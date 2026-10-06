"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/actions/auth";
import { initialActionState } from "@/lib/action-state";
import { FormAlert, Input, SubmitButton } from "@/components/forms";
import { Card } from "@/components/ui";
import { KeyRound } from "lucide-react";

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, initialActionState);

  return (
    <Card className="p-5 rounded-3xl space-y-4">
      <div className="border-b border-white/10 pb-2 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-crystal-400" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Ubah Password Akun (FR-02)
        </h2>
      </div>

      <form action={formAction} className="space-y-4">
        {state.message && (
          <FormAlert
            type={state.ok ? "success" : "error"}
            message={state.message}
          />
        )}

        <Input
          label="Password Lama"
          name="password_lama"
          type="password"
          placeholder="••••••••"
          error={state.errors?.password_lama}
          required
        />

        <Input
          label="Password Baru"
          name="password_baru"
          type="password"
          placeholder="Minimal 8 karakter (huruf & angka)"
          hint="Minimal 8 karakter kombinasi huruf dan angka"
          error={state.errors?.password_baru}
          required
        />

        <Input
          label="Konfirmasi Password Baru"
          name="konfirmasi"
          type="password"
          placeholder="Ulangi password baru"
          error={state.errors?.konfirmasi}
          required
        />

        <div className="pt-2">
          <SubmitButton size="md" loadingText="Memproses...">
            Simpan Password Baru
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}
