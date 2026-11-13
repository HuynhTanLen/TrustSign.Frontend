/**
 * Đăng nhập Google qua Firebase chỉ để lấy ID token gửi cho backend; phiên đăng nhập thật vẫn là JWT của TrustSign,
 * nên đăng xuất Firebase ngay sau khi lấy token. SDK nạp động để không nặng các trang không dùng đến.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const GOOGLE_SIGN_IN_ENABLED = Boolean(config.apiKey && config.authDomain && config.projectId);

/** Người dùng đóng cửa sổ Google: không phải lỗi, chỉ không làm gì. */
export class GoogleSignInCancelled extends Error {}

export async function getGoogleIdToken(): Promise<string> {
  const { initializeApp, getApps } = await import("firebase/app");
  const { getAuth, GoogleAuthProvider, signInWithPopup, signOut } = await import("firebase/auth");

  const app = getApps()[0] ?? initializeApp(config);
  const auth = getAuth(app);
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return await result.user.getIdToken();
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      throw new GoogleSignInCancelled();
    }
    throw err;
  } finally {
    await signOut(auth).catch(() => undefined);
  }
}
