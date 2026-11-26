import { detectVariables } from "@/lib/api/templates";

export type FieldSection = "partyA" | "partyB" | "transaction";

export interface TemplateFieldItem {
  key: string;
  label: string;
  section: FieldSection;
}

export interface TemplateClauseItem {
  title: string;
  body: string;
}

export interface ContractBlueprint {
  id: string;
  name: string;
  category: string;
  summary: string;
  /** Các dòng "Căn cứ ..." đặt trước phần thông tin các bên */
  legalBasis: string[];
  partyATitle: string;
  partyBTitle: string;
  fields: TemplateFieldItem[];
  clauses: TemplateClauseItem[];
}

/** Từ điển nhãn hiển thị tiếng Việt chuẩn cho mọi trường thông tin */
export const VARIABLE_LABELS: Record<string, string> = {
  // Bên A
  ten_ben_a: "Tên doanh nghiệp / Đơn vị (Bên A)",
  mst_ben_a: "Mã số thuế Bên A",
  cccd_ben_a: "Số CCCD Bên A",
  dai_dien_ben_a: "Người đại diện theo pháp luật Bên A",
  chuc_vu_ben_a: "Chức vụ người đại diện Bên A",
  dia_chi_ben_a: "Địa chỉ trụ sở Bên A",
  sdt_ben_a: "Số điện thoại Bên A",
  stk_ben_a: "Số tài khoản Bên A",
  ngan_hang_ben_a: "Ngân hàng Bên A",

  // Bên B
  ten_ben_b: "Tên đối tác / Khách hàng (Bên B)",
  mst_ben_b: "Mã số thuế Bên B",
  cccd_ben_b: "Số CCCD Bên B",
  dai_dien_ben_b: "Người đại diện Bên B",
  chuc_vu_ben_b: "Chức vụ người đại diện Bên B",
  dia_chi_ben_b: "Địa chỉ Bên B",
  sdt_ben_b: "Số điện thoại Bên B",
  ho_ten_nhan_vien: "Họ và tên người lao động",
  sinh_ngay_nhan_vien: "Ngày, tháng, năm sinh",
  gioi_tinh_nhan_vien: "Giới tính",
  cccd_nhan_vien: "Số CCCD / Định danh cá nhân (ngày cấp, nơi cấp)",
  dia_chi_nhan_vien: "Nơi cư trú",
  mst_nhan_vien: "Mã số thuế cá nhân",
  stk_nhan_vien: "Số tài khoản nhận thanh toán",
  ngan_hang_nhan_vien: "Ngân hàng nhận thanh toán",

  // Nội dung giao dịch
  ngay_hieu_luc: "Ngày bắt đầu hiệu lực",
  thoi_han_hop_dong: "Thời hạn thực hiện hợp đồng",
  gia_tri_hop_dong: "Tổng giá trị hợp đồng (VNĐ)",
  phuong_thuc_thanh_toan: "Phương thức & tiến độ thanh toán",
  muc_phat_vi_pham: "Mức phạt vi phạm",
  noi_dung_dich_vu: "Nội dung công việc / Dịch vụ cung cấp",
  ten_hang_hoa_tai_san: "Tên hàng hóa / Tài sản mua bán",
  so_luong_hang_hoa: "Số lượng, đơn vị tính",
  thong_so_ky_thuat: "Quy cách, chất lượng, thông số kỹ thuật",
  dia_diem_ban_giao: "Địa điểm giao nhận",
  thoi_gian_bao_hanh: "Thời hạn bảo hành",
  vi_tri_cong_viec: "Công việc phải làm / Chức danh chuyên môn",
  dia_diem_lam_viec: "Địa điểm làm việc",
  muc_luong_chinh: "Mức lương theo công việc, chức danh (VNĐ/tháng)",
  phu_cap_luong: "Phụ cấp lương (VNĐ/tháng)",
  cac_khoan_bo_sung: "Các khoản bổ sung khác",
  hinh_thuc_tra_luong: "Hình thức trả lương",
  ky_han_tra_luong: "Kỳ hạn trả lương",
  thoi_gio_lam_viec: "Thời giờ làm việc",
  dia_chi_mat_bang: "Địa chỉ mặt bằng / Văn phòng cho thuê",
  dien_tich_thue: "Diện tích thuê (m2)",
  muc_dich_thue: "Mục đích sử dụng",
  gia_thue_hang_thang: "Giá thuê hàng tháng (VNĐ/tháng)",
  tien_dat_coc: "Số tiền đặt cọc (VNĐ)",
  tong_tien_thue: "Tổng tiền thuê cả thời hạn",
  muc_dich_bao_mat: "Mục đích trao đổi thông tin bảo mật",
  so_hop_dong_goc: "Số và ngày ký hợp đồng gốc",
  ket_qua_nghiem_thu: "Kết quả đánh giá nghiệm thu",
  gia_tri_da_thanh_toan: "Số tiền đã thanh toán (VNĐ)",
  gia_tri_con_lai: "Số tiền còn phải thanh toán (VNĐ)",

  // Xây dựng
  stk_ben_b: "Số tài khoản Bên B",
  ngan_hang_ben_b: "Ngân hàng Bên B",
  ten_cong_trinh: "Tên công trình / Hạng mục",
  dia_diem_xay_dung: "Địa điểm xây dựng",
  quy_mo_cong_trinh: "Quy mô công trình",
  so_giay_phep_xay_dung: "Số giấy phép xây dựng",
  pham_vi_cong_viec: "Phạm vi, khối lượng công việc",
  loai_gia_hop_dong: "Loại giá hợp đồng",
  ty_le_tam_ung: "Tỷ lệ tạm ứng (%)",
  cac_dot_thanh_toan: "Các đợt thanh toán (thời điểm, tỷ lệ)",
  ty_le_giu_lai_bao_hanh: "Tỷ lệ giữ lại bảo hành (%)",
  bao_hanh_cong_trinh: "Thời gian bảo hành công trình",
  ho_so_ban_giao: "Hồ sơ bàn giao",
  nhan_su_giam_sat: "Nhân sự giám sát",
  ly_do_dieu_chinh: "Lý do điều chỉnh",
  noi_dung_dieu_chinh: "Nội dung, khối lượng điều chỉnh",
  gia_tri_truoc_dieu_chinh: "Giá trị hợp đồng trước điều chỉnh (VNĐ)",
  gia_tri_phat_sinh: "Giá trị tăng hoặc giảm (VNĐ)",
  gia_tri_sau_dieu_chinh: "Giá trị hợp đồng sau điều chỉnh (VNĐ)",
  lich_thi_cong_dieu_chinh: "Tiến độ sau điều chỉnh",
  dot_thanh_toan: "Đợt nghiệm thu, thanh toán số",
  khoi_luong_nghiem_thu: "Hạng mục, khối lượng nghiệm thu",
  gia_tri_nghiem_thu: "Giá trị nghiệm thu đợt này (VNĐ)",
  gia_tri_khau_tru_tam_ung: "Khấu trừ tạm ứng đợt này (VNĐ)",
  gia_tri_giu_lai: "Số tiền giữ lại bảo hành (VNĐ)",
  gia_tri_de_nghi_thanh_toan: "Số tiền đề nghị thanh toán (VNĐ)",
  email_ben_a: "Email Bên A",
  email_ben_b: "Email Bên B",
  dia_diem_giao_ket: "Địa điểm giao kết hợp đồng",
  bao_dam_thuc_hien: "Bảo đảm thực hiện hợp đồng, bảo lãnh tạm ứng",
  so_ngay_thanh_toan: "Số ngày thanh toán sau khi nhận hồ sơ hợp lệ",
  nha_thau_phu: "Nhà thầu phụ",
  muc_thuong: "Thưởng hoàn thành sớm",
  giai_quyet_tranh_chap: "Nơi giải quyết tranh chấp",
};

/** Chuyển nhãn tiếng Việt bất kỳ (VD: "Biển số xe") sang mã biến chuẩn "bien_so_xe" */
export function slugifyVariableName(input: string): string {
  return input
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** Đăng ký nhãn hiển thị cho biến động do người dùng tự thêm */
export function registerVariableLabel(key: string, label: string): void {
  VARIABLE_LABELS[key] = label;
}

// ---- Căn cứ pháp lý dùng chung ----
// Lưu ý khi đặt mã trường: mã chứa "ben_a" -> Mục I, "ben_b"/"nhan_vien"/"doi_tac" -> Mục II (xem parseTemplateIntoBlueprint);
// "ngay_" -> ô chọn ngày mặc định hôm nay; "thoi_han" -> thời hạn; "tien_"/"gia_tri"/nhãn chứa "VNĐ" -> định dạng tiền.
const BLDS = "Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015";
const LTM = "Luật Thương mại số 36/2005/QH11 ngày 14/6/2005";
const LGDDT = "Luật Giao dịch điện tử số 20/2023/QH15";
const NHU_CAU = "nhu cầu và khả năng thực tế của các bên";
const LXD = "Luật Xây dựng số 135/2025/QH15 ngày 10/12/2025";
const ND_CHAT_LUONG =
  "Nghị định số 207/2026/NĐ-CP ngày 15/6/2026 của Chính phủ về quản lý chất lượng, thi công xây dựng và bảo trì công trình xây dựng";
const ND_HOAT_DONG = "Nghị định số 217/2026/NĐ-CP ngày 19/6/2026 của Chính phủ về quản lý hoạt động xây dựng";
const ND_CHI_PHI = "Nghị định số 206/2026/NĐ-CP ngày 15/6/2026 của Chính phủ về quản lý chi phí đầu tư xây dựng";
const ND_HDXD =
  "Nghị định số 210/2026/NĐ-CP ngày 15/6/2026 của Chính phủ quy định chi tiết một số điều của Luật Xây dựng về hợp đồng xây dựng";

/** Đánh số "ĐIỀU n." tự động; mỗi phần tử của body là một đoạn (dòng) riêng, không chứa {{biến}}. */
function numbered(specs: [string, string[]][]): TemplateClauseItem[] {
  return specs.map(([title, body], i) => ({ title: `ĐIỀU ${i + 1}. ${title}`, body: body.join("\n") }));
}

const ESIGN: [string, string[]] = [
  "GIAO KẾT ĐIỆN TỬ VÀ HIỆU LỰC",
  [
    "Các bên giao kết văn bản này dưới dạng thông điệp dữ liệu theo Luật Giao dịch điện tử 2023; theo Điều 8 Luật này, thông tin trong thông điệp dữ liệu không bị phủ nhận giá trị pháp lý chỉ vì được thể hiện dưới dạng thông điệp dữ liệu.",
    "Mỗi bên ký bằng chữ ký điện tử trên nền tảng TrustSign; nhật ký xác thực (email người ký, mã OTP, thời điểm ký) được lưu trữ làm căn cứ chứng minh việc giao kết.",
    "Văn bản có hiệu lực kể từ thời điểm bên cuối cùng hoàn tất ký, trừ trường hợp các bên thỏa thuận ngày hiệu lực khác tại Mục III.",
  ],
];

const FORCE_MAJEURE: [string, string[]] = [
  "SỰ KIỆN BẤT KHẢ KHÁNG",
  [
    "Sự kiện bất khả kháng là sự kiện xảy ra một cách khách quan, không thể lường trước được và không thể khắc phục được mặc dù đã áp dụng mọi biện pháp cần thiết và khả năng cho phép (khoản 1 Điều 156 Bộ luật Dân sự 2015).",
    "Bên gặp sự kiện bất khả kháng phải thông báo cho bên kia trong vòng 07 ngày kể từ khi sự kiện xảy ra và được miễn trách nhiệm đối với phần nghĩa vụ bị ảnh hưởng trong thời gian sự kiện diễn ra.",
  ],
];

const DISPUTE: [string, string[]] = [
  "GIẢI QUYẾT TRANH CHẤP",
  [
    "Tranh chấp phát sinh được giải quyết trước hết bằng thương lượng, hòa giải giữa các bên.",
    "Sau 30 ngày kể từ ngày một bên yêu cầu mà không thương lượng được, mỗi bên có quyền khởi kiện tại Tòa án nhân dân có thẩm quyền, hoặc đưa ra Trọng tài thương mại nếu các bên có thỏa thuận trọng tài bằng văn bản theo Luật Trọng tài thương mại 2010.",
  ],
];

const PENALTY_COMMERCIAL: [string, string[]] = [
  "PHẠT VI PHẠM VÀ BỒI THƯỜNG THIỆT HẠI",
  [
    "Bên vi phạm nghĩa vụ phải chịu phạt theo mức nêu tại Mục III; đối với quan hệ thương mại, mức phạt không vượt quá 8% giá trị phần nghĩa vụ bị vi phạm (Điều 301 Luật Thương mại 2005).",
    "Ngoài tiền phạt, bên vi phạm phải bồi thường thiệt hại thực tế phát sinh do hành vi vi phạm gây ra (Điều 302 Luật Thương mại 2005, Điều 360 Bộ luật Dân sự 2015).",
    "Bên chậm thanh toán phải trả lãi trên số tiền chậm trả tương ứng với thời gian chậm trả (Điều 306 Luật Thương mại 2005).",
  ],
];

// ---- Điều khoản dùng chung cho hợp đồng xây dựng ----
const PRIVATE_CAPITAL =
  "Hợp đồng áp dụng cho công trình sử dụng vốn của tổ chức, cá nhân; không dùng cho dự án đầu tư công hoặc dự án theo phương thức đối tác công tư.";

const SITE_SAFETY: [string, string[]] = [
  "AN TOÀN LAO ĐỘNG, PHÒNG CHÁY VÀ VỆ SINH MÔI TRƯỜNG",
  [
    "Bên thi công chịu trách nhiệm bảo đảm an toàn lao động, phòng cháy chữa cháy, an ninh công trường và vệ sinh môi trường trong suốt thời gian thi công.",
    "Người lao động trên công trường phải được huấn luyện an toàn, trang bị phương tiện bảo hộ và được tham gia bảo hiểm theo quy định pháp luật.",
    "Bên thi công bồi thường thiệt hại về người, tài sản và công trình lân cận do lỗi của mình gây ra.",
  ],
];

const VARIATION: [string, string[]] = [
  "THAY ĐỔI, PHÁT SINH VÀ SỬA ĐỔI HỢP ĐỒNG",
  [
    "Công việc phát sinh ngoài phạm vi đã thỏa thuận chỉ được thực hiện và thanh toán khi hai bên thống nhất khối lượng, đơn giá, thời hạn bằng phụ lục hợp đồng trước khi thực hiện.",
    "Mọi sửa đổi hợp đồng phải được lập thành văn bản theo Điều 84 Luật Xây dựng 2025; phụ lục đã ký là bộ phận không tách rời của hợp đồng.",
  ],
];

const SUSPENSION: [string, string[]] = [
  "TẠM DỪNG VÀ CHẤM DỨT HỢP ĐỒNG",
  [
    "Việc tạm dừng, chấm dứt hợp đồng thực hiện theo thỏa thuận tại hợp đồng này và Điều 85 Luật Xây dựng 2025; bên đề nghị phải thông báo bằng văn bản cho bên kia trước ít nhất 15 ngày.",
    "Bên giao việc được tạm dừng hoặc chấm dứt khi bên nhận việc không bảo đảm chất lượng, an toàn hoặc chậm tiến độ nghiêm trọng và không khắc phục sau khi được yêu cầu.",
    "Bên nhận việc được tạm dừng hoặc chấm dứt khi bên giao việc không thanh toán đúng thỏa thuận hoặc không bảo đảm điều kiện để thực hiện công việc.",
    "Khi chấm dứt, hai bên nghiệm thu và thanh toán phần công việc đã hoàn thành đạt yêu cầu; bên có lỗi chịu phạt và bồi thường theo hợp đồng.",
  ],
];

const PENALTY_AGREED: [string, string[]] = [
  "PHẠT VI PHẠM VÀ BỒI THƯỜNG THIỆT HẠI",
  [
    "Bên vi phạm chịu phạt theo mức hai bên thỏa thuận tại Mục III (Điều 418 Bộ luật Dân sự 2015, Điều 86 Luật Xây dựng 2025).",
    "Ngoài tiền phạt, bên vi phạm phải bồi thường thiệt hại thực tế do hành vi vi phạm gây ra (Điều 360 Bộ luật Dân sự 2015).",
    "Bên chậm thanh toán phải trả lãi trên số tiền chậm trả theo Điều 357 Bộ luật Dân sự 2015.",
  ],
];

// ---- Trường dùng chung ----
const partyA = (...fields: [string, string][]): TemplateFieldItem[] =>
  fields.map(([key, label]) => ({ key, label, section: "partyA" }));
const partyB = (...fields: [string, string][]): TemplateFieldItem[] =>
  fields.map(([key, label]) => ({ key, label, section: "partyB" }));
const deal = (...fields: [string, string][]): TemplateFieldItem[] =>
  fields.map(([key, label]) => ({ key, label, section: "transaction" }));

const COMPANY_A = partyA(
  ["ten_ben_a", "Tên doanh nghiệp (Bên A)"],
  ["mst_ben_a", "Mã số thuế Bên A"],
  ["dia_chi_ben_a", "Địa chỉ trụ sở Bên A"],
  ["dai_dien_ben_a", "Người đại diện Bên A"],
  ["chuc_vu_ben_a", "Chức vụ người đại diện Bên A"],
);
const COMPANY_B = partyB(
  ["ten_ben_b", "Tên doanh nghiệp (Bên B)"],
  ["mst_ben_b", "Mã số thuế Bên B"],
  ["dia_chi_ben_b", "Địa chỉ trụ sở Bên B"],
  ["dai_dien_ben_b", "Người đại diện Bên B"],
  ["chuc_vu_ben_b", "Chức vụ người đại diện Bên B"],
);
const BANK_A = partyA(["stk_ben_a", "Số tài khoản Bên A"], ["ngan_hang_ben_a", "Ngân hàng Bên A"]);
const BANK_B = partyB(["stk_ben_b", "Số tài khoản Bên B"], ["ngan_hang_ben_b", "Ngân hàng Bên B"]);

const WORKS = deal(
  ["ten_cong_trinh", "Tên công trình / Hạng mục"],
  ["dia_diem_xay_dung", "Địa điểm xây dựng"],
  ["pham_vi_cong_viec", "Phạm vi, khối lượng công việc"],
  ["loai_gia_hop_dong", "Loại giá hợp đồng"],
  ["gia_tri_hop_dong", "Giá trị hợp đồng (VNĐ, đã gồm VAT)"],
  ["ty_le_tam_ung", "Tỷ lệ tạm ứng (%)"],
  ["cac_dot_thanh_toan", "Các đợt thanh toán (thời điểm, tỷ lệ)"],
  ["ty_le_giu_lai_bao_hanh", "Tỷ lệ giữ lại bảo hành (%)"],
  ["ngay_hieu_luc", "Ngày khởi công"],
  ["thoi_han_hop_dong", "Thời hạn thi công"],
  ["bao_hanh_cong_trinh", "Thời gian bảo hành (tính từ ngày nghiệm thu bàn giao)"],
  ["muc_phat_vi_pham", "Mức phạt vi phạm (tỷ lệ %, tối đa 8%)"],
);

/**
 * Mẫu hợp đồng ngành xây dựng (vốn tư nhân) theo Luật Xây dựng 135/2025/QH15 và NĐ 210/2026/NĐ-CP (hiệu lực 01/7/2026).
 * Bên A luôn là bên soạn hợp đồng trên hệ thống: được tự điền thông tin doanh nghiệp và ký trước ở cột trái.
 * KHÔNG đưa vào: dự án đầu tư công / PPP (nhiều quy định bắt buộc riêng) và giao khoán cho tổ đội thợ
 * (dễ bị xem là hợp đồng lao động, NĐ 337/2025 buộc ký qua nhà cung cấp eContract được cấp phép).
 */
export const REFERENCE_TEMPLATES: ContractBlueprint[] = [
  {
    id: "xd-thi-cong",
    name: "Hợp đồng thi công xây dựng công trình",
    category: "Thi công xây dựng",
    summary: "27 điều theo khung Phụ lục VI Quyết định 1040/QĐ-BXD: chủ đầu tư (Bên A) giao nhà thầu thi công. Công trình vốn tư nhân.",
    legalBasis: [BLDS, LXD, ND_HDXD, ND_CHAT_LUONG, ND_HOAT_DONG, ND_CHI_PHI, LTM, LGDDT, NHU_CAU],
    partyATitle: "BÊN GIAO THẦU - CHỦ ĐẦU TƯ (BÊN A)",
    partyBTitle: "BÊN NHẬN THẦU THI CÔNG (BÊN B)",
    fields: [
      ...COMPANY_A,
      ...partyA(["sdt_ben_a", "Số điện thoại Bên A"], ["email_ben_a", "Email Bên A"]),
      ...BANK_A,
      ...COMPANY_B,
      ...partyB(["sdt_ben_b", "Số điện thoại Bên B"], ["email_ben_b", "Email Bên B"]),
      ...BANK_B,
      ...deal(
        ["ten_cong_trinh", "Tên gói thầu, công trình, dự án (nếu có)"],
        ["dia_diem_xay_dung", "Địa điểm xây dựng"],
        ["dia_diem_giao_ket", "Địa điểm giao kết hợp đồng"],
        ["pham_vi_cong_viec", "Phạm vi, khối lượng công việc"],
        ["loai_gia_hop_dong", "Loại giá hợp đồng"],
        ["gia_tri_hop_dong", "Giá trị hợp đồng (VNĐ, đã gồm thuế, phí)"],
        ["bao_dam_thuc_hien", "Bảo đảm thực hiện hợp đồng, bảo lãnh tạm ứng (tỷ lệ, hình thức, hạn nộp; ghi \"Không áp dụng\" nếu không có)"],
        ["ty_le_tam_ung", "Tỷ lệ tạm ứng (%)"],
        ["cac_dot_thanh_toan", "Các đợt thanh toán (thời điểm, tỷ lệ)"],
        ["so_ngay_thanh_toan", "Số ngày thanh toán sau khi nhận hồ sơ hợp lệ"],
        ["ty_le_giu_lai_bao_hanh", "Tỷ lệ giữ lại bảo hành (%)"],
        ["ngay_hieu_luc", "Ngày khởi công"],
        ["thoi_han_hop_dong", "Thời hạn thi công"],
        ["bao_hanh_cong_trinh", "Thời gian bảo hành (tính từ ngày chủ đầu tư nghiệm thu)"],
        ["nha_thau_phu", "Nhà thầu phụ và tỷ lệ công việc giao thầu phụ (ghi \"Không có\" nếu không dùng)"],
        ["muc_thuong", "Thưởng hoàn thành sớm (ghi \"Không áp dụng\" nếu không có)"],
        ["muc_phat_vi_pham", "Mức phạt chậm tiến độ và vi phạm (tỷ lệ %, tối đa 8%)"],
        ["giai_quyet_tranh_chap", "Nơi giải quyết tranh chấp (Tòa án hoặc trung tâm trọng tài cụ thể)"],
      ),
    ],
    clauses: numbered([
      ["GIẢI THÍCH TỪ NGỮ", [
        "Bên giao thầu là Bên A, Bên nhận thầu là Bên B; công trình, địa điểm và phạm vi công việc theo Mục III.",
        "Công trường là mặt bằng Bên A bàn giao để thi công cùng các vị trí khác được hai bên xác định.",
        "Ngày là ngày dương lịch; ngày làm việc không gồm thứ Bảy, Chủ nhật, ngày lễ, tết.",
        PRIVATE_CAPITAL,
      ]],
      ["HỒ SƠ HỢP ĐỒNG VÀ THỨ TỰ ƯU TIÊN", [
        "Hồ sơ hợp đồng gồm hợp đồng này, phụ lục và các tài liệu kèm theo; các tài liệu bổ sung và giải thích cho nhau.",
        "Khi có mâu thuẫn, trừ thỏa thuận khác, thứ tự ưu tiên là: thông báo chấp thuận chọn thầu; đơn dự thầu hoặc báo giá; thông tin tại Mục III; các điều khoản của hợp đồng này; hồ sơ mời thầu hoặc yêu cầu của Bên A; bản vẽ và chỉ dẫn kỹ thuật; hồ sơ dự thầu hoặc đề xuất của Bên B; biên bản đàm phán; tài liệu khác.",
        "Phụ lục sửa đổi ký sau được áp dụng đối với nội dung đã sửa đổi.",
      ]],
      ["LUẬT VÀ NGÔN NGỮ", [
        "Hợp đồng chịu sự điều chỉnh của pháp luật Việt Nam; ngôn ngữ sử dụng là tiếng Việt.",
      ]],
      ["THÔNG BÁO", [
        "Mọi đề nghị, yêu cầu, chấp thuận trong quá trình thực hiện phải bằng văn bản giấy hoặc thông điệp dữ liệu, nêu căn cứ và thời hạn trả lời.",
        "Mỗi bên cử người đại diện quản lý hợp đồng và thông báo phạm vi quyền hạn cho bên kia.",
        "Thông báo có hiệu lực từ khi bên nhận nhận được tại địa chỉ hoặc email nêu tại Mục I, Mục II.",
      ]],
      ["BẢO ĐẢM THỰC HIỆN VÀ BẢO LÃNH TẠM ỨNG", [
        "Bảo đảm thực hiện hợp đồng và bảo lãnh tạm ứng được áp dụng theo thỏa thuận tại Mục III.",
        "Bảo đảm thực hiện có hiệu lực đến khi công trình được nghiệm thu và chuyển sang bảo hành; Bên A hoàn trả khi Bên B hoàn thành nghĩa vụ.",
        "Bên B không được nhận lại bảo đảm nếu từ chối thực hiện hợp đồng đã có hiệu lực, hoặc chậm tiến độ do lỗi của mình mà từ chối gia hạn bảo đảm.",
        "Bảo lãnh tạm ứng (nếu có) do tổ chức tín dụng hợp pháp phát hành, nộp trước khi tạm ứng, giá trị giảm dần theo số tạm ứng đã thu hồi; tiền tạm ứng không tính lãi.",
      ]],
      ["NỘI DUNG VÀ KHỐI LƯỢNG CÔNG VIỆC", [
        "Bên B thi công theo phạm vi tại Mục III, bản vẽ thiết kế được duyệt (kể cả sửa đổi được chấp thuận), chỉ dẫn kỹ thuật và biên bản đàm phán.",
        "Công việc gồm: nhận và quản lý mặt bằng, mốc giới; cung cấp vật liệu, nhân lực, máy móc (trừ phần Bên A cấp); thi công, lắp đặt; thí nghiệm, chạy thử; phối hợp nghiệm thu; khắc phục sai sót; bảo đảm an toàn, môi trường; thu dọn công trường và bàn giao.",
      ]],
      ["CHẤT LƯỢNG, NGHIỆM THU VÀ BÀN GIAO", [
        "Chất lượng, nghiệm thu và bàn giao thực hiện theo Điều 9 Nghị định 210/2026/NĐ-CP và Nghị định 207/2026/NĐ-CP; công trình đúng thiết kế, quy chuẩn, tiêu chuẩn áp dụng.",
        "Vật liệu, thiết bị phải đúng nguồn gốc đã thỏa thuận và được nghiệm thu trước khi sử dụng; thí nghiệm do phòng thí nghiệm đủ điều kiện thực hiện.",
        "Bên A được vào công trường để kiểm tra. Bên B báo trước khi che khuất công việc; việc Bên A không tham gia kiểm tra không miễn trách nhiệm của Bên B.",
        "Nghiệm thu từng công việc, giai đoạn, hạng mục bằng biên bản; biên bản nghiệm thu hoàn thành công trình ghi rõ thời điểm bắt đầu tính bảo hành và thời gian bảo hành.",
        "Sai sót phải được sửa chữa, nếu không sửa được thì thay thế; bên gây sai sót chịu chi phí khắc phục, thí nghiệm, kiểm định và hậu quả về tiến độ.",
        "Nếu Bên B không khắc phục đúng hạn Bên A ấn định, Bên A được tự làm hoặc thuê đơn vị khác bằng chi phí của Bên B.",
      ]],
      ["THỜI GIAN VÀ TIẾN ĐỘ", [
        "Ngày khởi công và thời hạn thi công theo Mục III; Bên B lập tiến độ chi tiết trình Bên A chấp thuận trước khi khởi công và cập nhật khi tiến độ không còn phù hợp.",
        "Bên B được gia hạn khi Bên A chậm bàn giao mặt bằng, chậm thanh toán, thay đổi phạm vi hoặc thiết kế, hoặc khi có bất khả kháng, hoàn cảnh thay đổi cơ bản.",
        "Bên B chậm tiến độ do lỗi của mình phải lập tiến độ khắc phục theo yêu cầu của Bên A; việc đẩy sớm tiến độ do hai bên thỏa thuận cả chi phí.",
      ]],
      ["GIÁ HỢP ĐỒNG, TẠM ỨNG VÀ THANH TOÁN", [
        "Loại giá và giá trị hợp đồng theo Mục III, gồm chi phí thực hiện công việc và thuế, phí theo quy định; chỉ được điều chỉnh theo thỏa thuận tại hợp đồng này.",
        "Tạm ứng theo tỷ lệ tại Mục III, chỉ dùng cho việc thực hiện hợp đồng; thu hồi dần qua các đợt thanh toán và thu hồi hết khi giá trị thanh toán đạt 80% giá hợp đồng.",
        "Thanh toán theo các đợt tại Mục III. Hợp đồng theo đơn giá thanh toán theo khối lượng thực tế được nghiệm thu nhân đơn giá; hợp đồng trọn gói thanh toán theo tiến độ công việc hoàn thành.",
        "Hồ sơ thanh toán gồm biên bản nghiệm thu khối lượng, bảng giá trị kể cả phát sinh và đề nghị thanh toán ghi rõ khoản khấu trừ tạm ứng, giữ lại, số còn phải trả.",
        "Bên A thanh toán bằng đồng Việt Nam, chuyển khoản, trong số ngày tại Mục III; chậm trả phải chịu lãi theo thỏa thuận, nếu không thỏa thuận thì theo lãi suất quá hạn của ngân hàng Bên B mở tài khoản (khoản 5 Điều 28 Nghị định 210/2026/NĐ-CP).",
        "Khoản giữ lại theo tỷ lệ tại Mục III được trả khi Bên B hoàn thành nghĩa vụ bảo hành.",
      ]],
      ["SỬA ĐỔI HỢP ĐỒNG", [
        "Việc thay đổi khối lượng, tiến độ, đơn giá, giá hợp đồng phải phù hợp loại giá hợp đồng và được lập thành phụ lục trước khi thực hiện (Điều 84 Luật Xây dựng 2025).",
        "Giá hợp đồng được điều chỉnh khi xảy ra sự kiện bồi thường nêu tại hợp đồng này.",
      ]],
      ["QUYỀN VÀ NGHĨA VỤ CỦA BÊN A", [
        "Quyền: kiểm tra chất lượng, tiến độ, an toàn; yêu cầu thay người không đủ năng lực; yêu cầu tạm dừng khi vi phạm; từ chối nghiệm thu công việc không đạt; yêu cầu phạt và bồi thường.",
        "Nghĩa vụ: xin giấy phép xây dựng (nếu thuộc diện phải cấp phép); bàn giao mặt bằng, mốc giới, hồ sơ thiết kế đúng hạn; trả lời đề nghị của Bên B; bố trí vốn và thanh toán đúng hạn; tổ chức nghiệm thu; giữ bí mật thông tin; bồi thường thiệt hại do lỗi của mình.",
      ]],
      ["QUYỀN VÀ NGHĨA VỤ CỦA BÊN B", [
        "Quyền: đề xuất khối lượng phát sinh, thay đổi biện pháp thi công; từ chối thực hiện khi Bên A chưa đáp ứng điều kiện; yêu cầu nghiệm thu, thanh toán, trả lãi chậm trả và bồi thường.",
        "Nghĩa vụ: bố trí nhân lực, thiết bị đủ năng lực như đã cam kết; lập biện pháp thi công, nhật ký, hồ sơ hoàn công và hồ sơ thanh toán; định vị công trình đúng mốc; thi công đúng thiết kế, tiến độ, an toàn.",
        "Bên B đã khảo sát công trường trước khi chào giá; gặp điều kiện bất lợi không lường trước, di vật, cổ vật phải báo ngay cho Bên A.",
        "Bên B tự chịu chi phí đường tạm, vận chuyển, sửa hư hỏng do mình gây ra và dọn công trường sau nghiệm thu.",
      ]],
      ["TƯ VẤN QUẢN LÝ DỰ ÁN (NẾU CÓ)", [
        "Bên A thông báo cho Bên B tên và phạm vi ủy quyền của đơn vị tư vấn; đơn vị này không được sửa đổi hợp đồng.",
        "Chỉ dẫn của tư vấn lập bằng văn bản; chấp thuận hoặc kiểm tra của tư vấn không miễn trách nhiệm của Bên B. Thay đơn vị tư vấn phải báo trước cho Bên B.",
      ]],
      ["TƯ VẤN GIÁM SÁT THI CÔNG (NẾU CÓ)", [
        "Đơn vị giám sát thực hiện giám sát chất lượng, khối lượng, tiến độ, an toàn theo hợp đồng của đơn vị đó và pháp luật; không được sửa đổi hợp đồng này.",
        "Nếu không thuê tư vấn, Bên A tự thực hiện giám sát. Thay đơn vị giám sát phải báo trước cho Bên B.",
      ]],
      ["NHÀ THẦU PHỤ", [
        "Bên B sử dụng nhà thầu phụ theo thỏa thuận tại Mục III; nhà thầu phụ ngoài danh sách phải được Bên A chấp thuận bằng văn bản.",
        "Bên B chịu trách nhiệm trước Bên A về khối lượng, chất lượng, tiến độ, an toàn và sai sót của nhà thầu phụ.",
        "Bên A chỉ định nhà thầu phụ hoặc thanh toán trực tiếp cho nhà thầu phụ khi có thỏa thuận với Bên B.",
      ]],
      ["AN TOÀN LAO ĐỘNG, BẢO VỆ MÔI TRƯỜNG VÀ PHÒNG CHÁY CHỮA CHÁY", [
        "Bên B lập biện pháp an toàn cho người, công trình và công trình lân cận; đặt cảnh báo; huấn luyện và trang bị bảo hộ cho người lao động.",
        "Khi có sự cố, Bên B xử lý, báo cáo cơ quan có thẩm quyền và bồi thường thiệt hại do lỗi của mình.",
        "Bên B chống bụi, tiếng ồn, xử lý phế thải; các bên tuân thủ quy định phòng cháy, chữa cháy; phát hiện vi phạm thì được đình chỉ thi công.",
      ]],
      ["ĐIỆN, NƯỚC VÀ AN NINH CÔNG TRƯỜNG", [
        "Bên B tự cung cấp và trả chi phí điện, nước, dịch vụ cần thiết; được dùng nguồn sẵn có của Bên A nếu hai bên thỏa thuận.",
        "Bên B bảo vệ công trường, không cho người không có nhiệm vụ ra vào.",
      ]],
      ["TẠM DỪNG HỢP ĐỒNG", [
        "Được tạm dừng toàn bộ hoặc một phần công việc khi bên kia vi phạm nghiêm trọng, có sự kiện bất khả kháng, theo yêu cầu của cơ quan nhà nước hoặc do pháp luật thay đổi ảnh hưởng trực tiếp.",
        "Bên tạm dừng thông báo bằng văn bản lý do, thời điểm và hậu quả trước ít nhất 15 ngày, trừ bất khả kháng; không thông báo gây thiệt hại thì phải bồi thường.",
      ]],
      ["CHẤM DỨT HỢP ĐỒNG", [
        "Bên A được chấm dứt khi Bên B từ chối thực hiện, ngừng thi công 56 ngày liên tục làm ảnh hưởng nghiêm trọng tiến độ, không thực hiện bảo đảm hợp đồng, không khắc phục sai sót nghiêm trọng, phá sản hoặc cung cấp tài liệu gian dối.",
        "Bên B được chấm dứt khi công việc bị dừng quá 56 ngày liên tục do lỗi của Bên A mà không có lý do chính đáng, Bên A không thanh toán quá 56 ngày kể từ hạn thanh toán, hoặc Bên A phá sản.",
        "Một bên được chấm dứt khi bên kia chuyển nhượng hợp đồng cho bên thứ ba mà không được mình chấp thuận. Các mốc 56 ngày áp dụng theo khoản 2 Điều 27 Nghị định 210/2026/NĐ-CP, trừ thỏa thuận khác.",
        "Bên chấm dứt thông báo bằng văn bản, nêu lý do và căn cứ, trước ít nhất 28 ngày, trừ thỏa thuận khác (khoản 5 Điều 27 Nghị định 210/2026/NĐ-CP); không thông báo mà gây thiệt hại thì phải bồi thường.",
        "Khi chấm dứt, Bên B dừng thi công, bảo đảm an toàn, bàn giao tài liệu, vật tư đã được thanh toán; hai bên xác định giá trị đã thực hiện. Bên A được tạm giữ thanh toán để bù chi phí do lỗi của Bên B.",
        "Thỏa thuận giải quyết tranh chấp vẫn còn hiệu lực sau khi hợp đồng chấm dứt.",
      ]],
      ["BẢO HIỂM VÀ BẢO HÀNH", [
        "Các bên mua bảo hiểm bắt buộc theo pháp luật: Bên A mua bảo hiểm công trình; Bên B mua bảo hiểm cho người lao động, thiết bị của mình và trách nhiệm với bên thứ ba, trừ thỏa thuận khác phù hợp pháp luật.",
        "Thời gian bảo hành theo Mục III; công trình vốn khác có thể tham khảo mức tối thiểu 24 tháng (cấp đặc biệt, cấp I) và 12 tháng (cấp còn lại) tại Điều 32 Nghị định 207/2026/NĐ-CP. Thiết bị bảo hành không ngắn hơn thời hạn của nhà sản xuất.",
        "Bên B bắt đầu khắc phục hư hỏng do lỗi của mình trong vòng 21 ngày kể từ khi nhận thông báo; quá hạn, Bên A được thuê đơn vị khác và trừ chi phí vào khoản bảo hành.",
        "Khoản giữ lại hoặc bảo lãnh bảo hành chỉ được hoàn trả khi hết thời hạn bảo hành và Bên A xác nhận bằng văn bản Bên B đã hoàn thành trách nhiệm.",
      ]],
      ["RỦI RO, BẤT KHẢ KHÁNG VÀ HOÀN CẢNH THAY ĐỔI CƠ BẢN", [
        "Bất khả kháng là sự kiện khách quan, không thể lường trước và không thể khắc phục dù đã áp dụng mọi biện pháp cần thiết (Điều 156 Bộ luật Dân sự 2015); hoàn cảnh thay đổi cơ bản xác định theo Điều 420 Bộ luật này và pháp luật xây dựng.",
        "Bên bị ảnh hưởng thông báo bằng văn bản sớm nhất, được miễn trách nhiệm phần nghĩa vụ bị cản trở và được gia hạn tương ứng; nghĩa vụ thanh toán tiền không được miễn.",
        "Bên B chịu rủi ro về công trình, vật tư từ ngày khởi công đến ngày nghiệm thu bàn giao, trừ rủi ro do Bên A hoặc bất khả kháng.",
        "Khi hoàn cảnh thay đổi cơ bản, bên bị ảnh hưởng được đề nghị sửa đổi hợp đồng; nếu bất khả kháng làm ngừng việc quá 56 ngày liên tục, mỗi bên được thông báo chấm dứt và thanh toán phần đã thực hiện.",
      ]],
      ["SỰ KIỆN BỒI THƯỜNG", [
        "Sự kiện bồi thường gồm: Bên A chậm giao mặt bằng, bản vẽ, chỉ dẫn hoặc tạm ứng; yêu cầu thử nghiệm bổ sung mà không phát hiện sai sót; từ chối nhà thầu phụ không có lý do; nền đất xấu hơn đáng kể so với dự kiến hợp lý; yêu cầu xử lý tình huống đột xuất; nhà thầu khác của Bên A gây cản trở; chậm xác nhận hoàn thành không có lý do; rủi ro thuộc Bên A.",
        "Nếu sự kiện làm tăng chi phí hoặc kéo dài thời gian, Bên B được bổ sung giá và gia hạn theo chứng minh hợp lý; Bên B không cảnh báo sớm hoặc không hợp tác thì có thể không được bồi thường phần đó.",
      ]],
      ["THƯỞNG VÀ PHẠT VI PHẠM", [
        "Thưởng hoàn thành sớm theo thỏa thuận tại Mục III.",
        "Bên vi phạm chịu phạt theo mức tại Mục III (Điều 86 Luật Xây dựng 2025), không quá 8% giá trị phần nghĩa vụ bị vi phạm (Điều 301 Luật Thương mại 2005).",
        "Ngoài tiền phạt, bên vi phạm bồi thường thiệt hại thực tế (Điều 302 Luật Thương mại 2005, Điều 360 Bộ luật Dân sự 2015).",
      ]],
      ["KHIẾU NẠI VÀ GIẢI QUYẾT TRANH CHẤP", [
        "Khiếu nại phải bằng văn bản, kèm căn cứ và chứng cứ; bên nhận trả lời trong thời hạn hợp lý.",
        "Tranh chấp được thương lượng, hòa giải trong 30 ngày; không thành thì đưa ra Tòa án hoặc trọng tài nêu tại Mục III (chọn trọng tài thì đây là thỏa thuận trọng tài).",
        "Trong khi giải quyết tranh chấp, các bên tiếp tục thực hiện hợp đồng, trừ trường hợp pháp luật hoặc hợp đồng cho phép tạm dừng.",
      ]],
      ["QUYẾT TOÁN VÀ THANH LÝ", [
        "Trong 30 ngày kể từ ngày nghiệm thu hoàn thành toàn bộ, Bên B nộp hồ sơ quyết toán gồm biên bản nghiệm thu, bảng quyết toán (giá trị hoàn thành, phát sinh, đã thanh toán, còn lại), hồ sơ hoàn công, nhật ký thi công.",
        "Một bên không thực hiện quyết toán thì bên kia được tự quyết toán theo Điều 87 Luật Xây dựng 2025.",
        "Hợp đồng được thanh lý trong 45 ngày kể từ khi các bên hoàn thành nghĩa vụ hoặc hợp đồng chấm dứt.",
      ]],
      ["HIỆU LỰC HỢP ĐỒNG", [
        ...ESIGN[1].slice(0, 2),
        "Hợp đồng được giao kết tại địa điểm nêu tại Mục III, có hiệu lực từ thời điểm bên cuối cùng hoàn tất ký; nếu có bảo đảm thực hiện hợp đồng thì đồng thời phải được Bên A nhận đủ.",
      ]],
      ["ĐIỀU KHOẢN CHUNG", [
        "Hai bên cam kết thực hiện đúng hợp đồng; đề nghị của bên này phải được bên kia xem xét và trả lời.",
        "Phụ lục là bộ phận không tách rời của hợp đồng; mỗi bên lưu một bản điện tử có đầy đủ chữ ký.",
      ]],
    ]),
  },
  {
    id: "xd-nha-o",
    name: "Hợp đồng thi công xây dựng nhà ở riêng lẻ",
    category: "Thi công xây dựng",
    summary: "Nhà thầu (Bên A) thi công nhà cho chủ nhà là cá nhân (Bên B): quy mô, phần việc khoán, đợt thanh toán, bảo hành.",
    legalBasis: [BLDS, LXD, ND_HDXD, LGDDT, NHU_CAU],
    partyATitle: "BÊN NHẬN THẦU THI CÔNG (BÊN A)",
    partyBTitle: "BÊN GIAO THẦU - CHỦ NHÀ (BÊN B)",
    fields: [
      ...COMPANY_A,
      ...BANK_A,
      ...partyB(
        ["ten_ben_b", "Họ và tên chủ nhà (Bên B)"],
        ["cccd_ben_b", "Số CCCD Bên B"],
        ["dia_chi_ben_b", "Nơi cư trú Bên B"],
        ["sdt_ben_b", "Số điện thoại Bên B"],
      ),
      ...deal(
        ["dia_diem_xay_dung", "Địa điểm xây dựng"],
        ["quy_mo_cong_trinh", "Quy mô (số tầng, tổng diện tích sàn m²)"],
        ["so_giay_phep_xay_dung", "Số giấy phép xây dựng (ghi \"Được miễn\" nếu thuộc diện miễn)"],
        ["pham_vi_cong_viec", "Phạm vi khoán (trọn gói hoặc phần thô, nhân công) và vật liệu sử dụng"],
        ["gia_tri_hop_dong", "Giá trị hợp đồng (VNĐ)"],
        ["cac_dot_thanh_toan", "Các đợt thanh toán (thời điểm, tỷ lệ)"],
        ["ngay_hieu_luc", "Ngày khởi công"],
        ["thoi_han_hop_dong", "Thời hạn thi công"],
        ["bao_hanh_cong_trinh", "Thời gian bảo hành (tính từ ngày bàn giao nhà)"],
        ["muc_phat_vi_pham", "Mức phạt vi phạm"],
      ),
    ],
    clauses: numbered([
      ["ĐỐI TƯỢNG HỢP ĐỒNG", [
        "Bên B giao và Bên A nhận thi công nhà ở riêng lẻ với địa điểm, quy mô, phạm vi khoán và vật liệu nêu tại Mục III, theo bản vẽ được Bên B chấp thuận.",
      ]],
      ["CHẤT LƯỢNG VÀ NGHIỆM THU", [
        "Bên A thi công đúng bản vẽ, giấy phép xây dựng (nếu có) và quy chuẩn kỹ thuật; sử dụng đúng chủng loại vật liệu đã thỏa thuận.",
        "Hai bên nghiệm thu từng giai đoạn (móng, khung, mái, hoàn thiện) trước khi thi công giai đoạn tiếp theo.",
      ]],
      ["TIẾN ĐỘ VÀ THANH TOÁN", [
        "Bên A khởi công và bàn giao theo ngày, thời hạn nêu tại Mục III; thời hạn được cộng thêm khi ngừng thi công do lỗi của Bên B hoặc bất khả kháng.",
        "Bên B thanh toán theo các đợt nêu tại Mục III bằng chuyển khoản vào tài khoản của Bên A, sau khi giai đoạn tương ứng được nghiệm thu.",
      ]],
      ["BẢO HÀNH", [
        "Bên A bảo hành nhà trong thời gian nêu tại Mục III, sửa chữa bằng chi phí của mình các hư hỏng như nứt, thấm, bong tróc do lỗi thi công hoặc vật liệu Bên A cung cấp.",
      ]],
      SITE_SAFETY,
      ["QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN", [
        "Bên B bàn giao mặt bằng, giấy tờ về quyền sử dụng đất và giấy phép xây dựng (nếu có), cung cấp điện nước phục vụ thi công theo thỏa thuận, được kiểm tra công việc bất kỳ lúc nào.",
        "Bên A bố trí thợ có tay nghề, quản lý công nhân, không chuyển giao toàn bộ công việc cho người khác khi chưa được Bên B đồng ý.",
      ]],
      VARIATION,
      PENALTY_AGREED,
      SUSPENSION,
      FORCE_MAJEURE,
      DISPUTE,
      ESIGN,
    ]),
  },
  {
    id: "xd-thau-phu",
    name: "Hợp đồng thầu phụ thi công xây dựng",
    category: "Thi công xây dựng",
    summary: "Nhà thầu chính (Bên A) giao một phần công việc cho nhà thầu phụ (Bên B), gắn với hợp đồng thầu chính.",
    legalBasis: [BLDS, LXD, ND_HDXD, LTM, LGDDT, NHU_CAU],
    partyATitle: "NHÀ THẦU CHÍNH (BÊN A)",
    partyBTitle: "NHÀ THẦU PHỤ (BÊN B)",
    fields: [
      ...COMPANY_A,
      ...COMPANY_B,
      ...BANK_B,
      ...deal(["so_hop_dong_goc", "Số và ngày ký hợp đồng thầu chính"]),
      ...WORKS,
    ],
    clauses: numbered([
      ["ĐỐI TƯỢNG VÀ QUAN HỆ VỚI HỢP ĐỒNG THẦU CHÍNH", [
        "Bên A giao và Bên B nhận thi công phần công việc nêu tại Mục III, thuộc hợp đồng thầu chính cũng nêu tại Mục III.",
        "Bên A bảo đảm được phép giao thầu phụ phần việc này theo hợp đồng thầu chính hoặc đã được chủ đầu tư chấp thuận; Bên B không được giao lại phần việc cho bên khác.",
        PRIVATE_CAPITAL,
      ]],
      ["CHẤT LƯỢNG, TIẾN ĐỘ VÀ NGHIỆM THU", [
        "Bên B tuân thủ thiết kế, tiêu chuẩn kỹ thuật, tiến độ của hợp đồng thầu chính đối với phần việc được giao và chỉ dẫn của Bên A.",
        "Khối lượng của Bên B được hai bên nghiệm thu bằng biên bản; nghiệm thu này không thay thế nghiệm thu của chủ đầu tư.",
      ]],
      ["GIÁ, TẠM ỨNG, THANH TOÁN VÀ QUYẾT TOÁN", [
        "Giá trị, loại giá, tỷ lệ tạm ứng và các đợt thanh toán theo Mục III; Bên A thanh toán bằng chuyển khoản vào tài khoản của Bên B trên cơ sở biên bản nghiệm thu và hồ sơ hợp lệ.",
        "Sau khi phần việc được nghiệm thu, hai bên quyết toán và thanh lý hợp đồng theo Điều 87 Luật Xây dựng 2025.",
      ]],
      ["BẢO HÀNH", [
        "Bên B bảo hành phần việc của mình trong thời gian nêu tại Mục III; Bên A giữ lại khoản bảo hành theo tỷ lệ nêu tại Mục III và hoàn trả khi Bên B hoàn thành nghĩa vụ.",
      ]],
      SITE_SAFETY,
      ["TRÁCH NHIỆM CỦA CÁC BÊN", [
        "Bên A bàn giao mặt bằng, bản vẽ, điều phối công trường và thanh toán đúng hạn cho Bên B.",
        "Bên A vẫn chịu trách nhiệm trước chủ đầu tư về phần việc giao thầu phụ; Bên B bồi hoàn cho Bên A thiệt hại phát sinh do lỗi của Bên B.",
      ]],
      VARIATION,
      PENALTY_COMMERCIAL,
      SUSPENSION,
      FORCE_MAJEURE,
      DISPUTE,
      ESIGN,
    ]),
  },
  {
    id: "xd-tu-van-thiet-ke",
    name: "Hợp đồng tư vấn thiết kế xây dựng",
    category: "Tư vấn xây dựng",
    summary: "Chủ đầu tư (Bên A) thuê đơn vị tư vấn (Bên B) lập hồ sơ thiết kế: phạm vi, hồ sơ bàn giao, chỉnh sửa, quyền tác giả.",
    legalBasis: [BLDS, LXD, ND_HDXD, LTM, LGDDT, NHU_CAU],
    partyATitle: "CHỦ ĐẦU TƯ (BÊN A)",
    partyBTitle: "ĐƠN VỊ TƯ VẤN THIẾT KẾ (BÊN B)",
    fields: [
      ...COMPANY_A,
      ...COMPANY_B,
      ...BANK_B,
      ...deal(
        ["ten_cong_trinh", "Tên công trình / Hạng mục"],
        ["dia_diem_xay_dung", "Địa điểm xây dựng"],
        ["pham_vi_cong_viec", "Phạm vi, yêu cầu thiết kế"],
        ["ho_so_ban_giao", "Hồ sơ bàn giao (thành phần, số bộ)"],
        ["gia_tri_hop_dong", "Giá trị hợp đồng (VNĐ, đã gồm VAT)"],
        ["ty_le_tam_ung", "Tỷ lệ tạm ứng (%)"],
        ["cac_dot_thanh_toan", "Các đợt thanh toán (thời điểm, tỷ lệ)"],
        ["ngay_hieu_luc", "Ngày bắt đầu thực hiện"],
        ["thoi_han_hop_dong", "Thời hạn hoàn thành hồ sơ"],
        ["muc_phat_vi_pham", "Mức phạt vi phạm (tỷ lệ %, tối đa 8%)"],
      ),
    ],
    clauses: numbered([
      ["ĐỐI TƯỢNG VÀ YÊU CẦU THIẾT KẾ", [
        "Bên B lập hồ sơ thiết kế theo phạm vi, yêu cầu nêu tại Mục III, phù hợp quy chuẩn, tiêu chuẩn áp dụng và nhiệm vụ thiết kế được Bên A chấp thuận.",
        "Bên B bảo đảm đủ điều kiện năng lực; người chủ trì thiết kế có chứng chỉ hành nghề phù hợp theo quy định pháp luật.",
        PRIVATE_CAPITAL,
      ]],
      ["BÀN GIAO, NGHIỆM THU VÀ CHỈNH SỬA", [
        "Bên B bàn giao hồ sơ theo thành phần, số lượng và thời hạn nêu tại Mục III, kèm tệp điện tử.",
        "Bên B chỉnh sửa hồ sơ bằng chi phí của mình khi sai sót do lỗi của Bên B hoặc theo ý kiến thẩm tra, thẩm định trong phạm vi nhiệm vụ đã thỏa thuận.",
        "Bên B giải thích thiết kế và phối hợp xử lý vướng mắc trong quá trình thi công theo yêu cầu của Bên A.",
      ]],
      ["GIÁ, TẠM ỨNG VÀ THANH TOÁN", [
        "Bên A tạm ứng và thanh toán theo Mục III bằng chuyển khoản vào tài khoản của Bên B, trên cơ sở hồ sơ được nghiệm thu.",
      ]],
      ["QUYỀN ĐỐI VỚI HỒ SƠ THIẾT KẾ", [
        "Quyền tài sản đối với hồ sơ thiết kế thuộc Bên A kể từ khi Bên A thanh toán đầy đủ; quyền nhân thân của tác giả được bảo vệ theo pháp luật về sở hữu trí tuệ.",
        "Bên B bảo đảm hồ sơ không xâm phạm quyền sở hữu trí tuệ của bên thứ ba và giữ bí mật thông tin dự án.",
      ]],
      ["QUYỀN VÀ NGHĨA VỤ CỦA BÊN A", [
        "Cung cấp thông tin, tài liệu, số liệu khảo sát cần thiết; phản hồi hồ sơ đúng thời hạn hai bên thống nhất.",
      ]],
      VARIATION,
      PENALTY_COMMERCIAL,
      SUSPENSION,
      FORCE_MAJEURE,
      DISPUTE,
      ESIGN,
    ]),
  },
  {
    id: "xd-tu-van-giam-sat",
    name: "Hợp đồng tư vấn giám sát thi công xây dựng",
    category: "Tư vấn xây dựng",
    summary: "Chủ đầu tư (Bên A) thuê đơn vị giám sát (Bên B): phạm vi, nhân sự, báo cáo, trách nhiệm độc lập.",
    legalBasis: [BLDS, LXD, ND_HDXD, LTM, LGDDT, NHU_CAU],
    partyATitle: "CHỦ ĐẦU TƯ (BÊN A)",
    partyBTitle: "ĐƠN VỊ TƯ VẤN GIÁM SÁT (BÊN B)",
    fields: [
      ...COMPANY_A,
      ...COMPANY_B,
      ...BANK_B,
      ...deal(
        ["ten_cong_trinh", "Tên công trình / Hạng mục"],
        ["dia_diem_xay_dung", "Địa điểm xây dựng"],
        ["pham_vi_cong_viec", "Phạm vi giám sát"],
        ["nhan_su_giam_sat", "Nhân sự giám sát (họ tên, chứng chỉ hành nghề)"],
        ["gia_tri_hop_dong", "Giá trị hợp đồng (VNĐ, đã gồm VAT)"],
        ["cac_dot_thanh_toan", "Các đợt thanh toán (thời điểm, tỷ lệ)"],
        ["ngay_hieu_luc", "Ngày bắt đầu giám sát"],
        ["thoi_han_hop_dong", "Thời hạn giám sát"],
        ["muc_phat_vi_pham", "Mức phạt vi phạm (tỷ lệ %, tối đa 8%)"],
      ),
    ],
    clauses: numbered([
      ["ĐỐI TƯỢNG VÀ NỘI DUNG GIÁM SÁT", [
        "Bên B giám sát chất lượng, khối lượng, tiến độ, an toàn lao động và vệ sinh môi trường của công trình trong phạm vi nêu tại Mục III.",
        "Bên B kiểm tra vật liệu, thiết bị, biện pháp thi công và tham gia nghiệm thu công việc, giai đoạn, hạng mục hoàn thành.",
        PRIVATE_CAPITAL,
      ]],
      ["NHÂN SỰ VÀ BÁO CÁO", [
        "Bên B bố trí nhân sự nêu tại Mục III có mặt tại công trường phù hợp tiến độ; việc thay thế nhân sự phải được Bên A đồng ý bằng văn bản.",
        "Bên B ghi nhật ký giám sát, báo cáo định kỳ và báo ngay cho Bên A khi phát hiện sai phạm, nguy cơ mất an toàn.",
      ]],
      ["TÍNH ĐỘC LẬP VÀ TRÁCH NHIỆM", [
        "Bên B giám sát trung thực, khách quan; không thông đồng với nhà thầu thi công hoặc nhà cung cấp làm sai khối lượng, chất lượng.",
        "Bên B bồi thường thiệt hại do nghiệm thu sai, bỏ sót hoặc chậm xử lý do lỗi của mình.",
      ]],
      ["GIÁ VÀ THANH TOÁN", [
        "Bên A thanh toán theo các đợt nêu tại Mục III bằng chuyển khoản vào tài khoản của Bên B; thời gian giám sát kéo dài ngoài thỏa thuận được xử lý bằng phụ lục hợp đồng.",
      ]],
      ["QUYỀN VÀ NGHĨA VỤ CỦA BÊN A", [
        "Cung cấp hồ sơ thiết kế, hợp đồng thi công và thông báo cho nhà thầu về quyền hạn của đơn vị giám sát.",
      ]],
      VARIATION,
      PENALTY_COMMERCIAL,
      SUSPENSION,
      FORCE_MAJEURE,
      DISPUTE,
      ESIGN,
    ]),
  },
  {
    id: "xd-vat-lieu",
    name: "Hợp đồng mua bán vật liệu xây dựng",
    category: "Cung cấp vật tư, thiết bị",
    summary: "Theo BLDS 2015 (Điều 430 trở đi) và Luật Thương mại 2005: xi măng, thép, cát đá, gạch, bê tông giao tại công trường.",
    legalBasis: [BLDS, LTM, LGDDT, NHU_CAU],
    partyATitle: "BÊN BÁN (BÊN A)",
    partyBTitle: "BÊN MUA (BÊN B)",
    fields: [
      ...COMPANY_A,
      ...BANK_A,
      ...COMPANY_B,
      ...deal(
        ["ten_hang_hoa_tai_san", "Tên vật liệu"],
        ["so_luong_hang_hoa", "Số lượng, đơn vị tính"],
        ["thong_so_ky_thuat", "Quy cách, chất lượng, tiêu chuẩn"],
        ["gia_tri_hop_dong", "Tổng giá bán"],
        ["phuong_thuc_thanh_toan", "Phương thức & thời hạn thanh toán"],
        ["dia_diem_ban_giao", "Địa điểm giao nhận"],
        ["ngay_hieu_luc", "Ngày giao hàng"],
        ["muc_phat_vi_pham", "Mức phạt vi phạm (tỷ lệ %, tối đa 8%)"],
      ),
    ],
    clauses: numbered([
      ["HÀNG HÓA VÀ CHẤT LƯỢNG", [
        "Bên A bán cho Bên B vật liệu đúng chủng loại, số lượng, quy cách, tiêu chuẩn nêu tại Mục III; hàng hóa có nguồn gốc hợp pháp, không bị tranh chấp.",
        "Mỗi lô hàng kèm chứng chỉ xuất xứ, chứng chỉ chất lượng hoặc kết quả thử nghiệm theo quy định đối với loại vật liệu đó.",
      ]],
      ["GIAO NHẬN VÀ KIỂM TRA", [
        "Bên A giao hàng tại địa điểm, thời gian nêu tại Mục III; hai bên lập biên bản giao nhận ghi số lượng, tình trạng từng lô.",
        "Bên B được lấy mẫu thử nghiệm; lô hàng không đạt phải được Bên A thu hồi, đổi bằng chi phí của Bên A trong thời hạn hai bên thống nhất.",
      ]],
      ["CHUYỂN QUYỀN SỞ HỮU VÀ RỦI RO", [
        "Quyền sở hữu và rủi ro đối với vật liệu chuyển sang Bên B từ thời điểm giao nhận, trừ trường hợp các bên có thỏa thuận khác.",
      ]],
      ["THANH TOÁN", [
        "Bên B thanh toán theo giá và phương thức nêu tại Mục III; Bên A xuất hóa đơn hợp lệ theo quy định pháp luật.",
      ]],
      ["TRÁCH NHIỆM VỀ KHUYẾT TẬT", [
        "Bên A chịu trách nhiệm về khuyết tật của vật liệu không thể phát hiện khi giao nhận, kể cả thiệt hại gây ra cho công trình do khuyết tật đó.",
      ]],
      PENALTY_COMMERCIAL,
      FORCE_MAJEURE,
      DISPUTE,
      ESIGN,
    ]),
  },
  {
    id: "xd-phu-luc",
    name: "Phụ lục hợp đồng xây dựng (phát sinh, điều chỉnh)",
    category: "Phụ lục, nghiệm thu & thanh lý",
    summary: "Ghi nhận khối lượng phát sinh, điều chỉnh giá và tiến độ của hợp đồng đã ký (Điều 84 Luật Xây dựng 2025).",
    legalBasis: [BLDS, LXD, "Hợp đồng gốc đã ký giữa hai bên nêu tại Mục III", LGDDT, NHU_CAU],
    partyATitle: "BÊN GIAO THẦU (BÊN A)",
    partyBTitle: "BÊN NHẬN THẦU (BÊN B)",
    fields: [
      ...COMPANY_A,
      ...COMPANY_B,
      ...deal(
        ["so_hop_dong_goc", "Số và ngày ký hợp đồng gốc"],
        ["ten_cong_trinh", "Tên công trình / Hạng mục"],
        ["ly_do_dieu_chinh", "Lý do điều chỉnh"],
        ["noi_dung_dieu_chinh", "Nội dung, khối lượng phát sinh hoặc điều chỉnh"],
        ["gia_tri_truoc_dieu_chinh", "Giá trị hợp đồng trước điều chỉnh (VNĐ)"],
        ["gia_tri_phat_sinh", "Giá trị tăng hoặc giảm (VNĐ)"],
        ["gia_tri_sau_dieu_chinh", "Giá trị hợp đồng sau điều chỉnh (VNĐ)"],
        ["lich_thi_cong_dieu_chinh", "Tiến độ sau điều chỉnh"],
        ["ngay_hieu_luc", "Ngày phụ lục có hiệu lực"],
      ),
    ],
    clauses: numbered([
      ["NỘI DUNG ĐIỀU CHỈNH", [
        "Hai bên thống nhất điều chỉnh hợp đồng gốc với lý do, nội dung và khối lượng nêu tại Mục III.",
      ]],
      ["GIÁ TRỊ, THANH TOÁN VÀ TIẾN ĐỘ", [
        "Giá trị hợp đồng và tiến độ sau điều chỉnh theo Mục III.",
        "Phần giá trị phát sinh được nghiệm thu và thanh toán theo phương thức của hợp đồng gốc.",
      ]],
      ["HIỆU LỰC", [
        "Phụ lục là bộ phận không tách rời của hợp đồng gốc (Điều 84 Luật Xây dựng 2025); các nội dung không được điều chỉnh vẫn giữ nguyên hiệu lực.",
        "Phụ lục được ký điện tử trên nền tảng TrustSign theo Luật Giao dịch điện tử 2023 và có hiệu lực từ ngày nêu tại Mục III, sau khi bên cuối cùng hoàn tất ký.",
      ]],
    ]),
  },
  {
    id: "xd-nghiem-thu",
    name: "Biên bản nghiệm thu khối lượng và đề nghị thanh toán đợt",
    category: "Phụ lục, nghiệm thu & thanh lý",
    summary: "Nhà thầu (Bên A) và bên giao thầu (Bên B) xác nhận khối lượng một đợt, khấu trừ tạm ứng, giữ lại bảo hành.",
    legalBasis: [BLDS, LXD, "Hợp đồng gốc đã ký giữa hai bên nêu tại Mục III", "Kết quả thực hiện công việc thực tế"],
    partyATitle: "BÊN NHẬN THẦU - BÊN ĐỀ NGHỊ THANH TOÁN (BÊN A)",
    partyBTitle: "BÊN GIAO THẦU (BÊN B)",
    fields: [
      ...COMPANY_A,
      ...BANK_A,
      ...COMPANY_B,
      ...deal(
        ["so_hop_dong_goc", "Số và ngày ký hợp đồng gốc"],
        ["ten_cong_trinh", "Tên công trình / Hạng mục"],
        ["dot_thanh_toan", "Đợt nghiệm thu, thanh toán số"],
        ["khoi_luong_nghiem_thu", "Hạng mục, khối lượng nghiệm thu"],
        ["ket_qua_nghiem_thu", "Kết quả đánh giá (đạt / tồn tại cần khắc phục)"],
        ["gia_tri_nghiem_thu", "Giá trị nghiệm thu đợt này (VNĐ)"],
        ["gia_tri_khau_tru_tam_ung", "Khấu trừ tạm ứng đợt này (VNĐ)"],
        ["gia_tri_giu_lai", "Giữ lại bảo hành đợt này (VNĐ)"],
        ["gia_tri_de_nghi_thanh_toan", "Số tiền đề nghị thanh toán (VNĐ)"],
        ["ngay_hieu_luc", "Ngày nghiệm thu"],
      ),
    ],
    clauses: numbered([
      ["NỘI DUNG NGHIỆM THU", [
        "Hai bên đã cùng kiểm tra, đo đếm hạng mục và khối lượng nêu tại Mục III, đối chiếu với thiết kế và hợp đồng gốc.",
        "Kết quả đánh giá theo Mục III; các tồn tại (nếu có) được Bên A khắc phục trong thời hạn hai bên thống nhất và nghiệm thu bổ sung bằng biên bản riêng.",
      ]],
      ["GIÁ TRỊ THANH TOÁN", [
        "Số tiền đề nghị thanh toán bằng giá trị nghiệm thu trừ khoản khấu trừ tạm ứng và khoản giữ lại bảo hành nêu tại Mục III.",
        "Biên bản này là căn cứ để Bên A xuất hóa đơn và Bên B thanh toán vào tài khoản của Bên A theo thời hạn của hợp đồng gốc.",
      ]],
      ["HIỆU LỰC", [
        "Biên bản là bộ phận không tách rời của hợp đồng gốc, được ký điện tử trên nền tảng TrustSign theo Luật Giao dịch điện tử 2023 và có hiệu lực từ thời điểm bên cuối cùng hoàn tất ký.",
        "Việc nghiệm thu đợt không làm giảm trách nhiệm của Bên A về chất lượng và bảo hành công trình.",
      ]],
    ]),
  },
  {
    id: "xd-thanh-ly",
    name: "Biên bản thanh lý hợp đồng xây dựng",
    category: "Phụ lục, nghiệm thu & thanh lý",
    summary: "Quyết toán công nợ, khoản giữ lại bảo hành và chấm dứt hợp đồng (Điều 87 Luật Xây dựng 2025, Điều 422 BLDS 2015).",
    legalBasis: [BLDS, LXD, "Hợp đồng gốc đã ký giữa hai bên nêu tại Mục III", "Hồ sơ quyết toán và tình hình thực hiện hợp đồng thực tế"],
    partyATitle: "BÊN A",
    partyBTitle: "BÊN B",
    fields: [
      ...COMPANY_A,
      ...COMPANY_B,
      ...deal(
        ["so_hop_dong_goc", "Số và ngày ký hợp đồng cần thanh lý"],
        ["ten_cong_trinh", "Tên công trình / Hạng mục"],
        ["gia_tri_hop_dong", "Tổng giá trị quyết toán (VNĐ)"],
        ["gia_tri_da_thanh_toan", "Số tiền đã thanh toán (VNĐ)"],
        ["gia_tri_con_lai", "Số tiền còn phải thanh toán (VNĐ)"],
        ["gia_tri_giu_lai", "Số tiền giữ lại bảo hành (VNĐ)"],
        ["bao_hanh_cong_trinh", "Thời gian bảo hành còn lại"],
        ["ngay_hieu_luc", "Ngày thanh lý"],
      ),
    ],
    clauses: numbered([
      ["TÌNH HÌNH THỰC HIỆN HỢP ĐỒNG", [
        "Hai bên xác nhận công việc theo hợp đồng gốc nêu tại Mục III đã được nghiệm thu, bàn giao và quyết toán với giá trị nêu tại Mục III.",
      ]],
      ["CÔNG NỢ", [
        "Số tiền còn phải thanh toán nêu tại Mục III được thanh toán trong vòng 15 ngày kể từ ngày ký biên bản này.",
        "Khoản giữ lại bảo hành nêu tại Mục III được hoàn trả khi hết thời gian bảo hành và nghĩa vụ bảo hành đã hoàn thành.",
      ]],
      ["NGHĨA VỤ CÒN HIỆU LỰC", [
        "Nghĩa vụ bảo hành trong thời gian còn lại nêu tại Mục III, nghĩa vụ bảo mật và thỏa thuận giải quyết tranh chấp tiếp tục có hiệu lực.",
      ]],
      ["HIỆU LỰC", [
        "Hợp đồng gốc được thanh lý theo Điều 87 Luật Xây dựng 2025 kể từ thời điểm hai bên hoàn tất ký biên bản này, trừ các nghĩa vụ còn hiệu lực nêu trên.",
        "Biên bản được ký điện tử trên nền tảng TrustSign theo Luật Giao dịch điện tử 2023.",
      ]],
    ]),
  },
];

/** Trường nội dung dài: nhập bằng ô nhiều dòng, in thành từng dòng dưới nhãn. */
export const LONG_TEXT_FIELDS: ReadonlySet<string> = new Set([
  "pham_vi_cong_viec",
  "cac_dot_thanh_toan",
  "ho_so_ban_giao",
  "nhan_su_giam_sat",
  "noi_dung_dieu_chinh",
  "khoi_luong_nghiem_thu",
  "ket_qua_nghiem_thu",
]);

/** Các hình thức giá theo khoản 2 Điều 82 Luật Xây dựng 2025. */
export const CONTRACT_PRICE_TYPES = [
  "Trọn gói",
  "Đơn giá cố định",
  "Đơn giá điều chỉnh",
  "Theo thời gian",
  "Chi phí cộng phí",
  "Theo kết quả đầu ra",
  "Theo tỷ lệ phần trăm",
  "Hỗn hợp",
  "Hình thức giá khác",
];

/**
 * Tự động tạo văn bản hợp đồng hoàn chỉnh, đúng trình tự pháp lý Việt Nam
 * từ Căn cứ, danh sách trường (Bên A, Bên B, Nội dung giao dịch) và các Điều khoản.
 */
export function buildFormattedContractFromBlueprint(bp: {
  name: string;
  legalBasis?: string[];
  partyATitle: string;
  partyBTitle: string;
  fields: TemplateFieldItem[];
  clauses: TemplateClauseItem[];
}): string {
  const partyAFields = bp.fields.filter((f) => f.section === "partyA");
  const partyBFields = bp.fields.filter((f) => f.section === "partyB");
  const transactionFields = bp.fields.filter((f) => f.section === "transaction");

  // Cập nhật từ điển nhãn để màn hình Soạn hợp đồng hiển thị đúng tên tiếng Việt người dùng vừa đặt
  for (const f of bp.fields) {
    VARIABLE_LABELS[f.key] = f.label;
  }

  const lines: string[] = [
    "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
    "Độc lập - Tự do - Hạnh phúc",
    "",
    (bp.name || "HỢP ĐỒNG GIAO DỊCH").trim().toUpperCase(),
    "",
  ];

  const basis = (bp.legalBasis ?? []).map((b) => b.trim()).filter(Boolean);
  if (basis.length > 0) {
    basis.forEach((b, i) => lines.push(`Căn cứ ${b}${i === basis.length - 1 ? "." : ";"}`));
    lines.push("");
  }

  if (partyAFields.length > 0) {
    lines.push(`I. ${bp.partyATitle.trim().toUpperCase()}:`);
    for (const f of partyAFields) {
      lines.push(`- ${f.label}: {{${f.key}}}`);
    }
    lines.push("");
  }

  if (partyBFields.length > 0) {
    lines.push(`II. ${bp.partyBTitle.trim().toUpperCase()}:`);
    for (const f of partyBFields) {
      lines.push(`- ${f.label}: {{${f.key}}}`);
    }
    lines.push("");
  }

  if (transactionFields.length > 0) {
    lines.push("III. THÔNG TIN GIAO DỊCH & ĐỐI TƯỢNG HỢP ĐỒNG:");
    for (const f of transactionFields) {
      lines.push(`- ${f.label}: {{${f.key}}}`);
    }
    lines.push("");
  }

  lines.push("Sau khi bàn bạc, hai bên thống nhất ký kết với các điều khoản cụ thể sau đây:");
  lines.push("");

  for (const clause of bp.clauses) {
    if (clause.title.trim()) {
      lines.push(clause.title.trim().toUpperCase());
    }
    if (clause.body.trim()) {
      lines.push(clause.body.trim());
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

/**
 * Bóc tách nội dung mẫu hợp đồng bất kỳ (kể cả mẫu cũ) thành cấu trúc Blueprint
 * để người dùng có thể thêm/xóa trường thông tin theo đúng mục mà không cần đụng tới {{...}}.
 */
export function parseTemplateIntoBlueprint(name: string, rawContent: string): {
  legalBasis: string[];
  partyATitle: string;
  partyBTitle: string;
  fields: TemplateFieldItem[];
  clauses: TemplateClauseItem[];
} {
  const vars = detectVariables(rawContent);
  const labelMap: Record<string, string> = { ...VARIABLE_LABELS };

  // Trích xuất nhãn thực tế từ các dòng "- Nhãn: {{key}}" nếu có
  for (const line of rawContent.split(/\r?\n/)) {
    const m = line.match(/^\s*[-•]?\s*([^:\n]+?)\s*:\s*\{\{([a-zA-Z0-9_]+)\}\}/);
    if (m) {
      const extractedLabel = m[1].trim();
      const varKey = m[2].trim();
      if (extractedLabel) {
        labelMap[varKey] = extractedLabel;
        VARIABLE_LABELS[varKey] = extractedLabel;
      }
    }
  }

  const fields: TemplateFieldItem[] = vars.map((key) => {
    const label = labelMap[key] ?? key.replace(/_/g, " ");
    let section: FieldSection = "transaction";
    if (key.endsWith("_ben_a") || key.includes("ben_a")) {
      section = "partyA";
    } else if (
      key.endsWith("_ben_b") ||
      key.includes("ben_b") ||
      key.includes("nhan_vien") ||
      key.includes("doi_tac")
    ) {
      section = "partyB";
    }
    return { key, label, section };
  });

  // Trích xuất Căn cứ (trước Mục I), tiêu đề Mục I/II và các điều khoản ĐIỀU 1, ĐIỀU 2...
  const legalBasis: string[] = [];
  let partyATitle = "ĐẠI DIỆN BÊN A";
  let partyBTitle = "ĐẠI DIỆN BÊN B";
  const clauses: TemplateClauseItem[] = [];
  const lines = rawContent.split(/\r?\n/);
  let currentClause: TemplateClauseItem | null = null;
  let seenSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const sectionA = trimmed.match(/^I\.\s+(.+?):?$/);
    const sectionB = trimmed.match(/^II\.\s+(.+?):?$/);
    if (sectionA) {
      partyATitle = sectionA[1];
      seenSection = true;
    } else if (sectionB) {
      partyBTitle = sectionB[1];
      seenSection = true;
    } else if (!seenSection && /^Căn cứ\s+/i.test(trimmed)) {
      legalBasis.push(trimmed.replace(/^Căn cứ\s+/i, "").replace(/[;.]\s*$/, ""));
    } else if (/^ĐIỀU\s+\d+/i.test(trimmed)) {
      seenSection = true;
      if (currentClause) clauses.push(currentClause);
      currentClause = { title: trimmed, body: "" };
    } else if (currentClause && trimmed && !trimmed.includes("{{")) {
      currentClause.body = currentClause.body ? `${currentClause.body}\n${trimmed}` : trimmed;
    }
  }
  if (currentClause) clauses.push(currentClause);

  if (clauses.length === 0) {
    clauses.push(
      {
        title: "ĐIỀU 1. NỘI DUNG VÀ THỰC HIỆN HỢP ĐỒNG",
        body: "Hai bên cam kết thực hiện đầy đủ các nội dung và thông tin giao dịch đã thỏa thuận ở trên.",
      },
      {
        title: "ĐIỀU 2. GIAO KẾT ĐIỆN TỬ VÀ HIỆU LỰC",
        body: ESIGN[1].join("\n"),
      },
    );
  }

  return {
    legalBasis,
    partyATitle,
    partyBTitle,
    fields,
    clauses,
  };
}

/**
 * Nếu người dùng có mẫu cũ chỉ chứa các biến nối liền nhau, tự động dàn trang chuẩn.
 */
export function normalizeTemplateStructure(rawContent: string, templateTitle?: string): string {
  const trimmed = rawContent.trim();
  if (!trimmed) return "";

  const withoutVars = trimmed.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, "").trim();
  if (withoutVars.length < 15) {
    const bp = parseTemplateIntoBlueprint(templateTitle || "HỢP ĐỒNG GIAO DỊCH", trimmed);
    return buildFormattedContractFromBlueprint({
      name: templateTitle || "HỢP ĐỒNG GIAO DỊCH",
      ...bp,
    });
  }

  return rawContent;
}
