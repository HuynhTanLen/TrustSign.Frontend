"use client";

import * as React from "react";
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  History,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import { verifyApi, type VerifyResult } from "@/lib/api/verify";
import { USE_MOCK } from "@/lib/mock";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

export default function VerifyPage() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState<"code" | "file">("code");
  const [code, setCode] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<VerifyResult | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  const check = async (action: () => Promise<VerifyResult>) => {
    setIsChecking(true);
    setError(null);
    setResult(null);
    try {
      const res = await action();
      setResult(res);
    } catch (err) {
      setError(err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedHash(text);
      toast(`Đã sao chép ${label}.`, "info");
      setTimeout(() => setCopiedHash(null), 2500);
    }
  };

  const outcome = result
    ? {
        Valid: {
          icon: ShieldCheck,
          title: "Hợp đồng nguyên vẹn và hợp lệ",
          text: "Chữ ký số PAdES và chuỗi nhật ký mật mã chưa từng bị sửa đổi kể từ thời điểm ký kết.",
          className: "bg-emerald-50 text-emerald-900 border-emerald-300 ring-4 ring-emerald-500/10",
        },
        Tampered: {
          icon: ShieldAlert,
          title: "Cảnh báo: Nội dung tài liệu đã bị sửa đổi trái phép",
          text: "Mã băm SHA-256 hoặc chữ ký số không khớp với bản gốc đã lưu trữ trong chuỗi chứng nhận.",
          className: "bg-red-50 text-red-900 border-red-300 ring-4 ring-red-500/10",
        },
        NotFound: {
          icon: XCircle,
          title: "Không tìm thấy hợp đồng",
          text: "Mã hợp đồng không tồn tại trên hệ thống hoặc file tải lên không phải văn bản ký kết của Chữ Tín.",
          className: "bg-amber-50 text-amber-900 border-amber-300 ring-4 ring-amber-500/10",
        },
      }[result.outcome]
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-page text-fg">
      <PublicHeader />

      <main className="flex-1 w-full max-w-[920px] mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 self-center sm:self-start px-3 py-1 rounded-full bg-selected text-primary text-xs font-semibold border border-primary/15">
            <Lock className="w-3.5 h-3.5" />
            <span>Cổng tra cứu tính toàn vẹn chữ ký số</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">
            Xác minh hợp đồng điện tử
          </h1>
          <p className="text-sm text-muted max-w-2xl leading-relaxed">
            Kiểm tra tính pháp lý của chữ ký số PAdES, chuỗi băm bảo mật SHA-256 và nhật ký kiểm toán (Audit Trail) của tài liệu ký kết trên hệ thống Chữ Tín.
          </p>
        </div>

        <Card>
          <div className="flex flex-col gap-5">
            <Tabs
              tabs={[
                { id: "code", label: "Kiểm tra theo Mã hợp đồng" },
                { id: "file", label: "Kiểm tra file PDF gốc" },
              ]}
              value={tab}
              onChange={(id) => setTab(id as "code" | "file")}
            />

            {tab === "code" ? (
              <form
                className="flex flex-col sm:flex-row sm:items-end gap-3 motion-safe:animate-fade-in"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (code.trim()) check(() => verifyApi.byCode(code));
                }}
              >
                <div className="flex-1">
                  <Input
                    label="Mã định danh hợp đồng"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ví dụ: HĐ-2026-1371"
                    leftIcon={<Search className="w-4 h-4 text-muted" />}
                    helperText="Mã được in trực tiếp ở đầu trang hợp đồng hoặc trong email thông báo."
                  />
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  glow
                  isLoading={isChecking}
                  disabled={!code.trim()}
                  className="sm:mb-6"
                >
                  Xác minh ngay
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-3 motion-safe:animate-fade-in">
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setFile(e.dataTransfer.files[0] ?? null);
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-8 sm:p-10 rounded-2xl border-2 border-dashed border-blue-300/80 bg-blue-50/30 hover:bg-blue-50/70 transition-colors text-center cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                    <Upload className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-fg block">
                      {file ? file.name : "Kéo thả file PDF đã ký vào đây hoặc bấm để chọn"}
                    </span>
                    <span className="text-xs text-muted mt-0.5 block">
                      File chỉ dùng để trích xuất hàm băm mật mã và chữ ký số trên máy chủ, không được lưu trữ.
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <div className="flex justify-end">
                  <Button
                    variant="accent"
                    glow
                    isLoading={isChecking}
                    disabled={!file}
                    onClick={() => file && check(() => verifyApi.byFile(file))}
                  >
                    Xác minh tính nguyên vẹn file
                  </Button>
                </div>
              </div>
            )}

            {USE_MOCK && (
              <p className="text-xs text-muted bg-strip p-2.5 rounded border border-line">
                💡 <em>Dữ liệu mẫu:</em> Nhập mã <strong>HĐ-0141</strong> (hợp lệ) hoặc <strong>HĐ-0099</strong> (đã bị thay đổi).
              </p>
            )}
          </div>
        </Card>

        {error ? <ErrorState error={error} title="Không thể kiểm tra tính hợp lệ" /> : null}

        {isChecking && (
          <div className="flex flex-col gap-3 p-6 rounded-xl border border-line bg-surface shadow-xs animate-pulse">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-32 w-full mt-2" />
          </div>
        )}

        {result && outcome && (
          <div className="flex flex-col gap-5 motion-safe:animate-fade-up">
            {/* BANNER KẾT QUẢ TỔNG QUAN */}
            <div
              role="status"
              className={cn("flex items-start gap-4 p-5 sm:p-6 rounded-xl border shadow-card", outcome.className)}
            >
              <outcome.icon className="w-8 h-8 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">{outcome.title}</p>
                {result.contractTitle && (
                  <p className="text-sm font-semibold mt-0.5">
                    {result.contractTitle}{" "}
                    <span className="font-mono font-normal">({result.contractCode})</span>
                  </p>
                )}
                <p className="text-xs sm:text-sm mt-1.5 opacity-90 leading-relaxed">{outcome.text}</p>
              </div>
            </div>

            {/* DANH SÁCH CHỮ KÝ SỐ ĐÃ KIỂM TRA */}
            {result.signatures.length > 0 && (
              <Card title="Chữ ký số trên tài liệu" icon={Award} bodyClassName="p-0">
                <ul className="divide-y divide-line">
                  {result.signatures.map((s) => (
                    <li
                      key={s.serial}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface hover:bg-slate-50/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-fg">
                          {[s.signerName, s.title, s.organization].filter(Boolean).join(", ")}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          Nhà cung cấp CA: <strong>{s.issuer}</strong> · Serial{" "}
                          <span className="font-mono text-fg">{s.serial}</span> · Ký lúc{" "}
                          {formatDateTime(s.signedAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 self-start sm:self-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold ring-1 ring-inset",
                            s.intact
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                              : "bg-red-50 text-red-700 ring-red-600/20",
                          )}
                        >
                          {s.intact ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {s.intact ? "Toàn vẹn nguyên bản" : "Đã bị can thiệp"}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold ring-1 ring-inset",
                            s.certificateStatus === "Valid"
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                              : "bg-amber-50 text-amber-700 ring-amber-600/20",
                          )}
                        >
                          {s.certificateStatus === "Valid" ? "Chứng thư còn hiệu lực" : "Chứng thư đã thu hồi"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* CHUỖI NHẬT KÝ KIỂM TOÁN (AUDIT LOG HASH CHAIN) */}
            {result.events.length > 0 && (
              <Card
                title="Chuỗi nhật ký kiểm toán (Mật mã bất biến)"
                description="Các mốc thao tác được nối chuỗi bằng thuật toán SHA-256"
                icon={History}
              >
                <ol className="relative flex flex-col gap-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-line-strong/60">
                  {result.events.map((ev, i) => {
                    const isCopied = copiedHash === ev.hash;
                    return (
                      <li
                        key={ev.index}
                        className={cn(
                          "relative pl-8 motion-safe:animate-fade-up",
                          !ev.ok && "rounded-lg bg-red-50/70 p-3 -ml-3 border border-red-200",
                        )}
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <span
                          className={cn(
                            "absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 bg-surface",
                            ev.ok ? "border-emerald-600 bg-emerald-600" : "border-danger bg-danger",
                          )}
                          aria-hidden="true"
                        />
                        <div className="flex items-center gap-2 text-xs text-muted mb-0.5">
                          <span className="font-semibold text-fg">Bước #{ev.index + 1}</span>
                          <span>·</span>
                          <span className={ev.ok ? "text-emerald-700 font-medium" : "text-danger font-medium"}>
                            {ev.ok ? "Chuỗi hợp lệ" : "Sai lệch chuỗi băm"}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-fg">{ev.title}</p>
                        {ev.hash && (
                          <button
                            type="button"
                            onClick={() => handleCopy(ev.hash, "mã băm SHA-256")}
                            className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-strip hover:bg-selected/50 border border-line text-[11px] font-mono text-muted hover:text-primary transition-colors cursor-pointer group"
                          >
                            <span className="font-semibold text-slate-500">SHA-256</span>
                            <span className="truncate max-w-[180px]">{ev.hash.slice(0, 16)}…</span>
                            {isCopied ? (
                              <Check className="w-3 h-3 text-success shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 text-muted group-hover:text-primary shrink-0" />
                            )}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </Card>
            )}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
