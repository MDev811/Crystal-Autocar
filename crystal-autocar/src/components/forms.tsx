"use client";

/**
 * Komponen form interaktif (client-side):
 * - Input Rupiah dengan auto-formatting saat mengetik (FR-05, NFR-05, NFR-06)
 * - Tombol submit dengan indikator loading otomatis (useFormStatus)
 * - Komponen input, select, textarea dengan styling glassmorphism
 */
import { useFormStatus } from "react-dom";
import { forwardRef, useState, type ComponentProps, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn, buttonClass } from "./ui";

/* --------------------------------- Input --------------------------------- */

export const Input = forwardRef<
  HTMLInputElement,
  ComponentProps<"input"> & { error?: string; label?: string; hint?: string }
>(function Input({ className, error, label, hint, id, ...props }, ref) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {props.required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "glass-input w-full px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500",
          error && "!border-rose-500/80 !shadow-[0_0_0_2px_rgba(244,63,94,0.2)]",
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-rose-400 animate-fade-up">{error}</p>}
    </div>
  );
});

/* ----------------------------- Rupiah Input ------------------------------ */

export function RupiahInput({
  label,
  name,
  defaultValue = 0,
  error,
  hint,
  required,
  id,
  placeholder = "0",
}: {
  label?: string;
  name: string;
  defaultValue?: number;
  error?: string;
  hint?: string;
  required?: boolean;
  id?: string;
  placeholder?: string;
}) {
  const [display, setDisplay] = useState(() => {
    if (!defaultValue) return "";
    return new Intl.NumberFormat("id-ID").format(defaultValue);
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDisplay("");
      return;
    }
    const num = Number(raw);
    setDisplay(new Intl.NumberFormat("id-ID").format(num));
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id ?? name} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-bold text-slate-400">
          Rp
        </span>
        <input
          id={id ?? name}
          name={name}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={cn(
            "glass-input w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold tabular-nums text-slate-100 placeholder:text-slate-500",
            error && "!border-rose-500/80 !shadow-[0_0_0_2px_rgba(244,63,94,0.2)]"
          )}
        />
      </div>
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-rose-400 animate-fade-up">{error}</p>}
    </div>
  );
}

/* --------------------------------- Select -------------------------------- */

export const Select = forwardRef<
  HTMLSelectElement,
  ComponentProps<"select"> & { error?: string; label?: string; hint?: string }
>(function Select({ className, error, label, hint, id, children, ...props }, ref) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {props.required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(
            "glass-input w-full appearance-none px-3.5 py-2.5 pr-8 text-sm text-slate-100 bg-slate-900/80",
            error && "!border-rose-500/80",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-rose-400 animate-fade-up">{error}</p>}
    </div>
  );
});

/* -------------------------------- Textarea ------------------------------- */

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea"> & { error?: string; label?: string; hint?: string }
>(function Textarea({ className, error, label, hint, id, ...props }, ref) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {props.required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={props.rows ?? 3}
        className={cn(
          "glass-input w-full px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500",
          error && "!border-rose-500/80",
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-rose-400 animate-fade-up">{error}</p>}
    </div>
  );
});

/* ----------------------------- Submit Button ----------------------------- */

export function SubmitButton({
  children = "Simpan",
  loadingText = "Menyimpan...",
  variant = "primary",
  size = "md",
  className,
}: {
  children?: ReactNode;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "md" | "sm" | "lg";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(buttonClass(variant, size, true), className)}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-current" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* ------------------------------ Form Alert ------------------------------- */

export function FormAlert({
  type = "error",
  message,
}: {
  type?: "error" | "success" | "info";
  message?: string | null;
}) {
  if (!message) return null;

  const styles = {
    error: "bg-rose-500/15 border-rose-500/30 text-rose-300",
    success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    info: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
  };

  return (
    <div className={cn("rounded-xl border px-3.5 py-2.5 text-xs font-medium animate-fade-up", styles[type])}>
      {message}
    </div>
  );
}
