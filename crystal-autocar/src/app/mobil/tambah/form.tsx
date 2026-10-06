"use client";

import { useActionState } from "react";
import { createCarAction } from "@/actions/cars";
import { initialActionState } from "@/lib/action-state";
import { FormAlert, Input, RupiahInput, Select, SubmitButton, Textarea } from "@/components/forms";
import { Card } from "@/components/ui";
import { todayISO } from "@/lib/format";
import { PURCHASE_SOURCES, PURCHASE_SOURCE_LABEL } from "@/lib/constants";

export function CreateCarForm() {
  const [state, formAction] = useActionState(createCarAction, initialActionState);
  const currentYear = new Date().getFullYear();

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <FormAlert type={state.ok ? "success" : "error"} message={state.message} />
      )}

      {/* Bagian 1: Identitas & Spesifikasi Mobil */}
      <Card className="p-5 space-y-4 rounded-3xl">
        <div className="border-b border-white/10 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-crystal-300">
            1. Spesifikasi Kendaraan
          </h2>
          <p className="text-xs text-slate-400">
            Data identitas fisik unit mobil (FR-03)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Merek Mobil"
            name="merek"
            placeholder="Cth: Toyota, Honda, Mitsubishi"
            error={state.errors?.merek}
            required
          />

          <Input
            label="Tipe / Varian"
            name="tipe"
            placeholder="Cth: Avanza 1.3 G M/T, HR-V Prestige"
            error={state.errors?.tipe}
            required
          />

          <Input
            label="Tahun Pembuatan"
            name="tahun"
            type="number"
            min="1980"
            max={currentYear + 1}
            defaultValue={currentYear - 3}
            placeholder="Cth: 2021"
            error={state.errors?.tahun}
            required
          />

          <Input
            label="Warna Kendaraan"
            name="warna"
            placeholder="Cth: Hitam Metalik, Putih Mutiara"
            error={state.errors?.warna}
            required
          />

          <Input
            label="Nomor Polisi (Plat)"
            name="nopol"
            placeholder="Cth: B 1234 ABC"
            hint="Huruf kapital otomatis (cth: B 1234 ABC)"
            error={state.errors?.nopol}
            required
          />

          <Input
            label="Nomor Rangka (VIN)"
            name="no_rangka"
            placeholder="Cth: MH1JB5115FK123456"
            error={state.errors?.no_rangka}
            required
          />
        </div>

        <Select
          label="Status Awal Unit"
          name="status_awal"
          defaultValue="tersedia"
          error={state.errors?.status_awal}
        >
          <option value="tersedia">Tersedia (Siap Dipajang di Showroom)</option>
          <option value="perbaikan">Dalam Perbaikan (Perlu Service / Poles Dulu)</option>
        </Select>

        <Textarea
          label="Catatan Kondisi Fisik (Opsional)"
          name="catatan"
          placeholder="Catatan inspeksi: kilometer, kondisi ban, kelengkapan kunci serep, buku servis..."
          error={state.errors?.catatan}
        />
      </Card>

      {/* Bagian 2: Transaksi Pembelian */}
      <Card className="p-5 space-y-4 rounded-3xl">
        <div className="border-b border-white/10 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-crystal-300">
            2. Data Pembelian & Modal Masuk
          </h2>
          <p className="text-xs text-slate-400">
            Pencatatan sumber beli & kalkulasi modal awal unit (FR-06, FR-08)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Tanggal Beli"
            name="tgl_beli"
            type="date"
            defaultValue={todayISO()}
            error={state.errors?.tgl_beli}
            required
          />

          <Input
            label="Nama Penjual / Pemilik Sebelumnya"
            name="penjual"
            placeholder="Cth: Bapak Gunawan / Showroom Maju"
            error={state.errors?.penjual}
            required
          />

          <Select
            label="Sumber Pembelian"
            name="sumber"
            defaultValue="marketplace"
            error={state.errors?.sumber}
          >
            {PURCHASE_SOURCES.map((s) => (
              <option key={s} value={s}>
                {PURCHASE_SOURCE_LABEL[s]}
              </option>
            ))}
          </Select>

          <RupiahInput
            label="Harga Beli Unit"
            name="harga_beli"
            placeholder="0"
            hint="Harga pokok pembelian unit"
            error={state.errors?.harga_beli}
            required
          />

          <RupiahInput
            label="Komisi Calo / Makelar (Jika Ada)"
            name="komisi_calo"
            placeholder="0"
            hint="Biaya fee perantara / makelar (FR-06)"
            error={state.errors?.komisi_calo}
          />
        </div>

        <Textarea
          label="Keterangan Pembelian (Opsional)"
          name="ket_beli"
          placeholder="Catatan transaksi beli, metode bayar transfer/tunai, perjanjian tempo..."
          error={state.errors?.ket_beli}
        />
      </Card>

      <div className="pt-2">
        <SubmitButton
          size="lg"
          loadingText="Menyimpan Mobil..."
          className="w-full text-base font-bold shadow-xl shadow-crystal-500/25"
        >
          Simpan Data Pembelian Mobil
        </SubmitButton>
      </div>
    </form>
  );
}
