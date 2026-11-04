"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  BookOpenCheck,
  FilePenLine,
  FileText,
  Layers,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { templatesApi, type TemplateSummary } from "@/lib/api/templates";
import {
  buildFormattedContractFromBlueprint,
  parseTemplateIntoBlueprint,
  REFERENCE_TEMPLATES,
  slugifyVariableName,
  VARIABLE_LABELS,
  type ContractBlueprint,
  type FieldSection,
  type TemplateClauseItem,
  type TemplateFieldItem,
} from "@/lib/contract-format";
import { ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

const SECTION_META: {
  id: FieldSection;
  roman: string;
  title: string;
  hint: string;
  placeholder: string;
  QuickSuggestions: string[];
}[] = [
  {
    id: "partyA",
    roman: "I",
    title: "Mục I · Thông tin Bên A (Doanh nghiệp của bạn)",
    hint: "Các thông tin pháp nhân của Bên A sẽ tự động xếp ở đầu hợp đồng.",
    placeholder: "VD: Số tài khoản ngân hàng Bên A, Chức vụ đại diện...",
    QuickSuggestions: [
      "Tên doanh nghiệp (Bên A)",
      "Mã số thuế Bên A",
      "Người đại diện pháp luật Bên A",
      "Chức vụ đại diện Bên A",
      "Địa chỉ trụ sở Bên A",
      "Số tài khoản ngân hàng Bên A",
    ],
  },
  {
    id: "partyB",
    roman: "II",
    title: "Mục II · Thông tin Bên B (Đối tác / Khách hàng / Nhân sự)",
    hint: "Các thông tin của Bên B sẽ tự động xếp ngay dưới Mục I.",
    placeholder: "VD: Địa chỉ giao hàng, Số điện thoại Bên B, Số CCCD...",
    QuickSuggestions: [
      "Tên đối tác / Khách hàng (Bên B)",
      "Mã số thuế / Số CCCD Bên B",
      "Người đại diện Bên B",
      "Địa chỉ liên hệ Bên B",
      "Số điện thoại Bên B",
    ],
  },
  {
    id: "transaction",
    roman: "III",
    title: "Mục III · Nội dung, Tài sản & Giá trị giao dịch",
    hint: "Thêm bất kỳ thông tin đặc thù nào của hợp đồng (hệ thống tự động căn lề và đánh dòng).",
    placeholder: "VD: Biển số xe, Số khung, Màu sơn, Tiền đặt cọc đợt 1...",
    QuickSuggestions: [
      "Tổng giá trị hợp đồng (VNĐ)",
      "Ngày bắt đầu hiệu lực",
      "Thời hạn thực hiện hợp đồng",
      "Phương thức & tiến độ thanh toán",
      "Thời hạn bảo hành",
      "Địa điểm bàn giao",
    ],
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data, error, isLoading, reload, mutate } = useApi("templates", templatesApi.list);

  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // State của Trình thiết kế hợp đồng tự động (không cần {})
  const defaultRef = REFERENCE_TEMPLATES[0];
  const [name, setName] = React.useState(defaultRef.name);
  const [partyATitle, setPartyATitle] = React.useState(defaultRef.partyATitle);
  const [partyBTitle, setPartyBTitle] = React.useState(defaultRef.partyBTitle);
  const [fields, setFields] = React.useState<TemplateFieldItem[]>(defaultRef.fields);
  const [clauses, setClauses] = React.useState<TemplateClauseItem[]>(defaultRef.clauses);

  // Ô nhập thêm trường mới cho từng mục
  const [newFieldText, setNewFieldText] = React.useState<Record<FieldSection, string>>({
    partyA: "",
    partyB: "",
    transaction: "",
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [isQuickUsingId, setIsQuickUsingId] = React.useState<string | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<TemplateSummary | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const editorRef = React.useRef<HTMLDivElement>(null);

  // Văn bản hợp đồng chuẩn A4 được TỰ ĐỘNG FORMAT theo đúng trình tự Mục I -> II -> III -> Điều khoản
  const formattedContent = React.useMemo(
    () =>
      buildFormattedContractFromBlueprint({
        name,
        partyATitle,
        partyBTitle,
        fields,
        clauses,
      }),
    [name, partyATitle, partyBTitle, fields, clauses],
  );

  const categories = React.useMemo(
    () => ["all", ...Array.from(new Set(REFERENCE_TEMPLATES.map((t) => t.category)))],
    [],
  );

  const filteredReferences = React.useMemo(
    () =>
      REFERENCE_TEMPLATES.filter(
        (t) => categoryFilter === "all" || t.category === categoryFilter,
      ),
    [categoryFilter],
  );

  const rows = (data ?? []).filter((t) =>
    t.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const loadBlueprintToBuilder = (bp: ContractBlueprint) => {
    setEditingId(null);
    setName(bp.name);
    setPartyATitle(bp.partyATitle);
    setPartyBTitle(bp.partyBTitle);
    setFields(bp.fields.map((f) => ({ ...f })));
    setClauses(bp.clauses.map((c) => ({ ...c })));
    toast(`Đã nạp mẫu "${bp.name}" vào khung tùy chỉnh bên dưới.`, "info");
    editorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /** Bấm "Dùng ngay" trên mẫu tham khảo: Lưu vào danh sách mẫu DN (nếu chưa có) và chuyển thẳng sang Soạn hợp đồng */
  const handleQuickUseReference = async (bp: ContractBlueprint) => {
    setIsQuickUsingId(bp.id);
    try {
      const existing = (data ?? []).find(
        (t) => t.name.trim().toLowerCase() === bp.name.trim().toLowerCase(),
      );
      if (existing) {
        router.push(`/app/contracts/new?templateId=${existing.id}`);
        return;
      }
      const compiled = buildFormattedContractFromBlueprint(bp);
      const created = await templatesApi.create({
        name: bp.name,
        content: compiled,
      });
      mutate((list) => [created, ...list]);
      router.push(`/app/contracts/new?templateId=${created.id}`);
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Không thể khởi tạo mẫu hợp đồng.",
        "error",
      );
    } finally {
      setIsQuickUsingId(null);
    }
  };

  const addFieldToSection = (section: FieldSection, rawLabel: string) => {
    const cleanLabel = rawLabel.trim();
    if (!cleanLabel) {
      toast("Vui lòng nhập tên thông tin cần thêm.", "error");
      return;
    }

    const baseKey = slugifyVariableName(cleanLabel);
    if (!baseKey) {
      toast("Tên thông tin không hợp lệ.", "error");
      return;
    }

    const prefix = section === "partyA" ? "ben_a_" : section === "partyB" ? "ben_b_" : "";
    const candidateKey =
      baseKey.includes("ben_a") || baseKey.includes("ben_b")
        ? baseKey
        : `${prefix}${baseKey}`;

    if (fields.some((f) => f.key === candidateKey)) {
      toast(`Trường "${cleanLabel}" đã có trong hợp đồng.`, "info");
      return;
    }

    VARIABLE_LABELS[candidateKey] = cleanLabel;
    setFields((prev) => [...prev, { key: candidateKey, label: cleanLabel, section }]);
    setNewFieldText((prev) => ({ ...prev, [section]: "" }));
  };

  const removeField = (key: string) => {
    setFields((prev) => prev.filter((f) => f.key !== key));
  };

  const moveFieldWithinSection = (key: string, dir: -1 | 1) => {
    setFields((prev) => {
      const targetField = prev.find((f) => f.key === key);
      if (!targetField) return prev;
      const sectionItems = prev.filter((f) => f.section === targetField.section);
      const idxInSec = sectionItems.findIndex((f) => f.key === key);
      const swapIdx = idxInSec + dir;
      if (swapIdx < 0 || swapIdx >= sectionItems.length) return prev;

      const idxA = prev.findIndex((f) => f.key === sectionItems[idxInSec].key);
      const idxB = prev.findIndex((f) => f.key === sectionItems[swapIdx].key);
      const next = [...prev];
      [next[idxA], next[idxB]] = [next[idxB], next[idxA]];
      return next;
    });
  };

  const updateClause = (idx: number, patch: Partial<TemplateClauseItem>) => {
    setClauses((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const addClause = () => {
    setClauses((prev) => [
      ...prev,
      {
        title: `ĐIỀU ${prev.length + 1}. ĐIỀU KHOẢN BỔ SUNG`,
        body: "Hai bên thỏa thuận thực hiện nghiêm túc các cam kết tại điều khoản này.",
      },
    ]);
  };

  const removeClause = (idx: number) => {
    setClauses((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEdit = async (tpl: TemplateSummary) => {
    setIsLoadingEdit(true);
    try {
      const detail = await templatesApi.get(tpl.id);
      const parsed = parseTemplateIntoBlueprint(detail.name, detail.content);
      setEditingId(detail.id);
      setName(detail.name);
      setPartyATitle(parsed.partyATitle);
      setPartyBTitle(parsed.partyBTitle);
      setFields(parsed.fields);
      setClauses(parsed.clauses);
      editorRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không tải được nội dung mẫu.", "error");
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("Vui lòng nhập tên mẫu hợp đồng.", "error");
      return;
    }
    if (fields.length === 0) {
      toast("Vui lòng giữ ít nhất 1 trường thông tin trong mẫu hợp đồng.", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const updated = await templatesApi.update(editingId, {
          name: name.trim(),
          content: formattedContent,
        });
        mutate((list) => list.map((t) => (t.id === editingId ? updated : t)));
        setEditingId(null);
        toast("Đã cập nhật và tự động dàn trang lại mẫu hợp đồng.", "success");
      } else {
        const created = await templatesApi.create({
          name: name.trim(),
          content: formattedContent,
        });
        mutate((list) => [created, ...list]);
        toast("Đã lưu mẫu hợp đồng vào thư viện của doanh nghiệp.", "success");
      }
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
      if (editingId === deleteTarget.id) setEditingId(null);
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
        title="Thư viện & Thiết kế Mẫu hợp đồng"
        description="Tham khảo 8 mẫu hợp đồng thông dụng nhất hoặc tự thêm mục thông tin — hệ thống tự động dàn trang chuẩn pháp lý A4 mà không cần dùng ký tự {}"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              loadBlueprintToBuilder(REFERENCE_TEMPLATES[0]);
            }}
          >
            <FilePenLine className="w-4 h-4" aria-hidden="true" />
            Thiết kế mẫu mới
          </Button>
        }
      />

      {/* PHẦN 1: THƯ VIỆN 8 MẪU HỢP ĐỒNG THÔNG DỤNG ĐỂ THAM KHẢO & DÙNG NGAY */}
      <Card
        title="Kho mẫu hợp đồng thông dụng (Tham khảo & Dùng ngay)"
        icon={BookOpenCheck}
        actions={
          <div className="w-56">
            <Select
              label=""
              aria-label="Lọc theo nhóm hợp đồng"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tất cả lĩnh vực ({REFERENCE_TEMPLATES.length} mẫu)</option>
              {categories
                .filter((c) => c !== "all")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </Select>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredReferences.map((bp) => (
            <div
              key={bp.id}
              className="flex flex-col justify-between gap-3 p-4 rounded-lg border border-line bg-page hover:border-primary/60 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge className="bg-selected text-primary">{bp.category}</Badge>
                  <span className="text-[11px] font-semibold text-muted">
                    {bp.fields.length} mục thông tin
                  </span>
                </div>
                <h3 className="text-sm font-bold text-fg leading-snug">{bp.name}</h3>
                <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">{bp.summary}</p>
              </div>

              <div className="pt-2 border-t border-line flex items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  className="flex-1 text-xs"
                  isLoading={isQuickUsingId === bp.id}
                  onClick={() => handleQuickUseReference(bp)}
                >
                  Dùng ngay
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs"
                  onClick={() => loadBlueprintToBuilder(bp)}
                >
                  Tùy chỉnh
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* PHẦN 2: DANH SÁCH MẪU ĐÃ LƯU CỦA DOANH NGHIỆP */}
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Card
          title={
            isLoading
              ? "Mẫu hợp đồng đã lưu của doanh nghiệp"
              : `Mẫu hợp đồng đã lưu của doanh nghiệp (${data?.length ?? 0})`
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
                  title={
                    search
                      ? "Không có mẫu khớp từ khóa"
                      : "Chưa có mẫu riêng nào trong danh sách doanh nghiệp"
                  }
                  description="Bấm 'Dùng ngay' hoặc 'Tùy chỉnh' ở 8 mẫu hợp đồng thông dụng phía trên để lưu mẫu cho doanh nghiệp."
                />
              </div>
            }
            columns={[
              {
                key: "name",
                header: "Tên mẫu hợp đồng",
                primary: true,
                render: (t) => <span className="font-semibold">{t.name}</span>,
              },
              {
                key: "vars",
                header: "Các mục thông tin tự động hỏi khi lập hợp đồng",
                render: (t) => (
                  <span className="flex flex-wrap gap-1 py-2 whitespace-normal">
                    {t.variables.map((v) => (
                      <span
                        key={v}
                        className="inline-flex items-center px-2 py-0.5 rounded-sm bg-selected text-primary text-xs font-medium"
                      >
                        {VARIABLE_LABELS[v] ?? v.replace(/_/g, " ")}
                      </span>
                    ))}
                  </span>
                ),
              },
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

      {/* PHẦN 3: TRÌNH THIẾT KẾ MẪU HỢP ĐỒNG TỰ ĐỘNG DÀN TRANG (KHÔNG CẦN DÙNG {}) */}
      <div ref={editorRef} className="grid grid-cols-1 lg:grid-cols-12 gap-5 scroll-mt-20 items-start">
        <Card
          title={
            editingId
              ? "Chỉnh sửa cấu trúc mẫu hợp đồng (Tự động dàn trang)"
              : "Tùy chỉnh & Tạo mẫu hợp đồng theo trình tự tự động"
          }
          icon={Layers}
          className="lg:col-span-7"
          actions={
            editingId ? (
              <Button variant="ghost" onClick={() => setEditingId(null)}>
                <X className="w-4 h-4" aria-hidden="true" />
                Hủy sửa
              </Button>
            ) : undefined
          }
        >
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <Input
              label="Tên hợp đồng (Sẽ in hoa ở giữa trang A4)"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: HỢP ĐỒNG MUA BÁN XE Ô TÔ"
            />

            {/* 3 MỤC THÔNG TIN THEO TRÌNH TỰ HỢP ĐỒNG: MỤC I (BÊN A) -> MỤC II (BÊN B) -> MỤC III (GIAO DỊCH) */}
            {SECTION_META.map((sec) => {
              const secFields = fields.filter((f) => f.section === sec.id);
              const existingLabels = new Set(secFields.map((f) => f.label.toLowerCase()));
              const availableSuggestions = sec.QuickSuggestions.filter(
                (s) => !existingLabels.has(s.toLowerCase()),
              );

              return (
                <div
                  key={sec.id}
                  className="p-4 rounded-lg border border-line bg-page flex flex-col gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-fg">{sec.title}</h4>
                    <p className="text-xs text-muted">{sec.hint}</p>
                  </div>

                  {/* Danh sách các mục thông tin hiện có trong nhóm này */}
                  {secFields.length === 0 ? (
                    <p className="text-xs text-muted italic">
                      Chưa có mục thông tin nào trong phần này.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {secFields.map((f, idx) => (
                        <li
                          key={f.key}
                          className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border border-line bg-surface text-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-sm bg-selected text-primary text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-fg truncate">{f.label}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveFieldWithinSection(f.key, -1)}
                              className="p-1 text-muted hover:text-fg disabled:opacity-30 cursor-pointer"
                              title="Đưa lên trên"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === secFields.length - 1}
                              onClick={() => moveFieldWithinSection(f.key, 1)}
                              className="p-1 text-muted hover:text-fg disabled:opacity-30 cursor-pointer"
                              title="Đưa xuống dưới"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeField(f.key)}
                              className="p-1 text-muted hover:text-danger cursor-pointer"
                              title="Bỏ mục này"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Ô gõ tiếng Việt để thêm mục thông tin mới (Tự động format vào đúng Mục I/II/III) */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newFieldText[sec.id]}
                      onChange={(e) =>
                        setNewFieldText((prev) => ({ ...prev, [sec.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFieldToSection(sec.id, newFieldText[sec.id]);
                        }
                      }}
                      placeholder={sec.placeholder}
                      className="flex-1 h-9 px-3 rounded-md border border-line-strong bg-surface text-xs text-fg placeholder:text-muted focus:outline-none focus:border-primary"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => addFieldToSection(sec.id, newFieldText[sec.id])}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm vào Mục {sec.roman}
                    </Button>
                  </div>

                  {/* Các nút gợi ý 1 chạm nếu chưa có */}
                  {availableSuggestions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-muted">Gợi ý thêm nhanh:</span>
                      {availableSuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => addFieldToSection(sec.id, sug)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-primary/25 bg-surface hover:bg-selected text-[11px] font-medium text-primary cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* MỤC IV: CÁC ĐIỀU KHOẢN HỢP ĐỒNG */}
            <div className="p-4 rounded-lg border border-line bg-page flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-fg">
                    Mục IV · Các điều khoản cam kết trong hợp đồng
                  </h4>
                  <p className="text-xs text-muted">
                    Các điều khoản pháp lý sẽ tự động đặt sau phần thông tin giao dịch.
                  </p>
                </div>
                <Button type="button" variant="secondary" onClick={addClause}>
                  <Plus className="w-3.5 h-3.5" />
                  Thêm điều khoản
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                {clauses.map((cl, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-md border border-line bg-surface flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={cl.title}
                        onChange={(e) => updateClause(idx, { title: e.target.value })}
                        className="flex-1 font-bold text-xs text-fg bg-transparent border-b border-transparent focus:border-primary focus:outline-none py-0.5"
                      />
                      {clauses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeClause(idx)}
                          className="text-xs text-muted hover:text-danger cursor-pointer"
                        >
                          Xóa điều này
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={cl.body}
                      onChange={(e) => updateClause(idx, { body: e.target.value })}
                      className="w-full rounded-sm border border-line bg-page p-2 text-xs text-fg focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button type="submit" variant="primary" isLoading={isSaving}>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                {editingId ? "Cập nhật mẫu hợp đồng" : "Lưu vào mẫu của doanh nghiệp"}
              </Button>
            </div>
          </form>
        </Card>

        {/* CỘT PHẢI: TỜ HỢP ĐỒNG A4 ĐƯỢC TỰ ĐỘNG DÀN TRANG THEO ĐÚNG TRÌNH TỰ */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 flex flex-col gap-4">
          <Card title="Bản xem trước Hợp đồng A4 (Tự động dàn trang)" icon={FileText}>
            <div className="rounded-md border-2 border-line-strong bg-white text-slate-900 p-6 shadow-sm font-sans text-xs leading-relaxed max-h-[680px] overflow-y-auto flex flex-col justify-between">
              <div className="whitespace-pre-wrap">
                {formattedContent.split(/(\{\{[a-zA-Z0-9_]+\}\})/g).map((part, i) => {
                  if (/^\{\{.+\}\}$/.test(part)) {
                    const key = part.slice(2, -2);
                    const friendly = VARIABLE_LABELS[key] ?? key.replace(/_/g, " ");
                    return (
                      <span
                        key={i}
                        className="inline-block px-1.5 py-0.5 mx-0.5 rounded-sm bg-selected text-primary border border-primary/30 font-sans font-semibold text-[11px]"
                      >
                        [{friendly}]
                      </span>
                    );
                  }
                  return <React.Fragment key={i}>{part}</React.Fragment>;
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200 grid grid-cols-2 gap-4 text-center font-sans text-[10px] text-neutral-700">
                <div>
                  <p className="font-bold uppercase text-black">ĐẠI DIỆN BÊN A</p>
                  <p className="italic text-neutral-500">(Chủ doanh nghiệp duyệt & ký số)</p>
                  <div className="h-12" />
                </div>
                <div>
                  <p className="font-bold uppercase text-black">ĐẠI DIỆN BÊN B</p>
                  <p className="italic text-neutral-500">(Đối tác ký số xác nhận)</p>
                  <div className="h-12" />
                </div>
              </div>
            </div>
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
