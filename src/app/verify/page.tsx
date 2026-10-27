"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileSignature,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Search,
  Award,
  Link2,
  ArrowLeft,
} from "lucide-react";

export default function VerifyPage() {
  const [activeTab, setActiveTab] = React.useState<"code" | "file">("code");
  const [code, setCode] = React.useState("TS-SAAS-2026-01");
  const [isTampered, setIsTampered] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-page text-fg">
      {/* Header */}
      <header className="h-[72px] border-b border-line bg-surface px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base shadow-sm shadow-indigo-500/20">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900">
              Chữ Tín <span className="text-primary font-semibold">TrustSign</span>
            </span>
            <span className="block text-[11px] text-muted font-medium">
              Cổng xác minh chữ ký số & Chuỗi băm công khai (FE-08)
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/app">
            <Button variant="secondary" size="md">
              <ArrowLeft className="w-4 h-4" />
              <span>Bảng điều khiển</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-[920px] w-full mx-auto px-6 py-10 flex-1 space-y-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Xác minh tính hợp lệ của Hợp đồng điện tử
          </h1>
          <p className="text-sm sm:text-base text-muted mt-1">
            Kiểm tra chữ ký số PAdES X.509 và tính toàn vẹn của chuỗi nhật ký sự kiện SHA-256 Hash-Chain
          </p>
        </div>

        {/* Khung tra cứu 2 Tab */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("code")}
                className={`h-10 px-5 rounded-xl text-sm font-semibold transition ${
                  activeTab === "code"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                Nhập mã hợp đồng
              </button>
              <button
                onClick={() => setActiveTab("file")}
                className={`h-10 px-5 rounded-xl text-sm font-semibold transition ${
                  activeTab === "file"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                Tải tệp PDF đã ký
              </button>
            </div>

            <Button
              variant={isTampered ? "primary" : "secondary"}
              size="sm"
              onClick={() => setIsTampered(!isTampered)}
            >
              {isTampered ? "Khôi phục trạng thái Hợp lệ" : "Mô phỏng trường hợp Chuỗi băm bị sửa đổi"}
            </Button>
          </div>

          {activeTab === "code" ? (
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <Input
                  label="Mã định danh hợp đồng"
                  placeholder="Ví dụ: TS-SAAS-2026-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button variant="primary" size="md" className="shrink-0">
                Kiểm tra hợp đồng
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-8 text-center bg-indigo-50/30">
              <Upload className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="text-base font-bold text-slate-900">
                Kéo thả tệp PDF đã ký vào đây để kiểm tra chữ ký PAdES
              </p>
              <p className="text-xs text-muted mt-1">
                Hệ thống sẽ đối chiếu mã băm SHA-256 và danh sách thu hồi chứng thư CRL
              </p>
            </div>
          )}
        </div>

        {/* Kết quả xác minh */}
        <div className="bg-surface border border-line rounded-2xl p-7 shadow-xs space-y-6">
          {!isTampered ? (
            <div className="p-5 border-2 border-emerald-500 bg-emerald-50/60 rounded-2xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-900">
                  Hợp đồng Hợp lệ & Nguyên vẹn 100%
                </h2>
                <p className="text-sm text-emerald-800 mt-1">
                  Tài liệu <strong>{code}</strong> không bị thay đổi bất kỳ byte nào sau khi ký. Tất cả chứng thư số X.509 và chuỗi nhật ký sự kiện SHA-256 đều khớp tuyệt đối.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 border-2 border-danger bg-rose-50 rounded-2xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-danger text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-rose-900">
                  CẢNH BÁO: Phát hiện sai lệch chuỗi băm (Đã bị can thiệp!)
                </h2>
                <p className="text-sm text-rose-800 mt-1">
                  Chuỗi nhật ký tại <strong>Sự kiện #2</strong> có mã băm không khớp với sự kiện liền kề. Nội dung hoặc thời gian ký có dấu hiệu bị sửa đổi trái phép.
                </p>
              </div>
            </div>
          )}

          {/* Danh sách chữ ký số */}
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-primary" />
              <span>Danh sách chữ ký số PAdES X.509</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-line bg-slate-50 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-slate-900">Nguyễn Văn An (Bên A)</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    CA: TrustSign Issuing CA v1 • Serial: 5F:2A:90:E4
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Ký lúc: 23/10/2026 09:15:10</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Còn hiệu lực
                </span>
              </div>

              <div className="p-4 rounded-xl border border-line bg-slate-50 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-slate-900">Trần Bình Minh (Bên B)</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    CA: TrustSign Issuing CA v1 • Serial: 8C:41:03:D9
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Ký lúc: 23/10/2026 10:42:05</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Còn hiệu lực
                </span>
              </div>
            </div>
          </div>

          {/* Chuỗi nhật ký sự kiện Hash-Chain */}
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Link2 className="w-5 h-5 text-primary" />
              <span>Chuỗi nhật ký sự kiện (SHA-256 Hash-Chain)</span>
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-line bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-slate-900">
                    Sự kiện #3: Hoàn tất hợp đồng và đóng dấu số hệ thống
                  </p>
                  <p className="font-mono text-xs text-slate-500 mt-0.5">
                    prevHash: e14c99...88aa → currentHash: 9a3f2b8c1d4e...d567
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  HASH HỢP LỆ
                </span>
              </div>

              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isTampered
                    ? "border-2 border-danger bg-rose-50"
                    : "border-line bg-slate-50"
                }`}
              >
                <div>
                  <p className="font-bold text-sm text-slate-900">
                    Sự kiện #2: Người ký thứ hai (Trần Bình Minh) xác thực OTP và ký
                  </p>
                  <p className="font-mono text-xs text-slate-600 mt-0.5">
                    prevHash: 3381ab...fc19 → currentHash:{" "}
                    {isTampered ? "TAMPERED_0091...ffff (GÃY CHUỖI!)" : "e14c9902a1b4...88aa"}
                  </p>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                    isTampered
                      ? "bg-danger text-white border-danger"
                      : "text-emerald-700 bg-emerald-50 border-emerald-200"
                  }`}
                >
                  {isTampered ? "CHUỖI BỊ GÃY" : "HASH HỢP LỆ"}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-line bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-slate-900">
                    Sự kiện #1: Khởi tạo hợp đồng và phát hành lời mời ký
                  </p>
                  <p className="font-mono text-xs text-slate-500 mt-0.5">
                    prevHash: GENESIS_0000...0000 → currentHash: 3381ab77c2d0...fc19
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  HASH HỢP LỆ
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-[64px] border-t border-line bg-surface px-6 lg:px-12 flex items-center justify-between text-sm text-muted">
        <span>© 2026 Chữ Tín (TrustSign)</span>
        <span>Hệ thống xác thực hợp đồng điện tử công khai</span>
      </footer>
    </div>
  );
}
