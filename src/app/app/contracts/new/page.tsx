"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Eye,
  FilePenLine,
  FileText,
  Move,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { contractsApi, type NewSigner } from "@/lib/api/contracts";
import { templatesApi, type TemplateDetail } from "@/lib/api/templates";
import { normalizeTemplateStructure, VARIABLE_LABELS } from "@/lib/contract-format";
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
const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const DEFAULT_BOX_WIDTH = 160;
const DEFAULT_BOX_HEIGHT = 64;

const SIGNER_COLORS = [
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-badge-signing-fg",
  "bg-muted",
];

const SIGNER_BOX_STYLES = [
  "border-primary bg-primary/12 text-primary",
  "border-success bg-success/12 text-success",
  "border-warning bg-warning/15 text-warning",
  "border-badge-signing-fg bg-badge-signing-bg/70 text-badge-signing-fg",
  "border-muted bg-strip/80 text-fg",
];

const STEPS = [
  "Nguồn & Điền hợp đồng",
  "Người ký",
  "Đặt vị trí ô ký",
  "Kiểm tra & gửi",
];

type Step = 0 | 1 | 2 | 3;

function formatVariableLabel(key: string): string {
  return VARIABLE_LABELS[key] ?? key.replace(/_/g, " ");
}

function defaultBoxForOrder(
  index: number,
  totalSigners = 2,
): Pick<NewSigner, "pageNumber" | "boxX" | "boxY" | "boxWidth" | "boxHeight"> {
  if (totalSigners === 1) {
    return {
      pageNumber: 1,
      boxX: 360,
      boxY: 95,
      boxWidth: DEFAULT_BOX_WIDTH,
      boxHeight: DEFAULT_BOX_HEIGHT,
    };
  }
  const col = index % 2;
  const row = Math.floor(index / 2);
  return {
    pageNumber: 1,
    boxX: col === 0 ? 65 : 365,
    boxY: Math.max(55, 115 - row * 78),
    boxWidth: DEFAULT_BOX_WIDTH,
    boxHeight: DEFAULT_BOX_HEIGHT,
  };
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2 bg-surface border border-line rounded-md p-2">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className={`w-7 h-7 rounded-md flex items-center justify-center text-sm font-semibold shrink-0 transition-colors duration-200 ${
              i < step
                ? "bg-success text-white"
                : i === step
                  ? "bg-primary text-white"
                  : "bg-page text-muted border border-line"
            }`}
          >
            {i < step ? <Check className="w-4 h-4" aria-hidden="true" /> : i + 1}
          </span>
          <span className={`text-sm truncate ${i === step ? "font-semibold text-fg" : "text-muted"}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <span className="hidden sm:block flex-1 h-px bg-line overflow-hidden">
              <span
                className={`block h-full bg-success origin-left transition-transform duration-300 ${
                  i < step ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * Hiển thị tờ hợp đồng chuẩn A4 như một văn bản pháp lý thật:
 * - Tự động có Quốc hiệu, Tiêu ngữ, Tên hợp đồng.
 * - Các trường {{bien}} được hiển thị như các ô tương tác trên tờ giấy:
 *   + Đang focus ô nào ở cột trái -> trường đó trên tờ giấy A4 sáng xanh và tự cuộn tới!
 *   + Bấm trực tiếp vào trường trên tờ giấy A4 -> tự động focus vào ô nhập liệu bên trái!
 */
function InteractiveContractPaper({
  title,
  structuredTemplate,
  values,
  focusedVar,
  onSelectVar,
  signers,
  interactiveFields = true,
}: {
  title: string;
  structuredTemplate: string;
  values: Record<string, string>;
  focusedVar?: string | null;
  onSelectVar?: (varKey: string) => void;
  signers?: NewSigner[];
  interactiveFields?: boolean;
}) {
  const tokenRefs = React.useRef<Record<string, HTMLElement | null>>({});

  React.useEffect(() => {
    if (focusedVar && tokenRefs.current[focusedVar]) {
      tokenRefs.current[focusedVar]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [focusedVar]);

  const hasHeader = structuredTemplate.toUpperCase().includes("CỘNG HÒA XÃ HỘI");
  const lines = structuredTemplate.replace(/\r\n/g, "\n").split("\n");

  const renderLineWithTokens = (line: string, lineIdx: number) => {
    const parts = line.split(/(\{\{[a-zA-Z0-9_]+\}\})/g);
    let seenVarInLine: Record<string, boolean> = {};

    return parts.map((part, partIdx) => {
      if (/^\{\{.+\}\}$/.test(part)) {
        const key = part.slice(2, -2);
        const val = values[key]?.trim();
        const isFocused = focusedVar === key;
        const label = formatVariableLabel(key);
        const isFirstRef = !seenVarInLine[key];
        seenVarInLine[key] = true;

        if (!interactiveFields) {
          return (
            <span key={`${lineIdx}-${partIdx}`} className="font-semibold text-black">
              {val || `[${label}]`}
            </span>
          );
        }

        return (
          <button
            key={`${lineIdx}-${partIdx}`}
            type="button"
            ref={(el) => {
              if (isFirstRef && !tokenRefs.current[key]) {
                tokenRefs.current[key] = el;
              } else if (isFirstRef) {
                tokenRefs.current[key] = el;
              }
            }}
            onClick={() => onSelectVar?.(key)}
            className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-sm font-sans text-xs transition-all cursor-pointer ${
              isFocused
                ? "bg-primary text-white font-bold ring-2 ring-primary/40 shadow-xs scale-[1.02]"
                : val
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold hover:bg-emerald-100"
                  : "bg-amber-100 text-amber-950 border border-dashed border-amber-400 font-medium hover:bg-amber-200"
            }`}
            title={`Nhấn để nhập: ${label}`}
          >
            {val || `[Điền: ${label}]`}
          </button>
        );
      }
      return <React.Fragment key={`${lineIdx}-${partIdx}`}>{part}</React.Fragment>;
    });
  };

  return (
    <div className="bg-white text-black font-serif px-7 py-6 text-[12.5px] leading-[1.65] flex flex-col justify-between min-h-full">
      <div>
        {!hasHeader && (
          <div className="text-center mb-4">
            <p className="font-bold text-[12px] uppercase tracking-wide">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="font-semibold text-[11.5px] underline underline-offset-4">
              Độc lập - Tự do - Hạnh phúc
            </p>
          </div>
        )}

        {!structuredTemplate.toUpperCase().includes((title || "").trim().toUpperCase()) && (
          <div className="text-center my-3">
            <p className="font-bold text-[14px] uppercase text-[#1f5fa8]">
              {title.trim() || "HỢP ĐỒNG GIAO DỊCH"}
            </p>
            <p className="font-sans text-[10px] text-neutral-500 mt-0.5">
              Lập ngày {new Date().toLocaleDateString("vi-VN")}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1.5 mt-2">
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={idx} className="h-1.5" />;

            const isQuocHieu = trimmed.toUpperCase() === "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
            const isTieuNgu = trimmed === "Độc lập - Tự do - Hạnh phúc";
            const isHeading =
              /^(ĐIỀU\s+\d+|I+\.|BÊN\s+[AB]|HỢP ĐỒNG|THỎA THUẬN|BIÊN BẢN)/i.test(trimmed);

            if (isQuocHieu) {
              return (
                <p key={idx} className="text-center font-bold text-[12px] uppercase tracking-wide">
                  {trimmed}
                </p>
              );
            }
            if (isTieuNgu) {
              return (
                <p key={idx} className="text-center font-semibold text-[11.5px] underline underline-offset-4 mb-2">
                  {trimmed}
                </p>
              );
            }
            return (
              <p
                key={idx}
                className={`${isHeading ? "font-bold text-[12.5px] mt-1.5" : "text-[12px]"}`}
              >
                {renderLineWithTokens(line, idx)}
              </p>
            );
          })}
        </div>
      </div>

      {/* Khối đại diện ký ở cuối tờ hợp đồng A4 */}
      <div className="mt-6 pt-4 border-t border-neutral-200 grid grid-cols-2 gap-4 text-center font-sans text-[10.5px] text-neutral-700">
        <div>
          <p className="font-bold uppercase text-black">ĐẠI DIỆN BÊN A</p>
          <p className="text-[9.5px] italic text-neutral-500">(Ký số và đóng dấu điện tử)</p>
          <div className="h-16" />
          <p className="font-semibold text-black truncate">
            {signers?.[0]?.fullName || values["dai_dien_ben_a"] || values["ten_ben_a"] || ""}
          </p>
        </div>
        <div>
          <p className="font-bold uppercase text-black">ĐẠI DIỆN BÊN B</p>
          <p className="text-[9.5px] italic text-neutral-500">(Ký số và đóng dấu điện tử)</p>
          <div className="h-16" />
          <p className="font-semibold text-black truncate">
            {signers?.[1]?.fullName ||
              values["dai_dien_ben_b"] ||
              values["ho_ten_nhan_vien"] ||
              values["ten_ben_b"] ||
              ""}
          </p>
        </div>
      </div>
    </div>
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
  const [templateDetail, setTemplateDetail] = React.useState<TemplateDetail | null>(null);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [focusedVar, setFocusedVar] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = React.useState<string | null>(null);
  const [signers, setSigners] = React.useState<NewSigner[]>([
    { fullName: "", email: "", ...defaultBoxForOrder(0, 1) },
  ]);
  const [activeSignerIndex, setActiveSignerIndex] = React.useState(0);
  const [activePage, setActivePage] = React.useState(1);
  const [dueAt, setDueAt] = React.useState(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [createdDraftId, setCreatedDraftId] = React.useState<string | null>(null);
  const [blocked, setBlocked] = React.useState<string | null>(null);

  const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const dragStateRef = React.useRef<{
    signerIdx: number;
    startClientX: number;
    startClientY: number;
    startBoxX: number;
    startBoxY: number;
  } | null>(null);

  const template = templates.data?.find((t) => t.id === templateId);

  React.useEffect(() => {
    if (!templateId) {
      setTemplateDetail(null);
      return;
    }
    let cancelled = false;
    templatesApi
      .get(templateId)
      .then((detail) => {
        if (!cancelled) {
          setTemplateDetail(detail);
          if (!title.trim()) setTitle(detail.name);
          const firstVar = detail.variables[0];
          if (firstVar) {
            setFocusedVar(firstVar);
            setTimeout(() => inputRefs.current[firstVar]?.focus(), 80);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setTemplateDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  React.useEffect(() => {
    if (!file) {
      setFilePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const structuredTemplateContent = React.useMemo(() => {
    if (!templateDetail) return "";
    return normalizeTemplateStructure(templateDetail.content, title || templateDetail.name);
  }, [templateDetail, title]);

  const focusVariableInput = (varKey: string) => {
    setFocusedVar(varKey);
    const el = inputRefs.current[varKey];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleVariableKeyDown = (currentVar: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !template) return;
    e.preventDefault();
    const idx = template.variables.indexOf(currentVar);
    if (idx >= 0 && idx < template.variables.length - 1) {
      const nextVar = template.variables[idx + 1];
      focusVariableInput(nextVar);
    }
  };

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (f.type !== "application/pdf") return toast("Chỉ nhận file PDF.", "error");
    if (f.size > MAX_FILE_BYTES) return toast("File lớn hơn 10 MB.", "error");
    setFile(f);
    setCreatedDraftId(null);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
  };

  const step1Valid =
    title.trim() !== "" &&
    (source === "upload"
      ? file !== null
      : !!template && template.variables.every((v) => (values[v] ?? "").trim() !== ""));

  const step2Valid =
    signers.every((s) => s.fullName.trim() && /\S+@\S+\.\S+/.test(s.email)) && dueAt !== "";

  const goToSignersStep = () => {
    // Tự động gợi ý tên người ký từ dữ liệu đã điền trên hợp đồng nếu ô người ký còn trống
    setSigners((prev) => {
      if (prev.length === 1 && !prev[0].fullName.trim()) {
        const repA = values["dai_dien_ben_a"] || values["ten_ben_a"] || "";
        const repB = values["dai_dien_ben_b"] || values["ho_ten_nhan_vien"] || values["ten_ben_b"] || "";
        if (repA && repB) {
          return [
            { fullName: repA, email: "", ...defaultBoxForOrder(0, 2) },
            { fullName: repB, email: "", ...defaultBoxForOrder(1, 2) },
          ];
        } else if (repA || repB) {
          return [{ fullName: repA || repB, email: "", ...defaultBoxForOrder(0, 1) }];
        }
      }
      return prev;
    });
    setStep(1);
  };

  const goToPlacement = () => {
    const normalizedEmails = signers.map((s) => s.email.trim().toLowerCase());
    if (new Set(normalizedEmails).size !== normalizedEmails.length) {
      toast("Email các người ký không được trùng nhau.", "error");
      return;
    }
    if (new Date(dueAt).getTime() <= Date.now()) {
      toast("Hạn ký phải sau thời điểm hiện tại.", "error");
      return;
    }
    setActiveSignerIndex(0);
    setActivePage(signers[0]?.pageNumber ?? 1);
    setStep(2);
  };

  const autoAlignSignatureBoxes = () => {
    setSigners((prev) =>
      prev.map((s, idx) => ({
        ...s,
        ...defaultBoxForOrder(idx, prev.length),
      })),
    );
    setActivePage(1);
    toast("Đã tự động căn chỉnh vị trí ô ký vào khu vực Đại diện ký cuối trang.", "success");
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

  const handleBoxPointerDown = (signerIdx: number, e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSignerIndex(signerIdx);
    const s = signers[signerIdx];
    dragStateRef.current = {
      signerIdx,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startBoxX: s.boxX,
      startBoxY: s.boxY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleBoxPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const deltaXPt = ((e.clientX - drag.startClientX) / rect.width) * PDF_PAGE_WIDTH;
    const deltaYPt = -((e.clientY - drag.startClientY) / rect.height) * PDF_PAGE_HEIGHT;

    const s = signers[drag.signerIdx];
    const nextX = Math.max(
      10,
      Math.min(PDF_PAGE_WIDTH - s.boxWidth - 10, Math.round(drag.startBoxX + deltaXPt)),
    );
    const nextY = Math.max(
      10,
      Math.min(PDF_PAGE_HEIGHT - s.boxHeight - 10, Math.round(drag.startBoxY + deltaYPt)),
    );

    updateSigner(drag.signerIdx, { boxX: nextX, boxY: nextY });
  };

  const handleBoxPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current) {
      dragStateRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const ensureDraftAndSigners = async (): Promise<string> => {
    let contractId = createdDraftId;
    if (!contractId) {
      const res =
        source === "upload" && file
          ? await contractsApi.upload(file, title.trim())
          : await contractsApi.createFromTemplate(templateId, title.trim(), values);
      contractId = res.contractId;
      setCreatedDraftId(contractId);
    }
    await contractsApi.setSigners(contractId, signers);
    return contractId;
  };

  const handleSaveDraftOnly = async () => {
    setIsSavingDraft(true);
    try {
      const contractId = await ensureDraftAndSigners();
      toast("Đã lưu hợp đồng nháp và vị trí ô ký.", "success");
      router.push(`/app/contracts/${contractId}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không lưu được hợp đồng nháp.", "error");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const contractId = await ensureDraftAndSigners();
      await contractsApi.send(contractId, new Date(dueAt).toISOString());
      toast("Đã gửi hợp đồng cho người ký đầu tiên.", "success");
      router.push(`/app/contracts/${contractId}`);
    } catch (err) {
      setConfirmOpen(false);
      if (
        err instanceof ApiError &&
        (err.code === "Subscription.QuotaExceeded" || err.code === "Quota.Exceeded" || err.status === 403)
      ) {
        setBlocked(
          err.code === "Subscription.QuotaExceeded" || err.code === "Quota.Exceeded"
            ? "Doanh nghiệp đã dùng hết hạn mức gửi ký trong kỳ. Hợp đồng đã được lưu ở trạng thái Nháp."
            : "Gói dịch vụ đã hết hạn. Hợp đồng đã được lưu ở trạng thái Nháp.",
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
          <Card title="Nguồn & Điền thông tin hợp đồng" icon={FileText}>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Nguồn hợp đồng">
                {[
                  {
                    id: "template" as const,
                    icon: FilePenLine,
                    title: "Từ mẫu hợp đồng",
                    text: "Điền thông tin trực quan và xem trực tiếp trên trang hợp đồng A4.",
                  },
                  {
                    id: "upload" as const,
                    icon: Upload,
                    title: "Tải file PDF lên",
                    text: "File PDF có sẵn, tối đa 10 MB, hệ thống tính mã băm SHA-256 gốc.",
                  },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={source === o.id}
                    onClick={() => {
                      setSource(o.id);
                      setCreatedDraftId(null);
                    }}
                    className={`flex items-start gap-3 p-4 rounded-md border text-left cursor-pointer ${
                      source === o.id
                        ? "border-primary bg-selected shadow-[inset_0_0_0_1px_var(--color-primary)]"
                        : "border-line hover:bg-page"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tên hợp đồng"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setCreatedDraftId(null);
                  }}
                  placeholder="Ví dụ: Hợp đồng mua bán xe"
                />

                {source === "template" && (
                  <Select
                    label="Chọn mẫu hợp đồng"
                    required
                    value={templateId}
                    disabled={templates.isLoading}
                    onChange={(e) => {
                      setTemplateId(e.target.value);
                      setValues({});
                      setCreatedDraftId(null);
                      const picked = templates.data?.find((t) => t.id === e.target.value);
                      if (picked) setTitle(picked.name);
                    }}
                  >
                    <option value="">{templates.isLoading ? "Đang tải…" : "— Chọn mẫu hợp đồng —"}</option>
                    {templates.data?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.variables.length} trường thông tin)
                      </option>
                    ))}
                  </Select>
                )}
              </div>

              {source === "template" ? (
                templates.error ? (
                  <ErrorState error={templates.error} onRetry={templates.reload} />
                ) : (
                  <>
                    {template && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start motion-safe:animate-fade-in pt-2">
                        {/* Cột trái: Các ô nhập liệu tự động focus theo thứ tự */}
                        <div className="lg:col-span-5 flex flex-col gap-3 p-4 rounded-md border border-line bg-page">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-fg">
                              Điền thông tin ({template.variables.filter((v) => (values[v] ?? "").trim()).length}/
                              {template.variables.length})
                            </span>
                            <span className="text-[11px] text-muted">Nhấn Enter để qua ô kế tiếp</span>
                          </div>

                          <div className="flex flex-col gap-3">
                            {template.variables.map((v, idx) => {
                              const isFocused = focusedVar === v;
                              return (
                                <div
                                  key={v}
                                  className={`p-2.5 rounded-md border transition-colors ${
                                    isFocused
                                      ? "border-primary bg-selected/60 shadow-2xs"
                                      : "border-line bg-surface"
                                  }`}
                                >
                                  <Input
                                    ref={(el) => {
                                      inputRefs.current[v] = el;
                                    }}
                                    label={`${idx + 1}. ${formatVariableLabel(v)}`}
                                    required
                                    value={values[v] ?? ""}
                                    onFocus={() => setFocusedVar(v)}
                                    onKeyDown={(e) => handleVariableKeyDown(v, e)}
                                    onChange={(e) => {
                                      setValues((prev) => ({ ...prev, [v]: e.target.value }));
                                      setCreatedDraftId(null);
                                    }}
                                    placeholder={`Nhập ${formatVariableLabel(v).toLowerCase()}…`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Cột phải: Tờ hợp đồng A4 tương tác trực tiếp */}
                        <div className="lg:col-span-7 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs text-muted px-1">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-fg">
                              <Eye className="w-3.5 h-3.5 text-primary" />
                              Bản xem trước hợp đồng chuẩn A4
                            </span>
                            <span>Bấm vào bất kỳ ô màu nào trên giấy để sửa nhanh</span>
                          </div>

                          <div className="rounded-md border-2 border-line-strong bg-white shadow-md max-h-[560px] overflow-y-auto">
                            <InteractiveContractPaper
                              title={title}
                              structuredTemplate={structuredTemplateContent}
                              values={values}
                              focusedVar={focusedVar}
                              onSelectVar={focusVariableInput}
                              interactiveFields={true}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {templates.data?.length === 0 && (
                      <p className="text-sm text-muted">
                        Chưa có mẫu nào.{" "}
                        <Link href="/app/templates" className="text-primary underline underline-offset-2">
                          Tạo mẫu hợp đồng
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
                  <span className="text-sm font-semibold text-fg">
                    {file ? file.name : "Kéo thả file PDF vào đây hoặc bấm để chọn"}
                  </span>
                  <span className="text-xs text-muted">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Chỉ nhận .pdf, tối đa 10 MB"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                </label>
              )}

              <div className="flex justify-end pt-2 border-t border-line">
                <Button variant="primary" disabled={!step1Valid} onClick={goToSignersStep}>
                  Tiếp tục chọn người ký
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
                onClick={() =>
                  setSigners((prev) => {
                    const nextCount = prev.length + 1;
                    return [
                      ...prev.map((s, idx) => ({ ...s, ...defaultBoxForOrder(idx, nextCount) })),
                      { fullName: "", email: "", ...defaultBoxForOrder(prev.length, nextCount) },
                    ];
                  })
                }
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Thêm người ký
              </Button>
            }
          >
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted">
                Hệ thống gửi link ký lần lượt theo thứ tự; người sau chỉ nhận link khi người trước đã ký xong.
              </p>
              <ol className="flex flex-col gap-3">
                {signers.map((s, i) => (
                  <li
                    key={i}
                    className="flex flex-col md:flex-row md:items-end gap-3 p-3 rounded-md border border-line bg-page motion-safe:animate-fade-in"
                  >
                    <span
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-sm font-semibold text-white shrink-0 ${SIGNER_COLORS[i]}`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Họ và tên người ký"
                        required
                        value={s.fullName}
                        onChange={(e) => updateSigner(i, { fullName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                      />
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
                      <Button
                        variant="ghost"
                        aria-label="Xuống dưới"
                        disabled={i === signers.length - 1}
                        onClick={() => moveSigner(i, 1)}
                      >
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
                <Input
                  label="Hạn ký"
                  type="datetime-local"
                  required
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  helperText="Phải sau thời điểm hiện tại."
                />
              </div>
              <div className="flex justify-between pt-2 border-t border-line">
                <Button variant="secondary" onClick={() => setStep(0)}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Quay lại
                </Button>
                <Button variant="primary" disabled={!step2Valid} onClick={goToPlacement}>
                  Đặt vị trí ô ký
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card
            title="Đặt vị trí ô chữ ký trên tờ hợp đồng A4"
            icon={Move}
            actions={
              <Button variant="secondary" onClick={autoAlignSignatureBoxes}>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Tự căn vào mục Đại diện ký
              </Button>
            }
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Cột trái: Danh sách người ký & thông số tọa độ */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <p className="text-sm text-muted">
                    Ô chữ ký đã được đặt sẵn ở mục <strong>Đại diện Bên A / Bên B</strong> cuối trang. Bạn có thể kéo thả để đổi vị trí tùy ý.
                  </p>

                  <div className="flex flex-col gap-2">
                    {signers.map((s, idx) => {
                      const isSelected = idx === activeSignerIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveSignerIndex(idx);
                            setActivePage(s.pageNumber);
                          }}
                          className={`flex items-center justify-between gap-3 p-3 rounded-md border text-left cursor-pointer transition-colors ${
                            isSelected
                              ? "border-primary bg-selected shadow-[inset_0_0_0_1px_var(--color-primary)]"
                              : "border-line bg-page hover:bg-surface"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold text-white shrink-0 ${SIGNER_COLORS[idx]}`}
                            >
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-fg truncate">{s.fullName}</p>
                              <p className="text-xs text-muted truncate">{s.email}</p>
                            </div>
                          </div>
                          <span className="font-mono text-xs text-muted shrink-0">
                            Tr.{s.pageNumber} · ({s.boxX}, {s.boxY})
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {signers[activeSignerIndex] && (
                    <div className="p-4 rounded-md border border-line bg-page flex flex-col gap-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">
                        Tọa độ ô ký · Người ký #{activeSignerIndex + 1} ({signers[activeSignerIndex].fullName})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          label="Trang PDF"
                          type="number"
                          min={1}
                          max={50}
                          value={String(signers[activeSignerIndex].pageNumber)}
                          onChange={(e) => {
                            const p = Math.max(1, Number(e.target.value) || 1);
                            updateSigner(activeSignerIndex, { pageNumber: p });
                            setActivePage(p);
                          }}
                        />
                        <Input
                          label="Tọa độ X (pt)"
                          type="number"
                          min={10}
                          max={480}
                          value={String(signers[activeSignerIndex].boxX)}
                          onChange={(e) =>
                            updateSigner(activeSignerIndex, {
                              boxX: Math.max(10, Math.min(480, Number(e.target.value) || 10)),
                            })
                          }
                        />
                        <Input
                          label="Tọa độ Y (pt)"
                          type="number"
                          min={10}
                          max={760}
                          value={String(signers[activeSignerIndex].boxY)}
                          onChange={(e) =>
                            updateSigner(activeSignerIndex, {
                              boxY: Math.max(10, Math.min(760, Number(e.target.value) || 10)),
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Chiều rộng (pt)"
                          type="number"
                          min={80}
                          max={260}
                          value={String(signers[activeSignerIndex].boxWidth)}
                          onChange={(e) =>
                            updateSigner(activeSignerIndex, {
                              boxWidth: Math.max(
                                80,
                                Math.min(260, Number(e.target.value) || DEFAULT_BOX_WIDTH),
                              ),
                            })
                          }
                        />
                        <Input
                          label="Chiều cao (pt)"
                          type="number"
                          min={40}
                          max={140}
                          value={String(signers[activeSignerIndex].boxHeight)}
                          onChange={(e) =>
                            updateSigner(activeSignerIndex, {
                              boxHeight: Math.max(
                                40,
                                Math.min(140, Number(e.target.value) || DEFAULT_BOX_HEIGHT),
                              ),
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cột phải: Tờ hợp đồng A4 chuẩn có sẵn vùng chữ ký cuối trang */}
                <div className="lg:col-span-7 flex flex-col items-center gap-2">
                  <div className="w-full max-w-[520px] flex items-center justify-between text-xs text-muted">
                    <span>
                      Trang đang hiển thị: <strong>Trang {activePage}</strong>
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        disabled={activePage <= 1}
                        onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                      >
                        Trang trước
                      </Button>
                      <Button variant="ghost" onClick={() => setActivePage((p) => p + 1)}>
                        Trang sau
                      </Button>
                    </div>
                  </div>

                  <div
                    ref={canvasRef}
                    className="relative w-full max-w-[520px] aspect-[595/842] rounded-md border-2 border-line-strong bg-white shadow-md overflow-hidden select-none"
                  >
                    {/* Nền tài liệu: PDF đã tải lên hoặc Tờ hợp đồng A4 chuẩn */}
                    {source === "upload" && filePreviewUrl ? (
                      <iframe
                        src={`${filePreviewUrl}#page=${activePage}&toolbar=0&navpanes=0`}
                        title="Xem trước PDF"
                        className="w-full h-full pointer-events-none opacity-90"
                      />
                    ) : (
                      <div className="w-full h-full overflow-hidden pointer-events-none">
                        <InteractiveContractPaper
                          title={title}
                          structuredTemplate={structuredTemplateContent}
                          values={values}
                          signers={signers}
                          interactiveFields={false}
                        />
                      </div>
                    )}

                    {/* Các ô chữ ký kéo thả trên trang hiện tại */}
                    {signers.map((s, idx) => {
                      if (s.pageNumber !== activePage) return null;
                      const leftPct = (s.boxX / PDF_PAGE_WIDTH) * 100;
                      const topPct =
                        ((PDF_PAGE_HEIGHT - s.boxY - s.boxHeight) / PDF_PAGE_HEIGHT) * 100;
                      const widthPct = (s.boxWidth / PDF_PAGE_WIDTH) * 100;
                      const heightPct = (s.boxHeight / PDF_PAGE_HEIGHT) * 100;
                      const isCurrent = idx === activeSignerIndex;

                      return (
                        <div
                          key={idx}
                          role="button"
                          tabIndex={0}
                          aria-label={`Ô ký của ${s.fullName}`}
                          onPointerDown={(e) => handleBoxPointerDown(idx, e)}
                          onPointerMove={handleBoxPointerMove}
                          onPointerUp={handleBoxPointerUp}
                          style={{
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            width: `${widthPct}%`,
                            height: `${heightPct}%`,
                          }}
                          className={`absolute rounded-sm border-2 border-dashed flex flex-col justify-between p-1.5 cursor-grab active:cursor-grabbing transition-shadow ${
                            SIGNER_BOX_STYLES[idx]
                          } ${isCurrent ? "ring-2 ring-primary shadow-md z-20" : "z-10"}`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold leading-tight">
                            <span className="truncate">
                              #{idx + 1} {s.fullName}
                            </span>
                            <Move className="w-3 h-3 shrink-0" />
                          </div>
                          <div className="text-[9px] font-mono opacity-80 truncate">
                            Ký số tại ({s.boxX}, {s.boxY})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-line">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Quay lại
                </Button>
                <Button variant="primary" onClick={() => setStep(3)}>
                  Tiếp tục kiểm tra
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card title="Kiểm tra trước khi lưu nháp hoặc gửi ký" icon={Send}>
            <div className="flex flex-col gap-4">
              <dl className="grid grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm">
                <dt className="text-muted">Tên hợp đồng</dt>
                <dd className="font-semibold text-fg">{title}</dd>
                <dt className="text-muted">Nguồn tài liệu</dt>
                <dd className="text-fg">
                  {source === "upload" ? `File PDF: ${file?.name}` : `Mẫu: ${template?.name}`}
                </dd>
                <dt className="text-muted">Hạn ký</dt>
                <dd className="text-fg">{formatDateTime(new Date(dueAt).toISOString())}</dd>
                <dt className="text-muted">Danh sách người ký & vị trí ô ký</dt>
                <dd>
                  <ol className="flex flex-col gap-1.5">
                    {signers.map((s, i) => (
                      <li key={i} className="flex flex-wrap items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-semibold text-white ${SIGNER_COLORS[i]}`}
                        >
                          {i + 1}
                        </span>
                        <span className="font-medium text-fg">{s.fullName}</span>
                        <span className="text-muted">({s.email})</span>
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm bg-page border border-line text-muted">
                          Trang {s.pageNumber} · X={s.boxX}, Y={s.boxY} ({s.boxWidth}×{s.boxHeight} pt)
                        </span>
                      </li>
                    ))}
                  </ol>
                </dd>
              </dl>

              <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-line">
                <Button variant="secondary" onClick={() => setStep(2)} disabled={isSavingDraft || isSending}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Quay lại chỉnh ô ký
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleSaveDraftOnly}
                    isLoading={isSavingDraft}
                    disabled={isSending}
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    Lưu bản nháp
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setConfirmOpen(true)}
                    disabled={isSavingDraft}
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    Gửi ký ngay
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Gửi hợp đồng đi ký"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={isSending}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSend} isLoading={isSending}>
              Xác nhận gửi ký
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg">
          Gửi <span className="font-semibold">{title}</span> cho {signers.length} người ký theo thứ tự. Khi gửi ký, hệ thống sẽ trừ <strong>01 lượt hợp đồng</strong> trong hạn mức gói cước và khóa nội dung tài liệu bằng mã băm SHA-256.
        </p>
      </Dialog>

      <Dialog
        open={blocked !== null}
        onClose={() => setBlocked(null)}
        title="Chưa gửi được hợp đồng"
        footer={
          <>
            {createdDraftId && (
              <Link href={`/app/contracts/${createdDraftId}`}>
                <Button variant="secondary">Xem bản nháp</Button>
              </Link>
            )}
            <Link href="/app/billing">
              <Button variant="primary">Nâng cấp gói cước</Button>
            </Link>
          </>
        }
      >
        <p className="text-sm text-fg">{blocked}</p>
      </Dialog>
    </div>
  );
}
