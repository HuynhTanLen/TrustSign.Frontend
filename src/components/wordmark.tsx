import Link from "next/link";

/**
 * Biểu trưng thương hiệu Chữ Tín (TrustSign):
 * Ấn chương son đỏ nhiều lớp lấy cảm hứng từ dấu pháp nhân kết hợp chữ "Chữ Tín" sắc nét.
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
      className={`group inline-flex items-center gap-2.5 select-none ${
        light ? "text-white" : "text-primary"
      }`}
    >
      <span
        aria-hidden="true"
        className={`relative inline-flex items-center justify-center w-7 h-7 rounded-md bg-seal text-white shadow-xs transition-transform duration-200 group-hover:scale-[1.03] ${
          light ? "ring-1 ring-white/30" : "ring-1 ring-seal/20"
        }`}
      >
        <span className="absolute inset-[3px] rounded-[3px] border border-white/45" />
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="relative w-3.5 h-3.5"
          aria-hidden="true"
        >
          <path
            d="M4.2 8.3L6.8 10.9L11.8 5.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex items-center gap-2">
        <span className="text-[17px] font-bold tracking-tight leading-none">
          Chữ Tín
        </span>
        {suffix && (
          <span
            className={`inline-flex items-center h-5 px-2 rounded-full text-[11px] font-semibold tracking-wide ${
              light
                ? "bg-white/15 text-white border border-white/20"
                : "bg-selected text-primary border border-primary/15"
            }`}
          >
            {suffix}
          </span>
        )}
      </span>
    </Link>
  );
}
