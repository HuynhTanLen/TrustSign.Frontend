"use client";

import * as React from "react";
import { Award, CircleCheck, CircleX, History, Search, ShieldAlert, ShieldCheck, ShieldQuestion, Upload } from "lucide-react";
import { verifyApi, type VerifyResult } from "@/lib/api/verify";
import { USE_MOCK } from "@/lib/mock";
import { formatDateTime } from "@/lib/format";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";

const OUTCOME = {
  Valid: {
    icon: ShieldCheck,
    title: "Hợp lệ",
    text: "Tài liệu không bị thay đổi sau khi ký; chữ ký số và chuỗi nhật ký khớp nhau.",
    className: "border-success bg-badge-completed-bg text-badge-completed-fg",
  },
  Tampered: {
    icon: ShieldAlert,
    title: "Đã bị thay đổi",
    text: "Phát hiện sai lệch: nội dung hoặc nhật ký không khớp với lúc ký. Không nên tin tưởng tài liệu này.",
    className: "border-danger bg-badge-declined-bg text-badge-declined-fg",
  },
  NotFound: {
    icon: ShieldQuestion,
    title: "Không tìm thấy",
    text: "Không có hợp đồng nào khớp mã này hoặc file không có chữ ký của hệ thống.",
    className: "border-line-strong bg-badge-draft-bg text-badge-draft-fg",
  },
} as const;

export default function VerifyPage() {
  const [tab, setTab] = React.useState<"code" | "file">("code");
  const [code, setCode] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<VerifyResult | null>(null);
  const [error, setError] = React.useState<unknown>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  const check = async (run: () => Promise<VerifyResult>) => {
    setIsChecking(true);
    setError(null);
    setResult(null);
    try {
      setResult(await run());
    } catch (err) {
      setError(err);
    } finally {
      setIsChecking(false);
    }
  };

  const outcome = result ? OUTCOME[result.outcome] : null;

  return (
    <div className="min-h-screen flex flex-col bg-page text-fg">
      <PublicHeader />

      <main className="flex-1 w-full max-w-[920px] mx-auto px-4 py-10 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Xác minh hợp đồng</h1>
          <p className="mt-1 text-sm text-muted">Kiểm tra chữ ký số và nhật ký thao tác của một hợp đồng đã ký trên Chữ Tín.</p>
        </div>

        <Card>
          <div className="flex flex-col gap-4">
            <Tabs
              tabs={[
                { id: "code", label: "Nhập mã hợp đồng" },
                { id: "file", label: "Tải file PDF" },
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
                  <Input label="Mã hợp đồng" value={code} onChange={(e) => setCode(e.target.value)} placeholder="HĐ-0141" leftIcon={<Search />} />
                </div>
                <Button type="submit" variant="primary" isLoading={isChecking} disabled={!code.trim()}>
                  Kiểm tra
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
                  className="flex flex-col items-center gap-1 p-8 rounded-md border border-dashed border-line-strong bg-page text-center cursor-pointer hover:bg-selected"
                >
                  <Upload className="w-6 h-6 text-primary" aria-hidden="true" />
                  <span className="text-sm font-semibold text-fg">{file ? file.name : "Kéo thả file PDF đã ký vào đây hoặc bấm để chọn"}</span>
                  <span className="text-xs text-muted">File chỉ dùng để kiểm tra, không được lưu lại</span>
                  <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
                <div className="flex justify-end">
                  <Button variant="primary" isLoading={isChecking} disabled={!file} onClick={() => file && check(() => verifyApi.byFile(file))}>
                    Kiểm tra file
                  </Button>
                </div>
              </div>
            )}
            {USE_MOCK && <p className="text-xs text-muted">Dữ liệu mẫu: thử mã HĐ-0141 (hợp lệ) hoặc HĐ-0099 (đã bị thay đổi).</p>}
          </div>
        </Card>

        {error ? <ErrorState error={error} title="Không kiểm tra được" /> : null}
        {isChecking && <Skeleton className="h-40" />}

        {result && outcome && (
          <div className="flex flex-col gap-4 motion-safe:animate-fade-up">
            <div role="status" className={`flex items-start gap-3 p-4 rounded-md border ${outcome.className}`}>
              <outcome.icon className="w-6 h-6 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-base font-semibold">{outcome.title}</p>
                {result.contractTitle && (
                  <p className="text-sm">
                    {result.contractTitle} <span className="font-mono">({result.contractCode})</span>
                  </p>
                )}
                <p className="text-sm mt-1">{outcome.text}</p>
              </div>
            </div>

            {result.signatures.length > 0 && (
              <Card title="Chữ ký số" icon={Award} bodyClassName="p-0">
                <ul className="divide-y divide-line">
                  {result.signatures.map((s) => (
                    <li key={s.serial} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-fg">{s.signerName}</p>
                        <p className="text-xs text-muted">
                          {s.issuer} · Serial <span className="font-mono">{s.serial}</span> · Ký lúc {formatDateTime(s.signedAt)}
                        </p>
                      </div>
                      <span className="flex flex-wrap gap-1">
                        <span
                          className={`inline-flex items-center gap-1 h-[22px] px-2 rounded-sm text-xs font-semibold ${
                            s.intact ? "bg-badge-completed-bg text-badge-completed-fg" : "bg-badge-declined-bg text-badge-declined-fg"
                          }`}
                        >
                          {s.intact ? "Nguyên vẹn" : "Bị thay đổi"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 h-[22px] px-2 rounded-sm text-xs font-semibold ${
                            s.certificateStatus === "Valid" ? "bg-badge-completed-bg text-badge-completed-fg" : "bg-badge-declined-bg text-badge-declined-fg"
                          }`}
                        >
                          {s.certificateStatus === "Valid" ? "Chứng thư còn hiệu lực" : "Chứng thư đã thu hồi"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {result.events.length > 0 && (
              <Card title="Chuỗi nhật ký" icon={History}>
                <ol className="relative flex flex-col gap-3 before:absolute before:left-[9px] before:top-3 before:bottom-3 before:w-px before:bg-line">
                  {result.events.map((ev, i) => (
                    <li
                      key={ev.index}
                      className={`relative pl-8 motion-safe:animate-fade-up ${ev.ok ? "" : "rounded-md bg-badge-declined-bg py-2 pr-2"}`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span className="absolute left-0 top-0.5 bg-surface rounded-full" aria-hidden="true">
                        {ev.ok ? <CircleCheck className="w-5 h-5 text-success" /> : <CircleX className="w-5 h-5 text-danger" />}
                      </span>
                      <p className="text-sm font-semibold text-fg">
                        #{ev.index} {ev.title}
                      </p>
                      <p className="font-mono text-xs text-muted break-all">
                        trước {ev.prevHash.slice(0, 12)}… · hiện tại {ev.hash.slice(0, 12)}…
                      </p>
                      {!ev.ok && <p className="text-xs text-danger mt-0.5">Mã băm không khớp với sự kiện trước: chuỗi bị gãy tại đây.</p>}
                    </li>
                  ))}
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
