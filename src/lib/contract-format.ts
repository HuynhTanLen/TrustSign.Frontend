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
  dai_dien_ben_a: "Người đại diện pháp luật Bên A",
  chuc_vu_ben_a: "Chức vụ đại diện Bên A",
  dia_chi_ben_a: "Địa chỉ trụ sở Bên A",
  sdt_ben_a: "Số điện thoại Bên A",
  stk_ben_a: "Số tài khoản ngân hàng Bên A",

  // Bên B
  ten_ben_b: "Tên đối tác / Khách hàng (Bên B)",
  mst_ben_b: "Mã số thuế / Số CCCD Bên B",
  dai_dien_ben_b: "Người đại diện Bên B",
  chuc_vu_ben_b: "Chức vụ đại diện Bên B",
  dia_chi_ben_b: "Địa chỉ liên hệ Bên B",
  sdt_ben_b: "Số điện thoại Bên B",
  ho_ten_nhan_vien: "Họ và tên người lao động",
  cccd_nhan_vien: "Số CCCD / Định danh cá nhân",
  dia_chi_thuong_tru: "Địa chỉ thường trú",

  // Nội dung giao dịch & Điều khoản
  ngay_hieu_luc: "Ngày bắt đầu hiệu lực",
  thoi_han_hop_dong: "Thời hạn thực hiện hợp đồng",
  gia_tri_hop_dong: "Tổng giá trị hợp đồng (VNĐ)",
  phuong_thuc_thanh_toan: "Phương thức & tiến độ thanh toán",
  noi_dung_dich_vu: "Nội dung công việc / Dịch vụ cung cấp",
  ten_hang_hoa_tai_san: "Tên hàng hóa / Tài sản mua bán",
  thong_so_ky_thuat: "Thông số chi tiết (Biển số / Số khung / Quy cách)",
  dia_diem_ban_giao: "Địa điểm bàn giao",
  thoi_gian_bao_hanh: "Thời hạn bảo hành",
  vi_tri_cong_viec: "Vị trí chuyên môn / Chức danh",
  muc_luong_chinh: "Mức lương chính (VNĐ/tháng)",
  dia_diem_lam_viec: "Địa điểm làm việc",
  dia_chi_mat_bang: "Địa chỉ mặt bằng / Văn phòng cho thuê",
  dien_tich_thue: "Diện tích thuê (m2)",
  gia_thue_hang_thang: "Giá thuê hàng tháng (VNĐ/tháng)",
  tien_dat_coc: "Số tiền đặt cọc (VNĐ)",
  muc_dich_bao_mat: "Mục đích trao đổi thông tin bảo mật",
  so_hop_dong_goc: "Số hợp đồng gốc căn cứ",
  ket_qua_nghiem_thu: "Kết quả đánh giá nghiệm thu",
};

/** Chuyển nhãn tiếng Việt bất kỳ (VD: "Biển số xe") sang mã biến chuẩn "bien_so_xe" */
export function slugifyVariableName(input: string): string {
  return input
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * 8 Mẫu hợp đồng thông dụng nhất tại Việt Nam để người dùng tham khảo và chọn dùng ngay.
 */
export const REFERENCE_TEMPLATES: ContractBlueprint[] = [
  {
    id: "b2b-service",
    name: "Hợp đồng cung cấp dịch vụ (B2B)",
    category: "Dịch vụ & Thương mại",
    summary: "Mẫu thông dụng nhất khi cung cấp dịch vụ phần mềm, tư vấn, marketing, vận chuyển cho doanh nghiệp.",
    partyATitle: "BÊN CUNG CẤP DỊCH VỤ (BÊN A)",
    partyBTitle: "BÊN SỬ DỤNG DỊCH VỤ (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện pháp luật Bên A", section: "partyA" },
      { key: "dia_chi_ben_a", label: "Địa chỉ trụ sở Bên A", section: "partyA" },
      { key: "ten_ben_b", label: "Tên đối tác / Khách hàng (Bên B)", section: "partyB" },
      { key: "mst_ben_b", label: "Mã số thuế Bên B", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "noi_dung_dich_vu", label: "Nội dung dịch vụ cung cấp", section: "transaction" },
      { key: "gia_tri_hop_dong", label: "Tổng giá trị hợp đồng (VNĐ)", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày bắt đầu hiệu lực", section: "transaction" },
      { key: "thoi_han_hop_dong", label: "Thời hạn thực hiện hợp đồng", section: "transaction" },
    ],
    clauses: [
      {
        title: "ĐIỀU 1. PHẠM VI CÔNG VIỆC VÀ THỜI HẠN THỰC HIỆN",
        body: "Bên A cam kết thực hiện và cung cấp dịch vụ theo đúng yêu cầu chuyên môn đã thống nhất với Bên B. Thời gian thực hiện hợp đồng được tính từ ngày hiệu lực cho đến khi hoàn thành nghĩa vụ nghiệm thu.",
      },
      {
        title: "ĐIỀU 2. GIÁ TRỊ HỢP ĐỒNG VÀ PHƯƠNG THỨC THANH TOÁN",
        body: "Bên B có trách nhiệm thanh toán đầy đủ giá trị hợp đồng cho Bên A bằng hình thức chuyển khoản ngân hàng theo hóa đơn tài chính hợp lệ.",
      },
      {
        title: "ĐIỀU 3. QUYỀN VÀ TRÁCH NHIỆM CỦA CÁC BÊN",
        body: "Bên A bảo đảm chất lượng dịch vụ, tiến độ bàn giao và bảo mật dữ liệu của Bên B. Bên B có trách nhiệm phối hợp cung cấp thông tin và thanh toán đúng hạn.",
      },
      {
        title: "ĐIỀU 4. ĐIỀU KHOẢN CHUNG VÀ HIỆU LỰC PHÁP LÝ",
        body: "Hợp đồng này được giao kết bằng phương thức điện tử theo Luật Giao dịch điện tử 2023. Chữ ký số của đại diện hai bên có giá trị pháp lý tương đương hợp đồng giấy.",
      },
    ],
  },
  {
    id: "sale-goods-vehicle",
    name: "Hợp đồng mua bán hàng hóa / Tài sản / Xe",
    category: "Mua bán & Tài sản",
    summary: "Dùng cho mua bán thiết bị, máy móc, phương tiện (ô tô, xe máy), lô hàng thương mại kèm bảo hành.",
    partyATitle: "BÊN BÁN (BÊN A)",
    partyBTitle: "BÊN MUA (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên đơn vị bán (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế / CCCD Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "ten_ben_b", label: "Tên bên mua (Bên B)", section: "partyB" },
      { key: "mst_ben_b", label: "Mã số thuế / CCCD Bên B", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "ten_hang_hoa_tai_san", label: "Tên hàng hóa / Tài sản mua bán", section: "transaction" },
      { key: "thong_so_ky_thuat", label: "Thông số chi tiết (Biển số / Số khung / Quy cách)", section: "transaction" },
      { key: "gia_tri_hop_dong", label: "Tổng giá bán (VNĐ)", section: "transaction" },
      { key: "dia_diem_ban_giao", label: "Địa điểm bàn giao tài sản", section: "transaction" },
      { key: "thoi_gian_bao_hanh", label: "Thời hạn bảo hành", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày ký kết & bàn giao", section: "transaction" },
    ],
    clauses: [
      {
        title: "ĐIỀU 1. CHẤT LƯỢNG VÀ NGUỒN GỐC TÀI SẢN",
        body: "Bên A cam đoan hàng hóa/tài sản nêu trên thuộc quyền sở hữu hợp pháp của Bên A, đúng thông số kỹ thuật, không có tranh chấp và đủ điều kiện lưu hành theo quy định pháp luật.",
      },
      {
        title: "ĐIỀU 2. BÀN GIAO VÀ CHUYỂN QUYỀN SỞ HỮU",
        body: "Bên A bàn giao tài sản cùng toàn bộ hồ sơ, chứng từ gốc cho Bên B tại địa điểm đã thỏa thuận ngay sau khi Bên B hoàn tất nghĩa vụ thanh toán.",
      },
      {
        title: "ĐIỀU 3. CHẾ ĐỘ BẢO HÀNH VÀ HỖ TRỢ KỸ THUẬT",
        body: "Bên A chịu trách nhiệm bảo hành kỹ thuật cho tài sản trong suốt thời hạn bảo hành đã cam kết.",
      },
    ],
  },
  {
    id: "labor-contract",
    name: "Hợp đồng lao động xác định thời hạn",
    category: "Nhân sự & Lao động",
    summary: "Mẫu chuẩn theo Bộ luật Lao động: chức danh chuyên môn, địa điểm làm việc, mức lương và bảo hiểm.",
    partyATitle: "NGƯỜI SỬ DỤNG LAO ĐỘNG (BÊN A)",
    partyBTitle: "NGƯỜI LAO ĐỘNG (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "ho_ten_nhan_vien", label: "Họ và tên người lao động", section: "partyB" },
      { key: "cccd_nhan_vien", label: "Số CCCD / Định danh cá nhân", section: "partyB" },
      { key: "dia_chi_thuong_tru", label: "Địa chỉ thường trú", section: "partyB" },
      { key: "vi_tri_cong_viec", label: "Vị trí chuyên môn / Chức danh", section: "transaction" },
      { key: "dia_diem_lam_viec", label: "Địa điểm làm việc", section: "transaction" },
      { key: "muc_luong_chinh", label: "Mức lương chính (VNĐ/tháng)", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày bắt đầu làm việc", section: "transaction" },
      { key: "thoi_han_hop_dong", label: "Thời hạn hợp đồng lao động", section: "transaction" },
    ],
    clauses: [
      {
        title: "ĐIỀU 1. CHẾ ĐỘ LÀM VIỆC VÀ NGHỈ NGƠI",
        body: "Thời giờ làm việc 08 giờ/ngày theo nội quy lao động của Công ty. Người lao động được nghỉ hàng tuần, nghỉ lễ, Tết và nghỉ phép năm hưởng nguyên lương theo Bộ luật Lao động.",
      },
      {
        title: "ĐIỀU 2. QUYỀN LỢI VÀ NGHĨA VỤ CỦA NGƯỜI LAO ĐỘNG",
        body: "Người lao động được thanh toán lương đúng hạn hàng tháng, được tham gia đầy đủ BHXH, BHYT, BHTN và cam kết chấp hành nội quy, bảo mật thông tin của doanh nghiệp.",
      },
    ],
  },
  {
    id: "office-lease",
    name: "Hợp đồng thuê văn phòng / Mặt bằng kinh doanh",
    category: "Bất động sản & Thuê",
    summary: "Dùng khi thuê hoặc cho thuê văn phòng, cửa hàng, kho bãi với điều khoản tiền thuê và đặt cọc rõ ràng.",
    partyATitle: "BÊN CHO THUÊ (BÊN A)",
    partyBTitle: "BÊN THUÊ (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên bên cho thuê (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế / CCCD Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "ten_ben_b", label: "Tên bên thuê (Bên B)", section: "partyB" },
      { key: "mst_ben_b", label: "Mã số thuế / CCCD Bên B", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "dia_chi_mat_bang", label: "Địa chỉ mặt bằng / Văn phòng cho thuê", section: "transaction" },
      { key: "dien_tich_thue", label: "Diện tích thuê (m2)", section: "transaction" },
      { key: "gia_thue_hang_thang", label: "Giá thuê hàng tháng (VNĐ/tháng)", section: "transaction" },
      { key: "tien_dat_coc", label: "Số tiền đặt cọc bảo đảm (VNĐ)", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày bàn giao mặt bằng", section: "transaction" },
      { key: "thoi_han_hop_dong", label: "Thời hạn thuê", section: "transaction" },
    ],
    clauses: [
      {
        title: "ĐIỀU 1. MỤC ĐÍCH THUÊ VÀ BÀN GIAO MẶT BẰNG",
        body: "Bên A đồng ý cho Bên B thuê phần diện tích mặt bằng nêu trên để làm văn phòng làm việc và hoạt động kinh doanh hợp pháp.",
      },
      {
        title: "ĐIỀU 2. ĐẶT CỌC VÀ THANH TOÁN TIỀN THUÊ",
        body: "Khoản tiền đặt cọc được giữ suốt thời hạn thuê và hoàn trả cho Bên B khi chấm dứt hợp đồng đúng hạn sau khi đối trừ các chi phí phát sinh (nếu có).",
      },
    ],
  },
  {
    id: "freelance-service",
    name: "Hợp đồng cộng tác viên / Khoán việc chuyên môn",
    category: "Nhân sự & Lao động",
    summary: "Giao khoán công việc theo đầu mục sản phẩm cho chuyên gia, cộng tác viên bên ngoài.",
    partyATitle: "BÊN GIAO KHOÁN (BÊN A)",
    partyBTitle: "BÊN NHẬN KHOÁN / CỘNG TÁC VIÊN (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "ho_ten_nhan_vien", label: "Họ và tên cộng tác viên (Bên B)", section: "partyB" },
      { key: "cccd_nhan_vien", label: "Số CCCD / Mã số thuế cá nhân", section: "partyB" },
      { key: "noi_dung_dich_vu", label: "Hạng mục công việc nhận khoán", section: "transaction" },
      { key: "gia_tri_hop_dong", label: "Tổng thù lao khoán việc (VNĐ)", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày bắt đầu thực hiện", section: "transaction" },
      { key: "thoi_han_hop_dong", label: "Thời hạn hoàn thành bàn giao", section: "transaction" },
    ],
    clauses: [
      {
        title: "ĐIỀU 1. YÊU CẦU KẾT QUẢ VÀ NGHIỆM THU",
        body: "Bên B chủ động thực hiện công việc và bàn giao đầy đủ sản phẩm đúng hạn để Bên A kiểm tra, nghiệm thu chất lượng.",
      },
      {
        title: "ĐIỀU 2. CHI TRẢ THÙ LAO VÀ THUẾ TNCN",
        body: "Bên A thanh toán thù lao cho Bên B sau khi khấu trừ thuế thu nhập cá nhân (nếu có) theo quy định hiện hành.",
      },
    ],
  },
  {
    id: "nda-confidential",
    name: "Thỏa thuận bảo mật thông tin (NDA)",
    category: "Pháp lý & Bảo mật",
    summary: "Bảo vệ bí mật kinh doanh, mã nguồn, báo giá và danh sách khách hàng khi làm việc với đối tác.",
    partyATitle: "BÊN TIẾT LỘ THÔNG TIN (BÊN A)",
    partyBTitle: "BÊN NHẬN THÔNG TIN (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp (Bên A)", section: "partyA" },
      { key: "mst_ben_a", label: "Mã số thuế Bên A", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "ten_ben_b", label: "Tên đối tác nhận thông tin (Bên B)", section: "partyB" },
      { key: "mst_ben_b", label: "Mã số thuế / CCCD Bên B", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "muc_dich_bao_mat", label: "Mục đích tiếp cận thông tin mật", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày ký thỏa thuận", section: "transaction" },
      { key: "thoi_han_hop_dong", label: "Thời hạn cam kết bảo mật", section: "transaction" },
    ],
    clauses: [
      {
        title: "ĐIỀU 1. PHẠM VI THÔNG TIN BẢO MẬT",
        body: "Mọi dữ liệu kỹ thuật, tài liệu tài chính, quy trình vận hành và thông tin khách hàng do Bên A cung cấp đều thuộc phạm vi thông tin mật.",
      },
      {
        title: "ĐIỀU 2. CAM KẾT KHÔNG TIẾT LỘ",
        body: "Bên B cam kết chỉ sử dụng thông tin mật đúng mục đích đã nêu và tuyệt đối không sao chép, phát tán cho bất kỳ bên thứ ba nào nếu không có sự đồng ý bằng văn bản của Bên A.",
      },
    ],
  },
  {
    id: "acceptance-handover",
    name: "Biên bản nghiệm thu & Bàn giao công việc",
    category: "Nghiệm thu & Thanh lý",
    summary: "Xác nhận hoàn thành bàn giao hạng mục dịch vụ/hàng hóa để làm căn cứ xuất hóa đơn thanh toán.",
    partyATitle: "BÊN GIAO / CUNG CẤP (BÊN A)",
    partyBTitle: "BÊN NHẬN / NGHIỆM THU (BÊN B)",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp bàn giao (Bên A)", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "ten_ben_b", label: "Tên đối tác nghiệm thu (Bên B)", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "so_hop_dong_goc", label: "Căn cứ Hợp đồng số", section: "transaction" },
      { key: "noi_dung_dich_vu", label: "Hạng mục bàn giao & nghiệm thu", section: "transaction" },
      { key: "ket_qua_nghiem_thu", label: "Kết luận đánh giá chất lượng", section: "transaction" },
      { key: "gia_tri_hop_dong", label: "Giá trị nghiệm thu thanh toán (VNĐ)", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày lập biên bản nghiệm thu", section: "transaction" },
    ],
    clauses: [
      {
        title: "ĐIỀU 1. XÁC NHẬN KẾT QUẢ NGHIỆM THU",
        body: "Hai bên thống nhất xác nhận Bên A đã hoàn thành và bàn giao đầy đủ các hạng mục công việc theo đúng tiêu chuẩn quy định tại hợp đồng gốc.",
      },
      {
        title: "ĐIỀU 2. CĂN CỨ THANH TOÁN",
        body: "Biên bản nghiệm thu này là cơ sở pháp lý để hai bên tiến hành xuất hóa đơn và thanh toán giá trị đợt nghiệm thu.",
      },
    ],
  },
  {
    id: "contract-liquidation",
    name: "Biên bản thanh lý hợp đồng",
    category: "Nghiệm thu & Thanh lý",
    summary: "Chốt hoàn tất toàn bộ nghĩa vụ công việc, công nợ và chính thức chấm dứt hiệu lực hợp đồng.",
    partyATitle: "ĐẠI DIỆN BÊN A",
    partyBTitle: "ĐẠI DIỆN BÊN B",
    fields: [
      { key: "ten_ben_a", label: "Tên doanh nghiệp (Bên A)", section: "partyA" },
      { key: "dai_dien_ben_a", label: "Người đại diện Bên A", section: "partyA" },
      { key: "ten_ben_b", label: "Tên đối tác (Bên B)", section: "partyB" },
      { key: "dai_dien_ben_b", label: "Người đại diện Bên B", section: "partyB" },
      { key: "so_hop_dong_goc", label: "Số hợp đồng cần thanh lý", section: "transaction" },
      { key: "gia_tri_hop_dong", label: "Tổng giá trị đã quyết toán (VNĐ)", section: "transaction" },
      { key: "ngay_hieu_luc", label: "Ngày ký thanh lý", section: "transaction" },
    ],
    clauses: [
      {
        title: "ĐIỀU 1. TÌNH HÌNH THỰC HIỆN VÀ QUYẾT TOÁN",
        body: "Hai bên xác nhận đã hoàn thành đầy đủ quyền và nghĩa vụ theo hợp đồng gốc, không còn bất kỳ vướng mắc hay công nợ tồn đọng nào.",
      },
      {
        title: "ĐIỀU 2. HIỆU LỰC THANH LÝ",
        body: "Hai bên đồng ý thanh lý hợp đồng kể từ ngày hai bên hoàn tất ký số biên bản này.",
      },
    ],
  },
];

/**
 * Tự động tạo văn bản hợp đồng hoàn chỉnh, đúng trình tự pháp lý Việt Nam
 * từ danh sách trường (Bên A, Bên B, Nội dung giao dịch) và các Điều khoản.
 */
export function buildFormattedContractFromBlueprint(bp: {
  name: string;
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

  lines.push("Sau khi bàn bạc, hai bên thống nhất ký kết hợp đồng với các điều khoản cụ thể sau đây:");
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

  // Trích xuất các điều khoản ĐIỀU 1, ĐIỀU 2...
  const clauses: TemplateClauseItem[] = [];
  const lines = rawContent.split(/\r?\n/);
  let currentClause: TemplateClauseItem | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^ĐIỀU\s+\d+/i.test(trimmed)) {
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
        title: "ĐIỀU 2. ĐIỀU KHOẢN CHUNG",
        body: "Hợp đồng này được ký số điện tử theo Luật Giao dịch điện tử 2023 và có hiệu lực kể từ thời điểm các bên hoàn tất ký xác nhận.",
      },
    );
  }

  return {
    partyATitle: "ĐẠI DIỆN BÊN A",
    partyBTitle: "ĐẠI DIỆN BÊN B",
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
