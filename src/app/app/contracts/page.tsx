"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FileText, Plus, Search } from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";

const STATUS_OPTIONS: { value: ContractStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Draft", label: "Nháp" },
  { value: "Pending", label: "Chờ ký" },
  { value: "Signing", label: "Đang ký" },
  { value: "Completed", label: "Hoàn tất" },
  { value: "Declined", label: "Từ chối" },
  { value: "Cancelled", label: "Đã hủy" },
  { value: "Expired", label: "Hết hạn" },
];

export default function ContractsListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const status = (searchParams.get("status") ?? "") as ContractStatus | "";
  const [draft, setDraft] = React.useState(query);

  const { data, error, isLoading, reload } = useApi(`contracts?${query}&${status}`, () =>
    contractsApi.list({ query, status }),
  );

  const setFilters = (next: { query?: string; status?: string }) => {
    const params = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.replace(`${pathname}?${params}`);
  };

  const filtered = Boolean(query || status);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hợp đồng"
        description="Tra cứu, theo dõi tiến trình ký và tải bản đã ký"
        actions={
          <Link href="/app/contracts/new">
            <Button variant="primary">
              <Plus className="w-4 h-4" aria-hidden="true" />
              Soạn hợp đồng
            </Button>
          </Link>
        }
      />

      <Card title="Bộ lọc" icon={Search}>
        <form
          className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px_auto] gap-4 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            setFilters({ query: draft.trim() });
          }}
        >
          <Input
            label="Từ khóa"
            placeholder="Tên hợp đồng, bên ký hoặc mã hợp đồng"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            leftIcon={<Search />}
          />
          <Select
            label="Trạng thái"
            value={status}
            onChange={(e) => setFilters({ status: e.target.value })}
            options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <div className="flex gap-2">
            <Button type="submit" variant="secondary">
              Tìm
            </Button>
            {filtered && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDraft("");
                  router.replace(pathname);
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </form>
      </Card>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Card
          title={isLoading ? "Danh sách hợp đồng" : `Danh sách hợp đồng (${data?.length ?? 0})`}
          icon={FileText}
          bodyClassName="p-0"
        >
          <Table
            bare
            loading={isLoading}
            rows={data ?? []}
            getRowKey={(c) => c.id}
            onRowClick={(c) => router.push(`/app/contracts/${c.id}`)}
            empty={
              <div className="p-4">
                {filtered ? (
                  <EmptyState
                    title="Không có hợp đồng khớp bộ lọc"
                    description="Thử từ khóa khác hoặc bỏ lọc theo trạng thái."
                    actionLabel="Xóa bộ lọc"
                    onAction={() => {
                      setDraft("");
                      router.replace(pathname);
                    }}
                  />
                ) : (
                  <EmptyState
                    icon={<FileText />}
                    title="Chưa có hợp đồng nào"
                    description="Soạn hợp đồng từ mẫu hoặc tải file PDF lên để gửi cho các bên ký."
                    actionLabel="Soạn hợp đồng"
                    onAction={() => router.push("/app/contracts/new")}
                  />
                )}
              </div>
            }
            columns={[
              { key: "code", header: "Mã", render: (c) => <span className="font-mono text-xs text-muted">{c.code}</span> },
              { key: "title", header: "Tên hợp đồng", primary: true, render: (c) => <span className="font-semibold">{c.title}</span> },
              { key: "partner", header: "Bên ký", render: (c) => c.partner },
              { key: "creator", header: "Người tạo", render: (c) => <span className="text-muted">{c.creatorName}</span> },
              { key: "status", header: "Trạng thái", render: (c) => <Badge contractStatus={c.status} /> },
              { key: "sent", header: "Ngày gửi", render: (c) => (c.sentAt ? formatDateTime(c.sentAt) : "Chưa gửi") },
              { key: "due", header: "Hạn ký", render: (c) => formatDateTime(c.dueAt) },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
