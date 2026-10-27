"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { authApi, UserDto } from "@/lib/api/auth";
import { tenantsApi } from "@/lib/api/tenants";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Building2, CheckCircle2 } from "lucide-react";

function AcceptInvitationContent() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const token = params.token;

  const [user, setUser] = React.useState<UserDto | null>(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    authApi
      .refresh()
      .then((res) => {
        if (isMounted) setUser(res.user);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setCheckingAuth(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAccept = async () => {
    setIsAccepting(true);
    setErrorMessage(null);
    try {
      const res = await tenantsApi.acceptInvitation(token);
      toast(`Đã tham gia doanh nghiệp ${res.tenant.name}`, "success");
      router.push("/app");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Không thể chấp nhận lời mời lúc này.");
      }
    } finally {
      setIsAccepting(false);
    }
  };

  const currentPath = `/invitations/${encodeURIComponent(token)}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4 text-fg">
      <div className="max-w-md w-full bg-surface border border-line rounded-2xl p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-primary-light border border-indigo-200 text-primary flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">Lời mời tham gia doanh nghiệp</h1>
          <p className="text-sm text-muted mt-1.5">
            Xác nhận tham gia không gian làm việc doanh nghiệp trên hệ thống Chữ Tín.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl border border-danger/30 bg-rose-50 text-sm text-danger text-left">
            {errorMessage}
          </div>
        )}

        {checkingAuth ? (
          <p className="text-sm text-muted py-4">Đang kiểm tra trạng thái đăng nhập…</p>
        ) : user ? (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-line text-sm">
              Đang đăng nhập với tài khoản: <strong>{user.email}</strong>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isAccepting}
              disabled={isAccepting}
              onClick={handleAccept}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Chấp nhận lời mời</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Vui lòng đăng nhập hoặc đăng ký bằng đúng địa chỉ email nhận được lời mời để tiếp tục.
            </p>
            <Link href={`/login?redirect=${encodeURIComponent(currentPath)}`} className="block">
              <Button variant="primary" size="md" className="w-full">
                Đăng nhập để chấp nhận
              </Button>
            </Link>
            <Link href="/register" className="block">
              <Button variant="secondary" size="md" className="w-full">
                Chưa có tài khoản? Đăng ký mới
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">Đang tải lời mời…</div>}>
      <AcceptInvitationContent />
    </Suspense>
  );
}
