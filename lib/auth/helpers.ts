import { NextResponse } from "next/server";
import { getSession } from "./session";

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    return { user: null, response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  return { user: session.user, response: null };
}

export function forbid() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}
