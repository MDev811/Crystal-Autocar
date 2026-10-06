"use client";

import { useState, useActionState, useTransition } from "react";
import { addOpexAction, deleteOpexAction } from "@/actions/opex";
import { initialActionState } from "@/lib/action-state";
import { FormAlert, Input, RupiahInput, Select, SubmitButton, Textarea } from "@/components/forms";
import { Card } from "@/components/ui";
import { OPEX_CATEGORIES, OPEX_LABEL } from "@/lib/constants";
import { rupiah, todayISO } from "@/lib/format";
import { Plus, Trash2, X, Receipt } from "lucide-react";

export function AddOpexModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addOpexAction, initialActionState);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-crystal text-slate-950 font-bold px-3.5 py-2 text-xs hover:brightness-110 shadow-lg shadow-crystal-500/20 active:scale-95 transition"
      >
        <Plus className="h-4 w-4" /> Catat Operasional
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-up">
          <div className="fixed inset-0" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/15 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="h-4 w-4 text-amethyst-400" /> Catat Pengeluaran Operasional
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              action={async (fd) => {
                await formAction(fd);
                setOpen(false);
              }}
              className="space-y-4"
            >
              {state.message && <FormAlert type="error" message={state.message} />}

              <Input
                label="Tanggal Pengeluaran"
                name="tanggal"
                type="date"
                defaultValue={todayISO()}
                required
              />

              <Select label="Kategori Beban" name="kategori" defaultValue="listrik" required>
                {OPEX_CATEGORIES.map((k) => (
                  <option key={k} value={k}>
                    {OPEX_LABEL[k]}
                  </option>
                ))}
              </Select>

              <RupiahInput
                label="Nominal Pengeluaran"
                name="nominal"
                placeholder="0"
                required
              />

              <Textarea
                label="Keterangan Rincian"
                name="keterangan"
                placeholder="Cth: Tagihan listrik showroom bulan Oktober, Saldo iklan OLX & FB Ads..."
              />

              <div className="pt-2">
                <SubmitButton loadingText="Menyimpan...">Simpan Pengeluaran</SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteOpexButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Hapus catatan pengeluaran operasional ini?")) {
          startTransition(async () => {
            await deleteOpexAction(id);
          });
        }
      }}
      disabled={isPending}
      title="Hapus"
      className="text-slate-400 hover:text-rose-400 transition p-1"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
