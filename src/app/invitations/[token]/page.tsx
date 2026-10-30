"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { authApi, UserDto } from "@/lib/api/auth";
import { tenantsApi } from "@/lib/api/tenants";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Building2, CheckCircle2, CircleAlert, LogOut } from "lucide-react";

function AcceptInvitationContent() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const token = params.token;

  const [user, setUser] = React.useState<UserDto | null>(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [correlationId, setCorrelationId] = React.useState<string | null>(null);

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
    setCorrelationId(null);
    try {
      const res = await tenantsApi.acceptInvitation(token);
      toast(`Đã gia nhập doanh nghiệp ${res.tenant.name}`, "success");
      router.push("/app");
    } catch (err) {
      if (err instanceof ApiError) {
        setCorrelationId(err.correlationId);
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Không kết nối được máy chủ API để xác nhận lời mời.");
      }
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSwitchAccount = async () => {
    setIsSwitchingAccount(true);
    try {
      await authApi.logout();
      setUser(null);
      setErrorMessage(null);
      setCorrelationId(null);
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const currentPath = `/invitations/${encodeURIComponent(token)}`;
  const loginHref = `/login?redirect=${encodeURIComponent(currentPath)}`;
  const registerHref = `/register?redirect=${encodeURIComponent(currentPath)}`;

  return (
    <div className="min-h-screen flex flex-col bg-page text-fg">
      <header className="h-16 navy-panel text-white border-b border-white/10 shadow-xs">
        <div className="h-full max-w-content mx-auto px-4 lg:px-6 flex items-center justify-between">
          <Wordmark tone="light" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[500px] motion-safe:animate-fade-up">
          <Card
            title="Lời mời tham gia doanh nghiệp"
            icon={Building2}
            bodyClassName="p-6"
          >
            <div className="flex flex-col gap-5">
              <p className="text-sm text-muted leading-relaxed">
                Bạn nhận được lời mời tham gia vào không gian làm việc của doanh nghiệp trên nền tảng Chữ Tín.
              </p>

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg border border-danger/25 bg-badge-declined-bg text-sm text-danger flex items-start gap-3"
                >
                  <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{errorMessage}</p>
                    {correlationId && (
                      <p className="mt-1 font-mono text-xs text-muted">Mã theo dõi: {correlationId}</p>
                    )}
                  </div>
                </div>
              )}

              {checkingAuth ? (
                <div className="flex flex-col gap-3 py-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-11 w-full mt-1" />
                </div>
              ) : user ? (
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-strip border border-line flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-selected text-primary border border-primary/10 flex items-center justify-center font-bold text-sm shrink-0">
                      {user.fullName.trim().slice(0, 1).toUpperCase() || "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted">Đang đăng nhập bằng tài khoản:</p>
                      <p className="font-bold text-fg truncate text-sm mt-0.5">{user.fullName}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isAccepting}
                    disabled={isSwitchingAccount}
                    onClick={handleAccept}
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    Chấp nhận lời mời & Gia nhập
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-muted hover:text-danger hover:bg-badge-declined-bg"
                    isLoading={isSwitchingAccount}
                    disabled={isAccepting}
                    onClick={handleSwitchAccount}
                  >
                    <LogOut className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Đăng xuất để đăng nhập tài khoản khác
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  <div className="p-4 rounded-xl bg-strip border border-line text-xs text-muted leading-relaxed">
                    Vui lòng đăng nhập hoặc đăng ký bằng đúng địa chỉ email đã nhận được thư mời tham gia.
                  </div>

                  <Link href={loginHref} className="block">
                    <Button variant="primary" size="lg" className="w-full">
                      Đăng nhập để chấp nhận lời mời
                    </Button>
                  </Link>

                  <Link href={registerHref} className="block">
                    <Button variant="secondary" size="lg" className="w-full">
                      Đăng ký tài khoản mới
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-page p-4">
          <div className="w-full max-w-[500px] bg-surface border border-line rounded-xl p-6 flex flex-col gap-4 shadow-card">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
