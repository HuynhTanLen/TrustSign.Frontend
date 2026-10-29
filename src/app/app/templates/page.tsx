"use client";

import * as React from "react";
import Link from "next/link";
import { Braces, Eye, FilePenLine, FileText, Search } from "lucide-react";
import { detectVariables, templatesApi } from "@/lib/api/templates";
import { ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

const CONTENT_PLACEHOLDER =
  "HỢP ĐỒNG DỊCH VỤ\nBên B: {{ten_doi_tac}} (Mã số thuế: {{ma_so_thue}})\nGiá trị hợp đồng: {{gia_tri_hd}}\nHiệu lực từ ngày {{ngay_hieu_luc}}.";

export default function TemplatesPage() {
  const { toast } = useToast();
  const { data, error, isLoading, reload, mutate } = useApi("templates", templatesApi.list);
  const [search, setSearch] = React.useState("");
  const [name, setName] = React.useState("");
  const [content, setContent] = React.useState("");
  const [showPreview, setShowPreview] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);

  const variables = React.useMemo(() => detectVariables(content), [content]);
  const rows = (data ?? []).filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase()));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast("Nhập tên mẫu và nội dung trước khi lưu.", "error");
      return;
    }
    setIsSaving(true);
    try {
      const created = await templatesApi.create({ name: name.trim(), content });
      mutate((list) => [created, ...list]);
      setName("");
      setContent("");
      setShowPreview(false);
      toast("Đã lưu mẫu hợp đồng.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không lưu được mẫu hợp đồng.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mẫu hợp đồng"
        description="Mẫu dùng lại cho nhiều hợp đồng; các trường cần điền viết dạng {{ten_bien}}"
        actions={
          <Button variant="primary" onClick={() => editorRef.current?.scrollIntoView({ behavior: "smooth" })}>
            <FilePenLine className="w-4 h-4" aria-hidden="true" />
            Tạo mẫu
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Card
          title={isLoading ? "Danh sách mẫu" : `Danh sách mẫu (${data?.length ?? 0})`}
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
                  title={search ? "Không có mẫu khớp từ khóa" : "Chưa có mẫu hợp đồng"}
                  description={search ? "Thử tên khác." : "Tạo mẫu đầu tiên ở khung soạn thảo bên dưới."}
                />
              </div>
            }
            columns={[
              { key: "name", header: "Tên mẫu", primary: true, render: (t) => <span className="font-semibold">{t.name}</span> },
              {
                key: "vars",
                header: "Trường cần điền",
                render: (t) => (
                  <span className="flex flex-wrap gap-1 py-2 whitespace-normal">
                    {t.variables.map((v) => (
                      <code key={v} className="px-1.5 rounded-sm bg-selected text-primary text-xs">
                        {v}
                      </code>
                    ))}
                  </span>
                ),
              },
              { key: "author", header: "Người tạo", render: (t) => t.authorName },
              { key: "updated", header: "Sửa lần cuối", render: (t) => <span className="text-muted">{formatDateTime(t.updatedAt)}</span> },
              {
                key: "use",
                header: "",
                align: "right",
                render: (t) => (
                  <Link href={`/app/contracts/new?templateId=${t.id}`}>
                    <Button variant="secondary">Dùng mẫu</Button>
                  </Link>
                ),
              },
            ]}
          />
        </Card>
      )}

      <div ref={editorRef} className="grid grid-cols-1 lg:grid-cols-12 gap-4 scroll-mt-20">
        <Card title="Soạn mẫu mới" icon={FilePenLine} className="lg:col-span-7">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input label="Tên mẫu" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Hợp đồng dịch vụ" />
            <div className="flex flex-col gap-2">
              <label htmlFor="tpl-content" className="text-sm font-semibold text-fg">
                Nội dung <span className="text-danger">*</span>
              </label>
              <textarea
                id="tpl-content"
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={CONTENT_PLACEHOLDER}
                className="w-full rounded-md border border-line-strong bg-surface p-3 font-mono text-sm text-fg placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted">Gõ {"{{ten_bien}}"} ở chỗ cần điền; hệ thống tự nhận ra các trường.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowPreview((v) => !v)} disabled={!content}>
                <Eye className="w-4 h-4" aria-hidden="true" />
                {showPreview ? "Ẩn xem trước" : "Xem trước"}
              </Button>
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Lưu mẫu
              </Button>
            </div>
            {showPreview && (
              <div className="rounded-md border border-line bg-page p-4 text-sm whitespace-pre-wrap motion-safe:animate-fade-in">
                {content.split(/(\{\{[a-zA-Z0-9_]+\}\})/g).map((part, i) =>
                  /^\{\{.+\}\}$/.test(part) ? (
                    <mark key={i} className="px-1 rounded-sm bg-badge-pending-bg text-badge-pending-fg">
                      {part.slice(2, -2)}
                    </mark>
                  ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                  ),
                )}
              </div>
            )}
          </form>
        </Card>

        <Card title={`Trường nhận ra (${variables.length})`} icon={Braces} className="lg:col-span-5">
          {variables.length === 0 ? (
            <p className="text-sm text-muted">Chưa có trường nào. Thêm {"{{ten_bien}}"} vào nội dung.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {variables.map((v) => (
                <li key={v} className="flex items-center justify-between gap-2 px-3 h-row rounded-md border border-line motion-safe:animate-fade-in">
                  <code className="text-sm text-primary">{v}</code>
                  <span className="text-xs text-muted">Chữ · bắt buộc</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
