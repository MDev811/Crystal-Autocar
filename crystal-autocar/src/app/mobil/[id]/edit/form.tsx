"use client";

import { useActionState } from "react";
import { updateCarAction } from "@/actions/cars";
import { initialActionState } from "@/lib/action-state";
import { FormAlert, Input, RupiahInput, Select, SubmitButton, Textarea } from "@/components/forms";
import { Card } from "@/components/ui";
import { PURCHASE_SOURCES, PURCHASE_SOURCE_LABEL } from "@/lib/constants";
import type { CarSummary, Purchase } from "@/lib/repo/cars";

export function EditCarForm({ car, purchase }: { car: CarSummary; purchase?: Purchase }) {
  const actionWithId = updateCarAction.bind(null, car.id);
  const [state, formAction] = useActionState(actionWithId, initialActionState);
  const currentYear = new Date().getFullYear();

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <FormAlert type={state.ok ? "success" : "error"} message={state.message} />
      )}

      {/* Identitas Kendaraan */}
      <Card className="p-5 space-y-4 rounded-3xl">
        <div className="border-b border-white/10 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-crystal-300">
            Spesifikasi Kendaraan
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Merek Mobil"
            name="merek"
            defaultValue={car.merek}
            error={state.errors?.merek}
            required
          />

          <Input
            label="Tipe / Varian"
            name="tipe"
            defaultValue={car.tipe}
            error={state.errors?.tipe}
            required
          />

          <Input
            label="Tahun"
            name="tahun"
            type="number"
            min="1980"
            max={currentYear + 1}
            defaultValue={car.tahun}
            error={state.errors?.tahun}
            required
          />

          <Input
            label="Warna"
            name="warna"
            defaultValue={car.warna}
            error={state.errors?.warna}
            required
          />

          <Input
            label="Nomor Polisi"
            name="nopol"
            defaultValue={car.nopol}
            error={state.errors?.nopol}
            required
          />

          <Input
            label="Nomor Rangka"
            name="no_rangka"
            defaultValue={car.no_rangka}
            error={state.errors?.no_rangka}
            required
          />
        </div>

        {(car.status === "tersedia" || car.status === "perbaikan") && (
          <Select label="Status Unit" name="status" defaultValue={car.status}>
            <option value="tersedia">Tersedia (Siap Jual)</option>
            <option value="perbaikan">Dalam Perbaikan</option>
          </Select>
        )}

        <Textarea
          label="Catatan Kendaraan"
          name="catatan"
          defaultValue={car.catatan ?? ""}
          error={state.errors?.catatan}
        />
      </Card>

      {/* Data Pembelian */}
      <Card className="p-5 space-y-4 rounded-3xl">
        <div className="border-b border-white/10 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-crystal-300">
            Data Pembelian & Harga Pokok
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Tanggal Beli"
            name="tgl_beli"
            type="date"
            defaultValue={purchase?.tanggal ?? car.tgl_beli ?? ""}
            error={state.errors?.tgl_beli}
            required
          />

          <Input
            label="Nama Penjual"
            name="penjual"
            defaultValue={purchase?.penjual ?? car.penjual ?? ""}
            error={state.errors?.penjual}
            required
          />

          <Select
            label="Sumber Beli"
            name="sumber"
            defaultValue={purchase?.sumber ?? car.sumber ?? "marketplace"}
            error={state.errors?.sumber}
          >
            {PURCHASE_SOURCES.map((s) => (
              <option key={s} value={s}>
                {PURCHASE_SOURCE_LABEL[s]}
              </option>
            ))}
          </Select>

          <RupiahInput
            label="Harga Beli"
            name="harga_beli"
            defaultValue={purchase?.harga_beli ?? car.harga_beli}
            error={state.errors?.harga_beli}
            required
          />

          <RupiahInput
            label="Komisi Calo"
            name="komisi_calo"
            defaultValue={purchase?.komisi_calo ?? car.komisi_calo}
            error={state.errors?.komisi_calo}
          />
        </div>

        <Textarea
          label="Keterangan Pembelian"
          name="ket_beli"
          defaultValue={purchase?.keterangan ?? ""}
          error={state.errors?.ket_beli}
        />
      </Card>

      <div className="pt-2">
        <SubmitButton size="lg" loadingText="Menyimpan Perubahan...">
          Simpan Perubahan Data Mobil
        </SubmitButton>
      </div>
    </form>
  );
}
