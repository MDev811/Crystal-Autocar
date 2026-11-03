import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Crystal Autocar — Keuangan Showroom",
    template: "%s · Crystal Autocar",
  },
  description:
    "Aplikasi pengelolaan keuangan jual beli mobil bekas Showroom Crystal Autocar: stok, modal per unit, penjualan, laba, dan arus kas.",
  applicationName: "Crystal Autocar",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Crystal Autocar", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050816",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full">
      <body className="relative min-h-full overflow-x-hidden">
        {/* Latar belakang aurora */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-crystal-500/25 blur-[110px] animate-float" />
          <div
            className="absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full bg-amethyst-500/25 blur-[120px] animate-float"
            style={{ animationDelay: "-5s" }}
          />
          <div
            className="absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-blue-600/20 blur-[120px] animate-float"
            style={{ animationDelay: "-9s" }}
          />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgb(255 255 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>
        {children}
      </body>
    </html>
  );
}
