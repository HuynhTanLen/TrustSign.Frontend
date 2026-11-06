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
  dai_dien_ben_a: "Người đại diện theo pháp luật Bên A",
  chuc_vu_ben_a: "Chức vụ người đại diện Bên A",
  dia_chi_ben_a: "Địa chỉ trụ sở Bên A",
  sdt_ben_a: "Số điện thoại Bên A",
  stk_ben_a: "Số tài khoản, ngân hàng Bên A",

  // Bên B
  ten_ben_b: "Tên đối tác / Khách hàng (Bên B)",
  mst_ben_b: "Mã số thuế / Số CCCD Bên B",
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
  stk_nhan_vien: "Số tài khoản, ngân hàng nhận thanh toán",

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
  muc_dich_bao_mat: "Mục đích trao đổi thông tin bảo mật",
  so_hop_dong_goc: "Số và ngày ký hợp đồng gốc",
  ket_qua_nghiem_thu: "Kết quả đánh giá nghiệm thu",
  gia_tri_da_thanh_toan: "Số tiền đã thanh toán (VNĐ)",
  gia_tri_con_lai: "Số tiền còn phải thanh toán (VNĐ)",
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
const BLLD = "Bộ luật Lao động số 45/2019/QH14 ngày 20/11/2019";
const LGDDT = "Luật Giao dịch điện tử số 20/2023/QH15";
const NHU_CAU = "nhu cầu và khả năng thực tế của các bên";

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

/**
 * 8 mẫu hợp đồng thông dụng tại Việt Nam. Pháp luật không ban hành mẫu bắt buộc cho các loại này;
 * nội dung được soạn theo các điều khoản bắt buộc / thông lệ của văn bản nêu ở phần "Căn cứ" từng mẫu.
 */
export const REFERENCE_TEMPLATES: ContractBlueprint[] = [
  {
    id: "b2b-service",
    name: "Hợp đồng cung cấp dịch vụ (B2B)",
    category: "Dịch vụ & Thương mại",
    summary: "Theo BLDS 2015 (Điều 513–521) và Luật Thương mại 2005: dịch vụ phần mềm, tư vấn, marketing, vận chuyển cho doanh nghiệp.",
    legalBasis: [BLDS, LTM, LGDDT, NHU_CAU],
    partyATitle: "BÊN CUNG ỨNG DỊCH VỤ (BÊN A)",
    partyBTitle: "BÊN SỬ DỤNG DỊCH VỤ (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế Bên A", section: "partyA" },
      { key: "dia_chi_ben_a", label: "Địa chỉ trụ sở Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện theo pháp luật Bên A", section: "partyA" },
      { key: "chuc_vu_ben_a", label: "Chức vụ", section: "partyA" },
      { key: "stk_ben_a", label: "Số tài khoản, ngân hàng Bên A", section: "partyA" },
      { key: "ten_ben_b", label: "Tên doanh nghiệp (Bên B)", section: "partyB" },
      { key: "mst_ben_b", label: "Mã số thuế Bên B", section: "partyB" },
      { key: "dia_chi_ben_b", label: "Địa chỉ trụ sở Bên B", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "chuc_vu_ben_b", label: "Chức vụ", section: "partyB" },
      { key: "noi_dung_dich_vu", label: "Nội dung, phạm vi dịch vụ", section: "transaction" },
      { key: "gia_tri_hop_dong", label: "Giá trị hợp đồng (VNĐ, đã gồm VAT)", section: "transaction" },
      { key: "phuong_thuc_thanh_toan", label: "Phương thức & tiến độ thanh toán", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày bắt đầu thực hiện", section: "transaction" },
      { key: "thoi_han_hop_dong", label: "Thời hạn thực hiện", section: "transaction" },
      { key: "muc_phat_vi_pham", label: "Mức phạt vi phạm (tỷ lệ %, tối đa 8%)", section: "transaction" },
    ],
    clauses: numbered([
      ["ĐỐI TƯỢNG VÀ YÊU CẦU DỊCH VỤ", [
        "Bên A thực hiện cho Bên B các công việc nêu tại Mục III; Bên B trả tiền dịch vụ theo thỏa thuận (Điều 513 Bộ luật Dân sự 2015).",
        "Yêu cầu chi tiết, tiêu chuẩn chất lượng và mốc bàn giao (nếu có) được các bên thống nhất bằng phụ lục hoặc văn bản trao đổi có xác nhận của hai bên.",
      ]],
      ["GIÁ DỊCH VỤ VÀ THANH TOÁN", [
        "Bên B thanh toán theo giá trị và tiến độ nêu tại Mục III bằng chuyển khoản vào tài khoản của Bên A.",
        "Bên A xuất hóa đơn giá trị gia tăng hợp lệ cho mỗi lần thanh toán theo quy định pháp luật về hóa đơn.",
      ]],
      ["QUYỀN VÀ NGHĨA VỤ CỦA BÊN A", [
        "Thực hiện công việc đúng chất lượng, số lượng, thời hạn, địa điểm và các thỏa thuận khác.",
        "Không giao cho người khác thực hiện thay công việc nếu không có sự đồng ý của Bên B.",
        "Bảo quản, giao lại tài liệu và phương tiện được giao; giữ bí mật thông tin biết được trong thời gian thực hiện dịch vụ.",
        "Được yêu cầu Bên B cung cấp thông tin, tài liệu cần thiết và thanh toán đầy đủ, đúng hạn.",
      ]],
      ["QUYỀN VÀ NGHĨA VỤ CỦA BÊN B", [
        "Cung cấp cho Bên A thông tin, tài liệu và phương tiện cần thiết để thực hiện công việc.",
        "Thanh toán đầy đủ, đúng hạn; nghiệm thu kết quả theo thỏa thuận.",
        "Được yêu cầu Bên A thực hiện công việc đúng thỏa thuận; được đơn phương chấm dứt và yêu cầu bồi thường khi Bên A vi phạm nghiêm trọng nghĩa vụ.",
      ]],
      PENALTY_COMMERCIAL,
      FORCE_MAJEURE,
      ["CHẤM DỨT HỢP ĐỒNG", [
        "Hợp đồng chấm dứt khi hoàn thành nghĩa vụ, theo thỏa thuận của các bên hoặc trường hợp khác theo Điều 422 Bộ luật Dân sự 2015.",
        "Một bên được đơn phương chấm dứt khi bên kia vi phạm nghiêm trọng nghĩa vụ (Điều 428 Bộ luật Dân sự 2015) và phải thông báo bằng văn bản trước ít nhất 15 ngày.",
      ]],
      DISPUTE,
      ESIGN,
    ]),
  },
  {
    id: "sale-goods-vehicle",
    name: "Hợp đồng mua bán hàng hóa / Tài sản",
    category: "Mua bán & Tài sản",
    summary: "Theo BLDS 2015 (Điều 430 trở đi) và Luật Thương mại 2005. Xe, nhà đất mua bán giữa cá nhân phải công chứng/chứng thực để đăng ký.",
    legalBasis: [BLDS, LTM, LGDDT, NHU_CAU],
    partyATitle: "BÊN BÁN (BÊN A)",
    partyBTitle: "BÊN MUA (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên bên bán (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế / Số CCCD Bên A", section: "partyA" },
      { key: "dia_chi_ben_a", label: "Địa chỉ Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "stk_ben_a", label: "Số tài khoản, ngân hàng Bên A", section: "partyA" },
      { key: "ten_ben_b", label: "Tên bên mua (Bên B)", section: "partyB" },
      { key: "mst_ben_b", label: "Mã số thuế / Số CCCD Bên B", section: "partyB" },
      { key: "dia_chi_ben_b", label: "Địa chỉ Bên B", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "ten_hang_hoa_tai_san", label: "Tên hàng hóa / Tài sản", section: "transaction" },
      { key: "so_luong_hang_hoa", label: "Số lượng, đơn vị tính", section: "transaction" },
      { key: "thong_so_ky_thuat", label: "Quy cách, chất lượng, thông số kỹ thuật", section: "transaction" },
      { key: "gia_tri_hop_dong", label: "Tổng giá bán (VNĐ, đã gồm VAT)", section: "transaction" },
      { key: "phuong_thuc_thanh_toan", label: "Phương thức & thời hạn thanh toán", section: "transaction" },
      { key: "dia_diem_ban_giao", label: "Địa điểm giao nhận", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày giao hàng", section: "transaction" },
      { key: "thoi_gian_bao_hanh", label: "Thời hạn bảo hành", section: "transaction" },
      { key: "muc_phat_vi_pham", label: "Mức phạt vi phạm (tỷ lệ %, tối đa 8%)", section: "transaction" },
    ],
    clauses: numbered([
      ["QUYỀN SỞ HỮU VÀ CHẤT LƯỢNG", [
        "Bên A bảo đảm hàng hóa/tài sản thuộc quyền sở hữu hợp pháp của mình hoặc mình có quyền bán, không bị tranh chấp, không bị kê biên hay dùng để bảo đảm nghĩa vụ khác.",
        "Hàng hóa/tài sản đúng số lượng, quy cách, chất lượng nêu tại Mục III và kèm đầy đủ giấy tờ chứng minh nguồn gốc.",
      ]],
      ["GIAO NHẬN VÀ KIỂM TRA", [
        "Bên A giao hàng tại địa điểm và thời gian nêu tại Mục III; hai bên lập biên bản giao nhận ghi rõ số lượng, tình trạng hàng hóa.",
        "Bên B có quyền kiểm tra trước khi nhận; nếu phát hiện không phù hợp, Bên B thông báo cho Bên A ngay khi nhận hàng để được đổi, bổ sung hoặc giảm giá.",
      ]],
      ["CHUYỂN QUYỀN SỞ HỮU VÀ RỦI RO", [
        "Quyền sở hữu và rủi ro đối với hàng hóa chuyển sang Bên B từ thời điểm giao nhận, trừ trường hợp các bên có thỏa thuận khác.",
        "Đối với tài sản phải đăng ký quyền sở hữu (xe cơ giới, tàu thuyền, quyền sử dụng đất...), các bên có trách nhiệm thực hiện thủ tục công chứng, chứng thực và đăng ký theo quy định của pháp luật chuyên ngành.",
      ]],
      ["THANH TOÁN", [
        "Bên B thanh toán theo giá và phương thức nêu tại Mục III; Bên A xuất hóa đơn hoặc chứng từ hợp lệ theo quy định.",
      ]],
      ["BẢO HÀNH", [
        "Bên A bảo hành hàng hóa/tài sản trong thời hạn nêu tại Mục III, tính từ ngày giao nhận.",
        "Trong thời hạn bảo hành, Bên A sửa chữa miễn phí hoặc thay thế hàng hóa có khuyết tật do lỗi sản xuất; không bảo hành hư hỏng do Bên B sử dụng sai hướng dẫn.",
      ]],
      PENALTY_COMMERCIAL,
      FORCE_MAJEURE,
      DISPUTE,
      ESIGN,
    ]),
  },
  {
    id: "labor-contract",
    name: "Hợp đồng lao động xác định thời hạn",
    category: "Nhân sự & Lao động",
    summary: "Đủ nội dung bắt buộc theo Điều 21 BLLĐ 2019 và Thông tư 10/2020. Bản điện tử chính thức phải ký số qua nhà cung cấp eContract theo Nghị định 337/2025.",
    legalBasis: [
      BLLD,
      "Nghị định số 337/2025/NĐ-CP ngày 24/12/2025 quy định về hợp đồng lao động điện tử",
      "Thông tư số 10/2020/TT-BLĐTBXH ngày 12/11/2020 hướng dẫn nội dung hợp đồng lao động",
      LGDDT,
      NHU_CAU,
    ],
    partyATitle: "NGƯỜI SỬ DỤNG LAO ĐỘNG (BÊN A)",
    partyBTitle: "NGƯỜI LAO ĐỘNG (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế Bên A", section: "partyA" },
      { key: "dia_chi_ben_a", label: "Địa chỉ trụ sở Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Họ tên người giao kết bên phía Bên A", section: "partyA" },
      { key: "chuc_vu_ben_a", label: "Chức danh người giao kết", section: "partyA" },
      { key: "ho_ten_nhan_vien", label: "Họ và tên người lao động", section: "partyB" },
      { key: "sinh_ngay_nhan_vien", label: "Ngày, tháng, năm sinh", section: "partyB" },
      { key: "gioi_tinh_nhan_vien", label: "Giới tính", section: "partyB" },
      { key: "cccd_nhan_vien", label: "Số CCCD / Định danh cá nhân (ngày cấp, nơi cấp)", section: "partyB" },
      { key: "dia_chi_nhan_vien", label: "Nơi cư trú", section: "partyB" },
      { key: "vi_tri_cong_viec", label: "Công việc phải làm / Chức danh chuyên môn", section: "transaction" },
      { key: "dia_diem_lam_viec", label: "Địa điểm làm việc", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày bắt đầu làm việc", section: "transaction" },
      { key: "thoi_han_hop_dong", label: "Thời hạn hợp đồng (không quá 36 tháng)", section: "transaction" },
      { key: "muc_luong_chinh", label: "Mức lương theo công việc, chức danh (VNĐ/tháng)", section: "transaction" },
      { key: "phu_cap_luong", label: "Phụ cấp lương (VNĐ/tháng)", section: "transaction" },
      { key: "cac_khoan_bo_sung", label: "Các khoản bổ sung khác", section: "transaction" },
      { key: "hinh_thuc_tra_luong", label: "Hình thức trả lương (tiền mặt / chuyển khoản)", section: "transaction" },
      { key: "ky_han_tra_luong", label: "Kỳ hạn trả lương (VD: ngày 05 hằng tháng)", section: "transaction" },
      { key: "thoi_gio_lam_viec", label: "Thời giờ làm việc (VD: 8 giờ/ngày, thứ Hai – thứ Sáu)", section: "transaction" },
    ],
    clauses: numbered([
      ["CÔNG VIỆC, ĐỊA ĐIỂM VÀ THỜI HẠN HỢP ĐỒNG", [
        "Người lao động làm công việc, tại địa điểm và trong thời hạn nêu tại Mục III; thời hạn hợp đồng không quá 36 tháng (Điều 20 Bộ luật Lao động 2019).",
        "Khi hợp đồng hết hạn mà người lao động vẫn tiếp tục làm việc, trong thời hạn 30 ngày hai bên phải ký hợp đồng lao động mới; nếu không ký, hợp đồng này trở thành hợp đồng không xác định thời hạn.",
        "Thử việc (nếu có) được thỏa thuận riêng theo Điều 24 đến Điều 27 Bộ luật Lao động 2019.",
      ]],
      ["TIỀN LƯƠNG, PHỤ CẤP VÀ CHẾ ĐỘ NÂNG LƯƠNG", [
        "Người sử dụng lao động trả lương trực tiếp, đầy đủ, đúng hạn cho người lao động theo mức, hình thức và kỳ hạn nêu tại Mục III.",
        "Mức lương không thấp hơn mức lương tối thiểu vùng do Chính phủ quy định tại thời điểm trả lương.",
        "Người lao động được xét nâng bậc, nâng lương theo quy chế lương, thưởng của doanh nghiệp và kết quả thực hiện công việc.",
      ]],
      ["THỜI GIỜ LÀM VIỆC, THỜI GIỜ NGHỈ NGƠI", [
        "Thời giờ làm việc bình thường không quá 08 giờ trong 01 ngày và không quá 48 giờ trong 01 tuần (Điều 105 Bộ luật Lao động 2019).",
        "Người lao động được nghỉ hằng tuần, nghỉ lễ, Tết (Điều 112) và nghỉ hằng năm hưởng nguyên lương (Điều 113) theo Bộ luật Lao động 2019 và nội quy lao động.",
      ]],
      ["TRANG BỊ BẢO HỘ LAO ĐỘNG", [
        "Người sử dụng lao động trang bị phương tiện bảo vệ cá nhân, bảo đảm điều kiện an toàn, vệ sinh lao động phù hợp với công việc theo quy định pháp luật.",
      ]],
      ["BẢO HIỂM XÃ HỘI, BẢO HIỂM Y TẾ, BẢO HIỂM THẤT NGHIỆP", [
        "Hai bên tham gia bảo hiểm xã hội bắt buộc, bảo hiểm y tế và bảo hiểm thất nghiệp theo quy định pháp luật.",
        "Người sử dụng lao động đóng phần trách nhiệm của mình và trích từ tiền lương phần người lao động phải đóng để nộp cùng một lúc.",
      ]],
      ["ĐÀO TẠO, BỒI DƯỠNG, NÂNG CAO TRÌNH ĐỘ", [
        "Người lao động được tham gia đào tạo, bồi dưỡng theo kế hoạch của doanh nghiệp; quyền lợi, nghĩa vụ và chi phí đào tạo (nếu có) được thỏa thuận bằng hợp đồng đào tạo riêng.",
      ]],
      ["NGHĨA VỤ CỦA NGƯỜI LAO ĐỘNG", [
        "Hoàn thành công việc được giao; chấp hành nội quy lao động, quy chế của doanh nghiệp và sự điều hành hợp pháp của người sử dụng lao động.",
        "Giữ bí mật kinh doanh, bí mật công nghệ của doanh nghiệp; bồi thường thiệt hại khi vi phạm theo quy định pháp luật.",
      ]],
      ["CHẤM DỨT HỢP ĐỒNG LAO ĐỘNG", [
        "Hợp đồng chấm dứt trong các trường hợp quy định tại Điều 34 Bộ luật Lao động 2019.",
        "Khi đơn phương chấm dứt, mỗi bên phải báo trước theo Điều 35 (người lao động) hoặc Điều 36 (người sử dụng lao động) Bộ luật Lao động 2019: ít nhất 30 ngày đối với hợp đồng từ 12 đến 36 tháng, ít nhất 03 ngày làm việc đối với hợp đồng dưới 12 tháng.",
      ]],
      ["GIẢI QUYẾT TRANH CHẤP LAO ĐỘNG", [
        "Tranh chấp phát sinh được giải quyết theo trình tự giải quyết tranh chấp lao động cá nhân quy định tại Bộ luật Lao động 2019 (hòa giải viên lao động, Hội đồng trọng tài lao động hoặc Tòa án).",
      ]],
      ["GIAO KẾT ĐIỆN TỬ VÀ HIỆU LỰC", [
        "Hợp đồng lao động được giao kết thông qua phương tiện điện tử dưới hình thức thông điệp dữ liệu theo quy định của pháp luật về giao dịch điện tử có giá trị như hợp đồng lao động bằng văn bản (khoản 1 Điều 14 Bộ luật Lao động 2019).",
        "Việc ký, chứng thực và lưu trữ hợp đồng lao động điện tử thực hiện theo Nghị định số 337/2025/NĐ-CP; hợp đồng có hiệu lực từ thời điểm bên sau cùng ký, trừ trường hợp các bên có thỏa thuận khác.",
        "Người sử dụng lao động gửi bản hợp đồng đã ký hoàn tất cho người lao động để lưu giữ.",
      ]],
    ]),
  },
  {
    id: "office-lease",
    name: "Hợp đồng thuê văn phòng / Mặt bằng kinh doanh",
    category: "Bất động sản & Thuê",
    summary: "Theo BLDS 2015 (Điều 472 trở đi, đặt cọc Điều 328); áp dụng thêm Luật Kinh doanh BĐS 2023 nếu bên cho thuê kinh doanh bất động sản.",
    legalBasis: [
      BLDS,
      "Luật Kinh doanh bất động sản số 29/2023/QH15 (trường hợp Bên cho thuê kinh doanh bất động sản)",
      LGDDT,
      NHU_CAU,
    ],
    partyATitle: "BÊN CHO THUÊ (BÊN A)",
    partyBTitle: "BÊN THUÊ (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên bên cho thuê (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế / Số CCCD Bên A", section: "partyA" },
      { key: "dia_chi_ben_a", label: "Địa chỉ Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "stk_ben_a", label: "Số tài khoản, ngân hàng Bên A", section: "partyA" },
      { key: "ten_ben_b", label: "Tên bên thuê (Bên B)", section: "partyB" },
      { key: "mst_ben_b", label: "Mã số thuế / Số CCCD Bên B", section: "partyB" },
      { key: "dia_chi_ben_b", label: "Địa chỉ Bên B", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "dia_chi_mat_bang", label: "Địa chỉ mặt bằng / Văn phòng cho thuê", section: "transaction" },
      { key: "dien_tich_thue", label: "Diện tích thuê (m2)", section: "transaction" },
      { key: "muc_dich_thue", label: "Mục đích sử dụng", section: "transaction" },
      { key: "gia_thue_hang_thang", label: "Giá thuê hàng tháng (VNĐ/tháng)", section: "transaction" },
      { key: "phuong_thuc_thanh_toan", label: "Kỳ và phương thức thanh toán tiền thuê", section: "transaction" },
      { key: "tien_dat_coc", label: "Số tiền đặt cọc (VNĐ)", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày bàn giao mặt bằng", section: "transaction" },
      { key: "thoi_han_hop_dong", label: "Thời hạn thuê", section: "transaction" },
    ],
    clauses: numbered([
      ["ĐỐI TƯỢNG VÀ MỤC ĐÍCH THUÊ", [
        "Bên A cho Bên B thuê mặt bằng nêu tại Mục III để sử dụng đúng mục đích đã thỏa thuận (Điều 472 Bộ luật Dân sự 2015).",
        "Bên A bảo đảm có quyền cho thuê hợp pháp, mặt bằng không có tranh chấp và đủ điều kiện để Bên B hoạt động theo mục đích thuê.",
      ]],
      ["GIÁ THUÊ VÀ THANH TOÁN", [
        "Giá thuê được giữ cố định trong thời hạn thuê, trừ trường hợp hai bên có thỏa thuận điều chỉnh bằng văn bản.",
        "Chi phí điện, nước, internet, phí dịch vụ tòa nhà do Bên B thanh toán theo thực tế sử dụng, trừ trường hợp có thỏa thuận khác.",
      ]],
      ["ĐẶT CỌC", [
        "Bên B giao cho Bên A khoản tiền đặt cọc nêu tại Mục III để bảo đảm thực hiện hợp đồng (Điều 328 Bộ luật Dân sự 2015).",
        "Khi hợp đồng chấm dứt đúng thỏa thuận, Bên A hoàn trả tiền cọc cho Bên B sau khi đối trừ các khoản còn nợ (nếu có) trong vòng 15 ngày.",
        "Nếu Bên B đơn phương chấm dứt trái thỏa thuận thì mất tiền cọc; nếu Bên A đơn phương chấm dứt trái thỏa thuận thì phải trả lại tiền cọc và một khoản tiền tương đương giá trị tiền cọc, trừ trường hợp có thỏa thuận khác.",
      ]],
      ["QUYỀN VÀ NGHĨA VỤ CỦA BÊN A", [
        "Bàn giao mặt bằng đúng diện tích, tình trạng và thời điểm đã thỏa thuận; bảo đảm cho Bên B sử dụng ổn định trong thời hạn thuê.",
        "Sửa chữa hư hỏng lớn về kết cấu không do lỗi của Bên B gây ra.",
      ]],
      ["QUYỀN VÀ NGHĨA VỤ CỦA BÊN B", [
        "Sử dụng mặt bằng đúng mục đích; trả tiền thuê đầy đủ, đúng hạn.",
        "Không cho thuê lại khi chưa có sự đồng ý bằng văn bản của Bên A; cải tạo, sửa chữa phải được Bên A đồng ý.",
        "Hoàn trả mặt bằng khi chấm dứt hợp đồng trong tình trạng như khi nhận, trừ hao mòn tự nhiên.",
      ]],
      ["ĐƠN PHƯƠNG CHẤM DỨT HỢP ĐỒNG", [
        "Bên A được đơn phương chấm dứt khi Bên B chậm trả tiền thuê quá 30 ngày, sử dụng sai mục đích hoặc cho thuê lại trái thỏa thuận.",
        "Bên B được đơn phương chấm dứt khi Bên A không bàn giao mặt bằng hoặc không bảo đảm cho Bên B sử dụng ổn định.",
        "Bên đơn phương chấm dứt phải thông báo bằng văn bản cho bên kia trước ít nhất 30 ngày.",
      ]],
      FORCE_MAJEURE,
      DISPUTE,
      ESIGN,
    ]),
  },
  {
    id: "freelance-service",
    name: "Hợp đồng dịch vụ với cá nhân (Cộng tác viên / Khoán việc)",
    category: "Nhân sự & Lao động",
    summary: "Hợp đồng dịch vụ theo BLDS 2015. Nếu thực tế có trả lương và chịu quản lý, điều hành thì là hợp đồng lao động (Điều 13 BLLĐ 2019).",
    legalBasis: [BLDS, LGDDT, NHU_CAU],
    partyATitle: "BÊN SỬ DỤNG DỊCH VỤ (BÊN A)",
    partyBTitle: "BÊN CUNG ỨNG DỊCH VỤ (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế Bên A", section: "partyA" },
      { key: "dia_chi_ben_a", label: "Địa chỉ trụ sở Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "ho_ten_nhan_vien", label: "Họ và tên cá nhân (Bên B)", section: "partyB" },
      { key: "cccd_nhan_vien", label: "Số CCCD / Định danh cá nhân (ngày cấp, nơi cấp)", section: "partyB" },
      { key: "mst_nhan_vien", label: "Mã số thuế cá nhân", section: "partyB" },
      { key: "dia_chi_nhan_vien", label: "Nơi cư trú", section: "partyB" },
      { key: "stk_nhan_vien", label: "Số tài khoản, ngân hàng nhận thanh toán", section: "partyB" },
      { key: "noi_dung_dich_vu", label: "Công việc / Sản phẩm phải bàn giao", section: "transaction" },
      { key: "gia_tri_hop_dong", label: "Tổng thù lao (VNĐ, trước thuế TNCN)", section: "transaction" },
      { key: "phuong_thuc_thanh_toan", label: "Phương thức & tiến độ thanh toán", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày bắt đầu thực hiện", section: "transaction" },
      { key: "thoi_han_hop_dong", label: "Thời hạn hoàn thành, bàn giao", section: "transaction" },
    ],
    clauses: numbered([
      ["TÍNH CHẤT QUAN HỆ HỢP ĐỒNG", [
        "Đây là hợp đồng dịch vụ theo Điều 513 Bộ luật Dân sự 2015; Bên B thực hiện công việc nêu tại Mục III và nhận thù lao theo kết quả công việc.",
        "Bên B tự chủ về thời gian, phương pháp và công cụ thực hiện; không chịu sự quản lý, điều hành và không áp dụng nội quy lao động của Bên A.",
      ]],
      ["YÊU CẦU KẾT QUẢ VÀ NGHIỆM THU", [
        "Bên B bàn giao sản phẩm đúng nội dung, chất lượng và thời hạn nêu tại Mục III.",
        "Trong vòng 05 ngày làm việc kể từ khi nhận bàn giao, Bên A nghiệm thu hoặc thông báo bằng văn bản các nội dung cần chỉnh sửa; quá thời hạn trên mà không phản hồi thì xem như đã nghiệm thu.",
      ]],
      ["THÙ LAO VÀ THUẾ THU NHẬP CÁ NHÂN", [
        "Bên A thanh toán thù lao theo Mục III sau khi khấu trừ thuế thu nhập cá nhân theo quy định pháp luật về thuế và cấp chứng từ khấu trừ thuế cho Bên B.",
        "Bên B tự chịu trách nhiệm quyết toán thuế thu nhập cá nhân của mình (nếu có).",
      ]],
      ["QUYỀN ĐỐI VỚI SẢN PHẨM", [
        "Quyền sở hữu, quyền tài sản đối với sản phẩm thuộc về Bên A kể từ khi Bên A thanh toán đầy đủ thù lao, trừ trường hợp có thỏa thuận khác.",
        "Bên B bảo đảm sản phẩm không vi phạm quyền sở hữu trí tuệ của bên thứ ba.",
      ]],
      ["BẢO MẬT", [
        "Bên B giữ bí mật mọi thông tin, tài liệu biết được trong quá trình thực hiện công việc, kể cả sau khi hợp đồng chấm dứt.",
      ]],
      ["CHẤM DỨT HỢP ĐỒNG", [
        "Hợp đồng chấm dứt khi hoàn thành nghĩa vụ hoặc theo thỏa thuận; mỗi bên được đơn phương chấm dứt khi bên kia vi phạm nghiêm trọng nghĩa vụ (Điều 428 Bộ luật Dân sự 2015), thông báo trước ít nhất 07 ngày.",
        "Khi chấm dứt trước hạn, Bên A thanh toán thù lao tương ứng với phần công việc Bên B đã hoàn thành và được nghiệm thu.",
      ]],
      DISPUTE,
      ESIGN,
    ]),
  },
  {
    id: "nda-confidential",
    name: "Thỏa thuận bảo mật thông tin (NDA)",
    category: "Pháp lý & Bảo mật",
    summary: "Theo BLDS 2015 (Điều 387, phạt vi phạm Điều 418) và Luật Sở hữu trí tuệ về bí mật kinh doanh; có ngoại lệ, hoàn trả tài liệu và phạt vi phạm.",
    legalBasis: [
      BLDS,
      "Luật Sở hữu trí tuệ số 50/2005/QH11, sửa đổi, bổ sung năm 2009, 2019 và 2022",
      LGDDT,
      NHU_CAU,
    ],
    partyATitle: "BÊN TIẾT LỘ THÔNG TIN (BÊN A)",
    partyBTitle: "BÊN NHẬN THÔNG TIN (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế Bên A", section: "partyA" },
      { key: "dia_chi_ben_a", label: "Địa chỉ trụ sở Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "ten_ben_b", label: "Tên bên nhận thông tin (Bên B)", section: "partyB" },
      { key: "mst_ben_b", label: "Mã số thuế / Số CCCD Bên B", section: "partyB" },
      { key: "dia_chi_ben_b", label: "Địa chỉ Bên B", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "muc_dich_bao_mat", label: "Mục đích tiếp cận thông tin mật", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày bắt đầu hiệu lực", section: "transaction" },
      { key: "thoi_han_hop_dong", label: "Thời hạn nghĩa vụ bảo mật", section: "transaction" },
      { key: "muc_phat_vi_pham", label: "Mức phạt cho mỗi lần vi phạm", section: "transaction" },
    ],
    clauses: numbered([
      ["THÔNG TIN MẬT", [
        "Thông tin mật là mọi thông tin kỹ thuật, tài chính, kinh doanh, mã nguồn, dữ liệu khách hàng, báo giá và tài liệu khác do Bên A cung cấp cho Bên B dưới bất kỳ hình thức nào, bao gồm cả bí mật kinh doanh theo Luật Sở hữu trí tuệ.",
      ]],
      ["NGOẠI LỆ", [
        "Không bị coi là thông tin mật: thông tin đã được công khai không do lỗi của Bên B; thông tin Bên B đã có hợp pháp trước khi nhận; thông tin Bên B nhận hợp pháp từ bên thứ ba không có nghĩa vụ bảo mật.",
        "Bên B được cung cấp thông tin theo yêu cầu của cơ quan nhà nước có thẩm quyền, nhưng phải thông báo trước cho Bên A nếu pháp luật cho phép và chỉ cung cấp trong phạm vi được yêu cầu.",
      ]],
      ["NGHĨA VỤ CỦA BÊN NHẬN THÔNG TIN", [
        "Chỉ sử dụng thông tin mật cho mục đích nêu tại Mục III; không sao chép, tiết lộ cho bên thứ ba khi chưa có sự đồng ý bằng văn bản của Bên A.",
        "Chỉ cho nhân sự thực sự cần biết tiếp cận thông tin và bảo đảm những người này chịu nghĩa vụ bảo mật tương tự.",
        "Áp dụng biện pháp bảo vệ không thấp hơn mức Bên B dùng để bảo vệ thông tin mật của chính mình.",
      ]],
      ["HOÀN TRẢ VÀ HỦY THÔNG TIN", [
        "Trong vòng 07 ngày kể từ khi Bên A yêu cầu hoặc khi kết thúc hợp tác, Bên B hoàn trả hoặc hủy toàn bộ tài liệu chứa thông tin mật, kể cả bản sao điện tử, và xác nhận bằng văn bản với Bên A.",
      ]],
      ["KHÔNG CHUYỂN GIAO QUYỀN", [
        "Việc cung cấp thông tin mật không làm phát sinh cho Bên B bất kỳ quyền sở hữu, quyền sở hữu trí tuệ hay quyền sử dụng nào đối với thông tin đó.",
      ]],
      ["PHẠT VI PHẠM VÀ BỒI THƯỜNG THIỆT HẠI", [
        "Bên B vi phạm nghĩa vụ bảo mật phải chịu phạt theo mức nêu tại Mục III (Điều 418 Bộ luật Dân sự 2015) và bồi thường toàn bộ thiệt hại thực tế phát sinh cho Bên A.",
      ]],
      ["THỜI HẠN BẢO MẬT", [
        "Nghĩa vụ bảo mật có hiệu lực trong thời hạn nêu tại Mục III, kể cả khi quan hệ hợp tác giữa các bên đã chấm dứt.",
      ]],
      DISPUTE,
      ESIGN,
    ]),
  },
  {
    id: "acceptance-handover",
    name: "Biên bản nghiệm thu & Bàn giao công việc",
    category: "Nghiệm thu & Thanh lý",
    summary: "Xác nhận khối lượng, chất lượng đã bàn giao theo hợp đồng gốc; làm căn cứ xuất hóa đơn và thanh toán đợt.",
    legalBasis: [BLDS, "Hợp đồng gốc đã ký giữa hai bên nêu tại Mục III", "Kết quả thực hiện công việc thực tế"],
    partyATitle: "BÊN GIAO (BÊN A)",
    partyBTitle: "BÊN NHẬN (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp bàn giao (Bên A)", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "chuc_vu_ben_a", label: "Chức vụ", section: "partyA" },
      { key: "ten_ben_b", label: "Tên doanh nghiệp nhận bàn giao (Bên B)", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "chuc_vu_ben_b", label: "Chức vụ", section: "partyB" },
      { key: "so_hop_dong_goc", label: "Số và ngày ký hợp đồng gốc", section: "transaction" },
      { key: "noi_dung_dich_vu", label: "Hạng mục, khối lượng nghiệm thu", section: "transaction" },
      { key: "ket_qua_nghiem_thu", label: "Kết quả đánh giá (đạt / tồn tại cần khắc phục)", section: "transaction" },
      { key: "gia_tri_hop_dong", label: "Giá trị nghiệm thu đợt này (VNĐ)", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày nghiệm thu", section: "transaction" },
    ],
    clauses: numbered([
      ["NỘI DUNG NGHIỆM THU", [
        "Hai bên đã cùng kiểm tra, đối chiếu hạng mục và khối lượng nêu tại Mục III với yêu cầu của hợp đồng gốc.",
      ]],
      ["KẾT LUẬN", [
        "Hạng mục đạt yêu cầu được Bên B chấp nhận và nhận bàn giao kể từ ngày nghiệm thu.",
        "Các tồn tại (nếu có) được Bên A khắc phục trong thời hạn hai bên thống nhất và nghiệm thu bổ sung bằng biên bản riêng.",
      ]],
      ["CĂN CỨ THANH TOÁN", [
        "Biên bản này là căn cứ để Bên A xuất hóa đơn và Bên B thanh toán giá trị nghiệm thu theo điều khoản thanh toán của hợp đồng gốc.",
      ]],
      ["HIỆU LỰC", [
        "Biên bản là bộ phận không tách rời của hợp đồng gốc, được ký điện tử trên nền tảng TrustSign theo Luật Giao dịch điện tử 2023 và có hiệu lực từ thời điểm bên cuối cùng hoàn tất ký.",
      ]],
    ]),
  },
  {
    id: "contract-liquidation",
    name: "Biên bản thanh lý hợp đồng",
    category: "Nghiệm thu & Thanh lý",
    summary: "Xác nhận đã hoàn thành nghĩa vụ, quyết toán công nợ và chấm dứt hợp đồng (Điều 422 BLDS 2015).",
    legalBasis: [BLDS, "Hợp đồng gốc đã ký giữa hai bên nêu tại Mục III", "Tình hình thực hiện hợp đồng thực tế"],
    partyATitle: "BÊN A",
    partyBTitle: "BÊN B",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp (Bên A)", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "chuc_vu_ben_a", label: "Chức vụ", section: "partyA" },
      { key: "ten_ben_b", label: "Tên đối tác (Bên B)", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "chuc_vu_ben_b", label: "Chức vụ", section: "partyB" },
      { key: "so_hop_dong_goc", label: "Số và ngày ký hợp đồng cần thanh lý", section: "transaction" },
      { key: "gia_tri_hop_dong", label: "Tổng giá trị đã thực hiện (VNĐ)", section: "transaction" },
      { key: "gia_tri_da_thanh_toan", label: "Số tiền đã thanh toán (VNĐ)", section: "transaction" },
      { key: "gia_tri_con_lai", label: "Số tiền còn phải thanh toán (VNĐ)", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày thanh lý", section: "transaction" },
    ],
    clauses: numbered([
      ["TÌNH HÌNH THỰC HIỆN HỢP ĐỒNG", [
        "Hai bên xác nhận đã thực hiện các nội dung của hợp đồng gốc nêu tại Mục III theo đúng thỏa thuận.",
      ]],
      ["QUYẾT TOÁN", [
        "Số tiền còn phải thanh toán nêu tại Mục III được thanh toán trong vòng 15 ngày kể từ ngày ký biên bản này.",
        "Sau khi khoản trên được thanh toán đầy đủ, hai bên không còn công nợ nào phát sinh từ hợp đồng gốc.",
      ]],
      ["NGHĨA VỤ CÒN HIỆU LỰC SAU THANH LÝ", [
        "Các nghĩa vụ bảo hành, bảo mật và giải quyết tranh chấp đã thỏa thuận trong hợp đồng gốc tiếp tục có hiệu lực theo thời hạn đã cam kết.",
      ]],
      ["HIỆU LỰC", [
        "Hợp đồng gốc chấm dứt kể từ thời điểm hai bên hoàn tất ký biên bản này (Điều 422 Bộ luật Dân sự 2015).",
        "Biên bản được ký điện tử trên nền tảng TrustSign theo Luật Giao dịch điện tử 2023.",
      ]],
    ]),
  },
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
