"use client";

import * as React from "react";
import {
  Camera,
  Check,
  CircleAlert,
  FileText,
  IdCard,
  Lightbulb,
  LoaderCircle,
  QrCode,
  RotateCcw,
  ScanFace,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import { ekycApi, type MyEkyc, type SubmitEkycRequest } from "@/lib/api/ekyc";
import {
  MAX_FACE_DISTANCE,
  canvasToJpeg,
  decodeCccdQr,
  detectFaces,
  faceDistance,
  fileToCanvas,
  loadFaceModels,
  toCanvas,
  type CccdInfo,
} from "@/lib/ekyc-vision";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

const STEPS = ["Chuẩn bị", "Xác thực khuôn mặt", "Ảnh CCCD mặt trước", "Ảnh CCCD mặt sau", "Xác thực & Hoàn tất"];

interface Shot {
  canvas: HTMLCanvasElement;
  blob: Blob;
  preview: string;
}

/* ---------------- Thanh bước ---------------- */

function Stepper({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-5 gap-2 rounded-md border border-line bg-surface p-3">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2 min-w-0" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                done && "border-success bg-success text-white",
                active && "border-primary bg-primary text-white",
                !done && !active && "border-line-strong text-muted",
              )}
            >
              {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i}
            </span>
            <span className="hidden md:flex flex-col min-w-0">
              <span className={cn("truncate text-sm font-semibold", active ? "text-primary" : "text-fg")}>{label}</span>
              <span className={cn("text-xs", done ? "text-success" : active ? "text-primary" : "text-muted")}>
                {done ? "Hoàn tất" : active ? "Đang xử lý" : "Đang chờ"}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- Camera ---------------- */

function CameraCapture({
  facing,
  shape,
  allowUpload,
  onCapture,
}: {
  facing: "user" | "environment";
  shape: "face" | "card";
  allowUpload: boolean;
  onCapture: (canvas: HTMLCanvasElement) => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [permissionError, setCameraError] = React.useState<string | null>(null);
  // Chỉ render phía client (trong Dialog đã mount) nên đọc navigator trực tiếp được.
  const cameraError = navigator.mediaDevices ? permissionError : "Trình duyệt không hỗ trợ camera (cần HTTPS hoặc localhost).";
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setCameraError("Không mở được camera. Hãy cho phép trình duyệt dùng camera" + (allowUpload ? " hoặc tải ảnh lên." : ".")));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing, allowUpload]);

  const capture = () => {
    const v = videoRef.current;
    if (v && v.videoWidth) onCapture(toCanvas(v, v.videoWidth, v.videoHeight));
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onCapture(await fileToCanvas(file));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-md bg-fg">
        {cameraError ? (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white">{cameraError}</p>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedData={() => setReady(true)}
              className={cn("h-full w-full object-cover", facing === "user" && "-scale-x-100")}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  "border-[3px] border-dashed border-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]",
                  shape === "face" ? "h-[78%] aspect-[3/4] rounded-[50%]" : "w-[72%] aspect-[85.6/54] rounded-lg",
                )}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {!cameraError && (
          <Button variant="primary" onClick={capture} disabled={!ready}>
            <Camera className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Chụp ảnh
          </Button>
        )}
        {allowUpload && (
          <label className="inline-flex cursor-pointer items-center rounded-md border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-fg hover:bg-page focus-within:outline-2 focus-within:outline-accent">
            <Upload className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Tải ảnh lên
            <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={upload} />
          </label>
        )}
      </div>
    </div>
  );
}

/* ---------------- Khung một bước chụp ---------------- */

function CaptureStep({
  title,
  hint,
  shot,
  busy,
  error,
  children,
  onRetake,
}: {
  title: string;
  hint: string;
  shot: Shot | null;
  busy: boolean;
  error: string | null;
  children: React.ReactNode;
  onRetake: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-base font-semibold text-fg">{title}</h3>
        <p className="text-sm text-muted">{hint}</p>
      </div>
      {shot ? (
        <div className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh blob cục bộ, không qua next/image */}
          <img src={shot.preview} alt="Ảnh vừa chụp" className="max-h-80 w-full rounded-md bg-page object-contain" />
          {busy && (
            <p className="flex items-center gap-2 text-sm text-muted" role="status">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Đang phân tích ảnh trên thiết bị của bạn…
            </p>
          )}
          {error && (
            <p className="flex items-start gap-2 rounded-md bg-badge-declined-bg p-3 text-sm text-badge-declined-fg" role="alert">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          <div className="flex justify-center">
            <Button variant="secondary" onClick={onRetake} disabled={busy}>
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Chụp lại
            </Button>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/* ---------------- Bước 0 ---------------- */

function PrepareStep({
  consent,
  onConsent,
  onUseOtherDevice,
}: {
  consent: boolean;
  onConsent: (v: boolean) => void;
  onUseOtherDevice?: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 rounded-md border border-line bg-primary-subtle p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-primary">Thông tin bảo mật</h3>
            <p className="mt-1 text-sm text-fg">
              Việc so khớp khuôn mặt và đọc mã QR chạy ngay trên trình duyệt của bạn. Ảnh gửi lên máy chủ được mã hoá
              AES-256 và chỉ quản trị viên xem được khi cần đối soát.
            </p>
          </div>
        </div>
        <div className="rounded-md border border-line p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
            <Lightbulb className="h-4 w-4 text-warning" aria-hidden="true" />
            Mẹo nhanh
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            <li>Dùng CCCD gắn chip còn hiệu lực, mã QR ở mặt trước không bị che hay loá.</li>
            <li>Chụp nơi đủ sáng, tránh phản quang; đặt thẻ trên nền phẳng, tối màu.</li>
            <li>Webcam máy tính khó đọc QR: có thể chụp bằng điện thoại rồi tải ảnh lên.</li>
          </ul>
        </div>
        {onUseOtherDevice && (
          <Button variant="secondary" onClick={onUseOtherDevice}>
            <QrCode className="mr-1.5 h-4 w-4" aria-hidden="true" />
            eKYC trên thiết bị khác
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-fg">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          Các bước xác minh
        </h3>
        {[
          ["Chụp khuôn mặt", "Nhìn thẳng camera, không đeo kính râm hay khẩu trang, chỉ một người trong khung hình."],
          ["Chụp hai mặt CCCD", "Mặt trước để đọc mã QR và ảnh chân dung, mặt sau để lưu hồ sơ."],
          ["Đối chiếu & gửi", "Hệ thống so khuôn mặt với ảnh trên thẻ, bạn kiểm tra thông tin rồi gửi."],
        ].map(([title, text], i) => (
          <div key={title} className="flex gap-3 rounded-md border border-line p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-sm font-semibold text-primary">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-fg">{title}</p>
              <p className="text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
        <label className="mt-1 flex items-start gap-2 text-sm text-fg">
          <input type="checkbox" checked={consent} onChange={(e) => onConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
          <span>
            Tôi đồng ý cho TrustSign xử lý ảnh khuôn mặt và CCCD (dữ liệu cá nhân nhạy cảm theo Nghị định 13/2023/NĐ-CP)
            để xác minh danh tính.
          </span>
        </label>
      </div>
    </div>
  );
}

/* ---------------- Hộp thoại chính ---------------- */

/** Giải phóng blob URL của ảnh cũ khi chụp lại hoặc đóng hộp thoại. */
function useRevokeOnChange(url: string | undefined) {
  React.useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
}

export function EkycDialog({
  open,
  onClose,
  onVerified,
  submitFn = ekycApi.submit,
  onUseOtherDevice,
}: {
  open: boolean;
  onClose: () => void;
  onVerified: (result: MyEkyc) => void;
  /** Trang điện thoại gửi qua link handoff thay vì phiên đăng nhập. */
  submitFn?: (req: SubmitEkycRequest) => Promise<MyEkyc>;
  onUseOtherDevice?: () => void;
}) {
  const [step, setStep] = React.useState(0);
  const [consent, setConsent] = React.useState(false);
  const [selfie, setSelfie] = React.useState<Shot | null>(null);
  const [selfieFace, setSelfieFace] = React.useState<Float32Array | null>(null);
  const [front, setFront] = React.useState<Shot | null>(null);
  const [cardFace, setCardFace] = React.useState<Float32Array | null>(null);
  const [cccd, setCccd] = React.useState<CccdInfo | null>(null);
  const [back, setBack] = React.useState<Shot | null>(null);
  const [distance, setDistance] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<MyEkyc | null>(null);

  // Tải model ngay khi mở hộp thoại để người dùng không phải chờ ở bước chụp.
  React.useEffect(() => {
    if (open) loadFaceModels().catch(() => undefined);
  }, [open]);

  useRevokeOnChange(selfie?.preview);
  useRevokeOnChange(front?.preview);
  useRevokeOnChange(back?.preview);

  const reset = () => {
    setStep(0);
    setConsent(false);
    setSelfie(null);
    setSelfieFace(null);
    setFront(null);
    setCardFace(null);
    setCccd(null);
    setBack(null);
    setDistance(null);
    setError(null);
    setResult(null);
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const toShot = async (canvas: HTMLCanvasElement): Promise<Shot> => {
    const blob = await canvasToJpeg(canvas);
    return { canvas, blob, preview: URL.createObjectURL(blob) };
  };

  const analyse = async (work: () => Promise<string | null>) => {
    setBusy(true);
    setError(null);
    try {
      setError(await work());
    } catch {
      setError("Không tải được bộ nhận diện khuôn mặt. Kiểm tra kết nối mạng rồi thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const onSelfie = async (canvas: HTMLCanvasElement) => {
    setSelfie(await toShot(canvas));
    await analyse(async () => {
      const faces = await detectFaces(canvas);
      if (faces.count === 0) return "Không thấy khuôn mặt. Hãy nhìn thẳng camera, đủ sáng rồi chụp lại.";
      if (faces.count > 1) return "Có nhiều hơn một khuôn mặt trong ảnh. Chỉ một người trong khung hình.";
      setSelfieFace(faces.descriptor);
      return null;
    });
  };

  const onFront = async (canvas: HTMLCanvasElement) => {
    setFront(await toShot(canvas));
    await analyse(async () => {
      const info = decodeCccdQr(canvas);
      if (!info) return "Không đọc được mã QR ở góc trên bên phải thẻ. Chụp gần hơn, rõ nét, không loá.";
      const faces = await detectFaces(canvas);
      if (!faces.descriptor) return "Không thấy ảnh chân dung trên thẻ. Chụp lại toàn bộ mặt trước CCCD.";
      setCccd(info);
      setCardFace(faces.descriptor);
      return null;
    });
  };

  const onBack = async (canvas: HTMLCanvasElement) => {
    setBack(await toShot(canvas));
    // Mặt sau không có QR; nếu đọc được QR thì người dùng đã chụp nhầm mặt trước.
    setError(decodeCccdQr(canvas) ? "Đây là mặt trước. Hãy lật thẻ và chụp mặt sau." : null);
  };

  const retake = (which: 1 | 2 | 3) => {
    setError(null);
    if (which === 1) {
      setSelfie(null);
      setSelfieFace(null);
    } else if (which === 2) {
      setFront(null);
      setCccd(null);
      setCardFace(null);
    } else setBack(null);
  };

  const goToReview = async () => {
    setStep(4);
    if (selfieFace && cardFace) setDistance(await faceDistance(selfieFace, cardFace));
  };

  const submit = async () => {
    if (!selfie || !front || !back || !cccd || distance === null) return;
    setBusy(true);
    setError(null);
    try {
      const saved = await submitFn({ qrText: cccd.raw, faceDistance: distance, selfie: selfie.blob, front: front.blob, back: back.blob });
      setResult(saved);
      onVerified(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không gửi được hồ sơ xác minh.");
    } finally {
      setBusy(false);
    }
  };

  const matched = distance !== null && distance <= MAX_FACE_DISTANCE;
  const canNext =
    !busy && !error && ((step === 0 && consent) || (step === 1 && !!selfieFace) || (step === 2 && !!cccd) || (step === 3 && !!back));

  const footer = result ? (
    <Button variant="primary" onClick={close}>Đóng</Button>
  ) : (
    <div className="flex w-full justify-between gap-2">
      <Button variant="ghost" onClick={() => { setError(null); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0 || busy}>
        Quay lại
      </Button>
      {step < 3 && (
        <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canNext}>
          {step === 0 ? "Bắt đầu xác thực" : "Tiếp tục"}
        </Button>
      )}
      {step === 3 && (
        <Button variant="primary" onClick={goToReview} disabled={!canNext}>Đối chiếu</Button>
      )}
      {step === 4 && (
        <Button variant="primary" onClick={submit} isLoading={busy} disabled={!matched}>Gửi xác minh</Button>
      )}
    </div>
  );

  return (
    <Dialog open={open} onClose={close} title="Xác thực người dùng eKYC" size="xl" preventClose={busy} footer={footer}>
      <div className="flex flex-col gap-5">
        <Stepper current={result ? 5 : step} />

        {step === 0 && <PrepareStep consent={consent} onConsent={setConsent} onUseOtherDevice={onUseOtherDevice} />}

        {step === 1 && (
          <CaptureStep
            title="Xác thực khuôn mặt"
            hint="Đặt khuôn mặt vào giữa khung bầu dục, nhìn thẳng và giữ yên khi chụp."
            shot={selfie}
            busy={busy}
            error={error}
            onRetake={() => retake(1)}
          >
            {/* Ảnh khuôn mặt chỉ chụp trực tiếp, không cho tải ảnh có sẵn. */}
            <CameraCapture facing="user" shape="face" allowUpload={false} onCapture={onSelfie} />
          </CaptureStep>
        )}

        {step === 2 && (
          <CaptureStep
            title="Ảnh CCCD mặt trước"
            hint="Đặt cả thẻ vào khung, mã QR ở góc trên bên phải phải rõ nét."
            shot={front}
            busy={busy}
            error={error}
            onRetake={() => retake(2)}
          >
            <CameraCapture facing="environment" shape="card" allowUpload onCapture={onFront} />
          </CaptureStep>
        )}
        {step === 2 && cccd && !error && <CccdSummary info={cccd} />}

        {step === 3 && (
          <CaptureStep
            title="Ảnh CCCD mặt sau"
            hint="Lật thẻ và chụp mặt sau, thấy rõ vân tay và ngày cấp."
            shot={back}
            busy={busy}
            error={error}
            onRetake={() => retake(3)}
          >
            <CameraCapture facing="environment" shape="card" allowUpload onCapture={onBack} />
          </CaptureStep>
        )}

        {step === 4 && cccd && (
          <div className="flex flex-col gap-4">
            {result ? (
              <div className="flex flex-col items-center gap-2 rounded-md bg-badge-completed-bg p-6 text-center text-badge-completed-fg" role="status">
                <ShieldCheck className="h-10 w-10" aria-hidden="true" />
                <p className="text-base font-semibold">Đã xác minh danh tính</p>
                <p className="text-sm">Tài khoản của bạn đã gắn với CCCD {result.maskedCitizenId}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr]">
                <div className="grid grid-cols-2 gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selfie?.preview} alt="Khuôn mặt" className="aspect-[3/4] w-full rounded-md bg-page object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={front?.preview} alt="CCCD mặt trước" className="aspect-[3/4] w-full rounded-md bg-page object-contain" />
                  <div
                    className={cn(
                      "col-span-2 flex items-center gap-2 rounded-md p-3 text-sm font-semibold",
                      distance === null ? "bg-page text-muted" : matched ? "bg-badge-completed-bg text-badge-completed-fg" : "bg-badge-declined-bg text-badge-declined-fg",
                    )}
                    role="status"
                  >
                    <ScanFace className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {distance === null
                      ? "Đang so khớp khuôn mặt…"
                      : matched
                        ? `Khuôn mặt khớp với ảnh trên CCCD (khoảng cách ${distance.toFixed(2)}, ngưỡng ${MAX_FACE_DISTANCE}).`
                        : `Khuôn mặt không khớp (khoảng cách ${distance.toFixed(2)} > ${MAX_FACE_DISTANCE}).`}
                  </div>
                  {distance !== null && !matched && (
                    <Button variant="secondary" className="col-span-2" onClick={() => { retake(1); setDistance(null); setStep(1); }}>
                      <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Chụp lại khuôn mặt
                    </Button>
                  )}
                </div>
                <CccdSummary info={cccd} />
              </div>
            )}
            {error && (
              <p className="flex items-start gap-2 rounded-md bg-badge-declined-bg p-3 text-sm text-badge-declined-fg" role="alert">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}

function CccdSummary({ info }: { info: CccdInfo }) {
  const rows: [string, string | undefined][] = [
    ["Số CCCD", info.citizenId],
    ["Họ và tên", info.fullName],
    ["Ngày sinh", info.dateOfBirth],
    ["Giới tính", info.gender],
    ["Nơi thường trú", info.address],
    ["Ngày cấp", info.issuedOn],
  ];
  return (
    <div className="rounded-md border border-line p-4">
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg">
        <IdCard className="h-4 w-4 text-primary" aria-hidden="true" />
        Thông tin đọc từ mã QR
      </h4>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium text-fg">{v || "—"}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}
