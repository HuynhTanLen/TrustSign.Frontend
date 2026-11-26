// Tự kiểm tra kho mẫu hợp đồng: node scripts/check-templates.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const load = (source) => {
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
};

const lib = await load(
  read("src/lib/contract-format.ts").replace(
    /^import \{ detectVariables \}.*$/m,
    "const detectVariables = (c: string) => [...new Set(Array.from(c.matchAll(/\\{\\{([a-zA-Z0-9_]+)\\}\\}/g), (m) => m[1]))];",
  ),
);

// Lấy đúng các hàm nhận diện kiểu trường mà form soạn hợp đồng đang dùng.
const page = read("src/app/app/contracts/new/page.tsx");
const pick = (name) => {
  const found = page.match(new RegExp(`^function ${name}\\([\\s\\S]*?^}`, "m"));
  assert.ok(found, `không tìm thấy hàm ${name}`);
  return `export ${found[0]}`;
};
const form = await load(["isStartDateField", "isDurationOrEndDateField", "isMoneyField"].map(pick).join("\n"));

const templates = lib.REFERENCE_TEMPLATES;
assert.equal(templates.length, 9);
assert.equal(new Set(templates.map((t) => t.id)).size, templates.length, "trùng id mẫu");

for (const t of templates) {
  const keys = t.fields.map((f) => f.key);
  assert.equal(new Set(keys).size, keys.length, `${t.id}: trùng mã trường`);
  for (const c of t.clauses) {
    assert.ok(!c.body.includes("{{"), `${t.id}: điều khoản chứa biến`);
    // PDF in đậm mọi dòng bắt đầu bằng "Điều " vì coi đó là tiêu đề.
    assert.ok(!/^điều /im.test(c.body), `${t.id}: ${c.title} có dòng nội dung bắt đầu bằng "Điều"`);
  }

  // Dựng văn bản rồi bóc tách lại phải ra đúng cấu trúc ban đầu.
  const parsed = lib.parseTemplateIntoBlueprint(t.name, lib.buildFormattedContractFromBlueprint(t));
  assert.deepEqual(parsed.legalBasis, t.legalBasis, `${t.id}: căn cứ`);
  assert.equal(parsed.partyATitle, t.partyATitle.toUpperCase(), `${t.id}: tiêu đề Bên A`);
  assert.equal(parsed.partyBTitle, t.partyBTitle.toUpperCase(), `${t.id}: tiêu đề Bên B`);
  assert.deepEqual(parsed.fields, t.fields, `${t.id}: trường, nhãn hoặc mục bị lệch`);
  assert.deepEqual(parsed.clauses, t.clauses.map((c) => ({ title: c.title.toUpperCase(), body: c.body })), `${t.id}: điều khoản`);

  for (const f of t.fields) {
    const money = f.key.startsWith("gia_tri");
    assert.equal(form.isMoneyField(f.key, f.label), money, `${t.id}.${f.key}: nhận diện tiền sai`);
    assert.equal(form.isStartDateField(f.key), f.key === "ngay_hieu_luc", `${t.id}.${f.key}: nhận diện ngày sai`);
    assert.equal(form.isDurationOrEndDateField(f.key), f.key === "thoi_han_hop_dong", `${t.id}.${f.key}: nhận diện thời hạn sai`);
  }
}

console.log(`OK: ${templates.length} mẫu, ${templates.reduce((n, t) => n + t.fields.length, 0)} trường`);
