import { AppShell } from "@/components/nav";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { CreateCarForm } from "./form";

export const metadata = {
  title: "Tambah Pembelian Mobil",
};

export default async function TambahMobilPage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <div className="max-w-2xl mx-auto space-y-4">
        <PageHeader
          title="Beli Mobil Baru"
          subtitle="Catat stok kendaraan baru masuk dan rincian harga beli"
          back="/mobil"
        />

        <CreateCarForm />
      </div>
    </AppShell>
  );
}
