import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FileSignature,
  KeyRound,
  QrCode,
  ScanFace,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { GatewayStatus } from "@/components/gateway-status";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Badge, type ContractStatus } from "@/components/ui/badge";

const mockContractsPreview: { code: string; title: string; signers: string; status: ContractStatus }[] = [
  { code: "HĐ-2026/0142", title: "Hợp đồng dịch vụ bảo trì hạ tầng Cloud", signers: "3/3 bên đã ký", status: "Completed" },
  { code: "HĐ-2026/0143", title: "Thỏa thuận bảo mật thông tin & tài sản NDA", signers: "Lượt ký 2/2: Giám đốc đối tác", status: "Signing" },
  { code: "HĐ-2026/0145", title: "Phụ lục hợp đồng kinh tế quý IV/2026", signers: "Chờ người ký 1 xác thực OTP", status: "Pending" },
  { code: "HĐ-2026/0148", title: "Hợp đồng cộng tác viên thiết kế", signers: "Soạn thảo nội bộ", status: "Draft" },
];

const faqs = [
  {
    q: "Hệ thống Chữ Tín có tính hợp pháp theo quy định Việt Nam không?",
    a: "Chữ Tín được thiết kế hoàn toàn tuân thủ Luật Giao dịch điện tử 2023 và các nghị định hướng dẫn, áp dụng chuẩn chữ ký điện tử PAdES, gắn dấu thời gian Timestamp và chuỗi nhật ký kiểm toán bất biến không thể làm giả.",
  },
  {
    q: "Người ký bên ngoài có cần tạo tài khoản trên Chữ Tín để ký không?",
    a: "Không. Đối tác hoặc khách hàng chỉ cần nhấn vào liên kết bảo mật nhận được trong email, nhận mã xác thực OTP 6 số để xác thực danh tính và thực hiện ký điện tử trực tiếp ngay trên trình duyệt điện thoại hoặc máy tính.",
  },
  {
    q: "Doanh nghiệp thanh toán phí thuê bao như thế nào?",
    a: "Hệ thống hỗ trợ thanh toán chuyển khoản nhanh qua VietQR tích hợp cổng SePay tự động. Ngay sau khi chuyển khoản đúng nội dung hóa đơn, hệ thống đối soát biến động số dư và kích hoạt gói trong 5 giây.",
  },
  {
    q: "Khi tạo doanh nghiệp mới, tôi có được dùng thử không?",
    a: "Có. Ngay khi bạn khởi tạo không gian doanh nghiệp đầu tiên, hệ thống tự động cấp gói Dùng thử 14 ngày với hạn mức hợp đồng để bạn và đội ngũ trải nghiệm đầy đủ các tính năng ký số PAdES.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-fg overflow-x-hidden">
      <PublicHeader />

      <main className="flex-1">
        {/* ==========================================================
            HERO SECTION: REFINED FINTECH MESH & COMMAND CENTER
            ========================================================== */}
        <section className="relative clean-mesh pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden border-b border-slate-200/70">
          {/* Subtle natural glow wash */}
          <div
            aria-hidden="true"
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-blue-100/60 to-transparent rounded-full blur-3xl pointer-events-none"
          />

          <div className="max-w-content mx-auto px-4 lg:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
              {/* Floating Pill Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xs text-xs font-bold text-slate-700 mb-8 motion-safe:animate-fade-in hover:border-blue-300 transition-colors cursor-default">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Luật Giao dịch điện tử 2023 · Chuẩn Chữ ký số PAdES Toàn cầu</span>
              </div>

              {/* Mega Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] lg:leading-[70px] font-black tracking-tight text-slate-900 motion-safe:animate-fade-up">
                Nền tảng Ký kết Số{" "}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 bg-clip-text text-transparent">
                  Thông minh & Bảo mật
                </span>{" "}
                cho Doanh nghiệp
              </h1>

              <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl leading-relaxed motion-safe:animate-fade-up [animation-delay:100ms]">
                Quản lý không gian đa pháp nhân, điều phối luồng ký tuần tự đến 5 bên,
                xác thực danh tính eKYC CCCD gắn chip và đóng dấu PAdES bất biến.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto motion-safe:animate-fade-up [animation-delay:150ms]">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    glow
                    className="w-full sm:w-auto shadow-md shadow-blue-600/20"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Bắt đầu Dùng thử 14 ngày
                  </Button>
                </Link>
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto shadow-xs hover:shadow-sm"
                  >
                    Xem chi tiết bảng giá
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-500 motion-safe:animate-fade-up [animation-delay:200ms]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Chứng thư PAdES Adobe Reader</span>
                </div>
                <div className="flex items-center gap-2">
                  <ScanFace className="w-4.5 h-4.5 text-blue-600" />
                  <span>eKYC Face Match & CCCD Chip</span>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className="w-4.5 h-4.5 text-indigo-600" />
                  <span>Thanh toán VietQR SePay tức thì</span>
                </div>
              </div>
            </div>

            {/* Clean Command Center Mockup */}
            <div className="mt-16 lg:mt-20 max-w-4xl mx-auto motion-safe:animate-fade-up [animation-delay:250ms]">
              <div className="relative p-2.5 sm:p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 shadow-xl">
                <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
                  {/* Mock Window Topbar */}
                  <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-400" />
                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 pl-2 border-l border-slate-300">
                        Alpha Tech Group · Không gian Doanh nghiệp
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Hệ thống ký số PAdES sẵn sàng
                    </span>
                  </div>

                  {/* Mock Workspace Content */}
                  <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-5 bg-white">
                    {/* Left Stats Widget */}
                    <div className="md:col-span-5 flex flex-col gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-100 shadow-xs">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hạn mức tháng này</p>
                        <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums">18 / 50 hợp đồng</p>
                        <div className="mt-3 h-2 rounded-full bg-slate-200/80 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[36%]" />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xác thực danh tính eKYC</p>
                          <p className="text-sm font-extrabold text-slate-900 mt-0.5">Nguyễn Văn An · Giám đốc</p>
                        </div>
                        <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <CheckCircle2 className="w-5 h-5" />
                        </span>
                      </div>
                    </div>

                    {/* Right Contract Feed */}
                    <div className="md:col-span-7 flex flex-col">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                        <span>Luồng hợp đồng đang xử lý</span>
                        <span className="text-indigo-600">Thời gian thực</span>
                      </div>
                      <ul className="divide-y divide-slate-100 flex-1 flex flex-col justify-between">
                        {mockContractsPreview.map((c) => (
                          <li key={c.code} className="py-2.5 px-2 rounded-lg flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{c.title}</p>
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {c.code} · <span className="font-sans text-slate-600">{c.signers}</span>
                              </p>
                            </div>
                            <Badge contractStatus={c.status} size="sm" className="shrink-0" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Strip */}
                  <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      Chuỗi băm toàn vẹn SHA-256 mã hóa RSA-2048
                    </span>
                    <span className="font-mono text-indigo-600 font-bold">SHA256:7f83b165...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================
            BENTO GRID 2.0: TÍNH NĂNG CỐT LÕI THẾ HỆ MỚI
            ========================================================== */}
        <section id="features" className="py-20 lg:py-28 max-w-content mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-200/80 shadow-xs">
              Tính năng vượt trội
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Kiến trúc Ký kết Toàn diện cho Doanh nghiệp
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Được thiết kế để loại bỏ hoàn toàn thủ tục giấy tờ cồng kềnh, tối ưu hóa thời gian chốt hợp đồng từ vài ngày xuống còn vài phút.
            </p>
          </div>

          {/* Dynamic Bento Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tile 1: Multi-tenant RBAC (Large 2 cols) */}
            <div className="bento-card md:col-span-2 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 text-blue-600 border border-blue-200/80 shadow-md shadow-blue-500/10">
                    <Building2 className="w-7 h-7" />
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                    Multi-tenant & RBAC
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Quản lý Đa Doanh nghiệp & Phân quyền Vai trò
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed max-w-xl">
                  Một tài khoản cá nhân có thể là Chủ sở hữu của doanh nghiệp này và là Nhân viên tại công ty khác.
                  Chuyển đổi ngữ cảnh tức thì, phân quyền Chủ sở hữu, Quản lý hợp đồng và Nhân viên chặt chẽ.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tách biệt dữ liệu pháp nhân 100%
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mời thành viên qua liên kết bảo mật
                </span>
              </div>
            </div>

            {/* Tile 2: Sequential Workflow (1 col) */}
            <div className="bento-card p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/15 to-purple-500/15 text-violet-600 border border-violet-200/80 shadow-md shadow-violet-500/10">
                    <FileSignature className="w-7 h-7" />
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-violet-50 text-violet-700 border border-violet-200">
                    Luồng ký 5 bên
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Ký kết Tuần tự Đa bên
                </h3>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Thiết lập thứ tự duyệt ký tuần tự. Người ký lượt sau chỉ nhận được thông báo khi người trước đã hoàn tất chữ ký số.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-violet-700">
                <span>Tránh xung đột thỏa thuận →</span>
              </div>
            </div>

            {/* Tile 3: OTP External Signer (1 col) */}
            <div className="bento-card p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 text-amber-600 border border-amber-200/80 shadow-md shadow-amber-500/10">
                    <KeyRound className="w-7 h-7" />
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                    Zero-Account
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Xác thực OTP Email Người ký ngoài
                </h3>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Đối tác ký ngoài không bắt buộc phải có tài khoản. Xác minh bằng mã OTP 6 số gửi thẳng vào email định danh của người ký.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-700">
                <span>Ký ngay trên điện thoại di động →</span>
              </div>
            </div>

            {/* Tile 4: PAdES & Audit Hash-chain (Large 2 cols) */}
            <div className="bento-card md:col-span-2 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/15 to-red-500/15 text-rose-600 border border-rose-200/80 shadow-md shadow-rose-500/10">
                    <Shield className="w-7 h-7" />
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                    Pháp lý Luật 2023
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Chữ ký số PAdES & Chuỗi Băm Bất biến (Audit Trail)
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed max-w-xl">
                  Chứng thư số định dạng PAdES tương thích chuẩn mở trên Adobe Acrobat.
                  Mọi nhật ký thao tác được liên kết thành chuỗi băm SHA-256 bất biến, chống chối bỏ trách nhiệm và ngăn chặn chỉnh sửa sau ký.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mở xem trực tiếp trên Adobe Reader không báo lỗi
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cổng tra cứu xác minh toàn vẹn công khai
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================
            WORKFLOW: 4 BƯỚC TRIỂN KHAI VẬN HÀNH
            ========================================================== */}
        <section id="workflow" className="py-20 lg:py-28 bg-white border-y border-slate-200/80">
          <div className="max-w-content mx-auto px-4 lg:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-200/80 shadow-xs">
                Quy trình tinh gọn
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Ký kết Hợp đồng chỉ trong 4 bước
              </h2>
              <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                Quy trình tự động hóa khép kín từ khi khởi tạo pháp nhân đến khi lưu trữ chứng từ có giá trị pháp lý.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Đăng ký & Kích hoạt", desc: "Tạo tài khoản doanh nghiệp, xác minh qua email và tự động nhận ngay gói dùng thử 14 ngày." },
                { step: "02", title: "Thiết lập Pháp nhân", desc: "Khởi tạo thông tin công ty, mã số thuế và phân quyền nhân sự theo vai trò quản lý." },
                { step: "03", title: "Soạn thảo & Gán lượt ký", desc: "Tải file PDF hoặc chọn mẫu sẵn, đặt vị trí ô ký tay và gán mã OTP bảo mật cho người ký." },
                { step: "04", title: "Đóng dấu PAdES & Lưu trữ", desc: "Tài liệu sau khi đủ chữ ký tự động đóng dấu PAdES, chuỗi băm bất biến và xuất biên lai." },
              ].map((s) => (
                <div key={s.step} className="bento-card p-7 flex flex-col justify-between">
                  <div>
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-base font-black shadow-md shadow-indigo-600/30">
                      {s.step}
                    </span>
                    <h3 className="mt-5 text-lg font-black text-slate-900">{s.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================================
            FAQ SECTION
            ========================================================== */}
        <section id="faq" className="py-20 lg:py-28 max-w-content mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-200/80 shadow-xs">
                Giải đáp thắc mắc
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Câu hỏi thường gặp
              </h2>
              <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                Tìm hiểu thêm về cơ sở pháp lý, tính toàn vẹn chữ ký số PAdES và cơ chế vận hành của hệ thống Chữ Tín.
              </p>

              <div className="mt-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Hỗ trợ kỹ thuật 24/7</p>
                <p className="text-base font-extrabold text-slate-900 mt-1">Đội ngũ Chữ Tín Engineering</p>
                <Link
                  href="/register"
                  className="mt-3 inline-flex items-center text-xs font-bold text-blue-600 hover:text-indigo-600 underline underline-offset-4"
                >
                  Tạo tài khoản trải nghiệm miễn phí →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl divide-y divide-slate-100 shadow-card overflow-hidden">
              {faqs.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-bold text-slate-900 hover:bg-slate-50 transition-colors [&::-webkit-details-marker]:hidden">
                    <span className="text-sm sm:text-base">{f.q}</span>
                    <ChevronDown
                      className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-open:rotate-180 group-open:text-indigo-600"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed motion-safe:animate-fade-in">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================================
            BOTTOM CTA BANNER: ENTERPRISE CALLOUT
            ========================================================== */}
        <section className="max-w-content mx-auto px-4 lg:px-6 pb-20">
          <div className="relative rounded-2xl p-8 lg:p-12 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white border border-slate-800 shadow-xl shadow-slate-950/20 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/15 mb-4">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Dùng thử 14 ngày đầy đủ tính năng
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Hiện đại hóa Quy trình Ký kết Hợp đồng ngay hôm nay
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Tạo không gian doanh nghiệp đầu tiên, cấp quyền thành viên và bắt đầu gửi hợp đồng ký số chuẩn PAdES trong 60 giây.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button variant="inverse" size="lg" glow className="shadow-lg">
                  Đăng ký dùng thử miễn phí
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 border border-white/20">
                  Bảng giá dịch vụ
                </Button>
              </Link>
            </div>
          </div>

          {process.env.NODE_ENV !== "production" && (
            <div className="mt-6 flex justify-center">
              <GatewayStatus />
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
