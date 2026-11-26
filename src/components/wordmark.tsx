import Link from "next/link";

/**
 * Biểu trưng thương hiệu TrustSign:
 * Con dấu hình học kết hợp ngòi bút ký & dấu xác thực trong bảng màu #1B4332 / #DCEBC7.
 */
export function Wordmark({
  href = "/",
  suffix,
  tone = "dark",
}: {
  href?: string;
  suffix?: string;
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 select-none transition-opacity duration-200 hover:opacity-90 ${
        light ? "text-white" : "text-[#1A2922]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`relative inline-flex items-center justify-center w-8 h-8 rounded-sm transition-transform duration-200 group-hover:scale-105 ${
          light
            ? "bg-[#DCEBC7] text-[#1A2922]"
            : "bg-[#1B4332] text-white"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-4.5 h-4.5"
          aria-hidden="true"
        >
          {/* Khung dấu xác thực + chữ T cách điệu kết hợp nét ký */}
          <path
            d="M5 6.5H19M12 6.5V18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="square"
          />
          <path
            d="M7.5 14.5L11 18L18.5 10.5"
            stroke={light ? "#1B4332" : "#DCEBC7"}
            strokeWidth="2.2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      </span>
      <span className="flex items-center gap-2 whitespace-nowrap shrink-0">
        <span
          className={`text-[17px] font-extrabold tracking-tight leading-none ${
            light ? "text-white" : "text-[#1A2922]"
          }`}
        >
          Trust<span className={light ? "text-[#DCEBC7]" : "text-[#1B4332]"}>Sign</span>
        </span>
        {suffix && (
          <span
            className={`inline-flex items-center h-5 px-2 rounded-sm text-[11px] font-semibold tracking-wide whitespace-nowrap shrink-0 ${
              light
                ? "bg-white/15 text-white border border-white/25"
                : "bg-[#EFF5E8] text-[#1B4332] border border-[#C9DEB0]"
            }`}
          >
            {suffix}
          </span>
        )}
      </span>
    </Link>
  );
}
