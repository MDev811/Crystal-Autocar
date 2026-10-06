"use client";

import { useState, useActionState, useTransition } from "react";
import {
  addBookingAction,
  addCostAction,
  addSaleAction,
  closeBookingAction,
  deleteAttachmentAction,
  deleteCarAction,
  deleteCostAction,
  setRepairStatusAction,
  uploadAttachmentAction,
  cancelSaleAction,
} from "@/actions/cars";
import { FormAlert, Input, RupiahInput, Select, SubmitButton, Textarea } from "@/components/forms";
import { Card, Money, buttonClass, cn } from "@/components/ui";
import { CAR_COST_CATEGORIES, CAR_COST_LABEL, ATTACHMENT_TYPES, ATTACHMENT_LABEL } from "@/lib/constants";
import { initialActionState } from "@/lib/action-state";
import { rupiah, todayISO } from "@/lib/format";
import {
  Plus,
  Trash2,
  X,
  Upload,
  HandCoins,
  CheckCircle2,
  Wrench,
  Car,
  FileText,
  AlertTriangle,
} from "lucide-react";

/* ------------------ Modal Dialog Wrapper ------------------ */
function ModalDialog({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-up">
      <div className="fixed inset-0" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/15 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------ 1. Tambah Biaya Unit (FR-07) ------------------ */
export function AddCostModal({ carId }: { carId: number }) {
  const [open, setOpen] = useState(false);
  const actionWithId = addCostAction.bind(null, carId);
  const [state, formAction] = useActionState(actionWithId, initialActionState);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-crystal-500/20 text-crystal-300 border border-crystal-400/30 px-3 py-1.5 text-xs font-bold hover:bg-crystal-500/30 transition active:scale-95"
      >
        <Plus className="h-3.5 w-3.5" /> Catat Biaya
      </button>

      <ModalDialog title="Catat Biaya Unit Kendaraan" isOpen={open} onClose={() => setOpen(false)}>
        <form
          action={async (fd) => {
            await formAction(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          {state.message && <FormAlert type="error" message={state.message} />}

          <Input
            label="Tanggal Biaya"
            name="tanggal"
            type="date"
            defaultValue={todayISO()}
            required
          />

          <Select label="Kategori Biaya" name="kategori" defaultValue="cuci_poles" required>
            {CAR_COST_CATEGORIES.map((k) => (
              <option key={k} value={k}>
                {CAR_COST_LABEL[k]}
              </option>
            ))}
          </Select>

          <RupiahInput
            label="Nominal Biaya"
            name="nominal"
            placeholder="0"
            hint="Akan otomatis ditambahkan ke Total Modal (HPP) mobil ini"
            required
          />

          <Textarea
            label="Keterangan Rincian"
            name="keterangan"
            placeholder="Cth: Salon poles body 3 step, ganti oli mesin + filter, isi Pertamax 20 liter..."
          />

          <div className="pt-2">
            <SubmitButton loadingText="Menyimpan Biaya...">Simpan Biaya Unit</SubmitButton>
          </div>
        </form>
      </ModalDialog>
    </>
  );
}

/* ------------------ 2. Tanda Jadi / DP Booking (FR-09) ------------------ */
export function AddBookingModal({ carId }: { carId: number }) {
  const [open, setOpen] = useState(false);
  const actionWithId = addBookingAction.bind(null, carId);
  const [state, formAction] = useActionState(actionWithId, initialActionState);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 px-3.5 py-2 text-xs font-bold hover:bg-sky-500/30 transition active:scale-95"
      >
        <HandCoins className="h-4 w-4" /> Terima Tanda Jadi (DP)
      </button>

      <ModalDialog title="Penerimaan Tanda Jadi (Booking)" isOpen={open} onClose={() => setOpen(false)}>
        <form action={formAction} className="space-y-4">
          {state.message && <FormAlert type="error" message={state.message} />}

          <Input
            label="Tanggal Tanda Jadi"
            name="tanggal"
            type="date"
            defaultValue={todayISO()}
            required
          />

          <Input
            label="Nama Pembeli / Pemesan"
            name="pembeli"
            placeholder="Cth: Ibu Rina Santoso"
            required
          />

          <Input
            label="Nomor WhatsApp / HP"
            name="telepon"
            placeholder="Cth: 081234567890"
          />

          <RupiahInput
            label="Nominal Tanda Jadi (DP)"
            name="nominal"
            placeholder="0"
            hint="Status mobil akan otomatis berubah menjadi 'Dipesan'"
            required
          />

          <div className="pt-2">
            <SubmitButton loadingText="Menyimpan Tanda Jadi...">
              Konfirmasi Tanda Jadi
            </SubmitButton>
          </div>
        </form>
      </ModalDialog>
    </>
  );
}

/* ------------------ 3. Batalkan Tanda Jadi (FR-09) ------------------ */
export function CloseBookingModal({
  carId,
  bookingId,
  nominal,
}: {
  carId: number;
  bookingId: number;
  nominal: number;
}) {
  const [open, setOpen] = useState(false);
  const actionWithId = closeBookingAction.bind(null, carId, bookingId);
  const [state, formAction] = useActionState(actionWithId, initialActionState);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold text-rose-300 hover:underline"
      >
        Batalkan / Tutup DP
      </button>

      <ModalDialog title="Pembatalan Tanda Jadi" isOpen={open} onClose={() => setOpen(false)}>
        <form action={formAction} className="space-y-4">
          {state.message && <FormAlert type="error" message={state.message} />}

          <p className="text-xs text-slate-300">
            Tanda jadi saat ini: <strong className="text-white">{rupiah(nominal)}</strong>.
            Pilih status penyelesaian di bawah:
          </p>

          <Input
            label="Tanggal Selesai"
            name="tanggal"
            type="date"
            defaultValue={todayISO()}
            required
          />

          <Select label="Keputusan Dana DP" name="status" defaultValue="dikembalikan" required>
            <option value="dikembalikan">Dikembalikan (Kas keluar showroom sebesar DP)</option>
            <option value="hangus">Hangus (Masuk kas / pendapatan lain-lain showroom)</option>
          </Select>

          <div className="pt-2">
            <SubmitButton variant="danger" loadingText="Memproses...">
              Selesaikan Pembatalan DP
            </SubmitButton>
          </div>
        </form>
      </ModalDialog>
    </>
  );
}

/* ------------------ 4. Transaksi Penjualan Tunai (FR-10, FR-11, FR-12) ------------------ */
export function SaleCarModal({
  carId,
  totalModal,
  bookingDp = 0,
  buyerName = "",
  buyerPhone = "",
}: {
  carId: number;
  totalModal: number;
  bookingDp?: number;
  buyerName?: string;
  buyerPhone?: string;
}) {
  const [open, setOpen] = useState(false);
  const actionWithId = addSaleAction.bind(null, carId);
  const [state, formAction] = useActionState(actionWithId, initialActionState);

  const [salePrice, setSalePrice] = useState(0);

  const profit = salePrice ? salePrice - totalModal : 0;
  const sisaPelunasan = salePrice ? Math.max(0, salePrice - bookingDp) : 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-500 text-slate-950 font-black px-4 py-2.5 text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
      >
        <CheckCircle2 className="h-4 w-4" /> Catat Penjualan (Terjual)
      </button>

      <ModalDialog title="Transaksi Penjualan Tunai Unit" isOpen={open} onClose={() => setOpen(false)}>
        <form action={formAction} className="space-y-4">
          {state.message && <FormAlert type="error" message={state.message} />}

          <Input
            label="Tanggal Penjualan"
            name="tanggal"
            type="date"
            defaultValue={todayISO()}
            required
          />

          <Input
            label="Nama Pembeli"
            name="pembeli"
            defaultValue={buyerName}
            placeholder="Cth: Bapak Eko Prasetyo"
            required
          />

          <Input
            label="Nomor Telepon Pembeli"
            name="telepon"
            defaultValue={buyerPhone}
            placeholder="Cth: 081298765432"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Harga Jual Mobil <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                name="harga_jual"
                type="text"
                inputMode="numeric"
                required
                onChange={(e) => {
                  const num = Number(e.target.value.replace(/\D/g, ""));
                  setSalePrice(num);
                  e.target.value = num ? new Intl.NumberFormat("id-ID").format(num) : "";
                }}
                placeholder="0"
                className="glass-input w-full pl-10 pr-3.5 py-2.5 text-sm font-bold tabular-nums text-emerald-300"
              />
            </div>
            {state.errors?.harga_jual && (
              <p className="text-xs font-medium text-rose-400 mt-1">{state.errors.harga_jual}</p>
            )}
          </div>

          {/* Kalkulasi Otomatis Laba & Pelunasan (FR-10, FR-11) */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Total Modal Unit (HPP):</span>
              <span className="font-semibold text-white">{rupiah(totalModal)}</span>
            </div>
            {bookingDp > 0 && (
              <div className="flex justify-between text-sky-300">
                <span>Tanda Jadi (DP Diterima):</span>
                <span className="font-semibold">− {rupiah(bookingDp)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300 pt-1 border-t border-white/10">
              <span>Sisa Pelunasan Diterima Hari Ini:</span>
              <span className="font-bold text-white text-sm">{rupiah(sisaPelunasan)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/10 text-sm">
              <span className="font-bold">Estimasi Laba / Rugi Bersih:</span>
              <span
                className={`font-black tabular-nums ${
                  profit >= 0 ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {profit >= 0 ? "+" : ""}
                {rupiah(profit)}
              </span>
            </div>
          </div>

          <Textarea
            label="Catatan Penjualan"
            name="keterangan"
            placeholder="Keterangan penyerahan BPKB, kwitansi nomor, pelunasan transfer bank..."
          />

          <div className="pt-2">
            <SubmitButton
              variant="success"
              loadingText="Menyimpan Penjualan..."
              className="w-full text-sm font-black"
            >
              Simpan Transaksi & Tandai Terjual
            </SubmitButton>
          </div>
        </form>
      </ModalDialog>
    </>
  );
}

/* ------------------ 5. Status Perbaikan Toggle (FR-04) ------------------ */
export function ToggleRepairButton({
  carId,
  currentStatus,
}: {
  carId: number;
  currentStatus: "tersedia" | "perbaikan";
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextStatus = currentStatus === "tersedia" ? "perbaikan" : "tersedia";
    startTransition(async () => {
      await setRepairStatusAction(carId, nextStatus);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition active:scale-95 disabled:opacity-50",
        currentStatus === "tersedia"
          ? "border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
      )}
    >
      {currentStatus === "tersedia" ? (
        <>
          <Wrench className="h-3.5 w-3.5" /> Masukkan ke Perbaikan
        </>
      ) : (
        <>
          <CheckCircle2 className="h-3.5 w-3.5" /> Tandai Selesai Perbaikan (Siap)
        </>
      )}
    </button>
  );
}

/* ------------------ 6. Upload Berkas & Foto (FR-19) ------------------ */
export function UploadAttachmentModal({ carId }: { carId: number }) {
  const [open, setOpen] = useState(false);
  const actionWithId = uploadAttachmentAction.bind(null, carId);
  const [state, formAction] = useActionState(actionWithId, initialActionState);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
      >
        <Upload className="h-3.5 w-3.5" /> Unggah Foto / Berkas
      </button>

      <ModalDialog title="Unggah Berkas Pendukung (FR-19)" isOpen={open} onClose={() => setOpen(false)}>
        <form
          action={async (fd) => {
            await formAction(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          {state.message && <FormAlert type="error" message={state.message} />}

          <Select label="Jenis Berkas" name="jenis" defaultValue="foto" required>
            {ATTACHMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ATTACHMENT_LABEL[t]}
              </option>
            ))}
          </Select>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Pilih Berkas (Foto / Dokumen)
            </label>
            <input
              type="file"
              name="berkas"
              multiple
              accept="image/*,application/pdf"
              required
              className="glass-input w-full p-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-crystal-500/20 file:text-crystal-300 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Maksimal 5 MB per berkas. Format: JPG, PNG, WEBP, PDF.
            </p>
            {state.errors?.berkas && (
              <p className="text-xs text-rose-400 mt-1">{state.errors.berkas}</p>
            )}
          </div>

          <div className="pt-2">
            <SubmitButton loadingText="Mengunggah...">Unggah Sekarang</SubmitButton>
          </div>
        </form>
      </ModalDialog>
    </>
  );
}

/* ------------------ 7. Tombol Hapus Biaya Unit ------------------ */
export function DeleteCostButton({ carId, costId }: { carId: number; costId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Hapus catatan biaya ini? Total modal akan disesuaikan otomatis.")) {
          startTransition(async () => {
            await deleteCostAction(carId, costId);
          });
        }
      }}
      disabled={isPending}
      title="Hapus Biaya"
      className="text-slate-400 hover:text-rose-400 transition p-1"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

/* ------------------ 8. Tombol Hapus Berkas ------------------ */
export function DeleteAttachmentButton({ carId, attachmentId }: { carId: number; attachmentId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Hapus berkas ini?")) {
          startTransition(async () => {
            await deleteAttachmentAction(carId, attachmentId);
          });
        }
      }}
      disabled={isPending}
      title="Hapus Berkas"
      className="p-1.5 rounded-lg bg-black/60 text-slate-300 hover:text-rose-400 hover:bg-black/90 transition"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

/* ------------------ 9. Tombol Batalkan Penjualan ------------------ */
export function CancelSaleButton({ carId }: { carId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Batalkan transaksi penjualan mobil ini? Status akan dikembalikan ke Tersedia.")) {
          startTransition(async () => {
            await cancelSaleAction(carId);
          });
        }
      }}
      disabled={isPending}
      className="text-xs font-bold text-rose-400 hover:underline"
    >
      Batalkan Penjualan
    </button>
  );
}

/* ------------------ 10. Tombol Hapus Mobil Lengkap ------------------ */
export function DeleteCarButton({ carId }: { carId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (
          confirm(
            "YAKIN INGIN MENGHAPUS MOBIL INI?\nSemua data pembelian, riwayat biaya, dan berkas foto akan dihapus permanen."
          )
        ) {
          startTransition(async () => {
            await deleteCarAction(carId);
          });
        }
      }}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition active:scale-95"
    >
      <Trash2 className="h-4 w-4" /> Hapus Mobil Ini
    </button>
  );
}
