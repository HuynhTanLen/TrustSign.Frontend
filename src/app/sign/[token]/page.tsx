"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  CircleX,
  Clock,
  ExternalLink,
  FileText,
  Lock,
  PenTool,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { signingApi, type CoordinatedRecipient, type SigningSession, type SigningState } from "@/lib/api/signing";
import { isValidEmail } from "@/lib/api/contracts";
import { ApiError } from "@/lib/api";
import { USE_MOCK } from "@/lib/mock";
import { useApi } from "@/lib/use-api";
import { formatDateTime } from "@/lib/format";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { ReasonDialog } from "@/components/reason-dialog";
import { SignaturePad } from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const OTP_LENGTH = 6;
const MAX_RECIPIENTS = 5;

const emptyRecipient = (role: CoordinatedRecipient["role"]): CoordinatedRecipient => ({ fullName: "", email: "", role, title: "" });

/** Người điều phối khai người duyệt/ký bên mình; họ được chèn ngay sau lượt này theo thứ tự trong danh sách. */
function CoordinateForm({ session, busy, onSubmit }: {
  session: SigningSession;
  busy: boolean;
  onSubmit: (recipients: CoordinatedRecipient[]) => void;
}) {
  const [rows, setRows] = React.useState<CoordinatedRecipient[]>(() => [emptyRecipient("Approver"), emptyRecipient("Signer")]);
  // Hàng của người điều phối vẫn giữ trong hợp đồng, nên chỗ còn lại là 5 trừ số người hiện có.
  const maxRows = MAX_RECIPIENTS - session.totalSigners;
  const update = (i: number, patch: Partial<CoordinatedRecipient>) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const signerCount = rows.filter((r) => r.role === "Signer").length;
  const emails = rows.map((r) => r.email.trim().toLowerCase());
  const problem =
    signerCount !== 1
      ? "Cần đúng 1 người ký bên bạn: người này dùng ô ký bên gửi đã đặt sẵn."
      : rows.some((r) => !r.fullName.trim() || r.fullName.trim().length > 100 || !isValidEmail(r.email))
        ? "Nhập đủ họ tên và email hợp lệ cho từng người."
        : new Set(emails).size !== emails.length
          ? "Email giữa các người không được trùng nhau."
          : rows.length > maxRows
            ? `Hợp đồng còn chỗ cho tối đa ${maxRows} người.`
            : null;

  return (
    <Card
      title="Khai báo người duyệt và người ký bên bạn"
      icon={Users}
      actions={
        <Button
          variant="secondary"
          disabled={rows.length >= maxRows}
          onClick={() => setRows((prev) => [...prev, emptyRecipient("Approver")])}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Thêm người
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-fg">
          {session.senderCompany} chọn bạn làm <strong>người điều phối</strong>. Bạn không ký mà khai báo ai bên bạn sẽ duyệt và ai ký.
          Hệ thống gửi email lần lượt theo thứ tự từ trên xuống ngay sau khi bạn xác nhận. Người duyệt nên đặt trước người ký.
        </p>
        <ol className="flex flex-col gap-3">
          {rows.map((r, i) => (
            <li key={i} className="flex flex-col gap-3 p-3.5 rounded-md border border-line bg-page">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-fg">Lượt {session.order + i + 1}</span>
                <Button
                  variant="ghost"
                  aria-label="Xóa người này"
                  disabled={rows.length === 1}
                  onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Vai trò"
                  value={r.role}
                  onChange={(e) => update(i, { role: e.target.value as CoordinatedRecipient["role"] })}
                  options={[
                    { value: "Approver", label: "Người duyệt (duyệt qua OTP, không ký)" },
                    { value: "Signer", label: "Người ký (dùng ô ký đã đặt sẵn)" },
                    { value: "Cc", label: "Nhận bản sao Cc (nhận email khi hoàn tất)" },
                  ]}
                />
                <Input label="Họ và tên" required value={r.fullName} maxLength={100} onChange={(e) => update(i, { fullName: e.target.value })} />
                <Input label="Email" required type="email" value={r.email} onChange={(e) => update(i, { email: e.target.value })} />
                <Input label="Chức danh" value={r.title ?? ""} maxLength={100} onChange={(e) => update(i, { title: e.target.value })} />
              </div>
            </li>
          ))}
        </ol>
        {problem && <p className="text-sm text-danger" role="alert">{problem}</p>}
        <div className="flex justify-end">
          <Button
            variant="success"
            size="lg"
            glow
            disabled={problem !== null}
            isLoading={busy}
            onClick={() => onSubmit(rows.map((r) => ({ ...r, fullName: r.fullName.trim(), email: r.email.trim(), title: r.title?.trim() || undefined })))}
          >
            Xác nhận điều phối
          </Button>
        </div>
      </div>
    </Card>
  );
}

function useSecondsLeft(until: string | null) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!until) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [until]);
  return until ? Math.max(0, Math.floor((new Date(until).getTime() - now) / 1000)) : 0;
}

function OtpInput({ value, onChange, disabled }: { value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Writes digits from box `start` onward, so pasting, autofill and fast typing all land in order.
  const fill = (start: number, digits: string[]) => {
    const next = [...value];
    digits.slice(0, OTP_LENGTH - start).forEach((d, k) => (next[start + k] = d));
    onChange(next);
    refs.current[Math.min(start + digits.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2" onPaste={(e) => {
      const digits = e.clipboardData.getData("text").replace(/\D/g, "").split("");
      if (digits.length) {
        e.preventDefault();
        fill(0, digits);
      }
    }}>
      {value.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          value={d}
          disabled={disabled}
          aria-label={`Chữ số ${i + 1}`}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, "");
            if (!typed) {
              const next = [...value];
              next[i] = "";
              onChange(next);
              return;
            }
            // Focus selects the box's digit, so one keystroke replaces it; extra digits flow into the next boxes.
            fill(i, typed.split(""));
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i]) refs.current[i - 1]?.focus();
          }}
          className="w-12 h-14 rounded-xl border border-line-strong bg-surface text-center text-2xl font-bold text-fg transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-xs"
        />
      ))}
    </div>
  );
}

function ResultScreen({ state, session }: { state: SigningState; session?: SigningSession }) {
  const isApprover = session?.role === "Approver";
  const isCoordinator = session?.role === "Coordinator";
  const content: Record<
    string,
    { icon: React.ReactNode; title: string; text: string; bgTone: string }
  > = {
    Signed: {
      icon: (
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>
      ),
      title: isCoordinator ? "Đã điều phối hợp đồng" : isApprover ? "Đã duyệt hợp đồng" : "Ký hợp đồng thành công!",
      text: isCoordinator
        ? "Hệ thống đã gửi email cho người đầu tiên bạn khai báo. Những người còn lại nhận email lần lượt khi tới lượt."
        : isApprover
          ? "Kết quả duyệt của bạn đã được ghi nhận. Hợp đồng được chuyển tới người kế tiếp theo thứ tự."
          : "Chữ ký của bạn đã được ghi nhận. Hệ thống sẽ thông báo khi tất cả các bên hoàn thành lượt của mình.",
      bgTone: "bg-surface",
    },
    Declined: {
      icon: (
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center ring-8 ring-red-50">
          <CircleX className="w-9 h-9" />
        </div>
      ),
      title: isCoordinator ? "Đã ghi nhận từ chối điều phối" : isApprover ? "Đã ghi nhận từ chối duyệt" : "Đã ghi nhận từ chối ký",
      text: "Lý do từ chối của bạn đã được thông báo tới người khởi tạo hợp đồng để rà soát lại thỏa thuận.",
      bgTone: "bg-surface",
    },
    NotYourTurn: {
      icon: (
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center ring-8 ring-amber-50">
          <Clock className="w-9 h-9" />
        </div>
      ),
      title: "Chưa tới lượt ký của bạn",
      text: "Hợp đồng đang được điều phối cho bên ký trước theo thứ tự. Hệ thống sẽ tự động gửi email thông báo khi đến lượt bạn xác nhận ký.",
      bgTone: "bg-surface",
    },
    Expired: {
      icon: (
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center ring-8 ring-slate-50">
          <Lock className="w-9 h-9" />
        </div>
      ),
      title: "Liên kết ký không còn hiệu lực",
      text: "Hợp đồng đã quá hạn ký hoặc người khởi tạo đã hủy yêu cầu. Vui lòng liên hệ bên gửi để phát hành liên kết mới.",
      bgTone: "bg-surface",
    },
  };
  const c = content[state] ?? content.Expired;
  return (
    <Card className="shadow-card border-line">
      <div className="flex flex-col items-center text-center gap-3 py-10 px-4 motion-safe:animate-pop-in max-w-lg mx-auto">
        {c.icon}
        <h1 className="text-2xl font-bold text-fg mt-2">{c.title}</h1>
        {session && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-strip border border-line text-xs font-medium text-slate-700">
            <span>{session.contractTitle}</span>
            <span className="font-mono text-muted">({session.contractCode})</span>
          </div>
        )}
        <p className="text-sm text-muted leading-relaxed mt-1">{c.text}</p>
      </div>
    </Card>
  );
}

function SignContent() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { data: session, error, isLoading, reload } = useApi(`signing:${token}`, () => signingApi.get(token));

  const [otpSentUntil, setOtpSentUntil] = React.useState<string | null>(null);
  const [otp, setOtp] = React.useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [attemptsLeft, setAttemptsLeft] = React.useState<number | null>(null);
  const [verified, setVerified] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [padOpen, setPadOpen] = React.useState(false);
  const [drawn, setDrawn] = React.useState<string | null>(null);
  const [signature, setSignature] = React.useState<string | null>(null);
  const [declining, setDeclining] = React.useState(false);
  const [finalState, setFinalState] = React.useState<SigningState | null>(null);
  const idempotencyKey = React.useRef<string | null>(null);
  const secondsLeft = useSecondsLeft(otpSentUntil);

  const sendOtp = async () => {
    setBusy(true);
    try {
      const { expiresAt } = await signingApi.requestOtp(token);
      setOtpSentUntil(expiresAt);
      setOtp(Array(OTP_LENGTH).fill(""));
      setAttemptsLeft(null);
      toast("Đã gửi mã OTP tới email.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không gửi được mã OTP.", "error");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await signingApi.verifyOtp(token, otp.join(""));
      if (result.verified) setVerified(true);
      else {
        setAttemptsLeft(result.attemptsLeft);
        setOtp(Array(OTP_LENGTH).fill(""));
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không xác thực được mã OTP.", "error");
    } finally {
      setBusy(false);
    }
  };

  const sign = async () => {
    if (!signature && !isApprover) return;
    idempotencyKey.current ??= crypto.randomUUID();
    setBusy(true);
    try {
      await signingApi.sign(token, signature, idempotencyKey.current);
      setFinalState("Signed");
    } catch (err) {
      setBusy(false);
      toast(err instanceof ApiError ? err.message : "Không ký được hợp đồng. Thử lại.", "error");
    }
  };

  const coordinate = async (recipients: CoordinatedRecipient[]) => {
    setBusy(true);
    try {
      await signingApi.coordinate(token, recipients);
      setFinalState("Signed");
    } catch (err) {
      setBusy(false);
      toast(err instanceof ApiError ? err.message : "Không gửi được danh sách. Thử lại.", "error");
    }
  };

  const otpLocked = attemptsLeft === 0;
  const isApprover = session?.role === "Approver";
  const isCoordinator = session?.role === "Coordinator";
  const verb = isCoordinator ? "điều phối" : isApprover ? "duyệt" : "ký";
  const state = finalState ?? session?.state;

  return (
    <div className="min-h-screen flex flex-col bg-page text-fg">
      <PublicHeader />
      <main className="flex-1 w-full max-w-[880px] mx-auto px-4 py-8 flex flex-col gap-4">
        {error ? (
          error instanceof ApiError && error.status === 404 ? (
            <ResultScreen state="Expired" />
          ) : (
            <ErrorState error={error} onRetry={reload} />
          )
        ) : isLoading || !session ? (
          <Skeleton className="h-64" />
        ) : state && state !== "AwaitingOtp" && state !== "ReadyToSign" ? (
          <ResultScreen state={state} session={session} />
        ) : (
          <>
            <Card title={`Hợp đồng cần ${verb}`} icon={FileText}>
              <dl className="grid grid-cols-1 sm:grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted">Hợp đồng</dt>
                <dd className="font-semibold text-fg">
                  {session.contractTitle} <span className="font-mono font-normal text-muted">({session.contractCode})</span>
                </dd>
                <dt className="text-muted">Bên gửi</dt>
                <dd className="text-fg">{session.senderCompany}</dd>
                <dt className="text-muted">{isCoordinator ? "Người điều phối" : isApprover ? "Người duyệt" : "Người ký"}</dt>
                <dd className="text-fg">
                  {session.signerName} ({session.signerEmailMasked}) · lượt {session.order}/{session.totalSigners}
                </dd>
                <dt className="text-muted">Hạn ký</dt>
                <dd className="text-fg">{formatDateTime(session.dueAt)}</dd>
              </dl>
            </Card>

            {!verified ? (
              <Card title="Xác thực người ký" icon={Lock}>
                {!otpSentUntil ? (
                  <div className="flex flex-col items-start gap-3">
                    <p className="text-sm text-fg">
                      Hệ thống gửi mã 6 chữ số tới <span className="font-semibold">{session.signerEmailMasked}</span> để xác nhận đúng người ký.
                    </p>
                    <Button variant="accent" glow onClick={sendOtp} isLoading={busy}>
                      Gửi mã OTP
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={verifyOtp} className="flex flex-col items-center gap-4 py-2 motion-safe:animate-fade-in">
                    <p className="text-sm text-fg text-center">
                      Nhập mã đã gửi tới <span className="font-semibold">{session.signerEmailMasked}</span>
                    </p>
                    <OtpInput value={otp} onChange={setOtp} disabled={otpLocked || secondsLeft === 0} />
                    {attemptsLeft !== null && attemptsLeft > 0 && (
                      <p className="text-sm text-danger" role="alert">Mã không đúng. Còn {attemptsLeft} lần thử.</p>
                    )}
                    {otpLocked && <p className="text-sm text-danger" role="alert">Đã nhập sai quá số lần cho phép. Yêu cầu mã mới.</p>}
                    <p className="text-xs text-muted tabular-nums">
                      {secondsLeft > 0
                        ? `Mã hết hạn sau ${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`
                        : "Mã đã hết hạn."}
                    </p>
                    {USE_MOCK && <p className="text-xs text-muted">Dữ liệu mẫu: mã đúng là 123456.</p>}
                    <div className="flex gap-2.5">
                      <Button type="button" variant="secondary" onClick={sendOtp} disabled={busy}>
                        Gửi lại mã
                      </Button>
                      <Button type="submit" variant="accent" glow isLoading={busy} disabled={otp.join("").length < OTP_LENGTH || otpLocked || secondsLeft === 0}>
                        Xác nhận
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            ) : (
              <>
                <Card
                  title="Tài liệu hợp đồng điện tử"
                  icon={FileText}
                  bodyClassName="p-0"
                  actions={
                    session.documentUrl && (
                      <a
                        href={session.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở tab mới</span>
                      </a>
                    )
                  }
                >
                  {session.documentUrl ? (
                    <iframe
                      src={`${session.documentUrl}#toolbar=0&navpanes=0`}
                      title="Tài liệu hợp đồng"
                      className="w-full h-[620px] border-0 bg-slate-900/5"
                    />
                  ) : (
                    <div className="p-8 text-sm text-muted text-center bg-page">
                      File PDF hiển thị ở đây khi máy chủ trả về đường dẫn tài liệu.
                    </div>
                  )}
                </Card>

                {isCoordinator ? (
                  <>
                    <CoordinateForm session={session} busy={busy} onSubmit={coordinate} />
                    <div className="flex justify-end">
                      <Button variant="secondary" onClick={() => setDeclining(true)} disabled={busy}>
                        Từ chối {verb}
                      </Button>
                    </div>
                  </>
                ) : (
                <>
                <Card title={isApprover ? "Các bên ký (bạn chỉ duyệt, không cần ký)" : "Ô ký"} icon={Users}>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {session.fields.map((f) => (
                      <li key={f.signerOrder}>
                        {f.isMine ? (
                          <button
                            type="button"
                            onClick={() => setPadOpen(true)}
                            className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                              signature ? "border-blue-500 bg-surface shadow-xs" : "border-blue-400 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-600 hover:shadow-md"
                            }`}
                          >
                            {signature ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={signature} alt="Chữ ký của bạn" className="max-h-16" />
                            ) : (
                              <>
                                <PenTool className="w-6 h-6 text-blue-600 animate-pulse" aria-hidden="true" />
                                <span className="text-sm font-bold text-blue-700">Bấm để ký vào đây</span>
                              </>
                            )}
                            <span className="text-xs text-muted font-medium">{f.signerName}</span>
                          </button>
                        ) : (
                          <div className="h-32 rounded-xl border border-line bg-page flex flex-col items-center justify-center gap-1">
                            <span className={`text-sm font-bold ${f.signed ? "text-emerald-600" : "text-muted"}`}>{f.signed ? "Đã ký" : "Chưa ký"}</span>
                            <span className="text-xs text-muted font-medium">{f.signerName}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setDeclining(true)} disabled={busy}>
                    Từ chối {verb}
                  </Button>
                  <Button variant="success" size="lg" glow onClick={sign} disabled={!isApprover && !signature} isLoading={busy}>
                    {isApprover ? "Duyệt hợp đồng" : "Ký hợp đồng"}
                  </Button>
                </div>
                </>
                )}
              </>
            )}
          </>
        )}
      </main>
      <PublicFooter />

      <Dialog
        open={padOpen}
        onClose={() => setPadOpen(false)}
        title="Chữ ký của bạn"
        className="max-w-[640px]"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPadOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              disabled={!drawn}
              onClick={() => {
                setSignature(drawn);
                setPadOpen(false);
              }}
            >
              Dùng chữ ký này
            </Button>
          </>
        }
      >
        <SignaturePad ink="#1b3a5c" onChange={setDrawn} />
      </Dialog>

      <ReasonDialog
        open={declining}
        title={`Từ chối ${verb}`}
        message="Bên gửi sẽ nhận được lý do và hợp đồng dừng ở trạng thái Từ chối."
        reasonLabel="Lý do từ chối"
        confirmLabel={`Từ chối ${verb}`}
        onClose={() => setDeclining(false)}
        onConfirm={async (reason) => {
          await signingApi.decline(token, reason);
          setDeclining(false);
          setFinalState("Declined");
        }}
      />
    </div>
  );
}

export default function SignPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-page" />}>
      <SignContent />
    </React.Suspense>
  );
}
