"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, FilePenLine, FileText, Plus, Send, Trash2, Upload, Users } from "lucide-react";
import { contractsApi, type NewSigner } from "@/lib/api/contracts";
import { templatesApi } from "@/lib/api/templates";
import { ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

const MAX_SIGNERS = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const SIGNER_COLORS = ["bg-primary", "bg-success", "bg-warning", "bg-badge-signing-fg", "bg-muted"];
const STEPS = ["Nguồn hợp đồng", "Người ký", "Kiểm tra và gửi"];

type Step = 0 | 1 | 2;

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2 bg-surface border border-line rounded-md p-2">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className={`w-7 h-7 rounded-md flex items-center justify-center text-sm font-semibold shrink-0 transition-colors duration-200 ${
              i < step ? "bg-success text-white" : i === step ? "bg-primary text-white" : "bg-page text-muted border border-line"
            }`}
          >
            {i < step ? <Check className="w-4 h-4" aria-hidden="true" /> : i + 1}
          </span>
          <span className={`text-sm truncate ${i === step ? "font-semibold text-fg" : "text-muted"}`}>{label}</span>
          {i < STEPS.length - 1 && (
            <span className="hidden sm:block flex-1 h-px bg-line overflow-hidden">
              <span className={`block h-full bg-success origin-left transition-transform duration-300 ${i < step ? "scale-x-100" : "scale-x-0"}`} />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function NewContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const templates = useApi("templates", templatesApi.list);

  const [step, setStep] = React.useState<Step>(0);
  const [source, setSource] = React.useState<"template" | "upload">("template");
  const [title, setTitle] = React.useState("");
  const [templateId, setTemplateId] = React.useState(searchParams.get("templateId") ?? "");
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [file, setFile] = React.useState<File | null>(null);
  const [signers, setSigners] = React.useState<NewSigner[]>([{ fullName: "", email: "" }]);
  const [dueAt, setDueAt] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [blocked, setBlocked] = React.useState<string | null>(null);

  const template = templates.data?.find((t) => t.id === templateId);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (f.type !== "application/pdf") return toast("Chỉ nhận file PDF.", "error");
    if (f.size > MAX_FILE_BYTES) return toast("File lớn hơn 10 MB.", "error");
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
  };

  const step1Valid =
    title.trim() !== "" &&
    (source === "upload" ? file !== null : !!template && template.variables.every((v) => (values[v] ?? "").trim() !== ""));
  const step2Valid = signers.every((s) => s.fullName.trim() && /\S+@\S+\.\S+/.test(s.email)) && dueAt !== "";

  const goToReview = () => {
    if (new Date(dueAt).getTime() <= Date.now()) {
      toast("Hạn ký phải sau thời điểm hiện tại.", "error");
      return;
    }
    setStep(2);
  };

  const updateSigner = (index: number, patch: Partial<NewSigner>) =>
    setSigners((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const moveSigner = (index: number, dir: -1 | 1) =>
    setSigners((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const handleSend = async () => {
    setIsSending(true);
    try {
      const { contractId } =
        source === "upload" && file
          ? await contractsApi.upload(file, title.trim())
          : await contractsApi.createFromTemplate(templateId, title.trim(), values);
      await contractsApi.setSigners(contractId, signers);
      await contractsApi.send(contractId, new Date(dueAt).toISOString());
      toast("Đã gửi hợp đồng cho người ký đầu tiên.", "success");
      router.push(`/app/contracts/${contractId}`);
    } catch (err) {
      setConfirmOpen(false);
      if (err instanceof ApiError && (err.code === "Subscription.QuotaExceeded" || err.code === "Quota.Exceeded" || err.status === 403)) {
        setBlocked(
          err.code === "Subscription.QuotaExceeded" || err.code === "Quota.Exceeded"
            ? "Doanh nghiệp đã dùng hết hạn mức gửi ký trong tháng. Hợp đồng được lưu ở trạng thái Nháp."
            : "Gói dịch vụ đã hết hạn. Hợp đồng được lưu ở trạng thái Nháp.",
        );
      } else {
        toast(err instanceof ApiError ? err.message : "Không gửi được hợp đồng.", "error");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Soạn hợp đồng" back={{ href: "/app/contracts", label: "Danh sách hợp đồng" }} />
      <Stepper step={step} />

      <div key={step} className="motion-safe:animate-fade-up">
        {step === 0 && (
          <Card title="Nguồn hợp đồng" icon={FileText}>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Nguồn hợp đồng">
                {[
                  { id: "template" as const, icon: FilePenLine, title: "Từ mẫu hợp đồng", text: "Điền các trường của mẫu, hệ thống tạo file PDF." },
                  { id: "upload" as const, icon: Upload, title: "Tải file PDF lên", text: "File PDF có sẵn, tối đa 10 MB." },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={source === o.id}
                    onClick={() => setSource(o.id)}
                    className={`flex items-start gap-3 p-4 rounded-md border text-left cursor-pointer ${
                      source === o.id ? "border-primary bg-selected shadow-[inset_0_0_0_1px_var(--color-primary)]" : "border-line hover:bg-page"
                    }`}
                  >
                    <o.icon className="w-5 h-5 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-semibold text-fg">{o.title}</span>
                      <span className="block text-sm text-muted">{o.text}</span>
                    </span>
                  </button>
                ))}
              </div>

              <Input label="Tên hợp đồng" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hợp đồng dịch vụ" />

              {source === "template" ? (
                templates.error ? (
                  <ErrorState error={templates.error} onRetry={templates.reload} />
                ) : (
                  <>
                    <Select
                      label="Mẫu hợp đồng"
                      required
                      value={templateId}
                      disabled={templates.isLoading}
                      onChange={(e) => {
                        setTemplateId(e.target.value);
                        setValues({});
                      }}
                    >
                      <option value="">{templates.isLoading ? "Đang tải…" : "Chọn mẫu"}</option>
                      {templates.data?.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.variables.length} trường)
                        </option>
                      ))}
                    </Select>
                    {template && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 motion-safe:animate-fade-in">
                        {template.variables.map((v) => (
                          <Input
                            key={v}
                            label={v}
                            required
                            value={values[v] ?? ""}
                            onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                          />
                        ))}
                      </div>
                    )}
                    {templates.data?.length === 0 && (
                      <p className="text-sm text-muted">
                        Chưa có mẫu nào.{" "}
                        <Link href="/app/templates" className="text-primary underline underline-offset-2">
                          Tạo mẫu
                        </Link>
                      </p>
                    )}
                  </>
                )
              ) : (
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    pickFile(e.dataTransfer.files[0]);
                  }}
                  className="flex flex-col items-center gap-1 p-8 rounded-md border border-dashed border-line-strong bg-page text-center cursor-pointer hover:bg-selected"
                >
                  <Upload className="w-6 h-6 text-primary" aria-hidden="true" />
                  <span className="text-sm font-semibold text-fg">{file ? file.name : "Kéo thả file PDF vào đây hoặc bấm để chọn"}</span>
                  <span className="text-xs text-muted">
                    {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "Chỉ nhận .pdf, tối đa 10 MB"}
                  </span>
                  <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
                </label>
              )}

              <div className="flex justify-end pt-2 border-t border-line">
                <Button variant="primary" disabled={!step1Valid} onClick={() => setStep(1)}>
                  Tiếp tục
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card
            title={`Người ký theo thứ tự (${signers.length}/${MAX_SIGNERS})`}
            icon={Users}
            actions={
              <Button
                variant="secondary"
                disabled={signers.length >= MAX_SIGNERS}
                onClick={() => setSigners((prev) => [...prev, { fullName: "", email: "" }])}
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Thêm người ký
              </Button>
            }
          >
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted">Hệ thống gửi link ký lần lượt theo thứ tự; người sau chỉ nhận link khi người trước đã ký.</p>
              <ol className="flex flex-col gap-3">
                {signers.map((s, i) => (
                  <li key={i} className="flex flex-col md:flex-row md:items-end gap-3 p-3 rounded-md border border-line bg-page motion-safe:animate-fade-in">
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center text-sm font-semibold text-white shrink-0 ${SIGNER_COLORS[i]}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input label="Họ và tên" required value={s.fullName} onChange={(e) => updateSigner(i, { fullName: e.target.value })} />
                      <Input
                        label="Email nhận link ký"
                        type="email"
                        required
                        value={s.email}
                        onChange={(e) => updateSigner(i, { email: e.target.value })}
                        placeholder="ten@congty.vn"
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" aria-label="Lên trên" disabled={i === 0} onClick={() => moveSigner(i, -1)}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" aria-label="Xuống dưới" disabled={i === signers.length - 1} onClick={() => moveSigner(i, 1)}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        aria-label="Xóa người ký"
                        disabled={signers.length === 1}
                        onClick={() => setSigners((prev) => prev.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="max-w-xs">
                <Input label="Hạn ký" type="datetime-local" required value={dueAt} onChange={(e) => setDueAt(e.target.value)} helperText="Phải sau thời điểm hiện tại." />
              </div>
              <div className="flex justify-between pt-2 border-t border-line">
                <Button variant="secondary" onClick={() => setStep(0)}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Quay lại
                </Button>
                <Button variant="primary" disabled={!step2Valid} onClick={goToReview}>
                  Tiếp tục
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card title="Kiểm tra trước khi gửi" icon={Send}>
            <div className="flex flex-col gap-4">
              <dl className="grid grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted">Tên hợp đồng</dt>
                <dd className="font-semibold text-fg">{title}</dd>
                <dt className="text-muted">Nguồn</dt>
                <dd className="text-fg">{source === "upload" ? `File ${file?.name}` : `Mẫu ${template?.name}`}</dd>
                <dt className="text-muted">Hạn ký</dt>
                <dd className="text-fg">{formatDateTime(new Date(dueAt).toISOString())}</dd>
                <dt className="text-muted">Người ký</dt>
                <dd>
                  <ol className="flex flex-col gap-1">
                    {signers.map((s, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-semibold text-white ${SIGNER_COLORS[i]}`}>{i + 1}</span>
                        {s.fullName} <span className="text-muted">({s.email})</span>
                      </li>
                    ))}
                  </ol>
                </dd>
              </dl>
              <p className="p-3 rounded-md bg-strip text-sm text-muted">
                Ô ký của mỗi người được đặt ở cuối trang cuối. Kéo thả vị trí ô ký trên PDF sẽ có khi tích hợp trình xem PDF.
              </p>
              <div className="flex justify-between pt-2 border-t border-line">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Quay lại
                </Button>
                <Button variant="primary" onClick={() => setConfirmOpen(true)}>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  Gửi ký
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Gửi ký"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={isSending}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSend} isLoading={isSending}>
              Gửi ký
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg">
          Gửi <span className="font-semibold">{title}</span> cho {signers.length} người ký theo thứ tự. Đã gửi thì không sửa được nội dung.
        </p>
      </Dialog>

      <Dialog
        open={blocked !== null}
        onClose={() => setBlocked(null)}
        title="Chưa gửi được hợp đồng"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBlocked(null)}>
              Đóng
            </Button>
            <Link href="/app/billing">
              <Button variant="primary">Nâng gói</Button>
            </Link>
          </>
        }
      >
        <p className="text-sm text-fg">{blocked}</p>
      </Dialog>
    </div>
  );
}
