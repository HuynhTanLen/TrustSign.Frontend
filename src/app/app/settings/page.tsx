"use client";

import * as React from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { authApi, UserDto } from "@/lib/api/auth";
import { tenantsApi, TenantDto } from "@/lib/api/tenants";
import { ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  Briefcase,
  Building2,
  CircleAlert,
  FileText,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

const VN_PHONE_REGEX = /^(0|\+84)\d{9}$/;
const TAX_CODE_REGEX = /^\d{10}(-\d{3})?$/;

function ProfileForm({
  user,
  refreshUser,
}: {
  user: UserDto;
  refreshUser: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [fullName, setFullName] = React.useState(user.fullName || "");
  const [phoneNumber, setPhoneNumber] = React.useState(user.phoneNumber || "");
  const [jobTitle, setJobTitle] = React.useState(user.jobTitle || "");
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    const trimmed = val.trim();
    if (trimmed && !VN_PHONE_REGEX.test(trimmed)) {
      setPhoneError("Số điện thoại không hợp lệ (định dạng 10 số: 0xxxxxxxxx hoặc +84xxxxxxxxx)");
    } else {
      setPhoneError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length > 100) {
      toast("Họ và tên là bắt buộc và tối đa 100 ký tự", "error");
      return;
    }

    const trimmedPhone = phoneNumber.trim();
    if (trimmedPhone && !VN_PHONE_REGEX.test(trimmedPhone)) {
      setPhoneError("Số điện thoại không hợp lệ (ví dụ: 0912345678 hoặc +84912345678)");
      return;
    }

    setIsSaving(true);
    try {
      await authApi.updateProfile({
        fullName: trimmedName,
        phoneNumber: trimmedPhone || undefined,
        jobTitle: jobTitle.trim() || undefined,
      });
      await refreshUser();
      toast("Đã cập nhật hồ sơ cá nhân thành công", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Cập nhật hồ sơ thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      title="Thông tin người dùng"
      description="Thông tin hiển thị khi lập và ký các văn bản hợp đồng."
      icon={User}
      bodyClassName="p-6"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email đăng nhập"
          type="email"
          value={user.email}
          disabled
          leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
          helperText="Email tài khoản không thể tự thay đổi. Dùng để đăng nhập và nhận thông báo ký."
        />

        <Input
          label="Họ và tên"
          required
          maxLength={100}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nguyễn Văn A"
          leftIcon={<User className="w-4 h-4" aria-hidden="true" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Số điện thoại"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="0912345678 hoặc +84912345678"
            leftIcon={<Phone className="w-4 h-4" aria-hidden="true" />}
            error={phoneError || undefined}
            helperText={!phoneError ? "Định dạng số điện thoại Việt Nam (10 số)" : undefined}
          />

          <Input
            label="Chức vụ / Chức danh"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Trưởng phòng Kinh doanh / Chuyên viên"
            leftIcon={<Briefcase className="w-4 h-4" aria-hidden="true" />}
          />
        </div>

        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Lưu hồ sơ cá nhân
          </Button>
        </div>
      </form>
    </Card>
  );
}

function SecurityForm() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Xác nhận mật khẩu mới không trùng khớp.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast("Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được thu hồi.", "success");
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Đổi mật khẩu thất bại.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Card
      title="Đổi mật khẩu"
      description="Đổi mật khẩu đăng nhập định kỳ để đảm bảo an toàn cho tài khoản và chữ ký số."
      icon={Lock}
      bodyClassName="p-6"
    >
      {passwordError && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-lg border border-danger/25 bg-badge-declined-bg text-sm text-danger flex items-start gap-3"
        >
          <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{passwordError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Mật khẩu hiện tại"
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          leftIcon={<KeyRound className="w-4 h-4" aria-hidden="true" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mật khẩu mới"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
            helperText="Tối thiểu 8 ký tự"
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
          />
        </div>

        <div className="p-3.5 rounded-lg bg-page border border-line text-xs text-muted flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span>
            Sau khi đổi mật khẩu thành công, hệ thống sẽ tự động thu hồi tất cả các phiên đăng nhập khác của bạn.
          </span>
        </div>

        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" isLoading={isChangingPassword}>
            Cập nhật mật khẩu
          </Button>
        </div>
      </form>
    </Card>
  );
}

function CompanyForm({
  tenant,
  isOwner,
  onUpdated,
}: {
  tenant: TenantDto;
  isOwner: boolean;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  const [companyName, setCompanyName] = React.useState(tenant.name || "");
  const [taxCode, setTaxCode] = React.useState(tenant.taxCode || "");
  const [taxCodeError, setTaxCodeError] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState(tenant.address || "");
  const [contactEmail, setContactEmail] = React.useState(tenant.contactEmail || "");
  const [companyPhone, setCompanyPhone] = React.useState(tenant.phone || "");
  const [repName, setRepName] = React.useState(tenant.representativeName || "");
  const [repTitle, setRepTitle] = React.useState(tenant.representativeTitle || "");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleTaxCodeChange = (val: string) => {
    setTaxCode(val);
    const trimmed = val.trim();
    if (trimmed && !TAX_CODE_REGEX.test(trimmed)) {
      setTaxCodeError("Mã số thuế không đúng định dạng (10 số hoặc 13 số dạng 1234567890-123)");
    } else {
      setTaxCodeError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = companyName.trim();
    if (!trimmedName || trimmedName.length > 200) {
      toast("Tên doanh nghiệp là bắt buộc và tối đa 200 ký tự", "error");
      return;
    }

    const trimmedTaxCode = taxCode.trim();
    if (trimmedTaxCode && !TAX_CODE_REGEX.test(trimmedTaxCode)) {
      setTaxCodeError("Mã số thuế không đúng định dạng (10 số hoặc 13 số dạng 1234567890-123)");
      return;
    }

    setIsSaving(true);
    try {
      await tenantsApi.updateCurrent({
        name: trimmedName,
        taxCode: trimmedTaxCode || undefined,
        address: address.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        phone: companyPhone.trim() || undefined,
        representativeName: repName.trim() || undefined,
        representativeTitle: repTitle.trim() || undefined,
      });
      onUpdated();
      toast("Đã cập nhật thông tin doanh nghiệp thành công", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Cập nhật thông tin doanh nghiệp thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      title="Thông tin pháp nhân doanh nghiệp"
      description="Thông tin doanh nghiệp sẽ được dùng để tự động điền phần Bên A khi tạo hợp đồng."
      icon={Building2}
      actions={
        <Badge tone={isOwner ? "completed" : "draft"}>
          {isOwner ? "Chủ doanh nghiệp" : "Chế độ chỉ xem"}
        </Badge>
      }
      bodyClassName="p-6"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isOwner && (
          <div className="p-3.5 rounded-lg border border-line bg-page text-sm text-muted flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Chỉ Chủ doanh nghiệp (TenantOwner) mới có quyền chỉnh sửa thông tin pháp nhân. Các thành viên khác chỉ có quyền xem.
            </span>
          </div>
        )}

        <Input
          label="Tên doanh nghiệp / Đơn vị"
          required
          maxLength={200}
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={!isOwner}
          leftIcon={<Building2 className="w-4 h-4" aria-hidden="true" />}
        />

        <Input
          label="Mã số thuế"
          value={taxCode}
          onChange={(e) => handleTaxCodeChange(e.target.value)}
          disabled={!isOwner}
          leftIcon={<FileText className="w-4 h-4" aria-hidden="true" />}
          error={taxCodeError || undefined}
          helperText={!taxCodeError ? "Định dạng 10 số hoặc 13 số (ví dụ: 0101234567 hoặc 0101234567-001)" : undefined}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Người đại diện pháp luật"
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
            disabled={!isOwner}
            placeholder="Nguyễn Văn A"
            leftIcon={<User className="w-4 h-4" aria-hidden="true" />}
          />

          <Input
            label="Chức vụ người đại diện"
            value={repTitle}
            onChange={(e) => setRepTitle(e.target.value)}
            disabled={!isOwner}
            placeholder="Giám đốc / Tổng giám đốc"
            leftIcon={<Briefcase className="w-4 h-4" aria-hidden="true" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Số điện thoại doanh nghiệp"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            disabled={!isOwner}
            placeholder="0241234567 hoặc 0901234567"
            leftIcon={<Phone className="w-4 h-4" aria-hidden="true" />}
          />

          <Input
            label="Email liên hệ doanh nghiệp"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            disabled={!isOwner}
            placeholder="lienhe@doanhnghiep.vn"
            leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
          />
        </div>

        <Input
          label="Địa chỉ trụ sở chính"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={!isOwner}
          placeholder="Tầng 5, Tòa nhà Landmark, Hà Nội"
          leftIcon={<MapPin className="w-4 h-4" aria-hidden="true" />}
        />

        {isOwner && (
          <div className="flex justify-end pt-3">
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Lưu thông tin doanh nghiệp
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}

function CompanyTab({
  isOwner,
  refreshUser,
}: {
  isOwner: boolean;
  refreshUser: () => Promise<void>;
}) {
  const { data: tenant, reload, isLoading } = useApi("tenants:current:settings", tenantsApi.getCurrent);

  const handleUpdated = () => {
    reload();
    void refreshUser();
  };

  if (isLoading || !tenant) {
    return (
      <Card title="Thông tin pháp nhân doanh nghiệp" icon={Building2} bodyClassName="p-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }

  return <CompanyForm key={tenant.id} tenant={tenant} isOwner={isOwner} onUpdated={handleUpdated} />;
}

export default function SettingsPage() {
  const { user, currentRole, refreshUser } = useWorkspace();
  const [activeTab, setActiveTab] = React.useState<string>("profile");
  const isOwner = currentRole === "TenantOwner";

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <PageHeader
        title="Cài đặt tài khoản & Doanh nghiệp"
        description="Quản lý hồ sơ cá nhân, mật khẩu bảo mật và thông tin pháp nhân tổ chức."
      />

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "profile", label: "Hồ sơ cá nhân" },
          { id: "security", label: "Bảo mật & Mật khẩu" },
          { id: "company", label: "Doanh nghiệp" },
        ]}
      />

      {activeTab === "profile" && user && (
        <ProfileForm key={user.id} user={user} refreshUser={refreshUser} />
      )}

      {activeTab === "security" && <SecurityForm />}

      {activeTab === "company" && (
        <CompanyTab isOwner={isOwner} refreshUser={refreshUser} />
      )}
    </div>
  );
}
