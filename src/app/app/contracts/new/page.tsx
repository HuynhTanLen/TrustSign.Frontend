"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Upload,
  Users,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  PenTool,
} from "lucide-react";

interface SignerItem {
  id: string;
  name: string;
  email: string;
  color: string;
  badgeClass: string;
}

export default function NewContractWizardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [sourceMode, setSourceMode] = React.useState<"template" | "upload">("template");
  const [contractTitle, setContractTitle] = React.useState("Hợp đồng Cung cấp Dịch vụ Phần mềm Cloud 2026");
  const [partnerCompany, setPartnerCompany] = React.useState("Công ty TNHH Thương mại & Công nghệ Sao Việt");
  const [contractValue, setContractValue] = React.useState("45.000.000 ₫");
  const [dueDate, setDueDate] = React.useState("2026-10-30T17:00");

  const [signers, setSigners] = React.useState<SignerItem[]>([
    {
      id: "s-1",
      name: "Nguyễn Văn An (Đại diện Bên A)",
      email: "an.nguyen@trustsign.vn",
      color: "#4f46e5",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      id: "s-2",
      name: "Trần Bình Minh (Đại diện Bên B)",
      email: "minh.tb@saoviettech.vn",
      color: "#059669",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ]);

  const handleAddSigner = () => {
    if (signers.length >= 5) {
      toast("Tối đa 5 người ký tuần tự cho mỗi hợp đồng", "error");
      return;
    }
    setSigners((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        name: `Người ký thứ ${prev.length + 1}`,
        email: `nguoiky${prev.length + 1}@doanhnghiep.vn`,
        color: "#d97706",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      },
    ]);
  };

  const handleRemoveSigner = (id: string) => {
    if (signers.length <= 1) return;
    setSigners((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSendContract = () => {
    toast("Đã phát hành hợp đồng và gửi email mời ký tới người ký đầu tiên!", "success");
    router.push("/app/contracts/TS-SAAS-2026-01");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/app/contracts"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách hợp đồng</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Soạn và phát hành hợp đồng mới
          </h1>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-2 bg-surface border border-line rounded-2xl p-2 shadow-2xs">
          {[
            { num: 1, label: "1. Nguồn hợp đồng" },
            { num: 2, label: "2. Người ký tuần tự" },
            { num: 3, label: "3. Đặt ô ký & Gửi" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num as 1 | 2 | 3)}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-all ${
                step === s.num
                  ? "bg-primary text-white shadow-xs"
                  : step > s.num
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: NGUỒN HỢP ĐỒNG (FE-04) */}
      {step === 1 && (
        <div className="bg-surface border border-line rounded-2xl p-7 shadow-xs space-y-6">
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setSourceMode("template")}
              className={`flex-1 min-w-[240px] p-5 rounded-2xl border-2 text-left transition-all ${
                sourceMode === "template"
                  ? "border-primary bg-primary-light/50"
                  : "border-line hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Khởi tạo từ Mẫu hợp đồng</h3>
                  <p className="text-xs text-muted">Điền biến động và tự động sinh tệp PDF</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSourceMode("upload")}
              className={`flex-1 min-w-[240px] p-5 rounded-2xl border-2 text-left transition-all ${
                sourceMode === "upload"
                  ? "border-primary bg-primary-light/50"
                  : "border-line hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Tải tệp PDF có sẵn</h3>
                  <p className="text-xs text-muted">Hỗ trợ tệp PDF chuẩn, tối đa 10 MB</p>
                </div>
              </div>
            </button>
          </div>

          {sourceMode === "template" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <Input
                label="Tên hợp đồng phát hành"
                required
                value={contractTitle}
                onChange={(e) => setContractTitle(e.target.value)}
              />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Chọn mẫu hợp đồng doanh nghiệp
                </label>
                <select className="w-full h-11 rounded-xl border border-slate-300 bg-surface px-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary">
                  <option>Mẫu Hợp đồng Dịch vụ Phần mềm SaaS (4 biến)</option>
                  <option>Mẫu Thỏa thuận Bảo mật NDA (3 biến)</option>
                  <option>Mẫu Hợp đồng Lao động Tiêu chuẩn (6 biến)</option>
                </select>
              </div>
              <Input
                label="Biến {{ten_doi_tac}} – Tên doanh nghiệp đối tác"
                required
                value={partnerCompany}
                onChange={(e) => setPartnerCompany(e.target.value)}
              />
              <Input
                label="Biến {{gia_tri_hd}} – Tổng giá trị hợp đồng"
                required
                value={contractValue}
                onChange={(e) => setContractValue(e.target.value)}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-10 text-center bg-indigo-50/30">
              <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-base font-bold text-slate-900">
                Kéo thả tệp PDF hợp đồng vào đây hoặc bấm để chọn tệp
              </p>
              <p className="text-sm text-muted mt-1">
                Chỉ nhận định dạng .pdf, dung lượng tối đa 10 MB
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-line flex justify-end">
            <Button variant="primary" size="lg" onClick={() => setStep(2)}>
              <span>Tiếp tục: Thiết lập Người ký</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: NGƯỜI KÝ TUẦN TỰ (FE-05) */}
      {step === 2 && (
        <div className="bg-surface border border-line rounded-2xl p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Danh sách người ký tuần tự (Tối đa 5 bên)</span>
              </h2>
              <p className="text-sm text-muted mt-0.5">
                Hệ thống sẽ gửi email mời ký lần lượt theo đúng thứ tự từ 1 đến hết
              </p>
            </div>
            <Button variant="secondary" size="md" onClick={handleAddSigner}>
              <Plus className="w-4 h-4" />
              <span>Thêm người ký</span>
            </Button>
          </div>

          <div className="space-y-4">
            {signers.map((signer, index) => (
              <div
                key={signer.id}
                className="p-5 rounded-2xl border border-line bg-slate-50/60 flex flex-col md:flex-row items-center gap-4"
              >
                <div
                  className="w-10 h-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0"
                  style={{ backgroundColor: signer.color }}
                >
                  #{index + 1}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <Input
                    label={`Họ và tên người ký lượt ${index + 1}`}
                    value={signer.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSigners((prev) =>
                        prev.map((item) => (item.id === signer.id ? { ...item, name: val } : item))
                      );
                    }}
                  />
                  <Input
                    label="Email nhận mã OTP & link ký"
                    type="email"
                    value={signer.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSigners((prev) =>
                        prev.map((item) => (item.id === signer.id ? { ...item, email: val } : item))
                      );
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSigner(signer.id)}
                  className="p-2.5 text-slate-400 hover:text-danger hover:bg-rose-50 rounded-xl transition"
                  title="Xóa người ký"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="max-w-sm">
            <Input
              label="Thời hạn hoàn tất ký kết"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-line flex justify-between">
            <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
              Quay lại Bước 1
            </Button>
            <Button variant="primary" size="lg" onClick={() => setStep(3)}>
              <span>Tiếp tục: Đặt vị trí ô ký trên PDF</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: VỊ TRÍ KÝ & GỬI KÝ (FE-05) */}
      {step === 3 && (
        <div className="bg-surface border border-line rounded-2xl p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Đặt vị trí ô chữ ký trên tài liệu PDF (FE-05)
              </h2>
              <p className="text-sm text-muted">
                Tọa độ lưu theo đơn vị điểm PDF (pt). Lưu ý: Đã phát hành thì không sửa được nội dung.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              {signers.map((s, idx) => (
                <span key={s.id} className={`px-3 py-1.5 rounded-xl border ${s.badgeClass}`}>
                  Lượt {idx + 1}: {s.name}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-8 bg-slate-50">
            <div className="max-w-[720px] mx-auto bg-white border border-slate-200 rounded-xl p-8 shadow-xs space-y-4 text-sm">
              <div className="text-center border-b border-line pb-4">
                <h3 className="font-bold text-base uppercase text-slate-900">{contractTitle}</h3>
                <p className="text-xs text-muted mt-1">Đối tác: {partnerCompany} • Giá trị: {contractValue}</p>
              </div>
              <p className="text-slate-700">
                Các bên cam kết thực hiện đúng quyền và nghĩa vụ theo các điều khoản đã thỏa thuận trong hợp đồng điện tử này.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 mt-6 border-t border-line">
                <div className="p-5 rounded-xl border-2 border-dashed border-indigo-500 bg-indigo-50/40 text-center">
                  <p className="text-xs font-bold text-indigo-700 uppercase">Ô KÝ LƯỢT 1 (X: 72pt, Y: 140pt)</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{signers[0]?.name}</p>
                </div>
                <div className="p-5 rounded-xl border-2 border-dashed border-emerald-600 bg-emerald-50/40 text-center">
                  <p className="text-xs font-bold text-emerald-700 uppercase">Ô KÝ LƯỢT 2 (X: 340pt, Y: 140pt)</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{signers[1]?.name ?? "Người ký 2"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-line flex justify-between">
            <Button variant="secondary" size="lg" onClick={() => setStep(2)}>
              Quay lại Bước 2
            </Button>
            <Button variant="primary" size="lg" onClick={handleSendContract}>
              <Send className="w-5 h-5" />
              <span>Phát hành & Gửi ký ngay</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
