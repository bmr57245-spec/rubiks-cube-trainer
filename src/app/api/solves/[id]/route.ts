import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@db/index";
import { solves } from "@db/schema";

export const dynamic = "force-dynamic";

function cid(req: Request) {
  const id = req.headers.get("x-client-id");
  return id && id.length >= 8 && id.length <= 100 ? id : null;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const clientId = cid(req);
  if (!clientId) return NextResponse.json({ error: "missing client" }, { status: 400 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body || !["none", "plus2", "dnf"].includes(body.penalty)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const [row] = await db
    .update(solves)
    .set({ penalty: body.penalty })
    .where(and(eq(solves.id, Number(id)), eq(solves.clientId, clientId)))
    .returning();
  return NextResponse.json({ solve: row ?? null });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const clientId = cid(req);
  if (!clientId) return NextResponse.json({ error: "missing client" }, { status: 400 });
  const { id } = await ctx.params;
  await db.delete(solves).where(and(eq(solves.id, Number(id)), eq(solves.clientId, clientId)));
  return NextResponse.json({ ok: true });
}
