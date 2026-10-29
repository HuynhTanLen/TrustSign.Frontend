import Link from "next/link";
import {
  Building2,
  Check,
  ChevronDown,
  FilePenLine,
  History,
  ListOrdered,
  MailCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import { GatewayStatus } from "@/components/gateway-status";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Badge, type ContractStatus } from "@/components/ui/badge";

const heroPoints = [
  "Một tài khoản quản lý nhiều doanh nghiệp tách biệt",
  "Mời thành viên qua email, phân quyền theo vai trò",
  "Xác thực người ký bằng OTP và chữ ký số PAdES",
];

// Hình minh họa danh sách hợp đồng trên trang giới thiệu, không phải bản ghi thật.
const previewRows: { title: string; code: string; status: ContractStatus }[] = [
  { title: "Hợp đồng dịch vụ", code: "HĐ-0142", status: "Signing" },
  { title: "Phụ lục gia hạn", code: "HĐ-0141", status: "Completed" },
  { title: "Hợp đồng lao động", code: "HĐ-0139", status: "Pending" },
  { title: "Biên bản thanh lý", code: "HĐ-0137", status: "Draft" },
];

const steps = [
  { title: "Đăng ký và xác minh", text: "Tạo tài khoản cá nhân và kích hoạt qua liên kết gửi tới email." },
  { title: "Thiết lập doanh nghiệp", text: "Khởi tạo không gian làm việc cho doanh nghiệp hoặc nhận lời mời tham gia." },
  { title: "Phân quyền nhân sự", text: "Mời thành viên theo vai trò Chủ doanh nghiệp, Quản lý hợp đồng hoặc Nhân viên." },
  { title: "Soạn và ký hợp đồng", text: "Soạn hợp đồng, gửi ký tuần tự qua OTP và lưu trữ bản ký số PAdES." },
];

const features = [
  { icon: Building2, title: "Đa doanh nghiệp", text: "Một tài khoản có thể tham gia nhiều doanh nghiệp và chuyển đổi ngữ cảnh làm việc." },
  { icon: Users, title: "Phân quyền vai trò", text: "Chủ doanh nghiệp, quản lý hợp đồng và nhân viên thấy đúng phần việc được giao." },
  { icon: FilePenLine, title: "Mẫu hợp đồng", text: "Tạo mẫu một lần với các trường cần điền, dùng lại thống nhất trong doanh nghiệp." },
  { icon: ListOrdered, title: "Ký tuần tự", text: "Tối đa 5 bên ký lần lượt; người sau nhận liên kết khi người trước đã hoàn tất." },
  { icon: MailCheck, title: "Xác thực OTP", text: "Mã 6 số gửi qua email cho người ký ngoài mà không bắt buộc tạo tài khoản." },
  { icon: ShieldCheck, title: "Chữ ký số và nhật ký", text: "Bản hoàn tất có chữ ký số PAdES mở bằng Adobe Reader kèm nhật ký chuỗi băm." },
];

const faqs = [
  {
    q: "Một tài khoản có thể làm việc ở nhiều doanh nghiệp không?",
    a: "Có. Một địa chỉ email có thể vừa là Chủ doanh nghiệp ở công ty này vừa là Quản lý hợp đồng hoặc Nhân viên ở công ty khác, chuyển đổi ngay ở thanh bên.",
  },
  {
    q: "Mời thành viên tham gia doanh nghiệp hoạt động thế nào?",
    a: "Chủ doanh nghiệp nhập email và chọn vai trò. Hệ thống gửi liên kết lời mời có hạn 7 ngày; người nhận đăng nhập đúng email đó để chấp nhận.",
  },
  {
    q: "Người ký bên ngoài có cần đăng ký tài khoản không?",
    a: "Không. Người ký đối tác nhận liên kết qua email, xác thực bằng mã OTP 6 số và ký trực tiếp trên trình duyệt.",
  },
  {
    q: "Hợp đồng điện tử trên Chữ Tín tuân thủ quy định nào?",
    a: "Hệ thống được thiết kế theo Luật Giao dịch điện tử 2023, kết hợp chữ ký số PAdES, dấu thời gian và nhật ký thao tác bất biến.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-page text-fg">
      <PublicHeader />

      <main className="flex-1">
        <section className="bg-surface border-b border-line">
          <div className="max-w-content mx-auto px-4 lg:px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="motion-safe:animate-fade-up">
              <h1 className="text-2xl lg:text-[28px] lg:leading-9 font-semibold text-fg">
                Quản lý và ký hợp đồng điện tử cho doanh nghiệp
              </h1>
              <p className="mt-3 text-base text-muted max-w-[520px]">
                Thiết lập không gian làm việc doanh nghiệp, phân quyền thành viên, soạn và ký hợp đồng điện tử tập trung ở một nơi.
              </p>
              <ul className="mt-5 flex flex-col gap-2 text-sm">
                {heroPoints.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/register">
                  <Button variant="primary">Đăng ký tài khoản</Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary">Đăng nhập</Button>
                </Link>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="rounded-md border border-line bg-page p-3 motion-safe:animate-fade-up [animation-delay:120ms]"
            >
              <div className="rounded-md border border-line bg-surface overflow-hidden">
                <div className="h-9 px-3 bg-primary flex items-center gap-2 text-xs text-white">
                  <span className="w-2.5 h-2.5 rounded-sm bg-seal ring-1 ring-white" />
                  <span className="font-semibold">Chữ Tín</span>
                  <span className="ml-auto text-topbar-muted">Không gian doanh nghiệp</span>
                </div>
                <div className="px-3 h-9 flex items-center gap-2 bg-strip border-b border-line text-xs font-semibold">
                  <History className="w-3.5 h-3.5 text-primary" />
                  Minh họa danh sách hợp đồng
                </div>
                <ul>
                  {previewRows.map((r, i) => (
                    <li
                      key={r.code}
                      className="h-row px-3 flex items-center gap-3 border-b border-line last:border-b-0 text-sm motion-safe:animate-fade-in"
                      style={{ animationDelay: `${240 + i * 80}ms` }}
                    >
                      <span className="font-mono text-xs text-muted w-16">{r.code}</span>
                      <span className="flex-1 truncate">{r.title}</span>
                      <Badge contractStatus={r.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-content mx-auto px-4 lg:px-6 py-12">
          <h2 className="text-xl font-semibold text-fg">Quy trình triển khai</h2>
          <ol className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative bg-surface border border-line rounded-md p-4">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary text-white text-sm font-semibold">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-base font-semibold text-fg">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-surface border-y border-line">
          <div className="max-w-content mx-auto px-4 lg:px-6 py-12">
            <h2 className="text-xl font-semibold text-fg">Chức năng chính</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {features.map((f) => (
                <div key={f.title} className="flex gap-3">
                  <f.icon className="w-4 h-4 mt-1 text-primary shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="text-base font-semibold text-fg">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-content mx-auto px-4 lg:px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-fg">Câu hỏi thường gặp</h2>
            <p className="mt-2 text-sm text-muted">
              Đã có tài khoản doanh nghiệp?{" "}
              <Link href="/login" className="text-primary underline underline-offset-2 hover:text-primary-hover">
                Đăng nhập
              </Link>{" "}
              để vào không gian làm việc.
            </p>
          </div>
          <div className="lg:col-span-2 bg-surface border border-line rounded-md divide-y divide-line">
            {faqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none font-semibold text-fg hover:bg-page [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown
                    className="w-4 h-4 text-muted shrink-0 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-4 pb-4 text-sm text-muted motion-safe:animate-fade-in">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-primary text-white">
          <div className="max-w-content mx-auto px-4 lg:px-6 py-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Bắt đầu thiết lập không gian doanh nghiệp</h2>
              <p className="mt-1 text-sm text-topbar-muted">
                Tạo tài khoản, xác minh email và mời các thành viên trong đơn vị cùng làm việc.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/register">
                <Button variant="inverse">Tạo tài khoản</Button>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center h-control px-4 rounded-md border border-topbar-muted text-sm font-semibold text-white hover:bg-topbar-hover"
              >
                Đăng nhập
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
