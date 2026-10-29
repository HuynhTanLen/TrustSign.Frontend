"use client";

import * as React from "react";
import { Package, Pencil, Plus } from "lucide-react";
import { subscriptionApi, type Plan, type SavePlanRequest } from "@/lib/api/subscription";
import { ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

const EMPTY: SavePlanRequest = { name: "", price: 0, durationDays: 30, monthlyQuota: 20, isTrial: false, isActive: true };

export default function AdminPlansPage() {
  const { toast } = useToast();
  const { data, error, isLoading, reload, mutate } = useApi("admin-plans", subscriptionApi.plans);
  const [editing, setEditing] = React.useState<{ id: string | null; form: SavePlanRequest } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const setField = <K extends keyof SavePlanRequest>(key: K, value: SavePlanRequest[K]) =>
    setEditing((e) => (e ? { ...e, form: { ...e.form, [key]: value } } : e));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setIsSaving(true);
    try {
      const saved = await subscriptionApi.savePlan(editing.id, editing.form);
      mutate((list) => (editing.id ? list.map((p) => (p.id === saved.id ? saved : p)) : [...list, saved]));
      toast(editing.id ? `Đã cập nhật gói ${saved.name}.` : `Đã tạo gói ${saved.name}.`, "success");
      setEditing(null);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không lưu được gói dịch vụ.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (p: Plan) => {
    const { id, ...rest } = p;
    try {
      const saved = await subscriptionApi.savePlan(id, { ...rest, isActive: !p.isActive });
      mutate((list) => list.map((x) => (x.id === saved.id ? saved : x)));
      toast(saved.isActive ? `Đã mở bán gói ${p.name}.` : `Đã ngừng bán gói ${p.name}.`, "success");
    } catch {
      toast("Không đổi được trạng thái gói.", "error");
    }
  };

  const f = editing?.form;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gói dịch vụ"
        description="Giá, thời hạn mỗi kỳ, hạn mức hợp đồng mỗi tháng và trạng thái mở bán"
        actions={
          <Button variant="primary" onClick={() => setEditing({ id: null, form: EMPTY })}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Tạo gói
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Card title="Danh sách gói" icon={Package} bodyClassName="p-0">
          <Table
            bare
            loading={isLoading}
            rows={data ?? []}
            getRowKey={(p) => p.id}
            empty={<p className="p-4 text-sm text-muted">Chưa có gói nào.</p>}
            columns={[
              {
                key: "name",
                header: "Tên gói",
                primary: true,
                render: (p) => (
                  <span className="inline-flex items-center gap-2 font-semibold">
                    Gói {p.name}
                    {p.isTrial && (
                      <span className="inline-flex items-center h-[22px] px-2 rounded-sm bg-badge-signing-bg text-badge-signing-fg text-xs">
                        Dùng thử
                      </span>
                    )}
                  </span>
                ),
              },
              { key: "price", header: "Giá", align: "right", render: (p) => formatMoney(p.price) },
              { key: "days", header: "Số ngày", align: "right", render: (p) => p.durationDays },
              { key: "quota", header: "Hợp đồng / tháng", align: "right", render: (p) => p.monthlyQuota },
              {
                key: "active",
                header: "Trạng thái",
                render: (p) => (
                  <span
                    className={`inline-flex items-center h-[22px] px-2 rounded-sm text-xs font-semibold ${
                      p.isActive ? "bg-badge-completed-bg text-badge-completed-fg" : "bg-badge-draft-bg text-badge-draft-fg"
                    }`}
                  >
                    {p.isActive ? "Đang bán" : "Ngừng bán"}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (p) => (
                  <span className="inline-flex gap-1">
                    <Button variant="ghost" onClick={() => setEditing({ id: p.id, form: { ...p } })}>
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                      Sửa
                    </Button>
                    <Button variant="ghost" onClick={() => toggleActive(p)}>
                      {p.isActive ? "Ngừng bán" : "Mở bán"}
                    </Button>
                  </span>
                ),
              },
            ]}
          />
        </Card>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Sửa gói dịch vụ" : "Tạo gói dịch vụ"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={isSaving}>
              Hủy
            </Button>
            <Button type="submit" form="plan-form" variant="primary" isLoading={isSaving}>
              Lưu
            </Button>
          </>
        }
      >
        {f && (
          <form id="plan-form" onSubmit={save} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Tên gói" required value={f.name} onChange={(e) => setField("name", e.target.value)} />
            </div>
            <Input label="Giá (₫)" type="number" min={0} required value={f.price} onChange={(e) => setField("price", Number(e.target.value))} />
            <Input label="Số ngày một kỳ" type="number" min={1} required value={f.durationDays} onChange={(e) => setField("durationDays", Number(e.target.value))} />
            <Input label="Hợp đồng mỗi tháng" type="number" min={1} required value={f.monthlyQuota} onChange={(e) => setField("monthlyQuota", Number(e.target.value))} />
            <div className="col-span-2 flex flex-col gap-2 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={f.isTrial} onChange={(e) => setField("isTrial", e.target.checked)} className="w-4 h-4 accent-primary" />
                Gói dùng thử (tặng khi tạo doanh nghiệp)
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={f.isActive} onChange={(e) => setField("isActive", e.target.checked)} className="w-4 h-4 accent-primary" />
                Đang bán
              </label>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
