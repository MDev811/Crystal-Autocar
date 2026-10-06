"use server";
/**
 * Aksi pengeluaran operasional showroom (FR-13).
 */
import { revalidatePath } from "next/cache";
import { run } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { fieldErrors, idSchema, opexSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

export async function addOpexAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = opexSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  run(
    "INSERT INTO operational_expenses (tanggal, kategori, nominal, keterangan) VALUES (?,?,?,?)",
    d.tanggal, d.kategori, d.nominal, d.keterangan,
  );
  revalidatePath("/", "layout");
  return { ok: true, message: "Pengeluaran operasional berhasil dicatat.", ts: Date.now() };
}

export async function deleteOpexAction(id: number) {
  await requireUser();
  run("DELETE FROM operational_expenses WHERE id = ?", idSchema.parse(id));
  revalidatePath("/", "layout");
}
