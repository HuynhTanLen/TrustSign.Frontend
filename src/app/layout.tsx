import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chữ Tín – Quản lý và ký hợp đồng điện tử",
  description: "Nền tảng quản lý và ký kết hợp đồng điện tử Chữ Tín (TrustSign)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full">
      <body className="min-h-full flex flex-col bg-page text-fg">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
