import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { DB_PATH } from "@/lib/db";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/format";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const fileBuf = await fs.readFile(DB_PATH);
    const filename = `crystal-autocar-backup-${todayISO()}.db`;

    return new NextResponse(fileBuf, {
      headers: {
        "Content-Type": "application/x-sqlite3",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return new NextResponse("Database backup failed", { status: 500 });
  }
}
