import { detectVariables } from "@/lib/api/templates";

/** Nhãn hiển thị tiếng Việt thân thiện cho các mã biến phổ biến */
export const VARIABLE_LABELS: Record<string, string> = {
  ten_ben_a: "Tên doanh nghiệp (Bên A)",
  mst_ben_a: "Mã số thuế Bên A",
  dai_dien_ben_a: "Người đại diện Bên A",
  ten_ben_b: "Tên đối tác / Khách hàng (Bên B)",
  mst_ben_b: "Mã số thuế Bên B",
  dai_dien_ben_b: "Người đại diện Bên B",
  gia_tri_hop_dong: "Giá trị hợp đồng (VNĐ)",
  ngay_hieu_luc: "Ngày hiệu lực",
  thoi_han_hop_dong: "Thời hạn hợp đồng",
  ho_ten_nhan_vien: "Họ và tên nhân viên",
  cccd_nhan_vien: "Số CCCD nhân viên",
  vi_tri_cong_viec: "Vị trí công việc",
  muc_luong_chinh: "Mức lương chính (VNĐ/tháng)",
  muc_dich_bao_mat: "Mục đích trao đổi thông tin",
  so_hop_dong_goc: "Số hợp đồng gốc",
};

/**
 * Nếu người dùng chỉ bấm các nút biến liên tiếp (VD: "{{ten_ben_a}}{{mst_ben_a}}")
 * mà chưa viết nhãn/xuống dòng, tự động dàn trang thành bố cục hợp đồng chuẩn.
 */
export function normalizeTemplateStructure(rawContent: string, templateTitle?: string): string {
  const trimmed = rawContent.trim();
  if (!trimmed) return "";

  const withoutVars = trimmed.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, "").trim();
  // Nếu văn bản chỉ toàn các biến {{...}} nối liền nhau (ít hơn 15 ký tự chữ thường)
  if (withoutVars.length < 15) {
    const vars = detectVariables(trimmed);
    const lines = vars.map((v) => {
      const label = VARIABLE_LABELS[v] ?? v.replace(/_/g, " ");
      return `- ${label}: {{${v}}}`;
    });
    return [
      "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
      "Độc lập - Tự do - Hạnh phúc",
      "",
      (templateTitle || "HỢP ĐỒNG GIAO DỊCH").toUpperCase(),
      "",
      "Các bên tham gia giao kết hợp đồng với thông tin và điều khoản cụ thể như sau:",
      ...lines,
      "",
      "Hai bên cam kết thực hiện đúng các nội dung đã thỏa thuận nêu trên. Hợp đồng được ký số điện tử và có giá trị pháp lý theo Luật Giao dịch điện tử 2023.",
    ].join("\n");
  }

  return rawContent;
}
