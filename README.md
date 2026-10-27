# Chữ Tín – Web

Giao diện của hệ thống ký kết hợp đồng điện tử Chữ Tín (TrustSign): Next.js (App Router), TypeScript, Tailwind CSS.

Đây là bộ khung: trang chủ chỉ báo frontend đã gọi được backend hay chưa.

## Cấu trúc

```
src/
  app/           Trang và layout (App Router)
  components/    Component dùng lại
  lib/api.ts     apiFetch: mọi request gọi tới backend, access token chỉ giữ trong bộ nhớ
```

## Chạy trên máy

Cần Node.js 22 trở lên. Backend `TrustSign.Api` nên chạy sẵn ở http://localhost:5050.

```bash
npm install
```

```bash
npm run dev
```

Mở http://localhost:3000.

## Cấu hình

| Biến | Ý nghĩa |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Địa chỉ backend, mặc định `http://localhost:5050`. Đổi bằng cách sao chép `.env.example` thành `.env.local` |

Origin của frontend phải nằm trong `Cors:AllowedOrigins` của backend.

`AGENTS.md` do Next.js sinh ra và tự tạo lại mỗi lần `next dev`, nên file này được commit cùng mã nguồn.
