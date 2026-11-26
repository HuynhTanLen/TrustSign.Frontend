import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  FileCheck2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { ContractThumbnail } from "@/components/contract-thumbnail";
import { GatewayStatus } from "@/components/gateway-status";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

const capabilities = [
  {
    num: "01",
    title: "Đa doanh nghiệp & Phân quyền",
    desc: "Một tài khoản quản trị nhiều không gian pháp nhân tách biệt, phân quyền Chủ sở hữu, Quản lý và Nhân viên.",
  },
  {
    num: "02",
    title: "Mẫu hợp đồng & Sinh PDF",
    desc: "Thiết kế mẫu hợp đồng có biến động, tự động dàn trang Mục I, II, III và kết xuất PDF chuẩn tiếng Việt.",
  },
  {
    num: "03",
    title: "Xác thực eKYC CCCD Chip",
    desc: "Đối chiếu sinh trắc học khuôn mặt với thẻ CCCD gắn chip trước khi đại diện doanh nghiệp thực hiện ký kết.",
  },
  {
    num: "04",
    title: "Ký tuần tự & OTP Email",
    desc: "Mời tối đa 5 bên ký tuần tự; đối tác ngoài xác thực mã OTP 6 số và ký ngay không cần tạo tài khoản.",
  },
  {
    num: "05",
    title: "Chữ ký số PAdES & Hash-chain",
    desc: "Đóng dấu chữ ký số PAdES hợp lệ trên Adobe Reader, kèm chuỗi băm SHA-256 chống chỉnh sửa dù 1 byte.",
  },
  {
    num: "06",
    title: "Thuê bao & VietQR SePay",
    desc: "Tặng 14 ngày dùng thử khi đăng ký doanh nghiệp; nâng cấp gói qua VietQR tự động kích hoạt tức thì.",
  },
];

const steps = [
  { step: "01", title: "Đăng ký tài khoản", desc: "Tạo tài khoản cá nhân và xác minh địa chỉ email." },
  { step: "02", title: "Đăng ký doanh nghiệp", desc: "Khởi tạo pháp nhân và nhận ngay 14 ngày dùng thử." },
  { step: "03", title: "Soạn thảo & Mời ký", desc: "Chọn mẫu hoặc tải PDF, đặt ô ký và gửi lời mời OTP." },
  { step: "04", title: "Đóng dấu PAdES", desc: "Hoàn tất chữ ký số, lưu vết hash-chain và gửi bản sao." },
];

const faqs = [
  {
    q: "Hệ thống TrustSign có tuân thủ quy định pháp luật Việt Nam không?",
    a: "TrustSign được thiết kế tuân thủ Luật Giao dịch điện tử 2023, áp dụng chuẩn chữ ký số PAdES và chuỗi nhật ký kiểm toán SHA-256 bất biến.",
  },
  {
    q: "Đối tác ký bên ngoài có cần đăng ký tài khoản không?",
    a: "Không. Người ký bên ngoài chỉ cần mở liên kết trong email, nhập mã OTP 6 số để xác thực và ký trực tiếp trên trình duyệt.",
  },
  {
    q: "Doanh nghiệp thanh toán phí gói dịch vụ như thế nào?",
    a: "Hệ thống tạo mã QR chuyển khoản VietQR qua cổng SePay. Khi giao dịch hoàn tất đúng nội dung, gói dịch vụ được kích hoạt tự động.",
  },
  {
    q: "Khi đăng ký doanh nghiệp mới, tôi có được dùng thử không?",
    a: "Có. Ngay khi tạo doanh nghiệp đầu tiên, hệ thống tự động cấp gói Dùng thử 14 ngày để đội ngũ trải nghiệm đầy đủ quy trình ký kết.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1A2922] overflow-x-clip">
      <PublicHeader />

      <main className="flex-1">
        {/* 1. SPARROW EDITORIAL SPLIT HERO */}
        <section className="border-b border-[#E6E4DC]">
          <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-12">
            {/* Left Editorial Typography */}
            <div className="lg:col-span-7 px-4 sm:px-8 lg:px-10 py-16 lg:py-28 flex flex-col justify-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2E3B33] motion-safe:animate-fade-in">
                TrustSign · Hợp đồng điện tử doanh nghiệp
              </p>

              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.06] text-[#1A2922] motion-safe:animate-fade-up">
                Ký kết vững vàng,{" "}
                <span className="font-serif italic font-normal text-[#1B4332]">
                  chuẩn mực ngay từ đầu.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-[#2E3B33] leading-relaxed max-w-xl motion-safe:animate-fade-up [animation-delay:80ms]">
                Nền tảng quản lý đa pháp nhân, xác thực eKYC, ký tuần tự nhiều bên và đóng dấu chữ ký số PAdES bất biến.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4 motion-safe:animate-fade-up [animation-delay:140ms]">
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-sm px-7 bg-[#1B4332] hover:bg-[#143326] text-white font-semibold transition-transform duration-200 hover:-translate-y-0.5"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Đăng ký ngay
                  </Button>
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1A2922] underline underline-offset-4 hover:text-[#1B4332] transition-colors px-2 py-2"
                >
                  Xem bảng giá
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2E3B33] hover:text-[#1B4332] transition-colors px-2 py-2"
                >
                  Xác minh tài liệu
                </Link>
              </div>
            </div>

            {/* Right Architectural Panel with Sample Contract */}
            <div className="lg:col-span-5 bg-[#F5F4EF] border-t lg:border-t-0 lg:border-l border-[#E6E4DC] px-6 sm:px-10 py-10 lg:py-14 flex flex-col justify-between motion-safe:animate-fade-up [animation-delay:180ms]">
              <div className="space-y-4">
                <ContractThumbnail
                  title="Hợp đồng cung cấp dịch vụ Cloud"
                  code="HĐ-2026/0142"
                  partyA="CÔNG TY CỔ PHẦN ALPHA TECH"
                  partyB="CÔNG TY TNHH GIẢI PHÁP B"
                />

                <div className="bg-[#DCEBC7] border border-[#C9DEB0] p-4 rounded-sm flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#1B4332]">
                      Xác thực toàn vẹn · SHA-256
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[#1A2922]">
                      Kiểm chứng hợp lệ trên Adobe Reader &amp; Foxit
                    </p>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#1B4332] bg-white/80 px-2 py-1 rounded-sm shrink-0">
                    PAdES
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-[#E6E4DC] grid grid-cols-2 gap-6 text-xs">
                <div>
                  <p className="text-2xl font-black text-[#1A2922]">5 bên</p>
                  <p className="text-[#2E3B33] mt-0.5">Ký tuần tự OTP</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#1A2922]">14 ngày</p>
                  <p className="text-[#2E3B33] mt-0.5">Dùng thử doanh nghiệp</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. EDITORIAL STATEMENT BAND */}
        <section className="bg-[#F5F4EF] text-[#1A2922] py-20 lg:py-24 text-center border-b border-[#E6E4DC]">
          <Reveal>
            <div className="max-w-3xl mx-auto px-4 lg:px-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]">
                Chuẩn hóa quy trình pháp lý
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-[#1A2922]">
                Từ bản nháp giấy đến{" "}
                <span className="font-serif italic font-normal text-[#1B4332]">
                  chứng thư bất biến.
                </span>
              </h2>
              <p className="mt-5 text-sm sm:text-base text-[#2E3B33] leading-relaxed max-w-xl mx-auto">
                Loại bỏ hoàn toàn khâu in ấn, chuyển phát và lưu trữ thủ công. Mọi thao tác đều được ký số và ghi nhận theo chuỗi băm SHA-256.
              </p>
            </div>
          </Reveal>
        </section>

        {/* 3. SWISS-GRID CAPABILITIES (Hairline Top Borders, Zero Bulky Cards) */}
        <section id="features" className="scroll-mt-16 py-20 lg:py-28 bg-white">
          <div className="max-w-content mx-auto px-4 lg:px-6">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 pb-6 border-b border-[#E6E4DC]">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1B4332]">
                    Năng lực hệ thống
                  </p>
                  <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A2922]">
                    Mọi công cụ cần thiết cho doanh nghiệp
                  </h2>
                </div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1B4332] hover:underline underline-offset-4 shrink-0"
                >
                  Trải nghiệm ngay <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
              {capabilities.map((c, idx) => (
                <Reveal key={c.num} delayMs={(idx % 3) * 80}>
                  <div className="group border-t-2 border-[#E6E4DC] hover:border-[#1B4332] pt-6 transition-colors duration-300">
                    <span className="font-serif italic text-2xl text-[#1B4332]">{c.num}.</span>
                    <h3 className="mt-3 text-lg font-extrabold text-[#1A2922] group-hover:text-[#1B4332] transition-colors">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#2E3B33] leading-relaxed">{c.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 4. EDITORIAL SPLIT SHOWCASE (Security & Hash-Chain) */}
        <section className="py-20 lg:py-24 bg-[#F5F4EF] border-y border-[#E6E4DC]">
          <div className="max-w-content mx-auto px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <Reveal>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1B4332]">
                  Kiến trúc bảo mật
                </p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A2922]">
                  Độc lập kiểm chứng, không cần tin vào bên thứ ba
                </h2>
                <p className="mt-4 text-sm sm:text-base text-[#2E3B33] leading-relaxed">
                  Tệp PDF sau khi hoàn tất mang chữ ký số PAdES nhúng trực tiếp, cho phép bất kỳ ai kiểm tra tính toàn vẹn trên Adobe Acrobat Reader hoặc tại cổng xác minh công khai của TrustSign.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm font-medium text-[#1A2922]">
                  <li className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#1B4332] shrink-0" aria-hidden="true" />
                    Chứng thư số X.509 &amp; đóng dấu PAdES chuẩn quốc tế
                  </li>
                  <li className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-[#1B4332] shrink-0" aria-hidden="true" />
                    Xác thực OTP 6 số, khóa phiên khi nhập sai 5 lần
                  </li>
                  <li className="flex items-center gap-2.5">
                    <FileCheck2 className="w-4 h-4 text-[#1B4332] shrink-0" aria-hidden="true" />
                    Phát hiện ngay mọi thay đổi dù chỉ 1 byte trên tài liệu
                  </li>
                </ul>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delayMs={120}>
                <div className="bg-white text-[#1A2922] p-7 sm:p-8 rounded-sm border border-[#E6E4DC]">
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E6E4DC] text-xs">
                    <span className="uppercase tracking-wider font-bold text-[#1B4332]">
                      Nhật ký Hash-chain
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#1B4332] font-bold">
                      <Check className="w-3.5 h-3.5" /> Hợp lệ
                    </span>
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3.5 bg-[#F5F4EF] border border-[#E6E4DC] rounded-sm">
                      <p className="text-[#1B4332] font-bold">01 · ContractSent</p>
                      <p className="mt-1 text-[#2E3B33] truncate">hash: 7f83b1657ff1fc53b92dc18148a1d65d...</p>
                    </div>
                    <div className="p-3.5 bg-[#F5F4EF] border border-[#E6E4DC] rounded-sm">
                      <p className="text-[#1B4332] font-bold">02 · SignerCompleted (PAdES)</p>
                      <p className="mt-1 text-[#2E3B33] truncate">prev: 7f83b165... → hash: 9e4c21ab...</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 5. 4-STEP WORKFLOW */}
        <section id="workflow" className="scroll-mt-16 py-20 lg:py-24 bg-white border-b border-[#E6E4DC]">
          <div className="max-w-content mx-auto px-4 lg:px-6">
            <Reveal>
              <div className="text-center max-w-xl mx-auto mb-14">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1B4332]">
                  Quy trình vận hành
                </p>
                <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-[#1A2922]">
                  Triển khai trong 4 bước
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((s, idx) => (
                <Reveal key={s.step} delayMs={idx * 80}>
                  <div className="group border-l-2 border-[#E6E4DC] hover:border-[#1B4332] pl-5 py-1 transition-colors duration-300">
                    <span className="font-serif italic text-3xl text-[#1B4332]">{s.step}</span>
                    <h3 className="mt-3 text-base font-extrabold text-[#1A2922]">{s.title}</h3>
                    <p className="mt-1.5 text-sm text-[#2E3B33] leading-relaxed">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FAQ SECTION */}
        <section id="faq" className="scroll-mt-16 py-20 lg:py-24 bg-[#F5F4EF]">
          <div className="max-w-content mx-auto px-4 lg:px-6 max-w-3xl">
            <Reveal>
              <div className="text-center mb-12">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1B4332]">
                  Giải đáp
                </p>
                <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-[#1A2922]">
                  Câu hỏi thường gặp
                </h2>
              </div>

              <div className="bg-white border border-[#E6E4DC] rounded-sm divide-y divide-[#E6E4DC]">
                {faqs.map((f) => (
                  <details key={f.q} className="group">
                    <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-bold text-[#1A2922] hover:bg-[#F5F4EF]/60 transition-colors [&::-webkit-details-marker]:hidden">
                      <span className="text-sm sm:text-base">{f.q}</span>
                      <ChevronDown
                        className="w-4 h-4 text-[#2E3B33] shrink-0 transition-transform duration-200 group-open:rotate-180 group-open:text-[#1B4332]"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="px-6 pb-5 pt-1 text-sm text-[#2E3B33] leading-relaxed motion-safe:animate-fade-in">
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* 7. EDITORIAL CTA */}
        <section className="bg-[#EFF5E8] text-[#1A2922] py-16 border-t border-[#C9DEB0]">
          <Reveal>
            <div className="max-w-content mx-auto px-4 lg:px-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#1A2922]">
                  Bắt đầu với{" "}
                  <span className="font-serif italic font-normal text-[#1B4332]">TrustSign</span>{" "}
                  ngay hôm nay.
                </h2>
                <p className="mt-2 text-sm text-[#2E3B33]">
                  Tạo tài khoản, đăng ký doanh nghiệp và trải nghiệm 14 ngày miễn phí.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-sm px-6 bg-[#1B4332] text-white hover:bg-[#143326] font-bold transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    Đăng ký ngay
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="rounded-sm px-6 bg-white text-[#1A2922] border border-[#C9DEB0] hover:bg-[#F5F4EF]"
                  >
                    Bảng giá
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>

          {process.env.NODE_ENV !== "production" && (
            <div className="max-w-content mx-auto px-4 lg:px-6 mt-8 flex justify-center">
              <GatewayStatus />
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
