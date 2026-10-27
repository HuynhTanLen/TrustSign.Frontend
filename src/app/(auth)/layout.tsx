import Link from "next/link";
import { FileSignature } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-page text-fg">
      <div className="sm:mx-auto sm:w-full sm:max-w-[460px] text-center mb-7">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base shadow-sm shadow-indigo-500/20">
            <FileSignature className="w-5 h-5" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900">
            Chữ Tín <span className="text-primary font-semibold">TrustSign</span>
          </span>
        </Link>
        <p className="mt-2 text-sm text-muted">
          Nền tảng quản lý và ký kết hợp đồng điện tử doanh nghiệp
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[460px]">
        <div className="bg-surface py-8 px-6 sm:px-9 border border-line rounded-2xl shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
