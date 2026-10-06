import { AppShell } from "@/components/nav";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { getCarSummary, getPurchase } from "@/lib/repo/cars";
import { notFound } from "next/navigation";
import { EditCarForm } from "./form";

export const metadata = {
  title: "Edit Data Mobil",
};

export default async function EditCarPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await props.params;
  const carId = Number(id);
  const car = getCarSummary(carId);

  if (!car) notFound();

  const purchase = getPurchase(carId);

  return (
    <AppShell user={user}>
      <div className="max-w-2xl mx-auto space-y-4">
        <PageHeader
          title={`Edit ${car.merek} ${car.tipe}`}
          subtitle={`Ubah spesifikasi atau data pembelian unit plat ${car.nopol}`}
          back={`/mobil/${car.id}`}
        />

        <EditCarForm car={car} purchase={purchase} />
      </div>
    </AppShell>
  );
}
