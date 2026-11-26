import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Wordmark } from "@/components/wordmark";

/**
 * AuthLayout — Giao diện chia đôi tối giản (Editorial Split-Screen).
 * Cột trái nền đá ấm (#F5F4EF) nhấn mạnh thông điệp thương hiệu; cột phải nền trắng tinh gọn cho biểu mẫu.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-[#1A2922]">
      {/* Mobile Header */}
      <header className="lg:hidden h-14 bg-[#F5F4EF] px-5 flex items-center justify-between border-b border-[#E6E4DC]">
        <div className="flex items-center gap-2.5">
          <Wordmark tone="dark" />
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#2E3B33]">
            Workspace
          </span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2E3B33] hover:text-[#1A2922] transition-colors"
        >
          Trang chủ
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </header>

      {/* Desktop Left Editorial Panel */}
      <aside className="hidden lg:flex lg:w-[46%] xl:w-[44%] flex-col justify-between bg-[#F5F4EF] border-r border-[#E6E4DC] p-10 xl:p-14 relative overflow-hidden select-none">
        <div className="relative z-10 flex items-center gap-3">
          <Wordmark tone="dark" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#2E3B33] pt-0.5">
            Workspace
          </span>
        </div>

        <div className="relative z-10 my-auto py-8 max-w-md">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#2E3B33] mb-4">
            Không gian ký kết pháp lý
          </p>

          <h2 className="text-4xl xl:text-[44px] font-extrabold tracking-tight leading-[1.08] text-[#1A2922]">
            Mọi giao dịch
            <br />
            bắt đầu từ
            <br />
            <span className="font-serif italic font-normal text-[#1B4332]">
              TrustSign.
            </span>
          </h2>

          <p className="mt-4 text-sm text-[#2E3B33] leading-relaxed max-w-xs">
            Quản lý hợp đồng, xác thực danh tính và ký số PAdES trên một không gian thống nhất.
          </p>

          <div className="relative mt-12 flex items-center">
            <div
              aria-hidden="true"
              className="w-48 h-48 rounded-full border-[14px] border-[#ECEBE3] flex items-center justify-center ml-6"
            />

            <div className="absolute left-0 top-2 w-56 rounded-lg bg-[#DCEBC7] border border-[#C9DEB0] p-5 shadow-[0_18px_36px_-12px_rgba(27,67,50,0.16)] -rotate-3">
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#4B6144]">
                Chuẩn pháp lý 2023
              </p>
              <p className="mt-2 text-lg font-bold leading-snug text-[#1A2922]">
                Ký một lần,
                <br />
                an tâm trọn đời.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-col gap-1.5 w-24">
                  <span className="h-1.5 w-full rounded-sm bg-[#B9CFA0]" />
                  <span className="h-1.5 w-3/4 rounded-sm bg-[#B9CFA0]" />
                </div>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#1B4332] text-white shadow-xs">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
              </div>
            </div>

            <div className="absolute left-36 top-28 bg-white border border-slate-200/90 rounded-md px-3.5 py-2 shadow-md flex items-center gap-1.5 text-xs font-semibold text-[#1A2922]">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#1B4332]" aria-hidden="true" />
              <span>An toàn &amp; Bất biến</span>
            </div>

            <span
              aria-hidden="true"
              className="ml-auto mr-6 text-4xl font-light text-[#7E8D6F] leading-none"
            >
              ✻
            </span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-[#2E3B33]">
          <span>Giải pháp hợp đồng điện tử chuẩn pháp lý.</span>
          <span aria-hidden="true" className="text-base text-[#7E8D6F]">
            ✻
          </span>
        </div>
      </aside>

      {/* Right Form Canvas */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        <div className="hidden lg:flex items-center justify-between px-10 pt-7">
          <span className="inline-flex items-center px-3 py-1 rounded-md border border-[#E6E4DC] bg-[#F5F4EF] text-[10px] font-semibold tracking-[0.14em] uppercase text-[#2E3B33]">
            TrustSign · E-Contract
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#2E3B33] hover:text-[#1B4332] transition-colors"
          >
            Trang chủ
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <main className="flex-1 flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[400px] motion-safe:animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
