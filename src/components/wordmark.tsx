import Link from "next/link";

/**
 * Biểu trưng thương hiệu Chữ Tín (TrustSign):
 * Ấn chương son đỏ sang trọng, chuẩn mực kết hợp chữ Chữ Tín sắc nét.
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
      className={`group inline-flex items-center gap-2.5 select-none transition-transform duration-200 active:scale-98 ${
        light ? "text-white" : "text-fg"
      }`}
    >
      <span
        aria-hidden="true"
        className={`relative inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#c92a2a] text-white shadow-xs transition-transform duration-200 group-hover:scale-105 ${
          light ? "ring-1 ring-white/30" : "ring-1 ring-[#c92a2a]/20"
        }`}
      >
        <span className="absolute inset-[3px] rounded-[5px] border border-white/50" />
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="relative w-3.5 h-3.5"
          aria-hidden="true"
        >
          <path
            d="M3.8 8.4L6.6 11.2L12.2 4.8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex items-center gap-2">
        <span
          className={`text-[17px] font-bold tracking-tight leading-none ${
            light ? "text-white" : "text-fg"
          }`}
        >
          Chữ Tín
        </span>
        {suffix && (
          <span
            className={`inline-flex items-center h-5 px-2 rounded-full text-[11px] font-semibold tracking-wide ${
              light
                ? "bg-white/20 text-white border border-white/30"
                : "bg-blue-50 text-blue-700 border border-blue-200/80"
            }`}
          >
            {suffix}
          </span>
        )}
      </span>
    </Link>
  );
}
