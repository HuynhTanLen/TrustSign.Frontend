import Link from "next/link";

/**
 * The logo: a small red seal (like the stamp on a contract) and the words "Chữ Tín".
 * `tone="light"` is for the navy top bar.
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
      className={`inline-flex items-center gap-2 text-base font-semibold ${light ? "text-white" : "text-primary"}`}
    >
      <span
        aria-hidden="true"
        className={`w-3.5 h-3.5 rounded-sm bg-seal ${light ? "ring-1 ring-white" : ""}`}
      />
      Chữ Tín
      {suffix && (
        <span className={`text-sm font-normal ${light ? "text-topbar-muted" : "text-muted"}`}>{suffix}</span>
      )}
    </Link>
  );
}
