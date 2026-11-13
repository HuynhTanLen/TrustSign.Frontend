/** Phải khớp TrustSign.Common.Validation.PasswordValidator; backend mới là nơi quyết định. */
export const PASSWORD_RULE =
  "Mật khẩu dài 8–64 ký tự, gồm cả chữ và số, không quá phổ biến và không chứa email hay họ tên.";

export const PASSWORD_MAX_LENGTH = 64;

const COMMON = new Set([
  "password1", "password123", "qwerty123", "abc12345", "abcd1234", "a1234567",
  "admin123", "iloveyou1", "matkhau123", "1q2w3e4r", "123456abc", "welcome1",
]);

export function isAcceptablePassword(pwd: string, email = "", fullName = ""): boolean {
  if (pwd.length < 8 || pwd.length > PASSWORD_MAX_LENGTH || !/\p{L}/u.test(pwd) || !/\d/.test(pwd)) return false;
  const lower = pwd.toLowerCase();
  if (COMMON.has(lower)) return false;

  const local = email.split("@")[0].toLowerCase();
  if (local.length >= 3 && lower.includes(local)) return false;

  const name = fullName.replace(/\s/g, "").toLowerCase();
  return name.length < 4 || !lower.replace(/\s/g, "").includes(name);
}
