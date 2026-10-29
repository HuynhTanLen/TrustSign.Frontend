"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { CircleCheck, CircleX, Clock, FileText, Lock, PenTool, Users } from "lucide-react";
import { signingApi, type SigningSession, type SigningState } from "@/lib/api/signing";
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
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const OTP_LENGTH = 6;

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
          className="w-11 h-12 rounded-md border border-line-strong bg-surface text-center text-xl font-semibold text-fg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      ))}
    </div>
  );
}

function ResultScreen({ state, session }: { state: SigningState; session?: SigningSession }) {
  const content: Record<string, { icon: React.ReactNode; title: string; text: string }> = {
    Signed: {
      icon: <CircleCheck className="w-10 h-10 text-success" />,
      title: "Đã ký hợp đồng",
      text: "Bản đã ký sẽ được gửi qua email khi tất cả các bên ký xong.",
    },
    Declined: {
      icon: <CircleX className="w-10 h-10 text-danger" />,
      title: "Đã từ chối ký",
      text: "Bên gửi đã nhận được lý do từ chối.",
    },
    NotYourTurn: {
      icon: <Clock className="w-10 h-10 text-warning" />,
      title: "Chưa tới lượt ký",
      text: "Link ký sẽ dùng được khi người ký trước đã ký xong. Hệ thống sẽ gửi email báo.",
    },
    Expired: {
      icon: <Lock className="w-10 h-10 text-muted" />,
      title: "Link ký không còn hiệu lực",
      text: "Hợp đồng đã hết hạn ký hoặc đã bị hủy. Liên hệ bên gửi để nhận link mới.",
    },
  };
  const c = content[state] ?? content.Expired;
  return (
    <Card>
      <div className="flex flex-col items-center text-center gap-2 py-8 motion-safe:animate-pop-in">
        {c.icon}
        <h1 className="text-xl font-semibold text-fg">{c.title}</h1>
        {session && (
          <p className="text-sm text-fg">
            {session.contractTitle} <span className="font-mono text-muted">({session.contractCode})</span>
          </p>
        )}
        <p className="text-sm text-muted max-w-md">{c.text}</p>
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
    if (!signature) return;
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

  const otpLocked = attemptsLeft === 0;
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
            <Card title="Hợp đồng cần ký" icon={FileText}>
              <dl className="grid grid-cols-1 sm:grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted">Hợp đồng</dt>
                <dd className="font-semibold text-fg">
                  {session.contractTitle} <span className="font-mono font-normal text-muted">({session.contractCode})</span>
                </dd>
                <dt className="text-muted">Bên gửi</dt>
                <dd className="text-fg">{session.senderCompany}</dd>
                <dt className="text-muted">Người ký</dt>
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
                    <Button variant="primary" onClick={sendOtp} isLoading={busy}>
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
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={sendOtp} disabled={busy}>
                        Gửi lại mã
                      </Button>
                      <Button type="submit" variant="primary" isLoading={busy} disabled={otp.join("").length < OTP_LENGTH || otpLocked || secondsLeft === 0}>
                        Xác nhận
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            ) : (
              <>
                <Card title="Tài liệu" icon={FileText} bodyClassName="p-0">
                  {session.documentUrl ? (
                    <iframe src={session.documentUrl} title="Tài liệu hợp đồng" className="w-full h-[560px]" />
                  ) : (
                    <p className="p-6 text-sm text-muted text-center bg-page">File PDF hiển thị ở đây khi máy chủ trả về đường dẫn tài liệu.</p>
                  )}
                </Card>

                <Card title="Ô ký" icon={Users}>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {session.fields.map((f) => (
                      <li key={f.signerOrder}>
                        {f.isMine ? (
                          <button
                            type="button"
                            onClick={() => setPadOpen(true)}
                            className={`w-full h-28 rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer ${
                              signature ? "border-primary bg-surface" : "border-primary bg-selected hover:bg-selected/70"
                            }`}
                          >
                            {signature ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={signature} alt="Chữ ký của bạn" className="max-h-16" />
                            ) : (
                              <>
                                <PenTool className="w-5 h-5 text-primary" aria-hidden="true" />
                                <span className="text-sm font-semibold text-primary">Bấm để ký vào đây</span>
                              </>
                            )}
                            <span className="text-xs text-muted">{f.signerName}</span>
                          </button>
                        ) : (
                          <div className="h-28 rounded-md border border-line bg-page flex flex-col items-center justify-center gap-1">
                            <span className={`text-sm font-semibold ${f.signed ? "text-success" : "text-muted"}`}>{f.signed ? "Đã ký" : "Chưa ký"}</span>
                            <span className="text-xs text-muted">{f.signerName}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <Button variant="secondary" onClick={() => setDeclining(true)} disabled={busy}>
                    Từ chối ký
                  </Button>
                  <Button variant="primary" onClick={sign} disabled={!signature} isLoading={busy}>
                    Ký hợp đồng
                  </Button>
                </div>
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
        title="Từ chối ký"
        message="Bên gửi sẽ nhận được lý do và hợp đồng dừng ở trạng thái Từ chối."
        reasonLabel="Lý do từ chối"
        confirmLabel="Từ chối ký"
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
