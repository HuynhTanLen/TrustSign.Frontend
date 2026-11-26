import * as React from "react";
import { Check, ShieldCheck } from "lucide-react";

/**
 * Hình minh họa thu nhỏ tờ hợp đồng A4 chuẩn pháp lý Việt Nam kèm chữ ký số PAdES.
 * Dùng cho trang chủ và thư viện mẫu hợp đồng.
 */
export function ContractThumbnail({
  title,
  code,
  partyA = "CÔNG TY CỔ PHẦN ALPHA TECH",
  partyB = "CÔNG TY TNHH ĐỐI TÁC B",
  signed = true,
  compact = false,
}: {
  title: string;
  code?: string;
  partyA?: string;
  partyB?: string;
  signed?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative bg-white border border-[#E6E4DC] rounded-sm overflow-hidden select-none ${
        compact ? "p-3.5" : "p-5 shadow-sm"
      }`}
    >
      {/* Header Quốc hiệu */}
      <div className="text-center border-b border-[#EFECE4] pb-2 mb-2.5">
        <p className="text-[8px] font-bold uppercase tracking-wider text-[#1A2922]">
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </p>
        <p className="text-[7px] font-semibold text-[#2E3B33] underline underline-offset-2">
          Độc lập - Tự do - Hạnh phúc
        </p>
      </div>

      {/* Tiêu đề hợp đồng */}
      <div className="text-center mb-2.5">
        <p
          className={`font-extrabold uppercase text-[#1B4332] leading-tight line-clamp-1 ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          {title}
        </p>
        {code && (
          <p className="font-mono text-[8px] text-[#2E3B33] mt-0.5">Số: {code}</p>
        )}
      </div>

      {/* Nội dung mô phỏng */}
      <div className="space-y-1.5 text-[8px] text-[#2E3B33]">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#1A2922] shrink-0">BÊN A:</span>
          <span className="truncate font-medium">{partyA}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#1A2922] shrink-0">BÊN B:</span>
          <span className="truncate font-medium">{partyB}</span>
        </div>

        <div className="pt-1.5 space-y-1">
          <span className="block h-1.5 w-full rounded-sm bg-[#EFECE4]" />
          <span className="block h-1.5 w-11/12 rounded-sm bg-[#EFECE4]" />
          {!compact && <span className="block h-1.5 w-4/5 rounded-sm bg-[#EFECE4]" />}
        </div>
      </div>

      {/* Khu vực chữ ký 2 bên */}
      <div className="mt-3 pt-2.5 border-t border-[#EFECE4] grid grid-cols-2 gap-2 text-center">
        <div className="border border-dashed border-[#C9DEB0] bg-[#EFF5E8]/60 rounded-sm p-1.5">
          <p className="text-[7px] font-bold uppercase text-[#1B4332]">Đại diện Bên A</p>
          {/* Nét chữ ký tay SVG */}
          <svg
            viewBox="0 0 90 26"
            className="w-16 h-5 mx-auto my-0.5 text-[#1B4332]"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 19C12 9 18 6 20 15C22 23 28 11 33 13C37 15 40 19 46 12C51 7 58 17 65 14C71 11 77 13 84 11"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {signed && (
            <span className="inline-flex items-center gap-0.5 text-[7px] font-bold text-[#1B4332]">
              <Check className="w-2.5 h-2.5" aria-hidden="true" />
              Đã ký số PAdES
            </span>
          )}
        </div>

        <div className="border border-dashed border-[#E6E4DC] bg-[#F5F4EF]/70 rounded-sm p-1.5">
          <p className="text-[7px] font-bold uppercase text-[#1A2922]">Đại diện Bên B</p>
          <svg
            viewBox="0 0 90 26"
            className="w-16 h-5 mx-auto my-0.5 text-[#1A2922]"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 16C16 7 24 20 31 12C36 6 43 18 50 13C56 9 63 16 72 12C76 10 80 12 83 11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="inline-flex items-center gap-0.5 text-[7px] font-semibold text-[#2E3B33]">
            <ShieldCheck className="w-2.5 h-2.5 text-[#1B4332]" aria-hidden="true" />
            Xác thực OTP
          </span>
        </div>
      </div>
    </div>
  );
}
