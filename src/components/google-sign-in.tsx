"use client";

import * as React from "react";
import { authApi, type UserDto } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { GOOGLE_SIGN_IN_ENABLED, GoogleSignInCancelled, getGoogleIdToken } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { CircleAlert } from "lucide-react";

type Pending = { idToken: string; step: "terms" | "password" };

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.1 5.5c4.3-4 6.8-9.9 6.8-16.8z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.4-4.9 2.3-8.8 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/**
 * Nút "Tiếp tục với Google". Backend trả hai lỗi cần hỏi thêm người dùng:
 * chưa có tài khoản thì cần đồng ý điều khoản; email trùng tài khoản cũ thì cần mật khẩu cũ để liên kết.
 */
export function GoogleSignIn({ onSuccess }: { onSuccess: (user: UserDto) => void }) {
  const [pending, setPending] = React.useState<Pending | null>(null);
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!GOOGLE_SIGN_IN_ENABLED) return null;

  const submit = async (idToken: string, extra: { acceptTerms?: boolean; password?: string } = {}) => {
    setBusy(true);
    setError(null);
    try {
      const res = await authApi.googleLogin({ idToken, ...extra });
      onSuccess(res.user);
    } catch (err) {
      if (err instanceof ApiError && err.code === "Auth.TermsMustBeAccepted" && !extra.acceptTerms) {
        setPending({ idToken, step: "terms" });
      } else if (err instanceof ApiError && err.code === "Auth.GoogleLinkRequiresPassword") {
        setPending({ idToken, step: "password" });
      } else if (err instanceof ApiError) {
        // Sai mật khẩu vẫn ở lại bước nhập mật khẩu; lỗi khác (token hết hạn, tài khoản bị khóa) thì quay lại từ đầu.
        if (err.code !== "Auth.InvalidCredentials") setPending(null);
        setError(err.message);
      } else {
        setPending(null);
        setError("Không kết nối được máy chủ API. Vui lòng kiểm tra backend đang chạy.");
      }
    } finally {
      setBusy(false);
    }
  };

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const idToken = await getGoogleIdToken();
      await submit(idToken);
    } catch (err) {
      if (!(err instanceof GoogleSignInCancelled)) {
        setError("Không đăng nhập được bằng Google. Vui lòng thử lại.");
      }
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div role="alert" className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 flex items-start gap-3">
          <CircleAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {pending?.step === "terms" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 flex flex-col gap-3">
          <p>Email Google này chưa có tài khoản TrustSign. Đồng ý điều khoản để tạo tài khoản mới.</p>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 h-4 w-4" />
            <span>Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo vệ dữ liệu cá nhân (NĐ 13/2023).</span>
          </label>
          <div className="flex gap-2">
            <Button type="button" size="sm" isLoading={busy} disabled={!acceptTerms} onClick={() => submit(pending.idToken, { acceptTerms: true })}>
              Tạo tài khoản
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setPending(null)}>Hủy</Button>
          </div>
        </div>
      )}

      {pending?.step === "password" && (
        <form
          className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(pending.idToken, { password });
          }}
        >
          <p>Email này đã có tài khoản TrustSign. Nhập mật khẩu hiện tại để liên kết với Google.</p>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Mật khẩu TrustSign"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={busy}>Liên kết và đăng nhập</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => { setPending(null); setPassword(""); }}>Hủy</Button>
          </div>
        </form>
      )}

      {!pending && (
        <Button type="button" variant="secondary" size="lg" className="w-full" isLoading={busy} onClick={start}>
          <GoogleMark />
          Tiếp tục với Google
        </Button>
      )}
    </div>
  );
}
