"use client";

import * as React from "react";
import Link from "next/link";
import {
  Braces,
  FilePenLine,
  FileText,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { detectVariables, templatesApi, type TemplateSummary } from "@/lib/api/templates";
import { ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

/** Gợi ý các trường phổ biến để người dùng bấm 1 chạm là chèn dòng chuẩn vào hợp đồng */
const QUICK_FIELDS: { label: string; key: string; group: string }[] = [
  { label: "Tên doanh nghiệp (Bên A)", key: "ten_ben_a", group: "Bên A" },
  { label: "Mã số thuế Bên A", key: "mst_ben_a", group: "Bên A" },
  { label: "Người đại diện Bên A", key: "dai_dien_ben_a", group: "Bên A" },
  { label: "Tên đối tác / Khách hàng (Bên B)", key: "ten_ben_b", group: "Bên B" },
  { label: "Mã số thuế Bên B", key: "mst_ben_b", group: "Bên B" },
  { label: "Người đại diện Bên B", key: "dai_dien_ben_b", group: "Bên B" },
  { label: "Giá trị hợp đồng (VNĐ)", key: "gia_tri_hop_dong", group: "Điều khoản" },
  { label: "Ngày hiệu lực", key: "ngay_hieu_luc", group: "Điều khoản" },
  { label: "Thời hạn hợp đồng", key: "thoi_han_hop_dong", group: "Điều khoản" },
];

/** Nhãn hiển thị tiếng Việt thân thiện cho các mã biến phổ biến */
export const VARIABLE_LABELS: Record<string, string> = {
  ten_ben_a: "Tên doanh nghiệp (Bên A)",
  mst_ben_a: "Mã số thuế Bên A",
  dai_dien_ben_a: "Người đại diện Bên A",
  ten_ben_b: "Tên đối tác / Khách hàng (Bên B)",
  mst_ben_b: "Mã số thuế Bên B",
  dai_dien_ben_b: "Người đại diện Bên B",
  gia_tri_hop_dong: "Giá trị hợp đồng (VNĐ)",
  ngay_hieu_luc: "Ngày hiệu lực",
  thoi_han_hop_dong: "Thời hạn hợp đồng",
  ho_ten_nhan_vien: "Họ và tên nhân viên",
  cccd_nhan_vien: "Số CCCD nhân viên",
  vi_tri_cong_viec: "Vị trí công việc",
  muc_luong_chinh: "Mức lương chính (VNĐ/tháng)",
  muc_dich_bao_mat: "Mục đích trao đổi thông tin",
  so_hop_dong_goc: "Số hợp đồng gốc",
};

/** Bộ mẫu hợp đồng chuẩn pháp lý Việt Nam để chọn nhanh bằng 1 cú nhấp */
const STARTER_TEMPLATES: { id: string; name: string; summary: string; content: string }[] = [
  {
    id: "b2b-service",
    name: "Hợp đồng cung cấp dịch vụ (B2B)",
    summary: "Mẫu chuẩn 2 bên doanh nghiệp: phạm vi công việc, giá trị, thanh toán và trách nhiệm.",
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

HỢP ĐỒNG CUNG CẤP DỊCH VỤ

Hôm nay, hợp đồng có hiệu lực từ ngày {{ngay_hieu_luc}}, chúng tôi gồm có:

I. BÊN CUNG CẤP DỊCH VỤ (BÊN A):
- Tên doanh nghiệp: {{ten_ben_a}}
- Mã số thuế: {{mst_ben_a}}
- Người đại diện: {{dai_dien_ben_a}}

II. BÊN SỬ DỤNG DỊCH VỤ (BÊN B):
- Tên đối tác / Khách hàng: {{ten_ben_b}}
- Mã số thuế: {{mst_ben_b}}
- Người đại diện: {{dai_dien_ben_b}}

Hai bên thống nhất ký kết hợp đồng với các điều khoản sau:

ĐIỀU 1. NỘI DUNG VÀ THỜI HẠN THỰC HIỆN
Bên A đồng ý cung cấp dịch vụ theo yêu cầu của Bên B trong thời hạn {{thoi_han_hop_dong}} kể từ ngày {{ngay_hieu_luc}}.

ĐIỀU 2. GIÁ TRỊ HỢP ĐỒNG VÀ THANH TOÁN
1. Tổng giá trị hợp đồng (đã bao gồm thuế GTGT): {{gia_tri_hop_dong}} VNĐ.
2. Bên B thanh toán bằng hình thức chuyển khoản vào tài khoản ngân hàng của Bên A.

ĐIỀU 3. ĐIỀU KHOẢN CHUNG
Hợp đồng này được giao kết điện tử theo Luật Giao dịch điện tử 2023 và có hiệu lực kể từ khi các bên hoàn tất ký số.`,
  },
  {
    id: "labor",
    name: "Hợp đồng lao động xác định thời hạn",
    summary: "Dùng cho tuyển dụng nhân sự: vị trí công việc, mức lương, thời hạn làm việc.",
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

HỢP ĐỒNG LAO ĐỘNG

I. NGƯỜI SỬ DỤNG LAO ĐỘNG (BÊN A):
- Tên doanh nghiệp: {{ten_ben_a}}
- Mã số thuế: {{mst_ben_a}}
- Người đại diện: {{dai_dien_ben_a}}

II. NGƯỜI LAO ĐỘNG (BÊN B):
- Họ và tên nhân viên: {{ho_ten_nhan_vien}}
- Số CCCD/Định danh: {{cccd_nhan_vien}}

Hai bên thỏa thuận ký kết Hợp đồng lao động với các điều khoản sau:

ĐIỀU 1. CÔNG VIỆC VÀ THỜI HẠN HỢP ĐỒNG
1. Vị trí chuyên môn: {{vi_tri_cong_viec}}.
2. Thời hạn hợp đồng: {{thoi_han_hop_dong}}, bắt đầu từ ngày {{ngay_hieu_luc}}.

ĐIỀU 2. CHẾ ĐỘ LƯƠNG VÀ PHÚC LỢI
1. Mức lương chính: {{muc_luong_chinh}} VNĐ/tháng.
2. Được đóng BHXH, BHYT, BHTN đầy đủ theo quy định của Bộ luật Lao động.`,
  },
  {
    id: "nda",
    name: "Thỏa thuận bảo mật thông tin (NDA)",
    summary: "Bảo vệ tài liệu kinh doanh, mã nguồn và dữ liệu khách hàng khi hợp tác.",
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

THỎA THUẬN BẢO MẬT THÔNG TIN (NDA)

Thỏa thuận được xác lập ngày {{ngay_hieu_luc}} giữa:

I. BÊN TIẾT LỘ (BÊN A):
- Tên doanh nghiệp: {{ten_ben_a}}
- Người đại diện: {{dai_dien_ben_a}}

II. BÊN NHẬN THÔNG TIN (BÊN B):
- Tên đối tác: {{ten_ben_b}}
- Người đại diện: {{dai_dien_ben_b}}

ĐIỀU 1. MỤC ĐÍCH TRAO ĐỔI THÔNG TIN
Hai bên trao đổi tài liệu mật nhằm phục vụ mục đích: {{muc_dich_bao_mat}}.

ĐIỀU 2. NGHĨA VỤ BẢO MẬT
Bên B cam kết bảo mật tuyệt đối mọi dữ liệu nhận được từ Bên A trong thời hạn {{thoi_han_hop_dong}} và không tiết lộ cho bất kỳ bên thứ ba nào.`,
  },
  {
    id: "acceptance",
    name: "Biên bản nghiệm thu & Thanh lý hợp đồng",
    summary: "Xác nhận hoàn thành bàn giao dịch vụ và chốt công nợ thanh toán.",
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

BIÊN BẢN NGHIỆM THU VÀ THANH LÝ HỢP ĐỒNG
(Căn cứ Hợp đồng số: {{so_hop_dong_goc}})

Hôm nay, ngày {{ngay_hieu_luc}}, đại diện hai bên gồm:
- BÊN A (Bên giao): {{ten_ben_a}} – Đại diện: {{dai_dien_ben_a}}
- BÊN B (Bên nhận): {{ten_ben_b}} – Đại diện: {{dai_dien_ben_b}}

Cùng thống nhất nghiệm thu toàn bộ hạng mục công việc theo hợp đồng số {{so_hop_dong_goc}} với tổng giá trị quyết toán là {{gia_tri_hop_dong}} VNĐ. Hai bên đồng ý thanh lý hợp đồng sau khi hoàn tất nghĩa vụ thanh toán.`,
  },
];

/** Chuyển nhãn tiếng Việt bất kỳ (VD: "Địa chỉ giao hàng") sang mã biến hợp lệ "dia_chi_giao_hang" */
function slugifyVariableName(input: string): string {
  return input
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Nếu người dùng chỉ bấm các nút biến liên tiếp (VD: "{{ten_ben_a}}{{mst_ben_a}}")
 * mà chưa viết nhãn/xuống dòng, tự động dàn trang thành bố cục hợp đồng chuẩn.
 */
export function normalizeTemplateStructure(rawContent: string, templateTitle?: string): string {
  const trimmed = rawContent.trim();
  if (!trimmed) return "";

  const withoutVars = trimmed.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, "").trim();
  // Nếu văn bản chỉ toàn các biến {{...}} nối liền nhau (ít hơn 15 ký tự chữ thường)
  if (withoutVars.length < 15) {
    const vars = detectVariables(trimmed);
    const lines = vars.map((v) => {
      const label = VARIABLE_LABELS[v] ?? v.replace(/_/g, " ");
      return `- ${label}: {{${v}}}`;
    });
    return [
      "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
      "Độc lập - Tự do - Hạnh phúc",
      "",
      (templateTitle || "HỢP ĐỒNG GIAO DỊCH").toUpperCase(),
      "",
      "Các bên tham gia giao kết hợp đồng với thông tin và điều khoản cụ thể như sau:",
      ...lines,
      "",
      "Hai bên cam kết thực hiện đúng các nội dung đã thỏa thuận nêu trên. Hợp đồng được ký số điện tử và có giá trị pháp lý theo Luật Giao dịch điện tử 2023.",
    ].join("\n");
  }

  return rawContent;
}

export default function TemplatesPage() {
  const { toast } = useToast();
  const { data, error, isLoading, reload, mutate } = useApi("templates", templatesApi.list);
  const [search, setSearch] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [content, setContent] = React.useState(STARTER_TEMPLATES[0].content);
  const [customFieldLabel, setCustomFieldLabel] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<TemplateSummary | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const editorRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const variables = React.useMemo(() => detectVariables(content), [content]);
  const rows = (data ?? []).filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase()));

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setContent("");
    setCustomFieldLabel("");
  };

  /**
   * Chèn thông minh:
   * - Nếu con trỏ đang ở đầu dòng mới hoặc ngay sau một `}}` khác, tự động chèn cả dòng `- Nhãn tiếng Việt: {{key}}\n`
   *   để không bao giờ bị dính chữ `{{a}}{{b}}`!
   * - Nếu con trỏ đang ở giữa câu văn (VD: "Hiệu lực từ ngày "), chỉ chèn `{{key}}`.
   */
  const insertVariableAtCursor = (varKey: string, friendlyLabel?: string) => {
    const label = friendlyLabel ?? VARIABLE_LABELS[varKey] ?? varKey;
    const token = `{{${varKey}}}`;
    const el = textareaRef.current;

    if (!el) {
      setContent((prev) => `${prev ? prev + "\n" : ""}- ${label}: ${token}`);
      return;
    }

    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const before = content.slice(0, start);
    const after = content.slice(end);

    const lastNewlineIdx = before.lastIndexOf("\n");
    const currentLineBeforeCursor = before.slice(lastNewlineIdx + 1);

    let insertion = token;
    if (currentLineBeforeCursor.trim() === "") {
      // Đang ở dòng trống -> chèn nguyên dòng có nhãn rõ ràng
      insertion = `- ${label}: ${token}\n`;
    } else if (currentLineBeforeCursor.trimEnd().endsWith("}}")) {
      // Đang đứng ngay sau 1 biến khác -> tự động xuống dòng và thêm nhãn
      insertion = `\n- ${label}: ${token}`;
    } else if (!currentLineBeforeCursor.endsWith(" ")) {
      insertion = ` ${token}`;
    }

    const nextContent = before + insertion + after;
    setContent(nextContent);

    requestAnimationFrame(() => {
      el.focus();
      const nextPos = start + insertion.length;
      el.setSelectionRange(nextPos, nextPos);
    });
  };

  const handleAddCustomField = () => {
    const slug = slugifyVariableName(customFieldLabel);
    if (!slug) {
      toast("Vui lòng nhập tên trường cần thêm (ví dụ: Địa chỉ giao hàng).", "error");
      return;
    }
    const label = customFieldLabel.trim();
    VARIABLE_LABELS[slug] = label;
    insertVariableAtCursor(slug, label);
    setCustomFieldLabel("");
  };

  const handleAutoFormatStructure = () => {
    const formatted = normalizeTemplateStructure(content, name);
    setContent(formatted);
    toast("Đã dàn trang mẫu hợp đồng theo chuẩn văn bản pháp lý.", "success");
  };

  const applyStarterTemplate = (starter: (typeof STARTER_TEMPLATES)[number]) => {
    setName(starter.name);
    setContent(starter.content);
    toast(`Đã nạp mẫu "${starter.name}".`, "info");
    textareaRef.current?.focus();
  };

  const handleEdit = async (tpl: TemplateSummary) => {
    setIsLoadingEdit(true);
    try {
      const detail = await templatesApi.get(tpl.id);
      setEditingId(detail.id);
      setName(detail.name);
      setContent(normalizeTemplateStructure(detail.content, detail.name));
      editorRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không tải được nội dung mẫu.", "error");
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast("Nhập tên mẫu và nội dung trước khi lưu.", "error");
      return;
    }
    const structuredContent = normalizeTemplateStructure(content, name.trim());
    setContent(structuredContent);

    setIsSaving(true);
    try {
      if (editingId) {
        const updated = await templatesApi.update(editingId, {
          name: name.trim(),
          content: structuredContent,
        });
        mutate((list) => list.map((t) => (t.id === editingId ? updated : t)));
        toast("Đã cập nhật mẫu hợp đồng.", "success");
      } else {
        const created = await templatesApi.create({
          name: name.trim(),
          content: structuredContent,
        });
        mutate((list) => [created, ...list]);
        toast("Đã lưu mẫu hợp đồng mới.", "success");
      }
      resetForm();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không lưu được mẫu hợp đồng.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await templatesApi.remove(deleteTarget.id);
      mutate((list) => list.filter((t) => t.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) resetForm();
      setDeleteTarget(null);
      toast("Đã xóa mẫu hợp đồng.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không xóa được mẫu hợp đồng.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mẫu hợp đồng"
        description="Tạo mẫu hợp đồng chuẩn cho doanh nghiệp chỉ với vài cú nhấp chuột — tự động dàn trang A4 chuẩn pháp lý"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingId(null);
              setName(STARTER_TEMPLATES[0].name);
              setContent(STARTER_TEMPLATES[0].content);
              editorRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <FilePenLine className="w-4 h-4" aria-hidden="true" />
            Tạo mẫu mới
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Card
          title={
            isLoading
              ? "Danh sách mẫu của doanh nghiệp"
              : `Danh sách mẫu của doanh nghiệp (${data?.length ?? 0})`
          }
          icon={FileText}
          actions={
            <div className="w-56 [&_label]:sr-only">
              <Input
                label="Tìm mẫu"
                placeholder="Tìm theo tên mẫu"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search />}
              />
            </div>
          }
          bodyClassName="p-0"
        >
          <Table
            bare
            loading={isLoading}
            rows={rows}
            getRowKey={(t) => t.id}
            empty={
              <div className="p-4">
                <EmptyState
                  icon={<FileText />}
                  title={search ? "Không có mẫu khớp từ khóa" : "Doanh nghiệp chưa có mẫu hợp đồng nào"}
                  description={
                    search
                      ? "Thử tên khác."
                      : "Chọn ngay 1 trong 4 mẫu hợp đồng chuẩn bên dưới rồi bấm 'Lưu mẫu hợp đồng' để sử dụng."
                  }
                />
              </div>
            }
            columns={[
              {
                key: "name",
                header: "Tên mẫu",
                primary: true,
                render: (t) => <span className="font-semibold">{t.name}</span>,
              },
              {
                key: "vars",
                header: "Các thông tin sẽ điền khi tạo hợp đồng",
                render: (t) => (
                  <span className="flex flex-wrap gap-1 py-2 whitespace-normal">
                    {t.variables.map((v) => (
                      <span
                        key={v}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-selected text-primary text-xs font-medium"
                      >
                        {VARIABLE_LABELS[v] ?? v}
                      </span>
                    ))}
                  </span>
                ),
              },
              { key: "author", header: "Người tạo", render: (t) => t.authorName },
              {
                key: "updated",
                header: "Cập nhật",
                render: (t) => <span className="text-muted">{formatDateTime(t.updatedAt)}</span>,
              },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (t) => (
                  <div className="inline-flex items-center gap-1.5">
                    <Link href={`/app/contracts/new?templateId=${t.id}`}>
                      <Button variant="primary">Soạn hợp đồng</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      aria-label={`Sửa mẫu ${t.name}`}
                      disabled={isLoadingEdit}
                      onClick={() => handleEdit(t)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      aria-label={`Xóa mẫu ${t.name}`}
                      onClick={() => setDeleteTarget(t)}
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* BƯỚC 1: KHO MẪU GỢI Ý 1 CHẠM */}
      <Card title="Chọn nhanh từ mẫu hợp đồng chuẩn (1 cú nhấp chuột)" icon={Sparkles}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STARTER_TEMPLATES.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => applyStarterTemplate(st)}
              className="flex flex-col justify-between gap-2 p-3.5 rounded-md border border-line bg-page hover:border-primary hover:bg-selected/50 text-left cursor-pointer transition-colors group"
            >
              <div>
                <p className="text-sm font-bold text-fg group-hover:text-primary">{st.name}</p>
                <p className="mt-1 text-xs text-muted line-clamp-2">{st.summary}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-1">
                <Wand2 className="w-3.5 h-3.5" />
                Nạp mẫu này
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* BƯỚC 2: TRÌNH SOẠN THẢO TRỰC QUAN + XEM TRƯỚC TỜ GIẤY A4 */}
      <div ref={editorRef} className="grid grid-cols-1 lg:grid-cols-12 gap-5 scroll-mt-20 items-start">
        <Card
          title={editingId ? "Chỉnh sửa mẫu hợp đồng" : "Soạn nội dung mẫu hợp đồng"}
          icon={FilePenLine}
          className="lg:col-span-7"
          actions={
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={handleAutoFormatStructure}>
                <Wand2 className="w-3.5 h-3.5" />
                Chuẩn hóa bố cục
              </Button>
              {editingId && (
                <Button variant="ghost" onClick={resetForm}>
                  <X className="w-4 h-4" aria-hidden="true" />
                  Hủy sửa
                </Button>
              )}
            </div>
          }
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input
              label="Tên mẫu hợp đồng"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Hợp đồng mua bán xe / Hợp đồng dịch vụ"
            />

            {/* Thanh công cụ bấm 1 chạm để chèn dòng thông tin cần điền */}
            <div className="rounded-md border border-line bg-page p-3 flex flex-col gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-fg">
                Bấm để thêm dòng thông tin cần điền vào hợp đồng:
              </span>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_FIELDS.map((field) => (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() => insertVariableAtCursor(field.key, field.label)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border border-primary/25 bg-surface hover:bg-selected text-xs font-medium text-primary cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {field.label}
                  </button>
                ))}
              </div>

              {/* Ô tự tạo trường tùy ý bằng tiếng Việt bình thường */}
              <div className="pt-2 border-t border-line flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <input
                  type="text"
                  value={customFieldLabel}
                  onChange={(e) => setCustomFieldLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomField();
                    }
                  }}
                  placeholder="Hoặc gõ tên trường khác (VD: Biển số xe, Số khung, Địa chỉ giao nhận)..."
                  className="flex-1 h-8 px-2.5 rounded-sm border border-line-strong bg-surface text-xs text-fg placeholder:text-muted focus:outline-none focus:border-primary"
                />
                <Button type="button" variant="secondary" onClick={handleAddCustomField}>
                  <Plus className="w-3.5 h-3.5" />
                  Thêm dòng này
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="tpl-content" className="text-sm font-semibold text-fg">
                Nội dung văn bản hợp đồng <span className="text-danger">*</span>
              </label>
              <textarea
                ref={textareaRef}
                id="tpl-content"
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Chọn một mẫu ở trên hoặc bấm các nút '+ Tên doanh nghiệp', '+ Giá trị hợp đồng'... Hệ thống sẽ tự động xuống dòng và gắn nhãn tiếng Việt rõ ràng."
                className="w-full rounded-md border border-line-strong bg-surface p-3.5 text-sm leading-relaxed text-fg placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              {content && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Xóa trắng
                </Button>
              )}
              <Button type="submit" variant="primary" isLoading={isSaving}>
                {editingId ? "Cập nhật mẫu hợp đồng" : "Lưu mẫu hợp đồng"}
              </Button>
            </div>
          </form>
        </Card>

        {/* CỘT PHẢI: XEM TRƯỚC TRANG GIẤY A4 TRỰC TIẾP & DANH SÁCH TRƯỜNG TỰ ĐỘNG */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card title="Xem trước tờ hợp đồng chuẩn A4" icon={FileText}>
            {!content.trim() ? (
              <div className="py-12 text-center text-sm text-muted">
                Chọn một mẫu gợi ý phía trên hoặc bấm thêm trường bên trái để xem trước tờ hợp đồng A4.
              </div>
            ) : (
              <div className="rounded-md border-2 border-line-strong bg-white text-black p-6 shadow-sm font-serif text-xs leading-relaxed whitespace-pre-wrap max-h-[420px] overflow-y-auto">
                {normalizeTemplateStructure(content, name)
                  .split(/(\{\{[a-zA-Z0-9_]+\}\})/g)
                  .map((part, i) => {
                    if (/^\{\{.+\}\}$/.test(part)) {
                      const key = part.slice(2, -2);
                      const friendly = VARIABLE_LABELS[key] ?? key.replace(/_/g, " ");
                      return (
                        <span
                          key={i}
                          className="inline-block px-1.5 py-0.5 mx-0.5 rounded-sm bg-amber-100 text-amber-950 border border-amber-300 font-sans font-semibold text-[11px]"
                          title={`Trường tự động: {{${key}}}`}
                        >
                          [{friendly}]
                        </span>
                      );
                    }
                    return <React.Fragment key={i}>{part}</React.Fragment>;
                  })}
              </div>
            )}
          </Card>

          <Card title={`Các trường sẽ tự động hỏi khi lập hợp đồng (${variables.length})`} icon={Braces}>
            {variables.length === 0 ? (
              <p className="text-sm text-muted">
                Khi bạn bấm thêm các trường như <strong>+ Tên đối tác</strong>, <strong>+ Giá trị hợp đồng</strong>..., danh sách ô nhập liệu sẽ hiện ở đây.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {variables.map((v, idx) => (
                  <li
                    key={v}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-line bg-page"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-sm bg-selected text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-fg truncate">
                          {VARIABLE_LABELS[v] ?? v.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted shrink-0">Bắt buộc điền</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Xóa mẫu hợp đồng"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} isLoading={isDeleting}>
              Xóa mẫu
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg">
          Bạn có chắc muốn xóa mẫu <span className="font-semibold">{deleteTarget?.name}</span>? Các hợp đồng đã tạo từ mẫu này không bị ảnh hưởng.
        </p>
      </Dialog>
    </div>
  );
}
