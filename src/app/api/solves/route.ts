import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@db/index";
import { solves } from "@db/schema";

export const dynamic = "force-dynamic";

function cid(req: Request) {
  const id = req.headers.get("x-client-id");
  return id && id.length >= 8 && id.length <= 100 ? id : null;
}

export async function GET(req: Request) {
  const clientId = cid(req);
  if (!clientId) return NextResponse.json({ error: "missing client" }, { status: 400 });
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 300) || 300, 1000);
  const rows = await db
    .select()
    .from(solves)
    .where(eq(solves.clientId, clientId))
    .orderBy(desc(solves.createdAt), desc(solves.id))
    .limit(limit);
  return NextResponse.json({ solves: rows });
}

export async function POST(req: Request) {
  const clientId = cid(req);
  if (!clientId) return NextResponse.json({ error: "missing client" }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.timeMs !== "number" || body.timeMs < 0 || body.timeMs > 3_600_000) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const penalty = ["none", "plus2", "dnf"].includes(body.penalty) ? body.penalty : "none";
  const mode = body.mode === "comp" ? "comp" : "free";
  const [row] = await db
    .insert(solves)
    .values({
      clientId,
      timeMs: Math.round(body.timeMs),
      penalty,
      scramble: String(body.scramble ?? "").slice(0, 400),
      mode,
      roundId: body.roundId ? String(body.roundId).slice(0, 60) : null,
    })
    .returning();
  return NextResponse.json({ solve: row });
}

export async function DELETE(req: Request) {
  const clientId = cid(req);
  if (!clientId) return NextResponse.json({ error: "missing client" }, { status: 400 });
  const mode = new URL(req.url).searchParams.get("mode");
  const where =
    mode === "free" || mode === "comp"
      ? and(eq(solves.clientId, clientId), eq(solves.mode, mode))
      : eq(solves.clientId, clientId);
  await db.delete(solves).where(where);
  return NextResponse.json({ ok: true });
}
