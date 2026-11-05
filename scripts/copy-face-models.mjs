// Chép 3 model nhận diện khuôn mặt cho eKYC từ node_modules sang public/ (không commit ~12 MB nhị phân vào git).
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";

const from = "node_modules/@vladmandic/face-api/model";
const to = "public/models/face-api";
const wanted = ["ssd_mobilenetv1_model", "face_landmark_68_model", "face_recognition_model"];

mkdirSync(to, { recursive: true });
for (const file of readdirSync(from)) {
  if (wanted.some((name) => file.startsWith(`${name}.`) || file.startsWith(`${name}-`))) {
    copyFileSync(`${from}/${file}`, `${to}/${file}`);
  }
}
