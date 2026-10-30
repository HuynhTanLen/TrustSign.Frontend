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
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { GatewayStatus } from "@/components/gateway-status";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Badge, type ContractStatus } from "@/components/ui/badge";

const heroHighlights = [
  "Quản lý nhiều không gian doanh nghiệp trên 1 tài khoản",
  "Phân quyền nhân sự chặt chẽ: Chủ doanh nghiệp, Quản lý, Nhân viên",
  "Ký tuần tự tối đa 5 bên với chuẩn chữ ký số PAdES và mã OTP email",
  "Tự động kích hoạt gói thuê bao qua chuyển khoản VietQR (SePay)",
];

const mockPreviewContracts: { code: string; title: string; signers: string; status: ContractStatus }[] = [
  { code: "HĐ-2026/0142", title: "Hợp đồng dịch vụ bảo trì hệ thống Cloud", signers: "3/3 bên đã ký", status: "Completed" },
  { code: "HĐ-2026/0143", title: "Thỏa thuận bảo mật thông tin NDA", signers: "Lượt ký 2/2: Giám đốc đối tác", status: "Signing" },
  { code: "HĐ-2026/0145", title: "Phụ lục hợp đồng kinh tế quý IV", signers: "Chờ người ký 1 xác thực OTP", status: "Pending" },
  { code: "HĐ-2026/0148", title: "Hợp đồng lao động xác định thời hạn", signers: "Soạn thảo nội bộ", status: "Draft" },
];

const workflowSteps = [
  {
    step: "01",
    title: "Đăng ký & Kích hoạt",
    text: "Tạo tài khoản cá nhân, xác minh bảo mật qua email và tự động nhận gói dùng thử 14 ngày.",
  },
  {
    step: "02",
    title: "Thiết lập Doanh nghiệp",
    text: "Khởi tạo không gian pháp nhân, phân quyền thành viên theo vai trò hoặc nhận lời mời tham gia.",
  },
  {
    step: "03",
    title: "Soạn thảo & Điều phối ký",
    text: "Tải hợp đồng PDF, gán thứ tự ký tuần tự cho tối đa 5 người ký và phát hành mã OTP bảo mật.",
  },
  {
    step: "04",
    title: "Đóng dấu PAdES & Lưu trữ",
    text: "Tài liệu hoàn tất được đóng dấu số PAdES, chuỗi băm bất biến và tải biên lai hóa đơn tức thì.",
  },
];

const bentoFeatures = [
  {
    icon: Building2,
    badge: "Multi-tenant",
    title: "Đa doanh nghiệp linh hoạt",
    text: "Một người dùng có thể là Chủ doanh nghiệp ở công ty này và là Nhân viên ở công ty khác, chuyển đổi ngữ cảnh tức thì không cần đăng nhập lại.",
  },
  {
    icon: Users,
    badge: "RBAC chặt chẽ",
    title: "Phân quyền vai trò chuẩn mực",
    text: "Quyền hạn tách bạch giữa Chủ sở hữu, Quản lý hợp đồng và Nhân viên nhằm bảo mật thông tin pháp lý tuyệt đối.",
  },
  {
    icon: FileSignature,
    badge: "Workflow ký",
    title: "Ký kết tuần tự đa bên",
    text: "Hỗ trợ luồng ký tuần tự đến 5 người ký. Người ký sau chỉ nhận thông báo khi người trước đã hoàn tất chữ ký số.",
  },
  {
    icon: KeyRound,
    badge: "Không cần tài khoản",
    title: "Xác thực OTP người ký ngoài",
    text: "Đối tác ký ngoài nhận liên kết ký an toàn qua email và xác thực danh tính bằng mã OTP 6 số bảo vệ phiên ký.",
  },
  {
    icon: Shield,
    badge: "Pháp lý 2023",
    title: "Chữ ký PAdES & Chuỗi băm bất biến",
    text: "Đạt chuẩn PAdES mở xem trên Adobe Acrobat. Chuỗi băm liên hoàn (audit hash-chain) ngăn chặn mọi hành vi chỉnh sửa sau ký.",
  },
  {
    icon: QrCode,
    badge: "Thanh toán M2",
    title: "Thanh toán VietQR SePay tự động",
    text: "Tích hợp cổng SePay đối soát biến động số dư tức thời. Nâng cấp hạn mức hợp đồng ngay sau khi quét mã VietQR.",
  },
];

const faqs = [
  {
    q: "Hệ thống Chữ Tín có tính hợp pháp theo quy định Việt Nam không?",
    a: "Chữ Tín được thiết kế hoàn toàn tuân thủ Luật Giao dịch điện tử 2023 và các nghị định hướng dẫn, áp dụng chuẩn chữ ký điện tử PAdES, gắn dấu thời gian và lưu giữ chuỗi nhật ký kiểm toán không thể đảo ngược.",
  },
  {
    q: "Người ký bên ngoài có cần tạo tài khoản trên Chữ Tín để ký không?",
    a: "Không. Đối tác hoặc khách hàng của bạn chỉ cần bấm vào liên kết bảo mật nhận được trong email, nhận mã xác thực OTP 6 số để xác thực danh tính và thực hiện ký trực tiếp trên trình duyệt điện thoại hoặc máy tính.",
  },
  {
    q: "Doanh nghiệp thanh toán phí thuê bao như thế nào?",
    a: "Hệ thống hỗ trợ thanh toán chuyển khoản nhanh qua VietQR tích hợp cổng SePay. Sau khi chuyển khoản đúng nội dung mã hóa đơn (ví dụ TS1234567), hệ thống tự động đối soát và kích hoạt gói trong vài giây.",
  },
  {
    q: "Khi tạo doanh nghiệp mới, tôi có được dùng thử không?",
    a: "Có. Ngay khi bạn khởi tạo không gian doanh nghiệp đầu tiên, hệ thống tự động cấp gói Dùng thử 14 ngày với hạn mức hợp đồng để bạn và đội ngũ trải nghiệm đầy đủ các tính năng ký số.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-page text-fg">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative hero-mesh border-b border-line overflow-hidden py-16 lg:py-24">
          <div className="max-w-content mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col items-start motion-safe:animate-fade-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-selected border border-primary/15 text-xs font-semibold text-primary mb-6 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Tuân thủ Luật Giao dịch điện tử 2023 · Chuẩn chữ ký PAdES</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[44px] lg:leading-[52px] font-bold tracking-tight text-fg">
                  Nền tảng quản lý & ký hợp đồng điện tử{" "}
                  <span className="text-primary underline decoration-accent/30 underline-offset-4">
                    chuẩn mực cho doanh nghiệp
                  </span>
                </h1>

                <p className="mt-5 text-base sm:text-lg text-muted max-w-xl leading-relaxed">
                  Thiết lập không gian làm việc đa doanh nghiệp, quản lý phân quyền nhân sự,
                  điều phối luồng ký kết tuần tự và xác thực chữ ký số an toàn tuyệt đối.
                </p>

                <ul className="mt-6 flex flex-col gap-2.5 text-sm text-fg">
                  {heroHighlights.map((point) => (
                    <li key={point} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto">
                      Bắt đầu miễn phí 14 ngày
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      Xem bảng giá dịch vụ
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-line/80 flex items-center gap-6 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Chứng thư số chuẩn quốc gia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-primary" />
                    <span>Thanh toán VietQR tức thì</span>
                  </div>
                </div>
              </div>

              {/* Interactive SaaS Mockup Card */}
              <div className="lg:col-span-5 motion-safe:animate-fade-up [animation-delay:120ms]">
                <div className="relative rounded-2xl p-2 bg-gradient-to-b from-primary/10 via-line/50 to-line/80 shadow-card-hover border border-line">
                  <div className="rounded-xl bg-surface border border-line overflow-hidden shadow-card">
                    {/* Workspace Top Bar Mock */}
                    <div className="px-4 py-3 navy-panel text-white flex items-center justify-between border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-seal text-white flex items-center justify-center text-xs font-bold ring-1 ring-white/30">
                          T
                        </span>
                        <div>
                          <p className="text-xs font-bold leading-none">Tập đoàn Công nghệ Alpha</p>
                          <p className="text-[10px] text-topbar-muted mt-0.5">Chủ doanh nghiệp · Gói Chuyên nghiệp</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Đang hoạt động
                      </span>
                    </div>

                    {/* Stats Widget Row */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-strip/60 border-b border-line text-xs">
                      <div className="p-2.5 rounded-md bg-surface border border-line">
                        <p className="text-muted text-[11px]">Hạn mức gửi ký tháng</p>
                        <p className="font-bold text-fg text-sm mt-0.5 tabular-nums">18 / 50 hợp đồng</p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-selected overflow-hidden">
                          <div className="h-full bg-primary rounded-full w-[36%]" />
                        </div>
                      </div>
                      <div className="p-2.5 rounded-md bg-surface border border-line">
                        <p className="text-muted text-[11px]">Thành viên tổ chức</p>
                        <p className="font-bold text-fg text-sm mt-0.5">6 nhân sự</p>
                        <p className="text-[10px] text-success mt-1">Đã phân quyền RBAC</p>
                      </div>
                    </div>

                    {/* Contract Queue Preview */}
                    <div className="p-3">
                      <div className="flex items-center justify-between pb-2 mb-1 border-b border-line text-xs font-semibold text-muted uppercase tracking-wider">
                        <span>Hợp đồng gần đây</span>
                        <span className="text-[11px] text-primary">Xem tất cả</span>
                      </div>
                      <ul className="divide-y divide-line/70">
                        {mockPreviewContracts.map((c) => (
                          <li key={c.code} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                            <div className="min-w-0">
                              <p className="font-semibold text-fg truncate">{c.title}</p>
                              <p className="text-[11px] text-muted font-mono mt-0.5">
                                {c.code} · <span className="font-sans text-muted/80">{c.signers}</span>
                              </p>
                            </div>
                            <Badge contractStatus={c.status} className="shrink-0 scale-90 origin-right" />
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* PAdES Badge Bar */}
                    <div className="px-3.5 py-2.5 bg-selected/50 border-t border-line flex items-center justify-between text-xs text-primary font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-primary" />
                        Xác thực chuẩn chữ ký điện tử PAdES
                      </span>
                      <span className="text-[11px] font-mono text-muted">SHA-256</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-16 lg:py-20 bg-surface border-b border-line">
          <div className="max-w-content mx-auto px-4 lg:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-accent bg-selected px-3 py-1 rounded-full border border-primary/10">
                Quy trình vận hành
              </span>
              <h2 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight text-fg">
                Triển khai ký kết điện tử chỉ trong 4 bước
              </h2>
              <p className="mt-2 text-muted text-sm sm:text-base">
                Quy trình tinh gọn, khép kín từ khâu khởi tạo pháp nhân đến khi hoàn tất chữ ký số pháp lý.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflowSteps.map((step) => (
                <div
                  key={step.step}
                  className="relative p-6 rounded-xl border border-line bg-page hover:bg-surface hover:shadow-card transition-all"
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white text-base font-bold shadow-xs">
                    {step.step}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-fg">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Features Section */}
        <section id="features" className="py-16 lg:py-20 bg-page border-b border-line">
          <div className="max-w-content mx-auto px-4 lg:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-accent bg-selected px-3 py-1 rounded-full border border-primary/10">
                Tính năng cốt lõi
              </span>
              <h2 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight text-fg">
                Hạ tầng ký số toàn diện cho doanh nghiệp
              </h2>
              <p className="mt-2 text-muted text-sm sm:text-base">
                Tối ưu hóa thời gian xử lý thủ tục hợp đồng, tiết kiệm chi phí in ấn và đảm bảo tính pháp lý bất biến.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bentoFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="p-6 rounded-xl border border-line bg-surface shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-selected text-primary border border-primary/10">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-strip text-muted border border-line">
                          {f.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-fg">{f.title}</h3>
                      <p className="mt-2 text-sm text-muted leading-relaxed">{f.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Teaser Section */}
        <section className="py-16 lg:py-20 bg-surface border-b border-line">
          <div className="max-w-content mx-auto px-4 lg:px-6 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-accent bg-selected px-3 py-1 rounded-full border border-primary/10">
              Minh bạch & Linh hoạt
            </span>
            <h2 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight text-fg">
              Các gói dịch vụ phù hợp quy mô doanh nghiệp
            </h2>
            <p className="mt-2 text-muted text-sm sm:text-base max-w-xl mx-auto">
              Đầy đủ tính năng phân quyền, ký tuần tự, xác thực OTP và đối soát thanh toán tự động qua VietQR.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/pricing">
                <Button variant="primary" size="lg">
                  Xem chi tiết các gói & Bảng giá
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Đăng ký dùng thử ngay
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 lg:py-20 bg-page border-b border-line">
          <div className="max-w-content mx-auto px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-wider text-accent bg-selected px-3 py-1 rounded-full border border-primary/10">
                Giải đáp thắc mắc
              </span>
              <h2 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight text-fg">
                Câu hỏi thường gặp
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
                Tìm hiểu thêm về tính pháp lý, cơ chế hoạt động và cách thức vận hành hệ thống hợp đồng điện tử Chữ Tín.
              </p>
              <div className="mt-6 p-4 rounded-xl bg-surface border border-line">
                <p className="text-xs font-semibold text-muted">Cần hỗ trợ tư vấn doanh nghiệp?</p>
                <p className="text-sm font-bold text-fg mt-1">Đội ngũ kỹ thuật Chữ Tín</p>
                <Link
                  href="/register"
                  className="mt-3 inline-flex items-center text-xs font-bold text-primary hover:text-primary-hover underline underline-offset-2"
                >
                  Bắt đầu tạo tài khoản dùng thử →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 bg-surface border border-line rounded-xl divide-y divide-line shadow-card overflow-hidden">
              {faqs.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none font-semibold text-fg hover:bg-strip transition-colors [&::-webkit-details-marker]:hidden">
                    <span className="text-sm sm:text-base">{f.q}</span>
                    <ChevronDown
                      className="w-4 h-4 text-muted shrink-0 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="px-6 pb-5 pt-1 text-sm text-muted leading-relaxed motion-safe:animate-fade-in">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Executive CTA Banner */}
        <section className="navy-panel text-white py-16 relative overflow-hidden">
          <div className="max-w-content mx-auto px-4 lg:px-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/15 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Kích hoạt tức thì 14 ngày dùng thử
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Sẵn sàng hiện đại hóa quy trình ký kết của bạn?
              </h2>
              <p className="mt-2 text-sm text-topbar-muted leading-relaxed">
                Khởi tạo tài khoản doanh nghiệp ngay hôm nay, trải nghiệm ký kết tuần tự và quản lý nhân sự an toàn.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button variant="inverse" size="lg">
                  Tạo tài khoản miễn phí
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  Đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {process.env.NODE_ENV !== "production" && (
          <div className="max-w-content mx-auto px-4 lg:px-6 py-4">
            <GatewayStatus />
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
