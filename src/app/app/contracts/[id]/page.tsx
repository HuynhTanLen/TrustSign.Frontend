"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  History,
  Lock,
  Mail,
  MapPin,
  PencilLine,
  Send,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { contractsApi, type ContractSigner } from "@/lib/api/contracts";
import { ROOT_CA_URL } from "@/lib/api/admin";
import { API_URL, ApiError } from "@/lib/api";
import { USE_MOCK } from "@/lib/mock";
import { useApi } from "@/lib/use-api";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

const SIGNER_STATUS_CONFIG: Record<
  ContractSigner["status"],
  {
    label: string;
    badgeTone: "completed" | "signing" | "draft" | "declined";
    icon: React.ElementType;
    nodeBg: string;
  }
> = {
  Signed: {
    label: "Đã ký tên",
    badgeTone: "completed",
    icon: CheckCircle2,
    nodeBg: "bg-success text-white ring-4 ring-success/15",
  },
  Current: {
    label: "Đang chờ ký",
    badgeTone: "signing",
    icon: Clock,
    nodeBg: "bg-primary text-white ring-4 ring-primary/20 animate-pulse",
  },
  Waiting: {
    label: "Chưa tới lượt",
    badgeTone: "draft",
    icon: Clock,
    nodeBg: "bg-slate-100 text-slate-500 border border-line",
  },
  Declined: {
    label: "Từ chối ký",
    badgeTone: "declined",
    icon: XCircle,
    nodeBg: "bg-danger text-white ring-4 ring-danger/15",
  },
};

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const {
    data: contract,
    error,
    isLoading,
    reload,
    mutate,
  } = useApi(`contract:${id}`, () => contractsApi.get(id));

  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [confirmSend, setConfirmSend] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [blockedMessage, setBlockedMessage] = React.useState<string | null>(null);
  const [isReminding, setIsReminding] = React.useState(false);

  const [dueAt, setDueAt] = React.useState(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await contractsApi.cancel(id);
      mutate((c) => ({ ...c, status: "Cancelled" }));
      setConfirmCancel(false);
      toast("Đã hủy hợp đồng thành công.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không hủy được hợp đồng.", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSendDraft = async () => {
    if (!dueAt || new Date(dueAt).getTime() <= Date.now()) {
      toast("Hạn ký phải sau thời điểm hiện tại.", "error");
      return;
    }
    setIsSending(true);
    try {
      await contractsApi.send(id, new Date(dueAt).toISOString());
      setConfirmSend(false);
      toast("Đã gửi hợp đồng đi ký thành công.", "success");
      reload();
    } catch (err) {
      setConfirmSend(false);
      if (
        err instanceof ApiError &&
        (err.code === "Subscription.QuotaExceeded" ||
          err.code === "Quota.Exceeded" ||
          err.status === 403)
      ) {
        setBlockedMessage(
          err.code === "Subscription.QuotaExceeded" || err.code === "Quota.Exceeded"
            ? "Doanh nghiệp đã dùng hết hạn mức gửi ký trong kỳ. Vui lòng nâng cấp gói cước để tiếp tục gửi ký."
            : "Gói dịch vụ đã hết hạn. Vui lòng gia hạn hoặc nâng cấp gói cước.",
        );
      } else {
        toast(err instanceof ApiError ? err.message : "Không gửi được hợp đồng.", "error");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = () => {
    if (USE_MOCK) {
      toast("Dữ liệu mẫu thử nghiệm không có file PDF vật lý.", "info");
      return;
    }
    window.open(`${API_URL}/api/contracts/${encodeURIComponent(id)}/signed-document`, "_blank");
  };

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Chi tiết hợp đồng"
          back={{ href: "/app/contracts", label: "Danh sách hợp đồng" }}
        />
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  if (isLoading || !contract) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-72 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Skeleton className="h-[680px] lg:col-span-7 xl:col-span-8 rounded-xl" />
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const canCancel =
    contract.status === "Draft" || contract.status === "Pending" || contract.status === "Signing";
  const canSend = contract.status === "Draft" && contract.signers.length > 0;
  const currentSigner = contract.signers.find((s) => s.status === "Current");

  const handleRemind = async () => {
    setIsReminding(true);
    try {
      await contractsApi.remind(id);
      toast(`Đã gửi lại email mời tới ${currentSigner?.email}.`, "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không gửi lại được email mời.", "error");
    } finally {
      setIsReminding(false);
    }
  };

  // Tính toán tiến độ ký kết
  const totalSigners = contract.signers.length;
  const signedCount = contract.signers.filter((s) => s.status === "Signed").length;
  const isAllSigned = totalSigners > 0 && signedCount === totalSigners;

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER TRANG CHI TIẾT */}
      <PageHeader
        back={{ href: "/app/contracts", label: "Danh sách hợp đồng" }}
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            <span className="break-words">{contract.title}</span>
            <Badge contractStatus={contract.status} />
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span>
              Mã hợp đồng:{" "}
              <strong className="font-mono text-fg font-semibold bg-strip px-1.5 py-0.5 rounded border border-line">
                {contract.code}
              </strong>
            </span>
            <span>·</span>
            <span>
              Người tạo: <strong className="text-fg font-medium">{contract.creatorName}</strong>
            </span>
            <span>·</span>
            <span>
              {contract.dueAt ? (
                <>
                  Hạn ký:{" "}
                  <strong className="text-fg font-medium">{formatDateTime(contract.dueAt)}</strong>
                </>
              ) : (
                "Chưa phát hành gửi ký"
              )}
            </span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            {contract.status === "Draft" && (
              <Link href={`/app/contracts/new?draft=${encodeURIComponent(contract.id)}`}>
                <Button variant={canSend ? "secondary" : "primary"} leftIcon={<PencilLine className="w-4 h-4" />}>
                  {canSend ? "Sửa người nhận" : "Tiếp tục soạn"}
                </Button>
              </Link>
            )}
            {canSend && (
              <Button
                variant="primary"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => setConfirmSend(true)}
              >
                Gửi hợp đồng đi ký
              </Button>
            )}
            {contract.status === "Completed" && (
              <Button
                variant="primary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleDownload}
              >
                Tải bản PDF hoàn tất
              </Button>
            )}
            {canCancel && (
              <Button
                variant="ghost"
                className="text-danger hover:bg-badge-declined-bg"
                leftIcon={<Ban className="w-4 h-4" />}
                onClick={() => setConfirmCancel(true)}
              >
                Hủy hợp đồng
              </Button>
            )}
          </div>
        }
      />

      {/* NỘI DUNG 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* CỘT TRÁI: KHUNG XEM TÀI LIỆU CHUYÊN NGHIỆP */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
          <section className="bg-surface border border-line rounded-xl shadow-card overflow-hidden flex flex-col">
            {/* Header khung tài liệu */}
            <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-strip/90 border-b border-line">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-selected text-primary border border-primary/10 shrink-0">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-fg truncate">Tài liệu điện tử</h2>
                  <p className="text-[11px] text-muted truncate">
                    Bản gốc chuẩn bị ký kết hoặc đã hoàn tất chứng nhận số
                  </p>
                </div>
              </div>

              {contract.documentUrl && (
                <div className="flex items-center gap-2">
                  <a
                    href={contract.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold bg-white border border-line text-slate-700 hover:bg-strip hover:text-fg shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Mở tab mới</span>
                  </a>
                </div>
              )}
            </header>

            {/* Vùng xem tài liệu PDF */}
            <div className="relative bg-slate-900/5 min-h-[580px] lg:h-[calc(100vh-14rem)] lg:min-h-[640px] flex flex-col">
              {contract.documentUrl ? (
                <iframe
                  src={`${contract.documentUrl}#toolbar=0&navpanes=0`}
                  title={`Tài liệu hợp đồng ${contract.code}`}
                  className="w-full flex-1 border-0"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center bg-surface">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-muted border border-line">
                    <FileText className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-fg">Chưa có bản xem trước tài liệu</p>
                    <p className="text-xs text-muted max-w-sm mt-1">
                      File PDF sẽ xuất hiện tại đây ngay khi máy chủ ký số tổng hợp và trả về đường dẫn tài liệu.
                    </p>
                  </div>
                </div>
              )}

              {/* Dải chân xác thực bảo mật PAdES */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-line flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>
                    Bảo vệ tính toàn vẹn tài liệu theo chuẩn chữ ký số <strong>PAdES</strong> (Luật GDĐT 2023).
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>SHA-256 Verified</span>
                </div>
              </div>
            </div>
          </section>

          {/* KHỐI CHỨNG THƯ CHỮ KÝ SỐ KHI ĐÃ KÝ */}
          {contract.signatures.length > 0 && (
            <Card
              title="Chứng thư & Dấu thời gian (Timestamp TSA)"
              icon={Award}
              actions={
                <a
                  href={ROOT_CA_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Root CA</span>
                </a>
              }
              bodyClassName="p-0"
            >
              <ul className="divide-y divide-line">
                {contract.signatures.map((s) => (
                  <li
                    key={s.serial}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="min-w-0 flex items-start gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
                          s.valid
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200",
                        )}
                      >
                        <Award className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-fg flex items-center gap-1.5 flex-wrap">
                          <span>{s.signerName}</span>
                          <span className="font-normal text-muted text-xs">({s.signerEmail})</span>
                        </p>
                        <p className="mt-1 text-xs text-muted flex items-center gap-1.5 flex-wrap">
                          <span>
                            Cơ quan cấp: <strong>{s.issuer}</strong>
                          </span>
                          <span>·</span>
                          <span>
                            Serial: <code className="font-mono text-fg">{s.serial}</code>
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          Thời điểm ký: {formatDateTime(s.signedAt)}
                          {s.timestampAuthority && (
                            <span className="ml-1 text-emerald-700 font-medium">
                              (Dấu thời gian {s.timestampAuthority})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold self-start sm:self-center shrink-0 ring-1 ring-inset",
                        s.valid
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                          : "bg-red-50 text-red-700 ring-red-600/20",
                      )}
                    >
                      {s.valid ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {s.valid ? "Hợp lệ" : "Không hợp lệ"}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="p-4 bg-strip/75 border-t border-line text-xs text-muted leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Để phần mềm Adobe Acrobat Reader hiển thị thông báo <em>&quot;Signature is valid&quot;</em> trên máy tính cá nhân, hãy tải chứng chỉ <strong>Root CA</strong> của hệ thống và cài đặt vào danh mục Trusted Root Certification Authorities.
                </span>
              </div>
            </Card>
          )}
        </div>

        {/* CỘT PHẢI: TIẾN TRÌNH KÝ & NHẬT KÝ THAO TÁC */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5">
          {/* THẺ 1: TIẾN TRÌNH VÀ THỨ TỰ CÁC BÊN KÝ */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <span>Tiến trình các bên ký & duyệt</span>
                <span className="text-xs font-normal text-muted">
                  ({signedCount}/{totalSigners})
                </span>
              </span>
            }
            icon={UserCheck}
            actions={
              isAllSigned && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3" /> Hoàn tất
                </span>
              )
            }
            bodyClassName="p-0"
          >
            {/* Thanh tiến độ phần trăm */}
            <div className="p-4 bg-strip/40 border-b border-line">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Tỷ lệ ký kết</span>
                <span className="font-bold tabular-nums text-fg">
                  {totalSigners > 0 ? Math.round((signedCount / totalSigners) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={signedCount}
                max={Math.max(1, totalSigners)}
                tone={isAllSigned ? "success" : "primary"}
              />
            </div>

            {/* Danh sách người ký thiết kế dạng Step Connector */}
            <ol className="relative divide-y divide-line">
              {contract.signers.map((s) => {
                const config = SIGNER_STATUS_CONFIG[s.status];
                const isApprover = s.role === "Approver";
                const isCc = s.role === "Cc";

                const roleBadge = isApprover ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                    Người duyệt
                  </span>
                ) : isCc ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-line">
                    Nhận bản sao (Cc)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    Người ký
                  </span>
                );

                const statusLabel =
                  isApprover && s.status === "Signed"
                    ? "Đã duyệt"
                    : isApprover && s.status === "Current"
                      ? "Đang chờ duyệt"
                      : isCc
                        ? "Đã nhận bản sao"
                        : config.label;

                return (
                  <li
                    key={s.order}
                    className={cn(
                      "p-4 sm:p-5 flex items-start gap-3.5 transition-colors",
                      s.status === "Current" ? "bg-selected/30" : "bg-surface hover:bg-slate-50/50",
                    )}
                  >
                    {/* Node số thứ tự hoặc biểu tượng trạng thái */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-transform",
                        config.nodeBg,
                      )}
                    >
                      {s.status === "Signed" ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span>{s.order}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm font-bold text-fg truncate">{s.fullName}</p>
                          {roleBadge}
                        </div>
                        <Badge tone={config.badgeTone} size="sm">
                          {statusLabel}
                        </Badge>
                      </div>

                      {(s.title || s.organization) && (
                        <p className="text-xs text-fg mt-1 font-medium">
                          {[s.title, s.organization].filter(Boolean).join(" · ")}
                        </p>
                      )}

                      <p className="text-xs text-muted truncate mt-0.5">
                        {s.email}
                        {s.phone ? ` · ${s.phone}` : ""}
                      </p>

                      {/* Tọa độ ô ký dạng chip nhẹ nhàng (chỉ người ký mới có ô ký) */}
                      {!isApprover &&
                        !isCc &&
                        s.pageNumber !== undefined &&
                        s.boxX !== undefined &&
                        s.boxY !== undefined && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-strip border border-line text-[11px] font-mono text-slate-600">
                            <MapPin className="w-3 h-3 text-muted" />
                            <span>
                              Trang {s.pageNumber} · ({Math.round(s.boxX)}, {Math.round(s.boxY)}) pt
                            </span>
                          </div>
                        )}

                      {s.signedAt && (
                        <p className="mt-1.5 text-xs text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {isApprover ? "Phê duyệt" : "Ký"} lúc {formatDateTime(s.signedAt)}
                          </span>
                        </p>
                      )}

                      {s.status === "Current" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-2"
                          leftIcon={<Mail className="w-3.5 h-3.5" />}
                          onClick={handleRemind}
                          isLoading={isReminding}
                        >
                          Gửi lại email mời
                        </Button>
                      )}

                      {s.declineReason && (
                        <div className="mt-2 p-2 rounded bg-red-50 border border-red-200 text-xs text-danger">
                          <strong>Lý do từ chối:</strong> {s.declineReason}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          {/* THẺ 2: NHẬT KÝ THAO TÁC & AUDIT TRAIL SẮC NÉT */}
          <Card
            title="Nhật ký thao tác (Audit Trail)"
            description="Toàn vẹn dữ liệu được chứng minh bằng chuỗi mã băm SHA-256"
            icon={History}
          >
            <ol className="relative flex flex-col gap-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-line-strong/60">
              {contract.events.map((ev, i) => {
                const isFirst = i === 0;

                return (
                  <li
                    key={ev.hash + i}
                    className="relative pl-8 motion-safe:animate-fade-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Chấm chỉ báo trạng thái trên dòng thời gian */}
                    <span
                      className={cn(
                        "absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 bg-surface",
                        isFirst
                          ? "border-primary ring-4 ring-primary/15 bg-primary"
                          : "border-slate-400",
                      )}
                      aria-hidden="true"
                    />

                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-muted mb-0.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{formatDateTime(ev.at)}</span>
                      </div>

                      <p className="text-sm font-bold text-fg">{ev.title}</p>
                      <p className="text-xs text-muted leading-relaxed mt-0.5">{ev.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>
      </div>

      {/* MODAL GỬI KÝ */}
      <Dialog
        open={confirmSend}
        onClose={() => setConfirmSend(false)}
        title="Gửi hợp đồng nháp đi ký"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmSend(false)} disabled={isSending}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSendDraft}
              isLoading={isSending}
              loadingText="Đang phát hành gửi ký…"
            >
              Xác nhận gửi ký
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-fg leading-relaxed">
            Hợp đồng <strong className="font-mono bg-strip px-1.5 py-0.5 rounded border border-line">{contract.code}</strong> sẽ được khóa nội dung và gửi email kèm mã OTP xác thực tới người ký đầu tiên theo thứ tự.
          </p>
          <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-primary leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Thao tác này sẽ trừ <strong>01 lượt</strong> hợp đồng trong gói thuê bao doanh nghiệp của bạn.
            </span>
          </div>
          <Input
            label="Hạn ký hợp đồng"
            type="datetime-local"
            required
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            helperText="Sau thời gian này, các bên chưa ký sẽ không thể truy cập link để ký tên."
          />
        </div>
      </Dialog>

      {/* MODAL CẢNH BÁO HẠN MỨC */}
      <Dialog
        open={blockedMessage !== null}
        onClose={() => setBlockedMessage(null)}
        title="Không đủ hạn mức gửi ký"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBlockedMessage(null)}>
              Đóng
            </Button>
            <Link href="/app/billing">
              <Button variant="primary">Nâng cấp gói dịch vụ ngay</Button>
            </Link>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-fg">{blockedMessage}</p>
        </div>
      </Dialog>

      {/* MODAL HỦY HỢP ĐỒNG */}
      <Dialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Xác nhận hủy hợp đồng"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmCancel(false)}
              disabled={isCancelling}
            >
              Quay lại
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              isLoading={isCancelling}
              loadingText="Đang hủy…"
            >
              Đồng ý hủy hợp đồng
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-fg leading-relaxed">
            Bạn có chắc chắn muốn hủy hợp đồng <strong className="font-mono">{contract.code}</strong>? Sau khi hủy, tiến trình ký kết sẽ bị đóng vĩnh viễn và các bên chưa ký sẽ không thể mở liên kết được nữa.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
