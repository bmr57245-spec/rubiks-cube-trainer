import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { algStats } from "@/db/schema";

export const dynamic = "force-dynamic";

function cid(req: Request) {
  const id = req.headers.get("x-client-id");
  return id && id.length >= 8 && id.length <= 100 ? id : null;
}

export async function GET(req: Request) {
  const clientId = cid(req);
  if (!clientId) return NextResponse.json({ error: "missing client" }, { status: 400 });
  const rows = await db.select().from(algStats).where(eq(algStats.clientId, clientId));
  return NextResponse.json({ stats: rows });
}

// result: good (أتقنتها) | slow (ببطء) | fail (نسيتها)
export async function POST(req: Request) {
  const clientId = cid(req);
  if (!clientId) return NextResponse.json({ error: "missing client" }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.algId !== "string" || !["good", "slow", "fail"].includes(body.result)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const algId = body.algId.slice(0, 40);
  const timeMs = typeof body.timeMs === "number" && body.timeMs > 0 ? Math.round(body.timeMs) : null;

  const [existing] = await db
    .select()
    .from(algStats)
    .where(and(eq(algStats.clientId, clientId), eq(algStats.algId, algId)));

  const prevBox = existing?.box ?? 0;
  const box = body.result === "good" ? Math.min(5, prevBox + 1) : body.result === "slow" ? prevBox : Math.max(0, prevBox - 2);
  const ok = body.result !== "fail";
  const best =
    ok && timeMs ? (existing?.bestMs ? Math.min(existing.bestMs, timeMs) : timeMs) : (existing?.bestMs ?? null);

  if (existing) {
    const [row] = await db
      .update(algStats)
      .set({
        box,
        attempts: existing.attempts + 1,
        successes: existing.successes + (ok ? 1 : 0),
        bestMs: best,
        lastAt: new Date(),
      })
      .where(eq(algStats.id, existing.id))
      .returning();
    return NextResponse.json({ stat: row });
  }
  const [row] = await db
    .insert(algStats)
    .values({ clientId, algId, box, attempts: 1, successes: ok ? 1 : 0, bestMs: best })
    .returning();
  return NextResponse.json({ stat: row });
}
