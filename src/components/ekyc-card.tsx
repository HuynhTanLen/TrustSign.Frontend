"use client";

import * as React from "react";
import { BadgeCheck, ScanFace } from "lucide-react";
import { ekycApi } from "@/lib/api/ekyc";
import { useApi } from "@/lib/use-api";
import { formatDate, formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EkycDialog } from "@/components/ekyc-dialog";

/** Thẻ trạng thái eKYC của tài khoản trong trang Cài đặt. */
export function EkycCard() {
  const { data, isLoading, mutate } = useApi("ekyc:mine", ekycApi.mine);
  const [open, setOpen] = React.useState(false);

  return (
    <Card
      title="Xác minh danh tính (eKYC)"
      description="Đối chiếu khuôn mặt với CCCD gắn chip để chứng minh bạn là chủ tài khoản khi ký hợp đồng."
      icon={ScanFace}
      bodyClassName="p-6"
    >
      {isLoading || !data ? (
        <Skeleton className="h-10 w-full" />
      ) : data.status === "Verified" ? (
        <div className="flex flex-wrap items-center gap-4">
          <BadgeCheck className="h-10 w-10 text-success" aria-hidden="true" />
          <div className="flex flex-col gap-0.5 text-sm">
            <span className="font-semibold text-fg">
              {data.fullName} <Badge tone="completed" size="sm">Đã xác minh</Badge>
            </span>
            <span className="text-muted">
              CCCD {data.maskedCitizenId} · Ngày sinh {formatDate(data.dateOfBirth)} · Xác minh lúc {formatDateTime(data.verifiedAt)}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm">
            {data.status === "Revoked" ? (
              <p className="text-danger">
                Lần xác minh trước đã bị quản trị viên thu hồi{data.revokeReason ? `: ${data.revokeReason}` : ""}. Vui lòng xác minh lại.
              </p>
            ) : (
              <p className="text-muted">Tài khoản chưa xác minh danh tính. Quá trình mất khoảng 2 phút.</p>
            )}
          </div>
          <Button variant="primary" onClick={() => setOpen(true)}>
            <ScanFace className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Xác minh ngay
          </Button>
        </div>
      )}
      <EkycDialog open={open} onClose={() => setOpen(false)} onVerified={(r) => mutate(() => r)} />
    </Card>
  );
}
