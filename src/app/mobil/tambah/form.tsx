"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCarAction } from "@/actions/cars";
import { initialActionState } from "@/lib/action-state";
import { FormAlert, Input, RupiahInput, Select, SubmitButton, Textarea } from "@/components/forms";
import { Card } from "@/components/ui";
import { todayISO } from "@/lib/format";
import { PURCHASE_SOURCES, PURCHASE_SOURCE_LABEL } from "@/lib/constants";

export function CreateCarForm() {
  const [state, formAction] = useActionState(createCarAction, initialActionState);
  const currentYear = new Date().getFullYear();
  const formRef = useRef<HTMLFormElement>(null);

  // Restore draft form dari sessionStorage (mencegah progress hilang jika browser refresh / reconnect)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("draft_new_car");
      if (saved && formRef.current) {
        const data = JSON.parse(saved) as Record<string, string>;
        for (const [key, val] of Object.entries(data)) {
          const el = formRef.current.elements.namedItem(key) as
            | HTMLInputElement
            | HTMLSelectElement
            | HTMLTextAreaElement
            | null;
          if (el && typeof val === "string" && val.length > 0) {
            el.value = val;
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Simpan setiap ketikan ke sessionStorage secara real-time
  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formData.forEach((val, key) => {
      if (typeof val === "string") {
        data[key] = val;
      }
    });
    try {
      sessionStorage.setItem("draft_new_car", JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  // Bersihkan draft setelah form berhasil disimpan ke database
  useEffect(() => {
    if (state.ok) {
      try {
        sessionStorage.removeItem("draft_new_car");
      } catch {
        // ignore
      }
    }
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      onChange={handleFormChange}
      onInput={handleFormChange}
      action={formAction}
      className="space-y-5"
    >
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

          <Input
            label="Kilometer (Jarak Tempuh)"
            name="kilometer"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="Cth: 45000"
            hint="Angka odometer saat ini (dalam km)"
            error={state.errors?.kilometer}
          />

          <Input
            label="Masa Aktif STNK"
            name="masa_stnk"
            type="date"
            hint="Tanggal berakhirnya masa berlaku STNK / pajak tahunan"
            error={state.errors?.masa_stnk}
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
            2. Data Pembelian &amp; Modal Masuk
          </h2>
          <p className="text-xs text-slate-400">
            Pencatatan sumber beli &amp; kalkulasi modal awal unit (FR-06, FR-08)
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

          <Input
            label="Nomor WhatsApp Penjual"
            name="telepon_penjual"
            type="tel"
            inputMode="tel"
            placeholder="Cth: 081234567890"
            hint="Nomor WhatsApp / HP penjual (untuk dihubungi kembali)"
            error={state.errors?.telepon_penjual}
          />

          <Input
            label="Nomor KTP Penjual (Opsional)"
            name="no_ktp"
            placeholder="Cth: 3273011234560001"
            hint="16 digit nomor KTP identitas penjual atau makelar"
            error={state.errors?.no_ktp}
            maxLength={16}
          />

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

        <Input
          label="Nama Makelar (Opsional)"
          name="nama_makelar"
          placeholder="Cth: Pak Bambang / Calo Jaya Motor"
          hint="Nama calo atau perantara yang membantu transaksi pembelian ini"
          error={state.errors?.nama_makelar}
        />

        <Textarea
          label="Alamat Lengkap Penjual"
          name="alamat_penjual"
          placeholder="Cth: Jl. Melati No. 12, RT 03/RW 05, Kel. Sukamaju, Kec. Cilodong, Depok"
          hint="Jalan, RT/RW, kelurahan, kecamatan, kota/kabupaten"
          error={state.errors?.alamat_penjual}
        />

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
