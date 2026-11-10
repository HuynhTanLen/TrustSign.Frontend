"use client";

import * as React from "react";
import { BadgeCheck, FileSearch } from "lucide-react";
import { ApiError } from "@/lib/api";
import { adminApi, type AdminTenantProfile } from "@/lib/api/admin";
import { formatDateTime } from "@/lib/format";
import { InfoList } from "@/components/admin-profile";
import { ReasonDialog } from "@/components/reason-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { VerificationBadge } from "@/components/verification-badge";

/** Quản trị nền tảng xem giấy đăng ký kinh doanh rồi duyệt hoặc từ chối hồ sơ xác thực của một doanh nghiệp. */
export function AdminTenantVerification({ tenant, onChanged }: { tenant: AdminTenantProfile; onChanged: () => void }) {
  const { toast } = useToast();
  const v = tenant.verification;
  const [approving, setApproving] = React.useState(false);
  const [rejecting, setRejecting] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  if (!v) return null;

  const fail = (err: unknown) =>
    toast(err instanceof ApiError ? err.message : "Thao tác không thành công. Thử lại.", "error");

  const openLicense = async () => {
    try {
      const url = await adminApi.businessLicenseUrl(tenant.id);
      window.open(url, "_blank", "noopener");
      // Đủ thời gian để tab mới tải xong; sau đó thu hồi để không giữ file trong bộ nhớ.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      fail(err);
    }
  };

  const approve = async () => {
    setBusy(true);
    try {
      await adminApi.approveVerification(tenant.id);
      toast("Đã xác thực doanh nghiệp.", "success");
      setApproving(false);
      onChanged();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title="Xác thực pháp nhân"
      icon={BadgeCheck}
      actions={<VerificationBadge status={v.status} />}
      bodyClassName="p-6"
    >
      <div className="flex flex-col gap-4">
        <InfoList
          items={[
            ["Nộp hồ sơ lúc", v.submittedAt && formatDateTime(v.submittedAt)],
            ["Xác thực lúc", v.verifiedAt && formatDateTime(v.verifiedAt)],
            ["Lý do từ chối", v.status === "Rejected" ? v.rejectReason : null],
          ]}
        />

        {v.status === "Pending" && (
          <p className="text-sm text-muted">
            Đối chiếu mã số thuế, tên và người đại diện ở trên với giấy đăng ký kinh doanh trước khi duyệt.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {v.hasLicense && (
            <Button variant="secondary" leftIcon={<FileSearch className="w-4 h-4" aria-hidden="true" />} onClick={openLicense}>
              Xem giấy đăng ký
            </Button>
          )}
          {v.status === "Pending" && (
            <>
              <Button onClick={() => setApproving(true)}>Duyệt</Button>
              <Button variant="ghost" className="text-danger" onClick={() => setRejecting(true)}>
                Từ chối
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={approving}
        onClose={() => !busy && setApproving(false)}
        preventClose={busy}
        title="Duyệt xác thực doanh nghiệp"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproving(false)} disabled={busy}>
              Hủy
            </Button>
            <Button onClick={approve} isLoading={busy}>
              Duyệt
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg">
          <strong>{tenant.name}</strong> sẽ được gửi hợp đồng đi ký và hiện dấu &quot;Đã xác thực&quot; với người ký. Chủ doanh nghiệp nhận email thông báo.
        </p>
      </Dialog>

      <ReasonDialog
        open={rejecting}
        title="Từ chối hồ sơ xác thực"
        message={`Chủ doanh nghiệp ${tenant.name} sẽ nhận lý do qua email và nộp lại được.`}
        confirmLabel="Từ chối"
        onClose={() => setRejecting(false)}
        onConfirm={async (reason) => {
          try {
            await adminApi.rejectVerification(tenant.id, reason);
            toast("Đã từ chối hồ sơ.", "success");
            setRejecting(false);
            onChanged();
          } catch (err) {
            fail(err);
          }
        }}
      />
    </Card>
  );
}
