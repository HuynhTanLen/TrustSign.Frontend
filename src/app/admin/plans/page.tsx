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

const EMPTY: SavePlanRequest = {
  name: "",
  price: 0,
  durationDays: 30,
  monthlyQuota: 20,
  isTrial: false,
  isActive: true,
};

export default function AdminPlansPage() {
  const { toast } = useToast();
  // Gọi endpoint /api/subscription/admin/plans để lấy TẤT CẢ các gói (kể cả isActive: false)
  const { data, error, isLoading, reload, mutate } = useApi(
    "admin-plans-all",
    subscriptionApi.adminPlans,
  );

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
      mutate((list) =>
        editing.id ? list.map((p) => (p.id === saved.id ? saved : p)) : [...list, saved],
      );
      toast(
        editing.id ? `Đã cập nhật gói ${saved.name}.` : `Đã khởi tạo gói ${saved.name}.`,
        "success",
      );
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
      toast(
        saved.isActive ? `Đã mở bán gói ${p.name}.` : `Đã ngừng bán gói ${p.name}.`,
        "success",
      );
    } catch {
      toast("Không đổi được trạng thái mở bán của gói.", "error");
    }
  };

  const f = editing?.form;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quản lý Gói dịch vụ"
        description="Định giá, số ngày mỗi chu kỳ thuê bao, hạn mức hợp đồng gửi ký mỗi tháng và trạng thái mở bán (M2)"
        actions={
          <Button variant="primary" onClick={() => setEditing({ id: null, form: EMPTY })}>
            <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Tạo gói dịch vụ mới
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Card
          title={isLoading ? "Danh sách gói" : `Danh sách gói dịch vụ (${data?.length ?? 0})`}
          icon={Package}
          bodyClassName="p-0"
        >
          <Table
            bare
            loading={isLoading}
            rows={data ?? []}
            getRowKey={(p) => p.id}
            empty={<p className="p-6 text-sm text-muted text-center">Chưa có gói dịch vụ nào.</p>}
            columns={[
              {
                key: "name",
                header: "Tên gói",
                primary: true,
                render: (p) => (
                  <span className="inline-flex items-center gap-2 font-bold text-fg">
                    Gói {p.name}
                    {p.isTrial && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-badge-signing-bg text-badge-signing-fg text-[11px] font-semibold">
                        Dùng thử mặc định
                      </span>
                    )}
                  </span>
                ),
              },
              {
                key: "price",
                header: "Đơn giá",
                align: "right",
                render: (p) => <span className="font-bold">{formatMoney(p.price)}</span>,
              },
              {
                key: "days",
                header: "Số ngày",
                align: "right",
                render: (p) => `${p.durationDays} ngày`,
              },
              {
                key: "quota",
                header: "Hợp đồng / tháng",
                align: "right",
                render: (p) => `${p.monthlyQuota} lượt`,
              },
              {
                key: "active",
                header: "Trạng thái",
                render: (p) => (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.isActive
                        ? "bg-badge-completed-bg text-badge-completed-fg"
                        : "bg-badge-draft-bg text-badge-draft-fg"
                    }`}
                  >
                    {p.isActive ? "Đang bán" : "Ngừng bán"}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "Thao tác",
                align: "right",
                render: (p) => (
                  <span className="inline-flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing({ id: p.id, form: { ...p } })}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                      Sửa
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleActive(p)}
                    >
                      {p.isActive ? "Ngừng bán" : "Mở bán"}
                    </Button>
                  </span>
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* Dialog tạo / sửa gói */}
      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Chỉnh sửa gói: ${f?.name}` : "Tạo gói dịch vụ mới"}
        className="max-w-[560px]"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={isSaving}>
              Hủy
            </Button>
            <Button type="submit" form="plan-form" variant="primary" isLoading={isSaving}>
              Lưu cấu hình gói
            </Button>
          </>
        }
      >
        {f && (
          <form id="plan-form" onSubmit={save} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Tên gói dịch vụ"
                required
                maxLength={100}
                placeholder="Cơ bản, Tiêu chuẩn, Chuyên nghiệp…"
                value={f.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>

            <Input
              label="Đơn giá (VNĐ)"
              type="number"
              min={0}
              required
              value={f.price}
              onChange={(e) => setField("price", Number(e.target.value))}
              helperText={f.price === 0 ? "Miễn phí" : formatMoney(f.price)}
            />

            <Input
              label="Thời hạn chu kỳ (ngày)"
              type="number"
              min={1}
              required
              value={f.durationDays}
              onChange={(e) => setField("durationDays", Number(e.target.value))}
            />

            <div className="col-span-2">
              <Input
                label="Hạn mức hợp đồng gửi ký mỗi tháng"
                type="number"
                min={1}
                required
                value={f.monthlyQuota}
                onChange={(e) => setField("monthlyQuota", Number(e.target.value))}
                helperText="Số lượt tạo và điều phối luồng ký kết trong 30 ngày."
              />
            </div>

            <div className="col-span-2 flex flex-col gap-3 pt-2 border-t border-line text-sm">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-line bg-strip cursor-pointer hover:bg-selected/40">
                <input
                  type="checkbox"
                  checked={f.isTrial}
                  onChange={(e) => setField("isTrial", e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-primary"
                />
                <div>
                  <span className="font-semibold text-fg block">Gói dùng thử (Trial)</span>
                  <span className="text-xs text-muted">
                    Tự động cấp miễn phí cho doanh nghiệp mới khi vừa khởi tạo.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-line bg-strip cursor-pointer hover:bg-selected/40">
                <input
                  type="checkbox"
                  checked={f.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-primary"
                />
                <div>
                  <span className="font-semibold text-fg block">Đang mở bán công khai</span>
                  <span className="text-xs text-muted">
                    Gói sẽ xuất hiện tại bảng giá công khai và danh mục nâng cấp của doanh nghiệp.
                  </span>
                </div>
              </label>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
