"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  FileSignature,
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  PenTool,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

function SignTokenContent() {
  const params = useParams();
  const { toast } = useToast();
  const token = (params?.token as string) || "TS-2026-092";

  const [isOtpVerified, setIsOtpVerified] = React.useState(false);
  const [otpDigits, setOtpDigits] = React.useState<string[]>(["8", "2", "9", "1", "4", "6"]);
  const [isSigned, setIsSigned] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  const handleDigitChange = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => prev.map((d, i) => (i === idx ? clean : d)));
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpDigits.join("").length === 6) {
      setIsOtpVerified(true);
      toast("Xác thực OTP thành công! Vui lòng kiểm tra văn bản và ký số.", "success");
    } else {
      toast("Vui lòng nhập đủ 6 chữ số OTP", "error");
    }
  };

  React.useEffect(() => {
    if (!modalOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#4f46e5";

    const onDown = (e: MouseEvent) => {
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };
    const onMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };
    const onUp = () => setIsDrawing(false);

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [modalOpen, isDrawing]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const applySignature = () => {
    setModalOpen(false);
    setIsSigned(true);
    toast("Đã chèn chữ ký điện tử vào ô ký của bạn", "success");
  };

  const handleFinalSign = () => {
    setIsCompleted(true);
    toast("Ký hợp đồng hoàn tất! Chứng thư số X.509 đã được đóng dấu.", "success");
  };

  const handleDecline = () => {
    const reason = prompt(
      "Nhập lý do từ chối ký (bắt buộc):",
      "Cần điều chỉnh lại thời hạn thanh toán ở Điều 4"
    );
    if (reason) {
      toast("Đã ghi nhận từ chối ký hợp đồng", "info");
    }
  };

  return (
    <div className="min-h-screen bg-page text-fg flex flex-col justify-between">
      {/* Header */}
      <header className="h-[72px] border-b border-line bg-surface px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base shadow-sm shadow-indigo-500/20">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900">
                Chữ Tín <span className="text-primary font-semibold">TrustSign</span>
              </span>
              <span className="block text-[11px] text-muted font-medium">
                Phòng ký hợp đồng điện tử công khai (FE-06)
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Về Bảng điều khiển</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-[920px] w-full mx-auto px-6 py-10 flex-1">
        {/* Thông tin hợp đồng */}
        <div className="bg-surface border border-line rounded-2xl p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Hợp đồng Dịch vụ Phần mềm Cloud
                </h1>
                <Badge contractStatus={isCompleted ? "Completed" : "Signing"} />
              </div>
              <p className="text-sm text-muted mt-1">
                Bên gửi: <strong className="text-slate-800">CTCP Giải pháp Chữ Tín</strong> • Người ký hiện tại:{" "}
                <strong className="text-primary">Trần Bình Minh (mi***@congngheabc.com)</strong>
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              Phiên ký: {token}
            </span>
          </div>

          {!isOtpVerified ? (
            /* Màn hình xác thực OTP 6 ô */
            <div className="max-w-md mx-auto py-6 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-primary flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Xác thực mã OTP người ký
                </h2>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">
                  Mã xác thực 6 chữ số đã được gửi tới hộp thư <strong>mi***@congngheabc.com</strong>.
                  Mã có hiệu lực trong vòng <strong>04:55</strong>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex items-center justify-center gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      className="w-12 h-14 rounded-xl border-2 border-slate-300 focus:border-primary focus:ring-3 focus:ring-primary/15 text-center text-xl font-bold text-slate-900 bg-surface focus:outline-none"
                    />
                  ))}
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Xác nhận OTP & Mở tài liệu ký</span>
                </Button>
              </form>
            </div>
          ) : isCompleted ? (
            /* Màn hình hoàn tất ký */
            <div className="max-w-lg mx-auto py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Đã ký hợp đồng thành công!
                </h2>
                <p className="text-sm text-muted mt-2 leading-relaxed">
                  Chữ ký điện tử của bạn và chứng thư số X.509 đã được nhúng vào tài liệu PDF theo chuẩn PAdES.
                  Bản sao hợp đồng hoàn chỉnh đã được gửi tới email của tất cả các bên.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Link href="/verify">
                  <Button variant="primary" size="md">
                    Kiểm tra tính hợp lệ (/verify)
                  </Button>
                </Link>
                <Link href="/app">
                  <Button variant="secondary" size="md">
                    Về Bảng điều khiển
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Màn hình xem PDF và đặt chữ ký */
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-2xl p-8 bg-white shadow-2xs text-sm leading-relaxed space-y-4">
                <div className="text-center pb-4 border-b border-line">
                  <p className="font-bold uppercase text-sm text-slate-900">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </p>
                  <p className="italic text-xs text-slate-600">Độc lập - Tự do - Hạnh phúc</p>
                  <h2 className="font-bold text-lg uppercase text-slate-900 mt-4">
                    HỢP ĐỒNG CUNG CẤP DỊCH VỤ PHẦN MỀM CLOUD
                  </h2>
                </div>

                <p>
                  Hôm nay, ngày <strong>23 tháng 10 năm 2026</strong>, các bên thống nhất ký kết hợp đồng cung cấp dịch vụ với các điều khoản dưới đây:
                </p>
                <p>
                  <strong>Bên A (Bên cung cấp):</strong> Công ty Cổ phần Giải pháp Chữ Tín (Đại diện: Ông Nguyễn Văn An)
                </p>
                <p>
                  <strong>Bên B (Bên sử dụng):</strong> Công ty TNHH Công nghệ ABC (Đại diện: Ông Trần Bình Minh)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-line mt-6">
                  <div className="text-center p-5 border border-emerald-200 bg-emerald-50/50 rounded-xl">
                    <p className="font-bold text-xs uppercase text-slate-700 mb-1">ĐẠI DIỆN BÊN A</p>
                    <p className="font-serif italic text-2xl font-bold text-primary my-2">
                      Nguyễn Văn An
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold">
                      ✓ Đã ký số X.509 • 23/10/2026 09:15
                    </p>
                  </div>

                  <div
                    onClick={() => setModalOpen(true)}
                    className={`text-center p-5 border-2 rounded-xl cursor-pointer transition-all ${
                      isSigned
                        ? "border-emerald-500 bg-emerald-50/40"
                        : "border-dashed border-amber-500 bg-amber-50/60 hover:bg-amber-50"
                    }`}
                  >
                    <p className="font-bold text-xs uppercase text-slate-700 mb-1">
                      ĐẠI DIỆN BÊN B (Ô KÝ CỦA BẠN)
                    </p>
                    {isSigned ? (
                      <>
                        <p className="font-serif italic text-2xl font-bold text-primary my-2">
                          Trần Bình Minh
                        </p>
                        <p className="text-xs text-emerald-700 font-semibold">
                          ✓ Đã chèn chữ ký (Bấm để ký lại)
                        </p>
                      </>
                    ) : (
                      <div className="py-3">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-xs">
                          <PenTool className="w-3.5 h-3.5" /> Bấm vào đây để ký tên
                        </span>
                        <p className="text-xs text-slate-600 mt-2">Trần Bình Minh</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <Button variant="danger" size="lg" onClick={handleDecline}>
                  <XCircle className="w-5 h-5" />
                  <span>Từ chối ký hợp đồng</span>
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!isSigned}
                  onClick={handleFinalSign}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Hoàn tất & Ký hợp đồng</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal vẽ chữ ký */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-line">
              <h3 className="text-lg font-bold text-slate-900">Ký tên điện tử</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="border-2 border-slate-300 rounded-xl transparent-checkerboard h-44 relative overflow-hidden">
              <canvas
                ref={canvasRef}
                width={460}
                height={176}
                className="w-full h-full cursor-crosshair"
              />
            </div>

            <div className="flex justify-between items-center text-sm text-muted">
              <span>Vẽ chữ ký vào khung trên hoặc dùng chữ ký đã lưu</span>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" /> Xóa vẽ lại
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-line">
              <Button variant="secondary" size="md" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button variant="primary" size="md" onClick={applySignature}>
                Áp dụng chữ ký
              </Button>
            </div>
          </div>
        </div>
      )}

      <footer className="h-[64px] border-t border-line bg-surface px-6 lg:px-12 flex items-center justify-between text-sm text-muted">
        <span>© 2026 Chữ Tín (TrustSign)</span>
        <span>Bảo mật bởi chứng thư số X.509 & Chuỗi băm SHA-256</span>
      </footer>
    </div>
  );
}

export default function SignTokenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">Đang tải cổng ký hợp đồng…</div>}>
      <SignTokenContent />
    </Suspense>
  );
}
