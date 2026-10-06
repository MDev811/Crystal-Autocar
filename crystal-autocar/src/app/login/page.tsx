import { LoginForm } from "./form";
import { FormAlert } from "@/components/forms";
import { Card, Logo } from "@/components/ui";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

export const metadata = {
  title: "Masuk",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ next?: string; expired?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  const { next, expired } = await props.searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block">
            <Logo compact={false} />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            Masuk ke Sistem
          </h1>
          <p className="text-xs text-slate-400">
            Sistem Pengelolaan Keuangan Showroom Crystal Autocar
          </p>
        </div>

        {expired && (
          <FormAlert
            type="info"
            message="Sesi Anda telah berakhir demi keamanan. Silakan login kembali."
          />
        )}

        <Card className="glass-strong p-6 space-y-5 rounded-3xl border-white/15">
          <LoginForm next={next} />

          {/* Info Akun Default untuk Demo Pengujian */}
          <div className="rounded-2xl border border-crystal-500/20 bg-crystal-500/10 p-3.5 text-xs text-crystal-200">
            <div className="font-bold flex items-center gap-1.5 text-crystal-300 mb-1">
              <Lock className="h-3.5 w-3.5" /> Akun Default Pengujian:
            </div>
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Username: <strong className="text-white">pemilik</strong></span>
              <span>Password: <strong className="text-white">crystal123</strong></span>
            </div>
          </div>
        </Card>

        <p className="text-center text-[11px] text-slate-500">
          &copy; {new Date().getFullYear()} Showroom Crystal Autocar. All rights reserved.
        </p>
      </div>
    </div>
  );
}
