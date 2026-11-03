"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { initialActionState } from "@/lib/action-state";
import { FormAlert, Input, SubmitButton } from "@/components/forms";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/"} />

      {state.message && (
        <FormAlert type="error" message={state.message} />
      )}

      <div>
        <Input
          label="Username"
          id="username"
          name="username"
          placeholder="Masukkan username"
          defaultValue="pemilik"
          error={state.errors?.username}
          required
          autoComplete="username"
        />
      </div>

      <div>
        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          defaultValue="crystal123"
          error={state.errors?.password}
          required
          autoComplete="current-password"
        />
      </div>

      <div className="pt-2">
        <SubmitButton
          variant="primary"
          size="lg"
          loadingText="Memverifikasi..."
          className="w-full"
        >
          Masuk
        </SubmitButton>
      </div>
    </form>
  );
}
