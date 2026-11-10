"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Calendar,
  Check,
  Eye,
  FilePenLine,
  FileText,
  MailCheck,
  Move,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { contractsApi, isValidEmail, type NewSigner, type RecipientRole } from "@/lib/api/contracts";
import { templatesApi, type TemplateDetail } from "@/lib/api/templates";
import { tenantsApi } from "@/lib/api/tenants";
import {
  buildFormattedContractFromBlueprint,
  normalizeTemplateStructure,
  parseTemplateIntoBlueprint,
  REFERENCE_TEMPLATES,
  registerVariableLabel,
  slugifyVariableName,
  VARIABLE_LABELS,
  type FieldSection,
  type TemplateClauseItem,
  type TemplateFieldItem,
} from "@/lib/contract-format";
import { useWorkspace } from "@/lib/workspace-context";
import { ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { PdfPageViewer, countPdfPages } from "@/components/pdf-page-viewer";

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
  "border-primary bg-primary/15 text-primary",
  "border-success bg-success/15 text-success",
  "border-warning bg-warning/18 text-warning",
  "border-badge-signing-fg bg-badge-signing-bg/80 text-badge-signing-fg",
  "border-muted bg-strip/90 text-fg",
];

const STEPS = [
  "Nguồn & Điền hợp đồng",
  "Người ký (Chủ DN & Đối tác)",
  "Đặt vị trí ô ký",
  "Kiểm tra & gửi",
];

type Step = 0 | 1 | 2 | 3;

function formatVariableLabel(key: string): string {
  return VARIABLE_LABELS[key] ?? key.replace(/_/g, " ");
}

/** Chuyển Date -> YYYY-MM-DD cho input[type="date"] */
function toIsoDateInput(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Chuyển YYYY-MM-DD -> dd/MM/yyyy chuẩn hợp đồng Việt Nam */
function isoToVnDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Chuyển dd/MM/yyyy -> YYYY-MM-DD cho input[type="date"] */
function vnDateToIso(vn: string): string {
  const m = vn.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return "";
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

/** Cộng thêm số tháng vào ngày dd/MM/yyyy và trả về chuỗi thời hạn chuẩn */
function buildDurationValue(startVnDate: string, months: number): { text: string; endIso: string } {
  const iso = vnDateToIso(startVnDate) || toIsoDateInput(new Date());
  const d = new Date(`${iso}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  const endIso = toIsoDateInput(d);
  const endVn = isoToVnDate(endIso);
  const label = months >= 12 && months % 12 === 0 ? `${months / 12} năm` : `${months} tháng`;
  return {
    text: `${label} (đến ngày ${endVn})`,
    endIso,
  };
}

function isStartDateField(key: string): boolean {
  return key === "ngay_hieu_luc" || key.startsWith("ngay_");
}

function isDurationOrEndDateField(key: string): boolean {
  return (
    key === "thoi_han_hop_dong" ||
    key === "thoi_gian_bao_hanh" ||
    key.includes("thoi_han") ||
    key.includes("ket_thuc")
  );
}

function isMoneyField(key: string, label?: string): boolean {
  const k = key.toLowerCase();
  const l = (label ?? "").toLowerCase();
  if (
    k.includes("mst") ||
    k.includes("cccd") ||
    k.includes("sdt") ||
    k.includes("stk") ||
    k.includes("dien_tich")
  ) {
    return false;
  }
  return (
    k === "gia_tri_hop_dong" ||
    k === "muc_luong_chinh" ||
    k === "gia_thue_hang_thang" ||
    k === "tien_dat_coc" ||
    k.includes("gia_tri") ||
    k.includes("gia_ban") ||
    k.includes("gia_mua") ||
    k.includes("gia_thue") ||
    k.includes("don_gia") ||
    k.includes("muc_luong") ||
    k.includes("tien_") ||
    k.includes("_tien") ||
    k.includes("chi_phi") ||
    k.includes("dat_coc") ||
    l.includes("giá trị") ||
    l.includes("giá bán") ||
    l.includes("giá thuê") ||
    l.includes("số tiền") ||
    l.includes("tổng tiền") ||
    l.includes("mức lương") ||
    l.includes("đặt cọc") ||
    l.includes("vnđ") ||
    l.includes("vnd")
  );
}

function formatDigitsToVnCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return raw;
  const normalized = digits.replace(/^0+(?=\d)/, "");
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function defaultBoxForOrder(
  index: number,
  totalSigners = 2,
  targetPage = 1,
): Pick<NewSigner, "pageNumber" | "boxX" | "boxY" | "boxWidth" | "boxHeight"> {
  if (totalSigners === 1) {
    return {
      pageNumber: targetPage,
      boxX: 355,
      boxY: 55,
      boxWidth: DEFAULT_BOX_WIDTH,
      boxHeight: DEFAULT_BOX_HEIGHT,
    };
  }
  const col = index % 2;
  const row = Math.floor(index / 2);
  return {
    pageNumber: targetPage,
    boxX: col === 0 ? 65 : 355,
    boxY: Math.max(40, 55 - row * 72),
    boxWidth: DEFAULT_BOX_WIDTH,
    boxHeight: DEFAULT_BOX_HEIGHT,
  };
}

/**
 * Tự động phân trang nội dung hợp đồng thành các trang A4 thực tế (Trang 1, Trang 2...)
 * để khi bấm chuyển trang sẽ hiển thị đúng nội dung từng trang và đặt khối Ký tên ở trang cuối.
 */
function splitContractIntoA4Pages(structuredTemplate: string, title: string): string[][] {
  const rawLines = structuredTemplate.replace(/\r\n/g, "\n").split("\n");
  const normalizedTitle = (title || "").trim().toUpperCase();

  // Loại bỏ dòng Quốc hiệu / Tiêu ngữ / Tiêu đề trùng lặp ở đầu (trước Mục I) vì Trang 1 đã có phần Header căn giữa chuẩn
  let seenFirstSection = false;
  const bodyLines = rawLines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return seenFirstSection;
    const upper = trimmed.toUpperCase();
    if (/^(I+\.|ĐIỀU\s+\d+|-\s+)/i.test(trimmed)) {
      seenFirstSection = true;
    }
    if (!seenFirstSection) {
      if (upper === "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM") return false;
      if (trimmed === "Độc lập - Tự do - Hạnh phúc") return false;
      if (normalizedTitle && upper === normalizedTitle) return false;
      if (/^(HỢP ĐỒNG|THỎA THUẬN|BIÊN BẢN|PHỤ LỤC)\b/i.test(trimmed) && !trimmed.endsWith(".")) {
        return false;
      }
    }
    return true;
  });

  // Gom từng điều khoản (ĐIỀU X...) cùng đoạn văn ngay sau nó thành 1 cụm để không bị đứt tiêu đề cuối trang
  const blocks: { lines: string[]; weight: number }[] = [];
  let i = 0;
  while (i < bodyLines.length) {
    const line = bodyLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      blocks.push({ lines: [line], weight: 0.45 });
      i++;
      continue;
    }

    const isClauseHeading = /^ĐIỀU\s+\d+/i.test(trimmed);
    const isSectionHeading = /^I+\./i.test(trimmed);

    if (isClauseHeading && i + 1 < bodyLines.length && bodyLines[i + 1].trim() !== "") {
      const nextLine = bodyLines[i + 1];
      const nextWeight = Math.max(1, Math.ceil(nextLine.trim().length / 78));
      blocks.push({
        lines: [line, nextLine],
        weight: 1.3 + nextWeight,
      });
      i += 2;
      continue;
    }

    const lineWeight = isSectionHeading
      ? 1.25
      : Math.max(1, Math.ceil(trimmed.length / 78));
    blocks.push({ lines: [line], weight: lineWeight });
    i++;
  }

  const totalWeight = blocks.reduce((acc, b) => acc + b.weight, 0);
  // Nếu tổng nội dung <= 28 dòng quy đổi (hầu hết các mẫu 3-4 điều khoản ngắn gọn), giữ trọn vẹn trong 1 trang A4
  if (totalWeight <= 28) {
    return [bodyLines];
  }

  const pages: string[][] = [];
  let currentPage: string[] = [];
  let currentWeight = 0;
  let pageCapacity = 25;

  for (const block of blocks) {
    if (currentPage.length > 0 && currentWeight + block.weight > pageCapacity) {
      pages.push(currentPage);
      currentPage = [...block.lines];
      currentWeight = block.weight;
      pageCapacity = 28;
    } else {
      currentPage.push(...block.lines);
      currentWeight += block.weight;
    }
  }

  if (currentPage.length > 0) {
    // Nếu trang cuối chỉ còn quá ít dòng (< 6 dòng quy đổi), gộp luôn vào trang trước để không bị lẻ 1 điều ngắn
    if (pages.length > 0 && currentWeight < 6) {
      pages[pages.length - 1].push(...currentPage);
    } else {
      pages.push(currentPage);
    }
  }

  return pages.length > 0 ? pages : [bodyLines];
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2 bg-surface border border-line rounded-xl p-3 shadow-sm">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2.5 flex-1 min-w-0">
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
              i < step
                ? "bg-emerald-600 text-white shadow-xs"
                : i === step
                  ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/30 scale-105 ring-2 ring-blue-300/50"
                  : "bg-slate-100 text-muted border border-line"
            }`}
          >
            {i < step ? <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" /> : i + 1}
          </span>
          <span className={`text-xs sm:text-sm truncate transition-colors ${i === step ? "font-bold text-blue-700" : i < step ? "font-semibold text-fg" : "text-muted"}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <span className="hidden sm:block flex-1 h-[2px] bg-slate-200 overflow-hidden rounded-full">
              <span
                className={`block h-full bg-emerald-500 origin-left transition-transform duration-300 ${
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
 * Tờ hợp đồng A4 dùng font-sans ("Segoe UI", Roboto, Arial) đồng bộ 100% với PDF của Backend
 * giúp hiển thị tiếng Việt có dấu sắc nét, không bao giờ lỗi dấu.
 */
function InteractiveContractPaper({
  title,
  structuredTemplate,
  values,
  focusedVar,
  onSelectVar,
  signers,
  interactiveFields = true,
  signatureSectionRef,
  pageNumber,
  onSwitchPage,
}: {
  title: string;
  structuredTemplate: string;
  values: Record<string, string>;
  focusedVar?: string | null;
  onSelectVar?: (varKey: string) => void;
  signers?: NewSigner[];
  interactiveFields?: boolean;
  signatureSectionRef?: React.RefObject<HTMLDivElement | null>;
  pageNumber?: number;
  onSwitchPage?: (page: number) => void;
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

  const pages = React.useMemo(
    () => splitContractIntoA4Pages(structuredTemplate, title),
    [structuredTemplate, title],
  );
  const totalPages = pages.length;
  const isPaginatedMode = typeof pageNumber === "number";
  const clampedPage = isPaginatedMode
    ? Math.max(1, Math.min(totalPages, pageNumber))
    : 1;
  const activeLines = isPaginatedMode
    ? (pages[clampedPage - 1] ?? pages[0] ?? [])
    : pages.flatMap((p) => p);
  const showHeader = !isPaginatedMode || clampedPage === 1;
  const showSignatureBlock = !isPaginatedMode || clampedPage === totalPages;

  const renderLineWithTokens = (line: string, lineIdx: number) => {
    const parts = line.split(/(\{\{[a-zA-Z0-9_]+\}\})/g);
    const seenVarInLine: Record<string, boolean> = {};

    return parts.map((part, partIdx) => {
      if (/^\{\{.+\}\}$/.test(part)) {
        const key = part.slice(2, -2);
        const rawVal = values[key]?.trim();
        const label = formatVariableLabel(key);
        const val =
          rawVal && isMoneyField(key, label)
            ? formatDigitsToVnCurrency(rawVal)
            : rawVal;
        const isFocused = focusedVar === key;
        const isFirstRef = !seenVarInLine[key];
        seenVarInLine[key] = true;

        if (!interactiveFields) {
          return (
            <span key={`${lineIdx}-${partIdx}`} className="font-semibold text-slate-900">
              {val || `[${label}]`}
            </span>
          );
        }

        return (
          <button
            key={`${lineIdx}-${partIdx}`}
            type="button"
            ref={(el) => {
              if (isFirstRef) tokenRefs.current[key] = el;
            }}
            onClick={() => onSelectVar?.(key)}
            className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-sm font-sans text-xs transition-all cursor-pointer ${
              isFocused
                ? "bg-primary text-white font-bold ring-2 ring-primary/40 shadow-xs"
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
    <div className="bg-white text-slate-900 font-sans px-7 py-6 text-[12px] leading-[1.6] flex flex-col justify-start min-h-[780px]">
      <div>
        {showHeader ? (
          <>
            <div className="text-center mb-3">
              <p className="font-bold text-[12px] uppercase tracking-wide">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p className="font-semibold text-[11.5px] underline underline-offset-4">
                Độc lập - Tự do - Hạnh phúc
              </p>
            </div>

            <div className="text-center my-2.5">
              <p className="font-bold text-[14px] uppercase text-[#1f5fa8]">
                {title.trim() || "HỢP ĐỒNG GIAO DỊCH"}
              </p>
              <p className="text-[10.5px] text-slate-500 mt-0.5">
                Ngày lập: {values["ngay_hieu_luc"] || isoToVnDate(toIsoDateInput(new Date()))}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200 text-[10.5px] text-slate-500">
            <span className="font-semibold uppercase text-slate-700 truncate">
              {title.trim() || "HỢP ĐỒNG GIAO DỊCH"} (Tiếp theo)
            </span>
            <span className="font-mono shrink-0">
              Trang {clampedPage} / {totalPages}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1 mt-2">
          {activeLines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={idx} className="h-1.5" />;

            const isCenteredDocTitle =
              /^(HỢP ĐỒNG|THỎA THUẬN|BIÊN BẢN|PHỤ LỤC)\s+/i.test(trimmed) &&
              trimmed.length < 95 &&
              !trimmed.endsWith(".") &&
              !trimmed.endsWith(":");

            if (isCenteredDocTitle) {
              return (
                <p
                  key={idx}
                  className="text-center font-bold text-[14px] uppercase text-[#1f5fa8] my-2"
                >
                  {renderLineWithTokens(line, idx)}
                </p>
              );
            }

            const isHeading = /^(ĐIỀU\s+\d+|I+\.)/i.test(trimmed);

            return (
              <p
                key={idx}
                className={`${isHeading ? "font-bold text-[12px] mt-1.5 text-slate-950" : "text-[11.5px] text-slate-800"}`}
              >
                {renderLineWithTokens(line, idx)}
              </p>
            );
          })}
        </div>
      </div>

      {showSignatureBlock ? (
        /* Khối đại diện ký nằm ngay dưới điều khoản cuối cùng (không bị đẩy cách xa) */
        <div
          ref={signatureSectionRef}
          className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-center text-[11px] text-slate-700 pb-4"
        >
          <div>
            <p className="font-bold uppercase text-slate-950">ĐẠI DIỆN BÊN A (CHỦ DN)</p>
            <p className="text-[10px] italic text-slate-500">(Nhận email xác nhận & ký số trước)</p>
            <div className="h-24 my-1 rounded-sm border border-dashed border-slate-200/80 flex items-center justify-center text-[10px] text-slate-400">
              Vùng đặt ô chữ ký Bên A
            </div>
            <p className="font-semibold text-slate-900 truncate">
              {signers?.[0]?.fullName || values["dai_dien_ben_a"] || values["ten_ben_a"] || ""}
            </p>
          </div>
          <div>
            <p className="font-bold uppercase text-slate-950">ĐẠI DIỆN BÊN B (ĐỐI TÁC)</p>
            <p className="text-[10px] italic text-slate-500">(Nhận email ký sau khi Bên A đã duyệt)</p>
            <div className="h-24 my-1 rounded-sm border border-dashed border-slate-200/80 flex items-center justify-center text-[10px] text-slate-400">
              Vùng đặt ô chữ ký Bên B
            </div>
            <p className="font-semibold text-slate-900 truncate">
              {signers?.[1]?.fullName ||
                values["dai_dien_ben_b"] ||
                values["ho_ten_nhan_vien"] ||
                values["ten_ben_b"] ||
                ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Trang {clampedPage} / {totalPages} · Còn tiếp các điều khoản và mục Đại diện ký tên ở Trang {clampedPage + 1}
          </span>
          {onSwitchPage && (
            <button
              type="button"
              onClick={() => onSwitchPage(clampedPage + 1)}
              className="px-2.5 py-1 rounded-sm bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
            >
              Sang Trang {clampedPage + 1} (Vùng ký tên) →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function NewContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, activeTenantId } = useWorkspace();
  const templates = useApi("templates", templatesApi.list);
  const tenants = useApi("tenants:mine", tenantsApi.mine);
  const currentTenantApi = useApi("tenants:current", tenantsApi.getCurrent);
  const currentTenant = currentTenantApi.data;

  const activeTenant = React.useMemo(
    () => tenants.data?.find((t) => t.id === activeTenantId) ?? tenants.data?.[0],
    [tenants.data, activeTenantId],
  );

  const [step, setStep] = React.useState<Step>(0);
  const [source, setSource] = React.useState<"template" | "upload">("template");
  const [title, setTitle] = React.useState("");
  const [selectedChoice, setSelectedChoice] = React.useState(
    searchParams.get("templateId") ?? `ref:${REFERENCE_TEMPLATES[0].id}`,
  );
  const [templateDetail, setTemplateDetail] = React.useState<TemplateDetail | null>(null);

  const [extraFields, setExtraFields] = React.useState<TemplateFieldItem[]>([]);
  const [removedFieldKeys, setRemovedFieldKeys] = React.useState<string[]>([]);
  const [customClauses, setCustomClauses] = React.useState<TemplateClauseItem[] | null>(null);
  const [newFieldLabel, setNewFieldLabel] = React.useState("");
  const [newFieldSection, setNewFieldSection] = React.useState<FieldSection | "clause">("transaction");

  const [values, setValues] = React.useState<Record<string, string>>({});
  const [endDateIso, setEndDateIso] = React.useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return toIsoDateInput(d);
  });
  const [focusedVar, setFocusedVar] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploadedTotalPages, setUploadedTotalPages] = React.useState(1);
  const [signers, setSigners] = React.useState<NewSigner[]>([
    {
      fullName: user.fullName || "",
      email: user.email || "",
      role: "Signer",
      phone: user.phoneNumber || "",
      title: user.jobTitle || "",
      ...defaultBoxForOrder(0, 2),
    },
    { fullName: "", email: "", role: "Signer", phone: "", title: "", organization: "", ...defaultBoxForOrder(1, 2) },
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

  // ?draft=<id>: tiếp tục soạn một bản Nháp. Nội dung PDF đã khóa (đã băm SHA-256), chỉ sửa người nhận, ô ký và hạn ký.
  const resumeDraftId = searchParams.get("draft");
  const [resumeError, setResumeError] = React.useState<unknown>(null);
  const [resumeLoading, setResumeLoading] = React.useState(resumeDraftId !== null);

  React.useEffect(() => {
    if (!resumeDraftId) return;
    let cancelled = false;
    (async () => {
      try {
        const detail = await contractsApi.get(resumeDraftId);
        if (detail.status !== "Draft" || !detail.documentUrl) {
          throw new Error("Chỉ tiếp tục soạn được hợp đồng đang ở trạng thái Nháp.");
        }
        const pdf = await fetch(detail.documentUrl);
        if (!pdf.ok) throw new Error("Không tải được tệp PDF của bản nháp.");
        const blob = await pdf.blob();
        if (cancelled) return;
        setSource("upload");
        setFile(new File([blob], `${detail.code}.pdf`, { type: "application/pdf" }));
        setTitle(detail.title);
        if (detail.signers.length > 0) {
          setSigners(
            detail.signers.map((s, i) => ({
              fullName: s.fullName,
              email: s.email,
              role: s.role ?? "Signer",
              phone: s.phone ?? "",
              organization: s.organization ?? "",
              title: s.title ?? "",
              ...defaultBoxForOrder(i, detail.signers.length),
              ...(s.boxWidth ? { pageNumber: s.pageNumber ?? 1, boxX: s.boxX ?? 0, boxY: s.boxY ?? 0, boxWidth: s.boxWidth, boxHeight: s.boxHeight ?? 0 } : {}),
            })),
          );
        }
        setCreatedDraftId(detail.id);
        setStep(1);
      } catch (err) {
        if (!cancelled) setResumeError(err);
      } finally {
        if (!cancelled) setResumeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resumeDraftId]);

  const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const placementScrollRef = React.useRef<HTMLDivElement>(null);
  const signatureSectionRef = React.useRef<HTMLDivElement>(null);
  const dragStateRef = React.useRef<{
    signerIdx: number;
    startClientX: number;
    startClientY: number;
    startBoxX: number;
    startBoxY: number;
  } | null>(null);

  /**
   * Tự động điền thông tin mặc định thông minh:
   * - Ngày bắt đầu hiệu lực (`ngay_hieu_luc`) = Ngày hôm nay (dd/MM/yyyy)
   * - Thời hạn thực hiện (`thoi_han_hop_dong`) = 1 năm kể từ hôm nay
   * - Thông tin Bên A = Tên DN, MST, Địa chỉ, Người đại diện của doanh nghiệp hiện tại
   */
  const buildSmartDefaultValues = React.useCallback(
    (varKeys: string[]): Record<string, string> => {
      const todayIso = toIsoDateInput(new Date());
      const todayVn = isoToVnDate(todayIso);
      const oneYear = buildDurationValue(todayVn, 12);

      const defaults: Record<string, string> = {};
      const company = currentTenant ?? activeTenant;
      for (const k of varKeys) {
        if (isStartDateField(k)) {
          defaults[k] = todayVn;
        } else if (k === "thoi_gian_bao_hanh") {
          defaults[k] = "12 tháng";
        } else if (isDurationOrEndDateField(k)) {
          defaults[k] = oneYear.text;
        } else if (k === "ten_ben_a" && (company?.name || activeTenant?.name)) {
          defaults[k] = company?.name || activeTenant?.name || "";
        } else if (k === "mst_ben_a" && (company?.taxCode || activeTenant?.taxCode)) {
          defaults[k] = company?.taxCode || activeTenant?.taxCode || "";
        } else if (k === "dia_chi_ben_a" && (company?.address || activeTenant?.address)) {
          defaults[k] = company?.address || activeTenant?.address || "";
        } else if (k === "dai_dien_ben_a") {
          defaults[k] = company?.representativeName || user.fullName || "";
        } else if (k === "chuc_vu_ben_a" && company?.representativeTitle) {
          defaults[k] = company.representativeTitle;
        } else if (k === "sdt_ben_a" && (company?.phone || user.phoneNumber)) {
          defaults[k] = company?.phone || user.phoneNumber || "";
        }
      }
      return defaults;
    },
    [currentTenant, activeTenant, user.fullName, user.phoneNumber],
  );

  // Khi chọn mẫu (mẫu tham khảo hoặc mẫu DB) -> nạp nội dung & tự điền ngày hôm nay + thông tin Bên A
  React.useEffect(() => {
    let cancelled = false;

    if (!selectedChoice) {
      Promise.resolve().then(() => {
        if (!cancelled) setTemplateDetail(null);
      });
      return () => {
        cancelled = true;
      };
    }

    if (selectedChoice.startsWith("ref:")) {
      const refId = selectedChoice.slice(4);
      const refBp = REFERENCE_TEMPLATES.find((r) => r.id === refId) ?? REFERENCE_TEMPLATES[0];
      const compiled = buildFormattedContractFromBlueprint(refBp);
      const vars = refBp.fields.map((f) => f.key);
      const smartDefaults = buildSmartDefaultValues(vars);

      Promise.resolve().then(() => {
        if (cancelled) return;
        setTemplateDetail({
          id: selectedChoice,
          name: refBp.name,
          content: compiled,
          variables: vars,
          authorName: "Mẫu chuẩn hệ thống",
          updatedAt: new Date().toISOString(),
        });
        setTitle(refBp.name);
        setExtraFields([]);
        setRemovedFieldKeys([]);
        setCustomClauses(null);
        setValues(smartDefaults);

        // Tự động focus vào trường đầu tiên chưa có dữ liệu (thường là Tên đối tác Bên B)
        const firstEmptyVar = vars.find((v) => !smartDefaults[v]) ?? vars[0];
        if (firstEmptyVar) {
          setFocusedVar(firstEmptyVar);
          setTimeout(() => inputRefs.current[firstEmptyVar]?.focus(), 80);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    templatesApi
      .get(selectedChoice)
      .then((detail) => {
        if (!cancelled) {
          const smartDefaults = buildSmartDefaultValues(detail.variables);
          setTemplateDetail(detail);
          setTitle(detail.name);
          setExtraFields([]);
          setRemovedFieldKeys([]);
          setCustomClauses(null);
          setValues(smartDefaults);

          const firstEmptyVar =
            detail.variables.find((v) => !smartDefaults[v]) ?? detail.variables[0];
          if (firstEmptyVar) {
            setFocusedVar(firstEmptyVar);
            setTimeout(() => inputRefs.current[firstEmptyVar]?.focus(), 80);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setTemplateDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedChoice, buildSmartDefaultValues]);

  // Khi sang Bước 3 (Đặt vị trí ô ký), tự động cuộn khung A4 xuống phần ĐẠI DIỆN BÊN A / BÊN B ở cuối trang
  React.useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        if (placementScrollRef.current) {
          placementScrollRef.current.scrollTo({
            top: placementScrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 120);
    }
  }, [step]);

  const mergedBlueprint = React.useMemo(() => {
    if (!templateDetail) return null;
    const base = parseTemplateIntoBlueprint(
      title || templateDetail.name,
      normalizeTemplateStructure(templateDetail.content, title || templateDetail.name),
    );
    const combinedFields = [...base.fields];
    for (const ef of extraFields) {
      if (!combinedFields.some((f) => f.key === ef.key)) {
        combinedFields.push(ef);
      }
    }
    const visibleFields = combinedFields.filter((f) => !removedFieldKeys.includes(f.key));
    const orderedFields = [
      ...visibleFields.filter((f) => f.section === "partyA"),
      ...visibleFields.filter((f) => f.section === "partyB"),
      ...visibleFields.filter((f) => f.section === "transaction"),
    ];
    const activeClauses = customClauses ?? base.clauses;
    const compiledContent = buildFormattedContractFromBlueprint({
      name: title || templateDetail.name,
      legalBasis: base.legalBasis,
      partyATitle: base.partyATitle,
      partyBTitle: base.partyBTitle,
      fields: orderedFields,
      clauses: activeClauses,
    });
    return {
      orderedFields,
      activeClauses,
      compiledContent,
    };
  }, [templateDetail, title, extraFields, removedFieldKeys, customClauses]);

  const activeVariables = React.useMemo(
    () => mergedBlueprint?.orderedFields.map((f) => f.key) ?? [],
    [mergedBlueprint],
  );

  const contractPages = React.useMemo(
    () => splitContractIntoA4Pages(mergedBlueprint?.compiledContent ?? "", title),
    [mergedBlueprint?.compiledContent, title],
  );
  const totalTemplatePages = Math.max(1, contractPages.length);
  const maxPageLimit =
    source === "upload" ? Math.max(1, uploadedTotalPages) : totalTemplatePages;

  const handleRemoveField = (key: string, label: string) => {
    if ((mergedBlueprint?.orderedFields.length ?? 0) <= 1) {
      toast("Hợp đồng cần giữ lại ít nhất 1 trường thông tin.", "error");
      return;
    }
    setExtraFields((prev) => prev.filter((f) => f.key !== key));
    setRemovedFieldKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setCreatedDraftId(null);
    toast(`Đã xóa mục "${label}" khỏi hợp đồng.`, "info");
  };

  const handleAddClause = (customTitle?: string, customBody?: string) => {
    const currentList = mergedBlueprint?.activeClauses ?? [];
    const nextNum = currentList.length + 1;
    const rawTitle = (customTitle ?? "").trim();
    const formattedTitle = rawTitle
      ? /^ĐIỀU\s+\d+/i.test(rawTitle)
        ? rawTitle.toUpperCase()
        : `ĐIỀU ${nextNum}. ${rawTitle.toUpperCase()}`
      : `ĐIỀU ${nextNum}. ĐIỀU KHOẢN THỎA THUẬN BỔ SUNG`;

    const nextClauses: TemplateClauseItem[] = [
      ...currentList,
      {
        title: formattedTitle,
        body:
          customBody?.trim() ||
          "Hai bên thống nhất thực hiện đầy đủ nghĩa vụ và cam kết theo nội dung điều khoản này.",
      },
    ];
    setCustomClauses(nextClauses);
    setCreatedDraftId(null);
    toast(`Đã thêm "${formattedTitle}" vào hợp đồng.`, "success");
  };

  const handleUpdateClause = (idx: number, patch: Partial<TemplateClauseItem>) => {
    const currentList = mergedBlueprint?.activeClauses ?? [];
    const nextClauses = currentList.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    setCustomClauses(nextClauses);
    setCreatedDraftId(null);
  };

  const handleRemoveClause = (idx: number) => {
    const currentList = mergedBlueprint?.activeClauses ?? [];
    if (currentList.length <= 1) {
      toast("Hợp đồng cần có ít nhất 1 điều khoản.", "error");
      return;
    }
    const removedTitle = currentList[idx]?.title ?? `Điều ${idx + 1}`;
    // Xóa và tự động đánh lại số thứ tự ĐIỀU 1, ĐIỀU 2...
    const nextClauses = currentList
      .filter((_, i) => i !== idx)
      .map((c, newIdx) => ({
        ...c,
        title: c.title.replace(/^ĐIỀU\s+\d+/i, `ĐIỀU ${newIdx + 1}`),
      }));
    setCustomClauses(nextClauses);
    setCreatedDraftId(null);
    toast(`Đã xóa "${removedTitle}" và đánh lại thứ tự điều khoản.`, "info");
  };

  const handleAddInlineField = () => {
    const clean = newFieldLabel.trim();
    if (!clean) {
      toast("Nhập tên mục thông tin hoặc điều khoản muốn thêm.", "error");
      return;
    }

    // Nếu người dùng chọn "Mục IV · Điều khoản" hoặc gõ bắt đầu bằng "Điều..." -> Tự động thêm vào Điều khoản hợp đồng!
    if (newFieldSection === "clause" || /^điều(\s+\d+|\s*:|\s*\.)/i.test(clean)) {
      const cleanedTitle = clean.replace(/^điều\s*\d*\s*[.:-]?\s*/i, "").trim();
      handleAddClause(cleanedTitle || "ĐIỀU KHOẢN BỔ SUNG");
      setNewFieldLabel("");
      return;
    }

    const baseKey = slugifyVariableName(clean);
    if (!baseKey) return;
    const prefix =
      newFieldSection === "partyA" ? "ben_a_" : newFieldSection === "partyB" ? "ben_b_" : "";
    const key =
      baseKey.includes("ben_a") || baseKey.includes("ben_b") ? baseKey : `${prefix}${baseKey}`;

    registerVariableLabel(key, clean);
    setRemovedFieldKeys((prev) => prev.filter((k) => k !== key));
    setExtraFields((prev) =>
      prev.some((f) => f.key === key) ? prev : [...prev, { key, label: clean, section: newFieldSection }],
    );
    setNewFieldLabel("");
    setCreatedDraftId(null);
    setTimeout(() => focusVariableInput(key), 60);
    toast(`Đã thêm "${clean}" và tự động sắp xếp lại hợp đồng.`, "success");
  };

  const focusVariableInput = (varKey: string) => {
    setFocusedVar(varKey);
    const el = inputRefs.current[varKey];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleVariableKeyDown = (currentVar: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const idx = activeVariables.indexOf(currentVar);
    if (idx >= 0 && idx < activeVariables.length - 1) {
      const nextVar = activeVariables[idx + 1];
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
      : activeVariables.length > 0 && activeVariables.every((v) => (values[v] ?? "").trim() !== ""));

  const hasSignerRole = signers.some((s) => (s.role ?? "Signer") === "Signer");
  const step2Valid =
    signers.length > 0 &&
    hasSignerRole &&
    signers.every((s) => {
      const name = s.fullName.trim();
      return name.length > 0 && name.length <= 100 && isValidEmail(s.email);
    }) &&
    dueAt !== "";

  const goToSignersStep = () => {
    const company = currentTenant ?? activeTenant;
    const repA = values["dai_dien_ben_a"] || company?.representativeName || user.fullName || "";
    const repB =
      values["dai_dien_ben_b"] || values["ho_ten_nhan_vien"] || values["ten_ben_b"] || "";

    setSigners((prev) => {
      const next = [...prev];
      if (next[0]) {
        next[0] = {
          ...next[0],
          fullName: repA || next[0].fullName,
          email: next[0].email || company?.contactEmail || user.email || "",
          phone: next[0].phone || company?.phone || user.phoneNumber || "",
          organization: next[0].organization || company?.name || "",
          title: next[0].title || company?.representativeTitle || user.jobTitle || "",
          role: next[0].role ?? "Signer",
        };
      }
      if (next[1] && !next[1].fullName.trim() && repB) {
        next[1] = {
          ...next[1],
          fullName: repB,
          organization: next[1].organization || values["ten_ben_b"] || "",
          title: next[1].title || values["chuc_vu_ben_b"] || "",
          phone: next[1].phone || values["sdt_ben_b"] || "",
          role: next[1].role ?? "Signer",
        };
      }
      return next;
    });
    setStep(1);
  };

  const computeSignatureZoneBoxY = React.useCallback((): number => {
    const canvasEl = canvasRef.current;
    const sigEl = signatureSectionRef.current;
    if (!canvasEl || !sigEl) return 55;
    const canvasRect = canvasEl.getBoundingClientRect();
    const sigRect = sigEl.getBoundingClientRect();
    if (canvasRect.height <= 0) return 55;
    // Khoảng cách từ đỉnh tờ A4 đến vùng khung nét đứt bên trong khối ĐẠI DIỆN BÊN A / BÊN B (~44px từ đỉnh sigSection)
    const boxTopPx = Math.max(0, sigRect.top - canvasRect.top + 44);
    const computedY = Math.round(
      PDF_PAGE_HEIGHT - (boxTopPx / canvasRect.height) * PDF_PAGE_HEIGHT - DEFAULT_BOX_HEIGHT,
    );
    return Math.max(25, Math.min(PDF_PAGE_HEIGHT - DEFAULT_BOX_HEIGHT - 20, computedY));
  }, []);

  const goToPlacement = async () => {
    if (!signers.some((s) => (s.role ?? "Signer") === "Signer")) {
      toast("Hợp đồng phải có ít nhất 1 người ký (Signer).", "error");
      return;
    }
    const normalizedEmails = signers.map((s) => s.email.trim().toLowerCase());
    if (new Set(normalizedEmails).size !== normalizedEmails.length) {
      toast("Email giữa các bên liên quan không được trùng nhau.", "error");
      return;
    }
    if (new Date(dueAt).getTime() <= Date.now()) {
      toast("Hạn ký phải sau thời điểm hiện tại.", "error");
      return;
    }
    // Viewer chỉ báo số trang sau khi bước đặt ô ký hiện ra, nên phải đếm trước; nếu không mọi ô ký rơi vào trang 1.
    let uploadPages = uploadedTotalPages;
    if (source === "upload" && file) {
      uploadPages = await countPdfPages(file).catch(() => uploadedTotalPages);
      setUploadedTotalPages(uploadPages);
    }
    const targetSignPage = source === "upload" ? Math.max(1, uploadPages) : totalTemplatePages;
    const firstSignerIndex = signers.findIndex((s) => (s.role ?? "Signer") === "Signer");
    setActiveSignerIndex(firstSignerIndex >= 0 ? firstSignerIndex : 0);
    setActivePage(targetSignPage);
    setStep(2);

    setTimeout(() => {
      const measuredY = source === "upload" ? 55 : computeSignatureZoneBoxY();
      setSigners((prev) =>
        prev.map((s, idx) => ({
          ...s,
          pageNumber:
            source === "upload"
              ? s.pageNumber > targetSignPage || s.pageNumber === 1
                ? targetSignPage
                : s.pageNumber
              : targetSignPage,
          boxX: idx % 2 === 0 ? 65 : 355,
          boxY: source === "upload" ? (s.boxY > 20 ? s.boxY : measuredY) : measuredY,
        })),
      );
    }, 60);
  };

  const autoAlignSignatureBoxes = () => {
    const targetSignPage = source === "upload" ? activePage : totalTemplatePages;
    setActivePage(targetSignPage);
    setTimeout(() => {
      const measuredY = source === "upload" ? 55 : computeSignatureZoneBoxY();
      setSigners((prev) =>
        prev.map((s, idx) => ({
          ...s,
          ...defaultBoxForOrder(idx, prev.length, targetSignPage),
          boxY: measuredY,
        })),
      );
      if (signatureSectionRef.current) {
        signatureSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
    toast(
      `Đã tự động căn chỉnh vị trí ô ký vào khu vực Đại diện ký ở Trang ${targetSignPage}.`,
      "success",
    );
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
    // Đã có bản nháp: chỉ cập nhật người nhận.
    if (createdDraftId) {
      await contractsApi.setSigners(createdDraftId, signers);
      return createdDraftId;
    }

    // Chưa có: tạo bản nháp kèm người nhận trong một lần gọi, sai thì backend không lưu gì.
    let contractId: string;
    if (source === "upload" && file) {
      const res = await contractsApi.upload(file, title.trim(), signers);
      contractId = res.contractId;
    } else {
      let realTemplateId = selectedChoice;
      const compiledContent = mergedBlueprint?.compiledContent ?? templateDetail?.content ?? "";
      if (
        selectedChoice.startsWith("ref:") ||
        extraFields.length > 0 ||
        removedFieldKeys.length > 0 ||
        customClauses !== null
      ) {
        const createdTpl = await templatesApi.create({
          name: title.trim(),
          content: compiledContent,
        });
        realTemplateId = createdTpl.id;
      }
      const normalizedValues: Record<string, string> = {};
      for (const [k, v] of Object.entries(values)) {
        normalizedValues[k] = isMoneyField(k, formatVariableLabel(k))
          ? formatDigitsToVnCurrency(v)
          : v;
      }
      const res = await contractsApi.createFromTemplate(
        realTemplateId,
        title.trim(),
        normalizedValues,
        signers,
      );
      contractId = res.contractId;
    }
    setCreatedDraftId(contractId);
    return contractId;
  };

  // Chưa eKYC thì không tạo được hợp đồng: đưa người dùng tới Cài đặt > Bảo mật, nơi có thẻ xác minh danh tính.
  const notifyNotVerified = () => {
    toast("Bạn cần xác minh danh tính (eKYC) trước khi tạo hợp đồng. Đang chuyển tới trang Cài đặt.", "error");
    router.push("/app/settings?tab=security");
  };

  const handleSaveDraftOnly = async () => {
    setIsSavingDraft(true);
    try {
      const contractId = await ensureDraftAndSigners();
      toast("Đã lưu hợp đồng nháp và vị trí ô ký.", "success");
      router.push(`/app/contracts/${contractId}`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "Identity.NotVerified") {
        notifyNotVerified();
      } else {
        toast(err instanceof ApiError ? err.message : "Không lưu được hợp đồng nháp.", "error");
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const contractId = await ensureDraftAndSigners();
      await contractsApi.send(contractId, new Date(dueAt).toISOString());
      toast(
        "Đã gửi email xác nhận ký hợp đồng cho Chủ doanh nghiệp (Lượt #1).",
        "success",
      );
      router.push(`/app/contracts/${contractId}`);
    } catch (err) {
      setConfirmOpen(false);
      if (err instanceof ApiError && err.code === "Identity.NotVerified") {
        notifyNotVerified();
      } else if (
        err instanceof ApiError &&
        (err.code === "Subscription.QuotaExceeded" ||
          err.code === "Quota.Exceeded" ||
          err.status === 403)
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

  /** Render ô nhập thông minh tùy theo loại trường (Ngày bắt đầu, Thời hạn/Ngày kết thúc, Tiền tệ, hoặc Văn bản) */
  const renderSmartFieldControl = (f: TemplateFieldItem, idx: number) => {
    const val = values[f.key] ?? "";

    // 1. Trường Ngày bắt đầu hiệu lực -> Bộ chọn lịch Date Picker + mặc định Hôm nay
    if (isStartDateField(f.key)) {
      const isoVal = vnDateToIso(val) || toIsoDateInput(new Date());
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-fg">
              {idx + 1}. {f.label} <span className="text-danger">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                const todayVn = isoToVnDate(toIsoDateInput(new Date()));
                setValues((prev) => ({ ...prev, [f.key]: todayVn }));
                setCreatedDraftId(null);
              }}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
            >
              Lấy ngày hôm nay
            </button>
          </div>
          <div className="relative flex items-center gap-2">
            <input
              ref={(el) => {
                inputRefs.current[f.key] = el;
              }}
              type="date"
              value={isoVal}
              onFocus={() => setFocusedVar(f.key)}
              onChange={(e) => {
                const pickedIso = e.target.value;
                if (!pickedIso) return;
                const pickedVn = isoToVnDate(pickedIso);
                setValues((prev) => ({ ...prev, [f.key]: pickedVn }));
                setCreatedDraftId(null);
              }}
              className="w-full h-10 px-3 rounded-md border border-line-strong bg-surface text-sm text-fg focus:outline-none focus:border-primary"
            />
            <span className="shrink-0 px-2.5 py-2 rounded-md bg-page border border-line text-xs font-mono text-fg">
              {val || isoToVnDate(isoVal)}
            </span>
          </div>
        </div>
      );
    }

    // 2. Trường Thời hạn hợp đồng / Ngày kết thúc -> Nút chọn nhanh (3 tháng, 6 tháng, 1 năm...) + Lịch chọn ngày kết thúc
    if (isDurationOrEndDateField(f.key)) {
      const startVn = values["ngay_hieu_luc"] || isoToVnDate(toIsoDateInput(new Date()));
      return (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-fg">
            {idx + 1}. {f.label} <span className="text-danger">*</span>
          </label>

          {/* Chọn nhanh thời hạn chỉ 1 cú nhấp */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: "3 tháng", months: 3 },
              { label: "6 tháng", months: 6 },
              { label: "1 năm", months: 12 },
              { label: "2 năm", months: 24 },
              { label: "3 năm", months: 36 },
            ].map((preset) => (
              <button
                key={preset.months}
                type="button"
                onClick={() => {
                  const computed = buildDurationValue(startVn, preset.months);
                  setEndDateIso(computed.endIso);
                  setValues((prev) => ({ ...prev, [f.key]: computed.text }));
                  setFocusedVar(f.key);
                  setCreatedDraftId(null);
                }}
                className="px-2.5 py-1 rounded-sm border border-primary/30 bg-surface hover:bg-selected text-xs font-semibold text-primary cursor-pointer transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Hoặc chọn ngày kết thúc cụ thể trên lịch */}
          <div className="grid grid-cols-1 sm:grid-cols-[165px_1fr] gap-2 items-center">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
              <input
                type="date"
                aria-label="Chọn ngày kết thúc"
                value={endDateIso}
                onChange={(e) => {
                  const pickedEndIso = e.target.value;
                  if (!pickedEndIso) return;
                  setEndDateIso(pickedEndIso);
                  const endVn = isoToVnDate(pickedEndIso);
                  setValues((prev) => ({
                    ...prev,
                    [f.key]: `Đến ngày ${endVn}`,
                  }));
                  setFocusedVar(f.key);
                  setCreatedDraftId(null);
                }}
                className="w-full h-9 px-2 rounded-md border border-line-strong bg-surface text-xs text-fg focus:outline-none focus:border-primary"
              />
            </div>

            <input
              ref={(el) => {
                inputRefs.current[f.key] = el;
              }}
              type="text"
              value={val}
              onFocus={() => setFocusedVar(f.key)}
              onKeyDown={(e) => handleVariableKeyDown(f.key, e)}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, [f.key]: e.target.value }));
                setCreatedDraftId(null);
              }}
              placeholder="VD: 1 năm (đến ngày 04/11/2027)"
              className="w-full h-9 px-3 rounded-md border border-line-strong bg-surface text-xs font-medium text-fg focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      );
    }

    // 3. Trường Tiền tệ (Giá trị hợp đồng / Mức lương / Tiền cọc) -> Tự động thêm dấu chấm phân cách hàng nghìn (1.000.000)
    if (isMoneyField(f.key, f.label)) {
      const displayMoney = val ? formatDigitsToVnCurrency(val) : "";
      return (
        <div className="flex flex-col gap-1.5">
          <Input
            ref={(el) => {
              inputRefs.current[f.key] = el;
            }}
            label={`${idx + 1}. ${f.label}`}
            required
            inputMode="numeric"
            value={displayMoney}
            onFocus={() => setFocusedVar(f.key)}
            onKeyDown={(e) => handleVariableKeyDown(f.key, e)}
            onChange={(e) => {
              const formatted = formatDigitsToVnCurrency(e.target.value);
              setValues((prev) => ({ ...prev, [f.key]: formatted }));
              setCreatedDraftId(null);
            }}
            placeholder="VD: 100.000.000"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted">Chọn nhanh:</span>
            {["10.000.000", "50.000.000", "100.000.000", "500.000.000"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setValues((prev) => ({ ...prev, [f.key]: preset }));
                  setFocusedVar(f.key);
                  setCreatedDraftId(null);
                }}
                className="px-2 py-0.5 rounded-sm border border-line bg-surface hover:border-primary/50 hover:text-primary text-[11px] font-mono text-fg cursor-pointer transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // 4. Các trường văn bản thông thường
    return (
      <Input
        ref={(el) => {
          inputRefs.current[f.key] = el;
        }}
        label={`${idx + 1}. ${f.label}`}
        required
        value={val}
        onFocus={() => setFocusedVar(f.key)}
        onKeyDown={(e) => handleVariableKeyDown(f.key, e)}
        onChange={(e) => {
          setValues((prev) => ({ ...prev, [f.key]: e.target.value }));
          setCreatedDraftId(null);
        }}
        placeholder={`Nhập ${f.label.toLowerCase()}…`}
      />
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={resumeDraftId ? "Tiếp tục soạn bản nháp" : "Soạn hợp đồng"}
        back={
          resumeDraftId
            ? { href: `/app/contracts/${resumeDraftId}`, label: "Chi tiết hợp đồng" }
            : { href: "/app/contracts", label: "Danh sách hợp đồng" }
        }
      />
      {resumeDraftId && resumeLoading ? (
        <p className="text-sm text-muted" role="status">Đang tải bản nháp…</p>
      ) : resumeDraftId && resumeError ? (
        <ErrorState error={resumeError} title="Không mở được bản nháp" />
      ) : (
        <>
      {resumeDraftId && (
        <p className="rounded-md border border-line bg-strip px-4 py-3 text-sm text-muted">
          Nội dung hợp đồng đã được khóa khi tạo bản nháp (mã băm SHA-256 cố định). Ở đây bạn chỉ sửa người nhận,
          vị trí ô ký và hạn ký. Muốn sửa nội dung, hãy hủy bản nháp và tạo hợp đồng mới.
        </p>
      )}
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
                    title: "Từ mẫu hợp đồng thông dụng",
                    text: "Tự động điền sẵn ngày hôm nay & thông tin Bên A — tự động dàn trang A4 chuẩn.",
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
                  placeholder="Ví dụ: Hợp đồng mua bán xe ô tô"
                />

                {source === "template" && (
                  <Select
                    label="Chọn mẫu hợp đồng tham khảo hoặc đã lưu"
                    required
                    value={selectedChoice}
                    onChange={(e) => {
                      setSelectedChoice(e.target.value);
                      setCreatedDraftId(null);
                    }}
                  >
                    <optgroup label="Kho 8 mẫu hợp đồng thông dụng (Có sẵn)">
                      {REFERENCE_TEMPLATES.map((r) => (
                        <option key={`ref:${r.id}`} value={`ref:${r.id}`}>
                          ★ {r.name} ({r.fields.length} mục)
                        </option>
                      ))}
                    </optgroup>
                    {(templates.data ?? []).length > 0 && (
                      <optgroup label="Mẫu đã lưu của doanh nghiệp">
                        {templates.data?.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.variables.length} mục)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </Select>
                )}
              </div>

              {source === "template" ? (
                templates.error ? (
                  <ErrorState error={templates.error} onRetry={templates.reload} />
                ) : (
                  mergedBlueprint && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start motion-safe:animate-fade-in pt-2">
                      {/* Cột trái: Các ô nhập liệu thông minh + Thêm mục thông tin mới */}
                      <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="p-4 rounded-md border border-line bg-page flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-fg">
                              Điền thông tin ({activeVariables.filter((v) => (values[v] ?? "").trim()).length}/
                              {activeVariables.length})
                            </span>
                            <span className="text-[11px] text-muted">Đã tự điền Bên A & Ngày hôm nay</span>
                          </div>

                          <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                            {mergedBlueprint.orderedFields.map((f, idx) => {
                              const isFocused = focusedVar === f.key;
                              return (
                                <div
                                  key={f.key}
                                  className={`relative p-3 rounded-md border transition-colors ${
                                    isFocused
                                      ? "border-primary bg-selected/60 shadow-2xs"
                                      : "border-line bg-surface"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveField(f.key, f.label)}
                                    title={`Xóa mục "${f.label}" khỏi hợp đồng`}
                                    aria-label={`Xóa mục ${f.label}`}
                                    className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[11px] font-medium text-muted hover:text-danger hover:bg-badge-declined-bg transition-colors cursor-pointer z-10"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Xóa
                                  </button>
                                  <div className="pr-12">{renderSmartFieldControl(f, idx)}</div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Khung tự thêm mục thông tin mới hoặc điều khoản mới */}
                          <div className="pt-3 border-t border-line flex flex-col gap-2">
                            <span className="text-xs font-bold text-fg">
                              + Cần thêm mục thông tin hoặc điều khoản mới?
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_165px] gap-2">
                              <input
                                type="text"
                                value={newFieldLabel}
                                onChange={(e) => setNewFieldLabel(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddInlineField();
                                  }
                                }}
                                placeholder={
                                  newFieldSection === "clause"
                                    ? "VD: Phạt vi phạm & Bồi thường..."
                                    : "VD: Biển số xe, Tiền đặt cọc..."
                                }
                                className="h-9 px-2.5 rounded-md border border-line-strong bg-surface text-xs text-fg placeholder:text-muted focus:outline-none focus:border-primary"
                              />
                              <select
                                value={newFieldSection}
                                onChange={(e) =>
                                  setNewFieldSection(e.target.value as FieldSection | "clause")
                                }
                                className="h-9 px-2 rounded-md border border-line-strong bg-surface text-xs text-fg focus:outline-none focus:border-primary"
                              >
                                <option value="transaction">Mục III · Giao dịch</option>
                                <option value="partyA">Mục I · Bên A</option>
                                <option value="partyB">Mục II · Bên B</option>
                                <option value="clause">Mục IV · Điều khoản</option>
                              </select>
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              className="w-full text-xs"
                              onClick={handleAddInlineField}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              {newFieldSection === "clause"
                                ? `Thêm Điều ${mergedBlueprint.activeClauses.length + 1} vào hợp đồng`
                                : "Thêm mục này & Tự động dàn trang lại"}
                            </Button>
                          </div>
                        </div>

                        {/* Khung quản lý Mục IV · Các điều khoản hợp đồng (ĐIỀU 1, ĐIỀU 2, ĐIỀU 3...) */}
                        <div className="p-4 rounded-md border border-line bg-page flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-fg">
                              Các điều khoản hợp đồng ({mergedBlueprint.activeClauses.length} điều)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddClause()}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Thêm Điều {mergedBlueprint.activeClauses.length + 1}
                            </button>
                          </div>

                          <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {mergedBlueprint.activeClauses.map((cl, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-md border border-line bg-surface flex flex-col gap-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={cl.title}
                                    onChange={(e) =>
                                      handleUpdateClause(idx, { title: e.target.value })
                                    }
                                    className="flex-1 font-bold text-xs text-fg bg-transparent border-b border-transparent focus:border-primary focus:outline-none py-0.5"
                                    placeholder={`ĐIỀU ${idx + 1}. TIÊU ĐỀ ĐIỀU KHOẢN`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveClause(idx)}
                                    title="Xóa điều khoản này"
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[11px] font-medium text-muted hover:text-danger hover:bg-badge-declined-bg transition-colors cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Xóa
                                  </button>
                                </div>
                                <textarea
                                  rows={2}
                                  value={cl.body}
                                  onChange={(e) =>
                                    handleUpdateClause(idx, { body: e.target.value })
                                  }
                                  className="w-full rounded-sm border border-line bg-page p-2 text-xs text-fg focus:outline-none focus:border-primary leading-relaxed"
                                  placeholder="Nhập nội dung chi tiết của điều khoản..."
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Cột phải: Tờ hợp đồng A4 tương tác trực tiếp */}
                      <div className="lg:col-span-7 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-muted px-1">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-fg">
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            Bản xem trước hợp đồng chuẩn A4 (Cuộn để xem toàn bộ)
                          </span>
                          <span>Bấm vào bất kỳ ô màu nào trên giấy để sửa nhanh</span>
                        </div>

                        <div className="rounded-md border-2 border-line-strong bg-white shadow-md max-h-[640px] overflow-y-auto">
                          <InteractiveContractPaper
                            title={title}
                            structuredTemplate={mergedBlueprint.compiledContent}
                            values={values}
                            focusedVar={focusedVar}
                            onSelectVar={focusVariableInput}
                            interactiveFields={true}
                          />
                        </div>
                      </div>
                    </div>
                  )
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
                  Tiếp tục thiết lập người ký
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card
            title={`Quy trình gửi Email duyệt & ký theo thứ tự (${signers.length}/${MAX_SIGNERS})`}
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
                      {
                        fullName: "",
                        email: "",
                        role: "Signer",
                        phone: "",
                        organization: "",
                        title: "",
                        ...defaultBoxForOrder(prev.length, nextCount),
                      },
                    ];
                  })
                }
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Thêm bên liên quan
              </Button>
            }
          >
            <div className="flex flex-col gap-4">
              <div className="p-3.5 rounded-md border border-primary/25 bg-selected/50 flex items-start gap-2.5 text-xs text-fg">
                <MailCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong>Cơ chế xác nhận ký qua Email Chủ doanh nghiệp:</strong> Khi gửi hợp đồng, hệ thống sẽ gửi email kèm mã OTP đến <strong>Lượt ký #1 (Chủ doanh nghiệp / Đại diện Bên A)</strong> để kiểm tra và xác nhận ký tên trước. Sau khi Chủ doanh nghiệp ký xong, hệ thống mới tự động gửi email mời ký cho <strong>Lượt ký #2 (Đối tác / Khách hàng Bên B)</strong>.
                </div>
              </div>

              <ol className="flex flex-col gap-3">
                {signers.map((s, i) => {
                  const roleTag =
                    s.role === "Approver"
                      ? `Lượt ${i + 1} · Người duyệt (OTP xác thực, không cần ô ký)`
                      : s.role === "Cc"
                        ? "Nhận bản sao Cc (Không có lượt ký, nhận email khi hoàn tất)"
                        : i === 0
                          ? "Lượt 1 · Chủ doanh nghiệp (Bên A) — Ký số trước"
                          : i === 1
                            ? "Lượt 2 · Đối tác (Bên B) — Ký sau khi Bên A duyệt/ký"
                            : `Lượt ${i + 1} · Người ký ${i + 1}`;

                  return (
                    <li
                      key={i}
                      className="flex flex-col gap-3 p-3.5 rounded-md border border-line bg-page motion-safe:animate-fade-in"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold text-white shrink-0 ${SIGNER_COLORS[i % SIGNER_COLORS.length]}`}
                          >
                            {i + 1}
                          </span>
                          <Badge
                            className={
                              s.role === "Approver"
                                ? "bg-amber-500/15 text-amber-700"
                                : s.role === "Cc"
                                  ? "bg-strip text-muted"
                                  : i === 0
                                    ? "bg-selected text-primary"
                                    : "bg-badge-completed-bg text-badge-completed-fg"
                            }
                          >
                            {roleTag}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            aria-label="Lên trên"
                            disabled={i === 0}
                            onClick={() => moveSigner(i, -1)}
                          >
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
                            aria-label="Xóa người nhận"
                            disabled={signers.length === 1}
                            onClick={() => setSigners((prev) => prev.filter((_, j) => j !== i))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Select
                          label="Vai trò"
                          value={s.role ?? "Signer"}
                          onChange={(e) => updateSigner(i, { role: e.target.value as RecipientRole })}
                          options={[
                            { value: "Signer", label: "Người ký (Có ô ký trên PDF & OTP)" },
                            { value: "Approver", label: "Người duyệt (Duyệt/từ chối qua OTP, không đóng chữ ký)" },
                            { value: "Cc", label: "Nhận bản sao Cc (Nhận email khi hoàn tất)" },
                          ]}
                        />
                        <Input
                          label={i === 0 ? "Họ tên Chủ doanh nghiệp / Đại diện Bên A" : "Họ và tên"}
                          required
                          value={s.fullName}
                          onChange={(e) => updateSigner(i, { fullName: e.target.value })}
                          placeholder="Nguyễn Văn A"
                          maxLength={100}
                        />
                        <Input
                          label="Email nhận thông báo / link ký"
                          type="email"
                          required
                          value={s.email}
                          onChange={(e) => updateSigner(i, { email: e.target.value })}
                          placeholder="email@doanhnghiep.vn"
                          error={
                            s.email.trim() && !isValidEmail(s.email)
                              ? "Email không hợp lệ, ví dụ: ten@congty.vn"
                              : undefined
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          label="Số điện thoại"
                          value={s.phone ?? ""}
                          onChange={(e) => updateSigner(i, { phone: e.target.value })}
                          placeholder="0912345678"
                        />
                        <Input
                          label="Đơn vị / Doanh nghiệp"
                          value={s.organization ?? ""}
                          onChange={(e) => updateSigner(i, { organization: e.target.value })}
                          placeholder="Công ty ABC"
                        />
                        <Input
                          label="Chức vụ"
                          value={s.title ?? ""}
                          onChange={(e) => updateSigner(i, { title: e.target.value })}
                          placeholder="Giám đốc"
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="max-w-xs">
                <Input
                  label="Hạn hoàn tất ký"
                  type="datetime-local"
                  required
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  helperText="Mặc định 7 ngày tới."
                />
              </div>
              <div className="flex justify-between pt-2 border-t border-line">
                {resumeDraftId ? (
                  <span />
                ) : (
                  <Button variant="secondary" onClick={() => setStep(0)}>
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    Quay lại
                  </Button>
                )}
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
            title="Đặt vị trí ô chữ ký trên tờ hợp đồng A4 (Cuộn lên/xuống tự do)"
            icon={Move}
            actions={
              <Button variant="secondary" onClick={autoAlignSignatureBoxes}>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Đặt chuẩn vào ô Đại diện ký cuối trang
              </Button>
            }
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <p className="text-sm text-muted">
                    Bạn có thể <strong>lăn chuột cuộn tờ hợp đồng lên/xuống</strong> ở bên phải và <strong>kéo thả 2 ô chữ ký</strong> vào đúng khung <em>ĐẠI DIỆN BÊN A</em> và <em>ĐẠI DIỆN BÊN B</em> ở cuối trang.
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
                              <p className="text-sm font-semibold text-fg truncate">
                                {idx === 0 ? `Chủ DN: ${s.fullName}` : `Đối tác: ${s.fullName}`}
                              </p>
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

                  {signers[activeSignerIndex] && (signers[activeSignerIndex].role ?? "Signer") === "Signer" && (
                    <details className="p-3.5 rounded-md border border-line bg-page text-xs group">
                      <summary className="font-semibold text-fg cursor-pointer select-none flex items-center justify-between">
                        <span>Tùy chỉnh tọa độ ô ký (Nâng cao)</span>
                        <span className="text-muted group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-line">
                        <p className="text-[11px] text-muted leading-relaxed">
                          Kéo thả ô ký trên trang giấy A4 bên cạnh là cách đặt chính. Nếu cần căn chỉnh tọa độ chính xác từng điểm (pt), bạn có thể nhập thủ công bên dưới.
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            label={`Trang PDF (1-${maxPageLimit})`}
                            type="number"
                            min={1}
                            max={maxPageLimit}
                            value={String(signers[activeSignerIndex].pageNumber)}
                            onChange={(e) => {
                              const p = Math.max(
                                1,
                                Math.min(maxPageLimit, Number(e.target.value) || 1),
                              );
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
                    </details>
                  )}
                </div>

                {/* Cột phải: Khung cuộn mượt cho phép xem từng trang A4 thực tế và đặt ô ký */}
                <div className="lg:col-span-7 flex flex-col items-center gap-2">
                  <div className="w-full max-w-[560px] flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span>
                        Trang đang hiển thị:{" "}
                        <strong className="text-fg">
                          Trang {activePage} / {maxPageLimit}
                        </strong>
                      </span>
                      {maxPageLimit > 1 && (
                        <div className="inline-flex items-center gap-1 ml-1 overflow-x-auto max-w-[280px] py-0.5">
                          {Array.from({ length: maxPageLimit }, (_, i) => i + 1).map((p) => {
                            const isSignPage = p === maxPageLimit;
                            const isCurrentPage = p === activePage;
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setActivePage(p)}
                                className={`px-2 py-0.5 rounded-sm border text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                                  isCurrentPage
                                    ? "bg-primary text-white border-primary"
                                    : "bg-page text-fg border-line hover:border-primary/50"
                                }`}
                              >
                                Tr.{p}
                                {isSignPage ? " (Ký tên)" : ""}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        disabled={activePage <= 1}
                        onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                      >
                        Trang trước
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={activePage >= maxPageLimit}
                        onClick={() => setActivePage((p) => Math.min(maxPageLimit, p + 1))}
                      >
                        Trang sau
                      </Button>
                    </div>
                  </div>

                  {/* Khung cuộn bên ngoài */}
                  <div
                    ref={placementScrollRef}
                    className="w-full max-w-[560px] max-h-[640px] overflow-y-auto rounded-md border-2 border-line-strong bg-slate-100 p-3 shadow-inner"
                  >
                    {/* Tờ A4 đầy đủ chiều cao để không bị cắt phần cuối */}
                    <div
                      ref={canvasRef}
                      className={`relative w-full rounded-sm bg-white shadow-md select-none ${
                        source === "upload" ? "" : "min-h-[780px]"
                      }`}
                    >
                      {source === "upload" && file ? (
                        <PdfPageViewer
                          file={file}
                          pageNumber={activePage}
                          onLoaded={(pages) => {
                            setUploadedTotalPages(pages);
                          }}
                        />
                      ) : (
                        <InteractiveContractPaper
                          title={title}
                          structuredTemplate={mergedBlueprint?.compiledContent ?? ""}
                          values={values}
                          signers={signers}
                          interactiveFields={false}
                          signatureSectionRef={signatureSectionRef}
                          pageNumber={activePage}
                          onSwitchPage={(p) => setActivePage(p)}
                        />
                      )}

                      {signers.map((s, idx) => {
                        if ((s.role ?? "Signer") !== "Signer") return null;
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
                            <div className="flex items-center justify-between gap-1 text-[10.5px] font-bold leading-tight">
                              <span className="truncate">
                                #{idx + 1} {s.fullName}
                              </span>
                              <Move className="w-3 h-3 shrink-0" />
                            </div>
                            <div className="text-[9.5px] font-mono opacity-85 truncate">
                              Ký số tại ({s.boxX}, {s.boxY})
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
          <Card title="Kiểm tra trước khi lưu nháp hoặc gửi Email xác nhận ký" icon={Send}>
            <div className="flex flex-col gap-4">
              <dl className="grid grid-cols-1 sm:grid-cols-[190px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm">
                <dt className="text-muted">Tên hợp đồng</dt>
                <dd className="font-semibold text-fg">{title}</dd>
                <dt className="text-muted">Nguồn tài liệu</dt>
                <dd className="text-fg">
                  {source === "upload" ? `File PDF: ${file?.name}` : `Mẫu: ${templateDetail?.name}`}
                </dd>
                <dt className="text-muted">Hạn ký</dt>
                <dd className="text-fg">{formatDateTime(new Date(dueAt).toISOString())}</dd>
                <dt className="text-muted">Trình tự gửi Email ký số</dt>
                <dd>
                  <ol className="flex flex-col gap-2">
                    {signers.map((s, i) => {
                      const isSigner = (s.role ?? "Signer") === "Signer";
                      const isApprover = s.role === "Approver";
                      const roleName = isApprover
                        ? "Người duyệt (Duyệt qua OTP)"
                        : isSigner
                          ? "Người ký (Có ô ký trên PDF)"
                          : "Nhận bản sao Cc";

                      return (
                        <li key={i} className="flex flex-wrap items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-semibold text-white ${SIGNER_COLORS[i % SIGNER_COLORS.length]}`}
                          >
                            {i + 1}
                          </span>
                          <span className="font-semibold text-fg">
                            {roleName}:
                          </span>
                          <span className="font-medium text-fg">{s.fullName}</span>
                          {(s.title || s.organization) && (
                            <span className="text-xs text-muted">
                              ({[s.title, s.organization].filter(Boolean).join(", ")})
                            </span>
                          )}
                          <span className="text-muted">({s.email})</span>
                          {isSigner ? (
                            <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm bg-page border border-line text-muted">
                              Trang {s.pageNumber} · X={s.boxX}, Y={s.boxY}
                            </span>
                          ) : (
                            <span className="text-xs px-1.5 py-0.5 rounded-sm bg-strip border border-line text-muted">
                              {isApprover ? "Không cần ô ký" : "Nhận link xem khi hoàn tất"}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </dd>
              </dl>

              <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-line">
                <Button
                  variant="secondary"
                  onClick={() => setStep(2)}
                  disabled={isSavingDraft || isSending}
                >
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
                    Gửi Email xác nhận ký
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
        </>
      )}

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Gửi Email xác nhận ký cho Chủ doanh nghiệp"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={isSending}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSend} isLoading={isSending}>
              Xác nhận gửi
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg leading-relaxed">
          Hệ thống sẽ khóa nội dung hợp đồng <span className="font-semibold">{title}</span> bằng mã băm SHA-256, trừ <strong>01 lượt hợp đồng</strong> trong hạn mức gói cước, và gửi <strong>Email xác nhận ký kèm OTP</strong> đến Chủ doanh nghiệp (<strong>{signers[0]?.email}</strong>) trước. Sau khi Chủ doanh nghiệp ký xong, hệ thống sẽ tự động gửi tiếp cho Đối tác.
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
