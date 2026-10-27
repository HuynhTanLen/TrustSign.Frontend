"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileSignature,
  XCircle,
  Award,
  Link2,
} from "lucide-react";

function ContractDetailContent() {
  const params = useParams();
  const { toast } = useToast();
  const contractId = (params?.id as string) || "TS-SAAS-2026-01";

  const [status, setStatus] = React.useState<"Completed" | "Signing" | "Cancelled">("Completed");

  const handleDownloadSigned = () => {
    toast(`Đang tải xuống bản PDF đã đóng dấu số (${contractId}-signed.pdf)`, "success");
  };

  const handleDownloadRootCa = () => {
    toast("Đang tải chứng thư gốc TrustSign-Root-CA.cer để tin cậy trên Adobe Reader", "info");
  };

  const handleCancelContract = () => {
    if (confirm("Bạn có chắc chắn muốn hủy hợp đồng này?")) {
      setStatus("Cancelled");
      toast("Đã hủy hợp đồng thành công", "info");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/app/contracts"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách hợp đồng</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              Hợp đồng Dịch vụ Phần mềm SaaS
            </h1>
            <Badge contractStatus={status} />
          </div>
          <p className="text-sm text-muted">
            Mã hợp đồng: <strong className="font-mono text-slate-800">{contractId}</strong> • Người tạo:{" "}
            <strong>Nguyễn Văn An</strong> • Hạn ký: <strong>30/10/2026 17:00</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/sign/${contractId}`}>
            <Button variant="secondary" size="md">
              <FileSignature className="w-4 h-4" />
              <span>Mở cổng ký công khai</span>
            </Button>
          </Link>
          {status !== "Cancelled" && (
            <Button variant="danger" size="md" onClick={handleCancelContract}>
              <XCircle className="w-4 h-4" />
              <span>Hủy hợp đồng</span>
            </Button>
          )}
          <Button variant="primary" size="md" onClick={handleDownloadSigned}>
            <Download className="w-4 h-4" />
            <span>Tải bản đã ký (PDF)</span>
          </Button>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: PDF Document Viewer & X.509 Signatures (FE-07) */}
        <div className="lg:col-span-7 space-y-6">
          {/* PDF Preview Card */}
          <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-line">
              <span className="text-sm font-bold text-slate-900">
                Xem trước tài liệu hợp đồng (Trang 1 / 2)
              </span>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                PAdES-B-T Signed PDF
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl p-8 bg-white text-sm leading-relaxed space-y-4 shadow-2xs">
              <div className="text-center pb-4 border-b border-line">
                <p className="font-bold uppercase text-sm text-slate-900">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="text-xs italic text-slate-600">Độc lập - Tự do - Hạnh phúc</p>
                <h2 className="font-bold text-lg uppercase text-slate-900 mt-4">
                  HỢP ĐỒNG DỊCH VỤ PHẦN MỀM ĐIỆN TỬ
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-1">Số: {contractId}/HĐDV-TS</p>
              </div>

              <p>
                Hôm nay, ngày <strong>23 tháng 10 năm 2026</strong>, tại Văn phòng Công ty Cổ phần Giải pháp Chữ Tín,
                chúng tôi gồm có:
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-line space-y-1">
                <p>
                  <strong>BÊN CUNG CẤP (BÊN A):</strong> CÔNG TY CỔ PHẦN GIẢI PHÁP CHỮ TÍN
                </p>
                <p className="text-xs text-slate-600">
                  Mã số thuế: 0109827364 • Đại diện: Ông Nguyễn Văn An (Giám đốc)
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-line space-y-1">
                <p>
                  <strong>BÊN SỬ DỤNG (BÊN B):</strong> CÔNG TY TNHH CÔNG NGHỆ ABC
                </p>
                <p className="text-xs text-slate-600">
                  Mã số thuế: 0314567890 • Đại diện: Ông Trần Bình Minh (Tổng Giám đốc)
                </p>
              </div>

              <p>
                Hai bên thống nhất ký kết hợp đồng cung cấp bản quyền sử dụng nền tảng ký hợp đồng điện tử Chữ Tín
                (Gói Doanh nghiệp Pro) với thời hạn 12 tháng kể từ ngày ký.
              </p>

              {/* Signature Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-line mt-6">
                <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 text-center">
                  <p className="text-xs font-bold uppercase text-slate-700">ĐẠI DIỆN BÊN A</p>
                  <p className="font-serif italic text-xl text-primary font-bold my-2">
                    Nguyễn Văn An
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold">
                    ✓ Đã ký số X.509 • 23/10/2026 09:15
                  </p>
                </div>

                <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 text-center">
                  <p className="text-xs font-bold uppercase text-slate-700">ĐẠI DIỆN BÊN B</p>
                  <p className="font-serif italic text-xl text-primary font-bold my-2">
                    Trần Bình Minh
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold">
                    ✓ Đã ký số X.509 • 23/10/2026 10:42
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Khung Chữ ký số X.509 (FE-07) */}
          <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-slate-900">
                  Chứng thư số PAdES & Dấu thời gian TSA (FE-07)
                </h2>
              </div>
              <button
                onClick={handleDownloadRootCa}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Tải Root CA (.cer) cho Adobe Reader →
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-line bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    1. Nguyễn Văn An (an.nguyen@trustsign.vn)
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Cấp bởi: <strong>TrustSign Issuing CA v1</strong> • Serial:{" "}
                    <code className="font-mono">5F:2A:90:E4:11:B2</code>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thời điểm ký: 23/10/2026 09:15:10 • Dấu thời gian: FreeTSA RFC 3161
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <ShieldCheck className="w-4 h-4" /> Hợp lệ
                </span>
              </div>

              <div className="p-4 rounded-xl border border-line bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    2. Trần Bình Minh (minh.tb@congngheabc.com)
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Cấp bởi: <strong>TrustSign Issuing CA v1</strong> • Serial:{" "}
                    <code className="font-mono">8C:41:03:D9:77:A0</code>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thời điểm ký: 23/10/2026 10:42:05 • Đóng dấu toàn vẹn hệ thống (System Seal)
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <ShieldCheck className="w-4 h-4" /> Hợp lệ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Signer List & Event Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Danh sách người ký theo thứ tự */}
          <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Danh sách người ký theo thứ tự
            </h2>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Nguyễn Văn An</p>
                    <p className="text-xs text-slate-600">an.nguyen@trustsign.vn</p>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                      Đã ký lúc 23/10/2026 09:15
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Trần Bình Minh</p>
                    <p className="text-xs text-slate-600">minh.tb@congngheabc.com</p>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                      Đã ký lúc 23/10/2026 10:42
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Dòng thời gian sự kiện Hash-Chain */}
          <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-slate-900">
                  Dòng thời gian sự kiện (Hash-Chain)
                </h2>
              </div>
              <Link href="/verify" className="text-xs font-semibold text-primary hover:underline">
                Xác minh độc lập →
              </Link>
            </div>

            <div className="space-y-4 relative before:absolute before:top-3 before:bottom-3 before:left-3.5 before:w-0.5 before:bg-slate-200">
              {[
                {
                  time: "23/10/2026 10:42",
                  title: "Hoàn tất hợp đồng & Đóng dấu số hệ thống",
                  desc: "Tất cả các bên đã ký. Đóng dấu PAdES-B-T.",
                  hash: "9a3f2b...d567",
                },
                {
                  time: "23/10/2026 10:41",
                  title: "Trần Bình Minh xác thực OTP & ký số",
                  desc: "Xác thực OTP email (IP: 113.190.23.14)",
                  hash: "e14c99...88aa",
                },
                {
                  time: "23/10/2026 09:15",
                  title: "Nguyễn Văn An ký số lượt 1",
                  desc: "Sử dụng chữ ký mặc định & chứng thư X.509",
                  hash: "7b201c...4f91",
                },
                {
                  time: "23/10/2026 09:10",
                  title: "Khởi tạo hợp đồng & Gửi lời mời ký",
                  desc: "Tạo từ mẫu Hợp đồng Dịch vụ SaaS",
                  hash: "3381ab...fc19",
                },
              ].map((ev, idx) => (
                <div key={idx} className="relative pl-9">
                  <div className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-xs absolute left-2 top-1" />
                  <p className="text-xs font-semibold text-slate-500">{ev.time}</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{ev.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{ev.desc}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    SHA-256: {ev.hash}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Đang tải chi tiết hợp đồng…</div>}>
      <ContractDetailContent />
    </Suspense>
  );
}
