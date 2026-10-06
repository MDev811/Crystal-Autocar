import { AppShell } from "@/components/nav";
import { ButtonLink, Card, EmptyState, KV, Money, PageHeader, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/session";
import {
  getActiveBooking,
  getCarSummary,
  getPurchase,
  getSale,
  listAttachments,
  listBookings,
  listCosts,
} from "@/lib/repo/cars";
import { daysBetween, rupiah, rupiahShort, tanggal, todayISO } from "@/lib/format";
import { CAR_COST_LABEL, CAR_STATUS_LABEL, PURCHASE_SOURCE_LABEL } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AddBookingModal,
  AddCostModal,
  CancelSaleButton,
  CloseBookingModal,
  DeleteAttachmentButton,
  DeleteCarButton,
  DeleteCostButton,
  SaleCarModal,
  ToggleRepairButton,
  UploadAttachmentModal,
} from "./dialogs";
import {
  Calculator,
  Car,
  Clock,
  Edit,
  ExternalLink,
  FileText,
  HandCoins,
  ImageIcon,
  Receipt,
  Tag,
  Wrench,
} from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const car = getCarSummary(Number(id));
  if (!car) return { title: "Mobil Tidak Ditemukan" };
  return { title: `${car.merek} ${car.tipe} (${car.nopol})` };
}

export default async function CarDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ baru?: string; terjual?: string }>;
}) {
  const user = await requireUser();
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const carId = Number(id);
  const car = getCarSummary(carId);

  if (!car) notFound();

  const purchase = getPurchase(carId);
  const costs = listCosts(carId);
  const bookings = listBookings(carId);
  const activeBooking = getActiveBooking(carId);
  const sale = getSale(carId);
  const attachments = listAttachments(carId);

  const today = todayISO();
  const agingDays = car.tgl_beli ? daysBetween(car.tgl_beli, sale?.tanggal ?? today) : 0;

  const photos = attachments.filter((a) => a.jenis === "foto");
  const docs = attachments.filter((a) => a.jenis !== "foto");

  return (
    <AppShell user={user}>
      <div className="space-y-5 max-w-3xl mx-auto">
        {/* Banner Notifikasi Baru / Terjual */}
        {searchParams.baru && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200 animate-fade-up">
            ✓ Mobil baru berhasil ditambahkan ke inventaris showroom!
          </div>
        )}
        {searchParams.terjual && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200 animate-fade-up font-semibold">
            🎉 Transaksi penjualan tersimpan! Status mobil kini resmi Terjual.
          </div>
        )}

        {/* Header Unit Mobil */}
        <PageHeader
          title={`${car.merek} ${car.tipe}`}
          subtitle={
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <StatusBadge status={car.status} />
              <span className="font-mono font-bold text-slate-200 bg-white/10 px-2 py-0.5 rounded-lg text-xs">
                {car.nopol}
              </span>
              <span className="text-slate-400 text-xs">Tahun {car.tahun}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" /> {agingDays} hari di showroom
              </span>
            </div>
          }
          back="/mobil"
          action={
            <div className="flex items-center gap-2">
              <Link
                href={`/mobil/${car.id}/edit`}
                className="grid h-10 w-10 place-items-center rounded-2xl glass text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Edit Data Mobil"
              >
                <Edit className="h-4 w-4" />
              </Link>
            </div>
          }
        />

        {/* Action Bar Cepat: Status Mobil & Tombol Penjualan */}
        <Card className="p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-crystal-500/20">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Aksi Cepat Transaksi
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Status saat ini: <strong className="text-white">{CAR_STATUS_LABEL[car.status]}</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Jika masih tersedia atau perbaikan */}
            {(car.status === "tersedia" || car.status === "perbaikan") && (
              <>
                <ToggleRepairButton carId={car.id} currentStatus={car.status} />
                <AddBookingModal carId={car.id} />
                <SaleCarModal carId={car.id} totalModal={car.total_modal} />
              </>
            )}

            {/* Jika sedang dipesan (ada tanda jadi) */}
            {car.status === "dipesan" && activeBooking && (
              <>
                <SaleCarModal
                  carId={car.id}
                  totalModal={car.total_modal}
                  bookingDp={activeBooking.nominal}
                  buyerName={activeBooking.pembeli}
                  buyerPhone={activeBooking.telepon ?? ""}
                />
              </>
            )}

            {/* Jika sudah terjual */}
            {car.status === "terjual" && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Terjual pada {tanggal(sale?.tanggal)}</span>
                <span className="text-slate-600">|</span>
                <CancelSaleButton carId={car.id} />
              </div>
            )}
          </div>
        </Card>

        {/* Informasi Tanda Jadi Aktif jika status dipesan */}
        {car.status === "dipesan" && activeBooking && (
          <Card className="p-4 rounded-3xl border-sky-500/30 bg-sky-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <HandCoins className="h-4 w-4" /> Tanda Jadi (Booking) Aktif
              </span>
              <CloseBookingModal
                carId={car.id}
                bookingId={activeBooking.id}
                nominal={activeBooking.nominal}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Pembeli</span>
                <strong className="text-white">{activeBooking.pembeli}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nominal DP</span>
                <strong className="text-sky-300 font-bold">{rupiah(activeBooking.nominal)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tanggal Booking</span>
                <span>{tanggal(activeBooking.tanggal)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* HASIL PENJUALAN jika sudah Terjual (FR-11) */}
        {sale && (
          <Card className="p-5 rounded-3xl border-emerald-500/30 bg-emerald-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Receipt className="h-4 w-4" /> Realisasi Penjualan & Keuntungan
              </h2>
              <span className="text-[11px] text-slate-300">{tanggal(sale.tanggal)}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Pembeli</span>
                <strong className="text-white">{sale.pembeli}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Harga Jual Realisasi</span>
                <strong className="text-white text-sm">{rupiah(sale.harga_jual)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Total Modal (HPP)</span>
                <span className="text-slate-300 font-semibold">{rupiah(sale.total_modal)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Laba Bersih Unit</span>
                <strong
                  className={`text-base font-black ${
                    sale.laba >= 0 ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {sale.laba >= 0 ? "+" : ""}
                  {rupiah(sale.laba)}
                </strong>
              </div>
            </div>
            {sale.keterangan && (
              <p className="text-xs text-slate-300 pt-1 border-t border-emerald-500/20 italic">
                &ldquo;{sale.keterangan}&rdquo;
              </p>
            )}
          </Card>
        )}

        {/* KALKULATOR TOTAL MODAL HPP (FR-08) */}
        <Card className="p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-crystal-500/20 text-crystal-300">
                <Calculator className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Kalkulator Total Modal (HPP Unit)
                </h2>
                <p className="text-[11px] text-slate-400">
                  FR-08: Harga Beli + Komisi Calo + Seluruh Biaya Perawatan
                </p>
              </div>
            </div>
            <AddCostModal carId={car.id} />
          </div>

          <div className="divide-y divide-white/5 text-xs">
            <KV label="Harga Beli Pokok Unit" value={rupiah(car.harga_beli)} />
            {car.komisi_calo > 0 && (
              <KV label="Komisi Calo / Makelar" value={rupiah(car.komisi_calo)} />
            )}
            <KV
              label={`Total Biaya Perbaikan & Perawatan (${costs.length} catatan)`}
              value={rupiah(car.total_biaya)}
            />
            <div className="flex items-center justify-between py-3 text-sm font-black text-white bg-white/5 px-3 rounded-2xl mt-2 border border-white/10">
              <span className="text-crystal-300 uppercase tracking-wider text-xs font-bold">
                Total Modal Terkumpul (HPP)
              </span>
              <span className="text-base text-crystal-300">{rupiah(car.total_modal)}</span>
            </div>
          </div>
        </Card>

        {/* RINCIAN BIAYA PER UNIT (FR-07) */}
        <Card className="p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-crystal-400" />
              Rincian Biaya Unit ({costs.length})
            </h2>
            <AddCostModal carId={car.id} />
          </div>

          {costs.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              Belum ada biaya perbaikan, poles, atau bensin yang dicatat untuk unit ini.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {costs.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {CAR_COST_LABEL[c.kategori]}
                      </span>
                      <span className="text-[10px] text-slate-400">{tanggal(c.tanggal)}</span>
                    </div>
                    {c.keterangan && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {c.keterangan}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-slate-200 tabular-nums">
                      {rupiah(c.nominal)}
                    </span>
                    <DeleteCostButton carId={car.id} costId={c.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* SPESIFIKASI & DATA PEMBELIAN DETAIL (FR-03, FR-06) */}
        <Card className="p-5 rounded-3xl space-y-3">
          <div className="border-b border-white/10 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Car className="h-4 w-4 text-crystal-400" />
              Spesifikasi & Data Pembelian
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
            <KV label="Merek / Tipe" value={`${car.merek} ${car.tipe}`} />
            <KV label="Tahun Pembuatan" value={car.tahun} />
            <KV label="Warna Kendaraan" value={car.warna} />
            <KV label="Nomor Polisi" value={car.nopol} strong />
            <KV label="Nomor Rangka (VIN)" value={car.no_rangka} />
            <KV label="Tanggal Pembelian" value={tanggal(car.tgl_beli)} />
            <KV label="Penjual Asal" value={purchase?.penjual ?? "-"} />
            <KV
              label="Sumber Beli"
              value={purchase?.sumber ? PURCHASE_SOURCE_LABEL[purchase.sumber] : "-"}
            />
          </div>

          {car.catatan && (
            <div className="pt-2 border-t border-white/10 text-xs">
              <span className="text-slate-400 block text-[11px]">Catatan Kondisi Fisik:</span>
              <p className="text-slate-200 mt-0.5 whitespace-pre-wrap">{car.catatan}</p>
            </div>
          )}
        </Card>

        {/* FOTO & DOKUMEN PENDUKUNG (FR-19) */}
        <Card className="p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-crystal-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Foto & Dokumen Pendukung ({attachments.length})
              </h2>
            </div>
            <UploadAttachmentModal carId={car.id} />
          </div>

          {attachments.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              Belum ada foto mobil, nota bengkel, atau dokumen STNK/BPKB yang diunggah.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Galeri Foto */}
              {photos.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Foto Mobil ({photos.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {photos.map((p) => (
                      <div
                        key={p.id}
                        className="relative group rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/berkas/${p.filename}`}
                          alt={p.original_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-2">
                          <a
                            href={`/api/berkas/${p.filename}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg bg-white/20 text-white hover:bg-white/40"
                            title="Buka Foto"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <DeleteAttachmentButton carId={car.id} attachmentId={p.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daftar Dokumen & Nota */}
              {docs.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Dokumen & Nota Pembelian ({docs.length})
                  </span>
                  <div className="divide-y divide-white/5">
                    {docs.map((d) => (
                      <div key={d.id} className="py-2 flex items-center justify-between text-xs">
                        <a
                          href={`/api/berkas/${d.filename}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-crystal-300 hover:underline min-w-0"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{d.original_name}</span>
                          <span className="text-[10px] text-slate-500 uppercase">({d.jenis})</span>
                        </a>
                        <DeleteAttachmentButton carId={car.id} attachmentId={d.id} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Tombol Hapus Mobil Permanen */}
        <div className="pt-4 flex justify-end">
          <DeleteCarButton carId={car.id} />
        </div>
      </div>
    </AppShell>
  );
}
