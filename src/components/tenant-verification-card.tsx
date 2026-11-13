"use client";

import * as React from "react";
import { BadgeCheck } from "lucide-react";
import { ApiError } from "@/lib/api";
import { LICENSE_MAX_BYTES, tenantsApi, type TenantDto } from "@/lib/api/tenants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { VerificationBadge } from "@/components/verification-badge";

/** Nộp giấy đăng ký kinh doanh để được xác thực pháp nhân; chưa xác thực thì chưa gửi ký hợp đồng được. */
export function TenantVerificationCard({
  tenant,
  isOwner,
  onChanged,
}: {
  tenant: TenantDto;
  isOwner: boolean;
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [isSending, setIsSending] = React.useState(false);

  const status = tenant.verificationStatus;
  const missing = [
    !tenant.taxCode && "mã số thuế",
    !tenant.address && "địa chỉ",
    !tenant.representativeName && "người đại diện",
  ].filter(Boolean) as string[];
  const canSubmit = isOwner && (status === "Unverified" || status === "Rejected");

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null;
    if (next && next.size > LICENSE_MAX_BYTES) {
      toast("File quá lớn, tối đa 5 MB.", "error");
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(next);
  };

  const submit = async () => {
    if (!file || isSending) return;
    setIsSending(true);
    try {
      await tenantsApi.submitVerification(file);
      setFile(null);
      toast("Đã nộp hồ sơ, vui lòng chờ quản trị viên duyệt.", "success");
      onChanged();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không nộp được hồ sơ xác thực.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card
      title="Xác thực doanh nghiệp"
      description="Người ký chỉ nhận lời mời từ doanh nghiệp đã được xác thực. Bản nháp vẫn soạn được khi chưa xác thực."
      icon={BadgeCheck}
      actions={<VerificationBadge status={status} />}
      bodyClassName="p-6"
    >
      <div className="flex flex-col gap-4 text-sm">
        {status === "Verified" && (
          <p className="text-fg">
            Doanh nghiệp đã được xác thực. Đổi tên hoặc mã số thuế sẽ làm mất xác thực và phải nộp hồ sơ lại.
          </p>
        )}

        {status === "Pending" && (
          <p className="text-fg">Hồ sơ đã được nộp và đang chờ quản trị viên duyệt. Kết quả sẽ gửi qua email.</p>
        )}

        {status === "Rejected" && (
          <p className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-danger">
            Hồ sơ chưa được duyệt. Lý do: {tenant.verificationRejectReason}
          </p>
        )}

        {canSubmit && missing.length > 0 && (
          <p className="text-muted">
            Cần nhập {missing.join(", ")} ở phần thông tin pháp nhân bên trên và bấm lưu trước khi nộp hồ sơ.
          </p>
        )}

        {canSubmit && missing.length === 0 && (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="font-medium text-fg">Giấy đăng ký kinh doanh (PDF, JPEG hoặc PNG, tối đa 5 MB)</span>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={pick}
                className="text-sm file:mr-3 file:rounded-md file:border file:border-line file:bg-page file:px-3 file:py-1.5 file:text-sm"
              />
            </label>
            <div>
              <Button onClick={submit} disabled={!file || isSending} isLoading={isSending}>
                {status === "Rejected" ? "Nộp lại hồ sơ" : "Nộp hồ sơ xác thực"}
              </Button>
            </div>
          </div>
        )}

        {!isOwner && status !== "Verified" && (
          <p className="text-muted">Chỉ Chủ doanh nghiệp mới nộp được hồ sơ xác thực.</p>
        )}
      </div>
    </Card>
  );
}
