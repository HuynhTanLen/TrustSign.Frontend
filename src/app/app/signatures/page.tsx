"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  PenTool,
  Type,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Sliders,
  RotateCw,
  Sparkles,
} from "lucide-react";

export default function SignaturesPage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [createTab, setCreateTab] = React.useState<"draw" | "type" | "upload">("draw");
  const [typedName, setTypedName] = React.useState("Nguyễn Văn An");
  const [otsuThreshold, setOtsuThreshold] = React.useState(138);
  const [inkColor, setInkColor] = React.useState<"#1e3a8a" | "#0f172a">("#1e3a8a");

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Chữ ký của tôi (FE-09 & FE-10)
          </h1>
          <p className="text-sm text-muted mt-1">
            Quản lý mẫu chữ ký điện tử nền trong suốt (PNG) và công cụ tách nền Otsu trên trình duyệt
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Thêm chữ ký mới</span>
        </Button>
      </div>

      {/* Lưới thẻ chữ ký đã lưu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border-2 border-primary rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mặc định
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Vẽ tay (Canvas)
              </span>
            </div>
            <div className="h-32 flex items-center justify-center font-serif italic text-3xl font-bold text-indigo-800 border border-line rounded-xl transparent-checkerboard mb-4">
              Nguyễn Văn An
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-line text-sm">
            <span className="text-slate-600 font-medium">Chữ ký Giám đốc</span>
            <button
              onClick={() => toast("Không thể xóa chữ ký mặc định đang dùng", "error")}
              className="text-slate-400 hover:text-danger p-1.5 rounded-lg hover:bg-rose-50 transition"
              title="Xóa chữ ký"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
          <div>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => toast("Đã đặt làm chữ ký mặc định", "success")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Đặt làm mặc định
              </button>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Tách nền Otsu
              </span>
            </div>
            <div className="h-32 flex items-center justify-center font-serif italic text-3xl font-bold text-slate-900 border border-line rounded-xl transparent-checkerboard mb-4">
              Văn An
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-line text-sm">
            <span className="text-slate-600 font-medium">Chữ ký nháy</span>
            <button
              onClick={() => toast("Đã xóa mẫu chữ ký", "info")}
              className="text-slate-400 hover:text-danger p-1.5 rounded-lg hover:bg-rose-50 transition"
              title="Xóa chữ ký"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center group transition-all min-h-[220px] bg-surface/50 hover:bg-indigo-50/30"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Plus className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-slate-900">Tạo mẫu chữ ký mới</p>
          <p className="text-xs text-muted mt-1 max-w-[220px]">
            Hỗ trợ vẽ trực tiếp, gõ chữ nghệ thuật hoặc tải ảnh chụp giấy
          </p>
        </button>
      </div>

      {/* Bộ tách chữ ký từ ảnh chụp bằng thuật toán Otsu (FE-10) */}
      <div className="bg-surface border border-line rounded-2xl p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900">
                Trình tách chữ ký từ ảnh chụp giấy – Thuật toán ngưỡng Otsu (FE-10)
              </h2>
            </div>
            <p className="text-sm text-muted mt-1">
              Xử lý 100% trên trình duyệt bằng HTML5 Canvas: khử nền giấy vàng, lọc nhiễu đốm nhỏ và cắt sát khung nét mực (padding 8px).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setInkColor(inkColor === "#1e3a8a" ? "#0f172a" : "#1e3a8a")}
            >
              Đổi màu mực: {inkColor === "#1e3a8a" ? "Xanh dương" : "Đen"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast("Đã xoay ảnh 90 độ theo chiều kim đồng hồ", "info")}
            >
              <RotateCw className="w-4 h-4" />
              <span>Xoay 90°</span>
            </Button>
          </div>
        </div>

        {/* 2 ô xem trước cạnh nhau */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              1. Ảnh gốc chụp trên giấy (Có bóng mờ & nền giấy)
            </label>
            <div className="h-48 border border-slate-300 rounded-2xl bg-[#f3ead8] flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <span className="font-serif italic text-4xl text-slate-800 select-none">
                Nguyễn Văn An
              </span>
              <span className="text-xs text-amber-900/60 mt-3 font-mono">
                JPG • 1600×900px • Ánh sáng tự nhiên
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              2. Kết quả tách nền Otsu (PNG nền trong suốt)
            </label>
            <div className="h-48 border border-indigo-200 rounded-2xl transparent-checkerboard flex flex-col items-center justify-center relative">
              <div className="border border-dashed border-indigo-400 px-6 py-3 rounded-lg">
                <span
                  className="font-serif italic text-4xl font-bold select-none transition-all"
                  style={{
                    color: inkColor,
                    opacity: Math.min(1, Math.max(0.35, (otsuThreshold - 50) / 110)),
                    filter: `contrast(${100 + (otsuThreshold - 120)}%)`,
                  }}
                >
                  Nguyễn Văn An
                </span>
              </div>
              <span className="text-xs text-primary font-semibold mt-2">
                Đã tự động cắt sát khung bao (Auto-crop 8px)
              </span>
            </div>
          </div>
        </div>

        {/* Thanh trượt Độ đậm dịch ngưỡng Otsu */}
        <div className="p-5 rounded-2xl border border-line bg-slate-50 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <span>Thanh trượt Độ đậm nét mực (Dịch ngưỡng Otsu):</span>
            </span>
            <span className="font-mono font-bold text-primary bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
              Ngưỡng: {otsuThreshold} / 255 (Otsu chuẩn: 138)
            </span>
          </div>
          <input
            type="range"
            min="80"
            max="210"
            value={otsuThreshold}
            onChange={(e) => setOtsuThreshold(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>Mảnh hơn (Lọc nhiễu nền tối đa)</span>
            <span>Mặc định Otsu (138)</span>
            <span>Đậm hơn (Giữ nét thanh)</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setOtsuThreshold(138)}
          >
            Khôi phục ngưỡng Otsu
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => toast("Đã lưu chữ ký PNG trong suốt vào danh sách", "success")}
          >
            Lưu chữ ký vào tài khoản
          </Button>
        </div>
      </div>

      {/* Modal 3 Tab thêm chữ ký (FE-09) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-line">
              <h3 className="text-lg font-bold text-slate-900">Thêm chữ ký điện tử mới</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* 3 Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCreateTab("draw")}
                className={`h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  createTab === "draw" ? "bg-surface text-primary shadow-2xs" : "text-slate-600"
                }`}
              >
                <PenTool className="w-4 h-4" /> Vẽ tay
              </button>
              <button
                type="button"
                onClick={() => setCreateTab("type")}
                className={`h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  createTab === "type" ? "bg-surface text-primary shadow-2xs" : "text-slate-600"
                }`}
              >
                <Type className="w-4 h-4" /> Gõ tên
              </button>
              <button
                type="button"
                onClick={() => setCreateTab("upload")}
                className={`h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  createTab === "upload" ? "bg-surface text-primary shadow-2xs" : "text-slate-600"
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Tải ảnh
              </button>
            </div>

            {createTab === "draw" && (
              <div className="space-y-3">
                <div className="h-40 rounded-xl border border-slate-300 transparent-checkerboard flex items-center justify-center">
                  <span className="font-serif italic text-3xl font-bold text-primary">
                    Nguyễn Văn An
                  </span>
                </div>
                <p className="text-xs text-muted text-center">
                  Sử dụng chuột hoặc màn hình cảm ứng để ký trong khung
                </p>
              </div>
            )}

            {createTab === "type" && (
              <div className="space-y-4">
                <Input
                  label="Nhập họ và tên chữ ký"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  {["font-serif italic", "font-serif font-bold", "font-mono italic", "italic font-semibold"].map(
                    (cls, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-line hover:border-primary cursor-pointer text-center transparent-checkerboard"
                      >
                        <span className={`text-xl text-primary ${cls}`}>{typedName}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {createTab === "upload" && (
              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center bg-indigo-50/30">
                <ImageIcon className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900">
                  Chọn ảnh chụp chữ ký trên giấy (JPG, PNG)
                </p>
                <p className="text-xs text-muted mt-1">
                  Tự động chuyển sang bước tách nền bằng thuật toán Otsu
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-line">
              <Button variant="secondary" size="md" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setModalOpen(false);
                  toast("Đã lưu chữ ký mới thành công", "success");
                }}
              >
                Lưu chữ ký
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
