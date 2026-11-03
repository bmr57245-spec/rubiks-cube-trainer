import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@db/index";
import { lessonProgress } from "@db/schema";

export const dynamic = "force-dynamic";

function cid(req: Request) {
  const id = req.headers.get("x-client-id");
  return id && id.length >= 8 && id.length <= 100 ? id : null;
}

export async function GET(req: Request) {
  const clientId = cid(req);
  if (!clientId) return NextResponse.json({ error: "missing client" }, { status: 400 });
  const rows = await db.select().from(lessonProgress).where(eq(lessonProgress.clientId, clientId));
  return NextResponse.json({ completed: rows.map((r) => r.lessonId) });
}

export async function POST(req: Request) {
  const clientId = cid(req);
  if (!clientId) return NextResponse.json({ error: "missing client" }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.lessonId !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 });
  const lessonId = body.lessonId.slice(0, 60);
  if (body.done === false) {
    await db
      .delete(lessonProgress)
      .where(and(eq(lessonProgress.clientId, clientId), eq(lessonProgress.lessonId, lessonId)));
  } else {
    await db.insert(lessonProgress).values({ clientId, lessonId }).onConflictDoNothing();
  }
  return NextResponse.json({ ok: true });
}
