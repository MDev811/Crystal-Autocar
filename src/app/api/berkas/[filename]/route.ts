import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import { uploadPath } from "@/lib/uploads";
import { getAttachmentByFilename } from "@/lib/repo/cars";
import { getSession } from "@/lib/session";

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ filename: string }> }
) {
  // Hanya user terotentikasi yang bisa melihat berkas (NFR-03)
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { filename } = await props.params;
  const filePath = uploadPath(filename);
  if (!filePath) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const fileBuf = await fs.readFile(filePath);
    const meta = getAttachmentByFilename(filename);

    return new NextResponse(fileBuf, {
      headers: {
        "Content-Type": meta?.mime ?? "application/octet-stream",
        "Content-Disposition": meta?.mime.startsWith("image/")
          ? "inline"
          : `inline; filename="${meta?.original_name ?? filename}"`,
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("File Not Found", { status: 404 });
  }
}
