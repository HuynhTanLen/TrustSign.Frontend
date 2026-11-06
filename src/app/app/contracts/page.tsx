"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { contractsApi } from "@/lib/api/contracts";
import { useApi } from "@/lib/use-api";
import { formatDateTime } from "@/lib/format";
import { Badge, type ContractStatus } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Table } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";

const FILTER_TABS: { id: string; label: string; status: ContractStatus | "" }[] = [
  { id: "all", label: "Tất cả", status: "" },
  { id: "pending", label: "Chờ ký", status: "Pending" },
  { id: "signing", label: "Đang ký", status: "Signing" },
  { id: "completed", label: "Đã hoàn tất", status: "Completed" },
  { id: "draft", label: "Bản nháp", status: "Draft" },
  { id: "declined", label: "Bị từ chối", status: "Declined" },
  { id: "cancelled", label: "Đã hủy", status: "Cancelled" },
];

export default function ContractsListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("query") ?? "";
  const statusParam = (searchParams.get("status") ?? "") as ContractStatus | "";
  const [draftSearch, setDraftSearch] = React.useState(query);

  const {
    data,
    error,
    isLoading,
    isRefreshing,
    reload,
  } = useApi(`contracts?${query}&${statusParam}`, () =>
    contractsApi.list({ query, status: statusParam }),
  );

  // Đồng bộ search draft khi URL thay đổi
  React.useEffect(() => {
    Promise.resolve().then(() => setDraftSearch(query));
  }, [query]);

  const setFilters = (next: { query?: string; status?: string }) => {
    const params = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.replace(`${pathname}?${params}`);
  };

  const activeTabId = React.useMemo(() => {
    const found = FILTER_TABS.find((t) => t.status === statusParam);
    return found ? found.id : "all";
  }, [statusParam]);

  const handleTabChange = (newTabId: string) => {
    const target = FILTER_TABS.find((t) => t.id === newTabId);
    setFilters({ status: target?.status ?? "" });
  };

  const clearAllFilters = () => {
    setDraftSearch("");
    router.replace(pathname);
  };

  const isFiltered = Boolean(query || statusParam);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quản lý Hợp đồng"
        description="Tra cứu hợp đồng pháp lý, kiểm tra thứ tự luồng ký kết và tải bản PDF đã ký số"
        actions={
          <Link href="/app/contracts/new">
            <Button variant="accent" glow leftIcon={<Plus className="w-4 h-4" />}>
              Soạn hợp đồng mới
            </Button>
          </Link>
        }
      />

      {/* THANH TABS LỌC NHANH TRẠNG THÁI */}
      <div className="bg-surface border border-line rounded-xl px-4 py-1 shadow-xs overflow-x-auto">
        <Tabs
          tabs={FILTER_TABS.map((t) => ({
            id: t.id,
            label: t.label,
          }))}
          value={activeTabId}
          onChange={handleTabChange}
          ariaLabel="Lọc nhanh trạng thái hợp đồng"
        />
      </div>

      {/* THANH TÌM KIẾM VÀ CÔNG CỤ */}
      <div className="p-4 rounded-xl border border-line bg-surface shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form
          className="w-full sm:max-w-md flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setFilters({ query: draftSearch.trim() });
          }}
        >
          <div className="relative flex-1">
            <Input
              placeholder="Tìm theo tên hợp đồng, đối tác hoặc mã HĐ…"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-muted" />}
              rightIcon={
                draftSearch ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftSearch("");
                      setFilters({ query: "" });
                    }}
                    aria-label="Xóa từ khóa"
                    className="cursor-pointer text-muted hover:text-fg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : undefined
              }
            />
          </div>
          <Button type="submit" variant="secondary" size="md">
            Tìm
          </Button>
        </form>

        <div className="flex items-center gap-2 self-end sm:self-center text-xs text-muted">
          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={clearAllFilters}
            >
              Xóa bộ lọc
            </Button>
          )}
          <span>
            Tổng: <strong>{data?.length ?? 0}</strong> hợp đồng
          </span>
        </div>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Card bodyClassName="p-0">
          <Table
            bare
            loading={isLoading}
            refreshing={isRefreshing}
            rows={data ?? []}
            getRowKey={(c) => c.id}
            onRowClick={(c) => router.push(`/app/contracts/${c.id}`)}
            empty={
              <div className="p-6">
                {isFiltered ? (
                  <EmptyState
                    title="Không tìm thấy hợp đồng phù hợp"
                    description="Thử đổi từ khóa tìm kiếm hoặc chọn tab trạng thái khác."
                    actionLabel="Xóa bộ lọc hiện tại"
                    onAction={clearAllFilters}
                  />
                ) : (
                  <EmptyState
                    icon={<FileText />}
                    title="Chưa có hợp đồng nào"
                    description="Khởi tạo hợp đồng từ thư viện mẫu hoặc tải tài liệu PDF lên để thiết lập người ký."
                    actionLabel="Soạn hợp đồng đầu tiên"
                    onAction={() => router.push("/app/contracts/new")}
                  />
                )}
              </div>
            }
            columns={[
              {
                key: "code",
                header: "Mã HĐ",
                render: (c) => (
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-strip px-2 py-0.5 rounded border border-line">
                    {c.code}
                  </span>
                ),
              },
              {
                key: "title",
                header: "Tên hợp đồng",
                primary: true,
                render: (c) => (
                  <div className="min-w-0 py-0.5">
                    <p className="font-bold text-fg hover:text-primary transition-colors truncate max-w-md">
                      {c.title}
                    </p>
                    <p className="text-xs text-muted truncate mt-0.5">
                      Tạo bởi {c.creatorName}
                    </p>
                  </div>
                ),
              },
              {
                key: "partner",
                header: "Bên ký (Bên B)",
                render: (c) => (
                  <span className="font-medium text-slate-900 truncate block max-w-xs" title={c.partner}>
                    {c.partner || "Chưa cập nhật"}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Trạng thái",
                render: (c) => <Badge contractStatus={c.status} size="sm" />,
              },
              {
                key: "sent",
                header: "Ngày gửi",
                align: "right",
                render: (c) => (
                  <span className="text-xs text-muted">
                    {c.sentAt ? formatDateTime(c.sentAt) : "Chưa gửi"}
                  </span>
                ),
              },
              {
                key: "due",
                header: "Hạn ký",
                align: "right",
                hideOnMobile: true,
                render: (c) => (
                  <span className="text-xs text-slate-600">
                    {c.dueAt ? formatDateTime(c.dueAt) : "—"}
                  </span>
                ),
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
