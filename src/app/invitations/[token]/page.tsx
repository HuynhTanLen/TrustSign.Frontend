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
      toast(`Đã tham gia doanh nghiệp ${res.tenant.name}`, "success");
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
      <header className="h-14 bg-primary text-white">
        <div className="h-full max-w-content mx-auto px-4 lg:px-6 flex items-center justify-between">
          <Wordmark tone="light" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[460px] motion-safe:animate-fade-up">
          <Card title="Lời mời tham gia doanh nghiệp" icon={Building2} bodyClassName="p-6">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted">
                Xác nhận lời mời để tham gia không gian làm việc của doanh nghiệp trên hệ thống Chữ Tín.
              </p>

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 rounded-md border border-line bg-badge-declined-bg text-sm text-danger flex items-start gap-2.5"
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
                <div className="flex flex-col gap-2 py-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-9 w-full mt-1" />
                </div>
              ) : user ? (
                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-md bg-page border border-line text-sm">
                    <p className="text-muted">Đang đăng nhập bằng tài khoản:</p>
                    <p className="font-semibold text-fg mt-0.5">
                      {user.fullName} ({user.email})
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    isLoading={isAccepting}
                    disabled={isSwitchingAccount}
                    onClick={handleAccept}
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    Chấp nhận lời mời
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    isLoading={isSwitchingAccount}
                    disabled={isAccepting}
                    onClick={handleSwitchAccount}
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Đăng xuất để dùng tài khoản khác
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="p-3 rounded-md bg-page border border-line text-sm text-muted">
                    Vui lòng đăng nhập hoặc đăng ký bằng đúng địa chỉ email đã nhận được lời mời.
                  </p>

                  <Link href={loginHref} className="block">
                    <Button variant="primary" className="w-full">
                      Đăng nhập để chấp nhận
                    </Button>
                  </Link>

                  <Link href={registerHref} className="block">
                    <Button variant="secondary" className="w-full">
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
          <div className="w-full max-w-[460px] bg-surface border border-line rounded-md p-6 flex flex-col gap-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
