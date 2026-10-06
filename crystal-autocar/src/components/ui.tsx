/**
 * Komponen UI dasar (server-safe). Gaya glassmorphism konsisten di seluruh aplikasi.
 */
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { CAR_STATUS_LABEL, type CarStatus } from "@/lib/constants";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* --------------------------------- Logo --------------------------------- */

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="lg-crystal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a5f3fc" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="14" fill="url(#lg-crystal)" opacity="0.18" />
      <rect x="1" y="1" width="46" height="46" rx="14" fill="none" stroke="url(#lg-crystal)" strokeOpacity="0.6" />
      <path d="M24 8 L36 18 L24 40 L12 18 Z" fill="url(#lg-crystal)" />
      <path d="M12 18 H36 M24 8 L20 18 L24 40 L28 18 Z" fill="none" stroke="#050816" strokeOpacity="0.45" strokeWidth="1.2" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-extrabold tracking-tight">
            Crystal <span className="text-gradient">Autocar</span>
          </span>
          <span className="block text-[11px] font-medium text-slate-400">Keuangan Showroom</span>
        </span>
      )}
    </span>
  );
}

/* --------------------------------- Card --------------------------------- */

export function Card({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div className={cn("glass p-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between gap-3 first:mt-0">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-slate-400">{children}</h2>
      {action}
    </div>
  );
}

/* -------------------------------- Button -------------------------------- */

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-crystal text-white shadow-[0_8px_24px_-8px_rgb(34_211_238/0.6)] hover:brightness-110 hover:shadow-[0_10px_30px_-8px_rgb(34_211_238/0.75)]",
  secondary: "glass !rounded-2xl text-slate-100 hover:bg-white/10",
  danger: "bg-rose-500/15 text-rose-300 border border-rose-400/30 hover:bg-rose-500/25",
  success: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/25",
  ghost: "text-slate-300 hover:bg-white/8 hover:text-white",
};

export function buttonClass(variant: Variant = "primary", size: "md" | "sm" | "lg" = "md", full = false) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 select-none",
    size === "sm" && "min-h-10 px-3.5 text-sm",
    size === "md" && "min-h-12 px-5 text-[15px]",
    size === "lg" && "min-h-14 px-6 text-base",
    full && "w-full",
    VARIANTS[variant],
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  full,
  className,
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; size?: "md" | "sm" | "lg"; full?: boolean }) {
  return <Link className={cn(buttonClass(variant, size, full), className)} {...rest} />;
}

/* ------------------------------ Status badge ----------------------------- */

const STATUS_STYLE: Record<CarStatus, string> = {
  tersedia: "bg-emerald-400/12 text-emerald-300 ring-emerald-400/30",
  perbaikan: "bg-amber-400/12 text-amber-300 ring-amber-400/30",
  dipesan: "bg-sky-400/12 text-sky-300 ring-sky-400/30",
  terjual: "bg-slate-400/12 text-slate-300 ring-slate-400/25",
};
const STATUS_DOT: Record<CarStatus, string> = {
  tersedia: "bg-emerald-400",
  perbaikan: "bg-amber-400",
  dipesan: "bg-sky-400",
  terjual: "bg-slate-400",
};

export function StatusBadge({ status, className }: { status: CarStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        STATUS_STYLE[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status], status !== "terjual" && "animate-pulse")} />
      {CAR_STATUS_LABEL[status]}
    </span>
  );
}

/* ------------------------------ Page header ------------------------------ */

export function PageHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  back?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start gap-3 animate-fade-up">
      {back && (
        <Link
          href={back}
          aria-label="Kembali"
          className="glass !rounded-2xl mt-0.5 grid h-11 w-11 shrink-0 place-items-center text-slate-200 transition hover:bg-white/10 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[22px] font-extrabold tracking-tight sm:text-2xl">{title}</h1>
        {subtitle && <div className="mt-0.5 text-sm text-slate-400">{subtitle}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

/* ------------------------------ Empty state ------------------------------ */

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-crystal-400 ring-1 ring-white/10">
        {icon}
      </div>
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-xs text-sm text-slate-400">{children}</div>}
    </Card>
  );
}

/* ------------------------------- Key-value ------------------------------- */

export function KV({ label, value, strong }: { label: ReactNode; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd className={cn("text-right text-sm tabular-nums", strong ? "font-bold text-white" : "font-medium text-slate-200")}>
        {value}
      </dd>
    </div>
  );
}

export function Money({ value, signed, className }: { value: number; signed?: boolean; className?: string }) {
  const color = signed ? (value > 0 ? "text-emerald-300" : value < 0 ? "text-rose-300" : "text-slate-300") : "";
  const n = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.abs(Math.round(value)));
  return (
    <span className={cn("tabular-nums", color, className)}>
      {signed && value > 0 ? "+" : value < 0 ? "−" : ""}Rp {n}
    </span>
  );
}
