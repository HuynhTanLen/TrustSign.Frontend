"use client";

import jsQR from "jsqr";

/** Phải khớp IdentityVerification.MaxFaceDistance phía máy chủ. */
export const MAX_FACE_DISTANCE = 0.6;
const MODEL_URL = "/models/face-api";
const MAX_SIDE = 1920;

type FaceApi = typeof import("@vladmandic/face-api");
let faceApiPromise: Promise<FaceApi> | null = null;

/** Tải model một lần (~12 MB, trình duyệt lưu đệm); ảnh không rời khỏi máy người dùng khi so khớp. */
export function loadFaceModels(): Promise<FaceApi> {
  faceApiPromise ??= (async () => {
    const faceapi = await import("@vladmandic/face-api");
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    return faceapi;
  })().catch((err) => {
    faceApiPromise = null;
    throw err;
  });
  return faceApiPromise;
}

export interface FaceResult {
  count: number;
  /** Vector của khuôn mặt lớn nhất trong ảnh. */
  descriptor: Float32Array | null;
}

export async function detectFaces(canvas: HTMLCanvasElement): Promise<FaceResult> {
  const faceapi = await loadFaceModels();
  const faces = await faceapi
    .detectAllFaces(canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
  if (faces.length === 0) return { count: 0, descriptor: null };
  const largest = faces.reduce((a, b) => (b.detection.box.area > a.detection.box.area ? b : a));
  return { count: faces.length, descriptor: largest.descriptor };
}

export async function faceDistance(a: Float32Array, b: Float32Array): Promise<number> {
  const faceapi = await loadFaceModels();
  return faceapi.euclideanDistance(a, b);
}

export interface CccdInfo {
  raw: string;
  citizenId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  issuedOn?: string;
}

const ddmmyyyy = (s: string) => (/^\d{8}$/.test(s) ? `${s.slice(0, 2)}/${s.slice(2, 4)}/${s.slice(4)}` : null);

/** Mã QR của CCCD gắn chip: Số CCCD|CMND cũ|Họ tên|ddMMyyyy|Giới tính|Địa chỉ|ddMMyyyy. Máy chủ kiểm tra lại. */
export function parseCccdQr(raw: string): CccdInfo | null {
  const p = raw.trim().split("|");
  if (p.length < 6 || !/^\d{12}$/.test(p[0]) || !p[2]?.trim()) return null;
  const dob = ddmmyyyy(p[3]);
  if (!dob) return null;
  return {
    raw: raw.trim(),
    citizenId: p[0],
    fullName: p[2].trim(),
    dateOfBirth: dob,
    gender: p[4].trim(),
    address: p[5].trim(),
    issuedOn: ddmmyyyy(p[6] ?? "") ?? undefined,
  };
}

/** Thử cả ảnh, rồi phóng to góc trên bên phải (vị trí QR trên mặt trước CCCD) vì QR thường nhỏ trong ảnh chụp. */
export function decodeCccdQr(canvas: HTMLCanvasElement): CccdInfo | null {
  const { width: w, height: h } = canvas;
  const regions: [number, number, number, number][] = [
    [0, 0, w, h],
    [w / 2, 0, w / 2, h / 2],
    [w / 3, 0, (w * 2) / 3, (h * 2) / 3],
  ];
  for (const [sx, sy, sw, sh] of regions) {
    const scale = Math.min(2, 1200 / Math.max(sw, sh));
    const c = document.createElement("canvas");
    c.width = Math.round(sw * scale);
    c.height = Math.round(sh * scale);
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, c.width, c.height);
    const code = jsQR(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height, { inversionAttempts: "attemptBoth" });
    const info = code && parseCccdQr(code.data);
    if (info) return info;
  }
  return null;
}

/** Vẽ lại ảnh tối đa 1920px và xuất JPEG: vừa giới hạn 5 MB vừa bỏ EXIF (vị trí GPS) của ảnh điện thoại. */
export function toCanvas(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const c = document.createElement("canvas");
  c.width = Math.round(width * scale);
  c.height = Math.round(height * scale);
  c.getContext("2d")!.drawImage(source, 0, 0, c.width, c.height);
  return c;
}

export function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Không xuất được ảnh."))), "image/jpeg", 0.9),
  );
}

export async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  try {
    return toCanvas(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}
