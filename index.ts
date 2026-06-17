import { int, sym, rat, complex, power, plus, times, gi } from "./expr";
import { MorphionForm, Expr } from "./types";
import { toNum, toExpression, toJson, toComplex, toMorphionForm } from "./utils";
import { addMorphionForms, mulMorphionForms, poly } from "./morphion";
import { replacer } from "./json";
// import { toString } from "./string";
// import { toLatex } from "./latex";
// import { toHtml } from "./html";
// import { toMarkdown } from "./markdown";
// import { toXml } from "./xml";
// import { toYaml } from "./yaml";
// import { toCsv } from "./csv";
// import { toTex } from "./tex";
// import { toSvg } from "./svg";
// import { toPng } from "./png";
// import { toJpg } from "./jpg";
// import { toGif } from "./gif";
// import { toBmp } from "./bmp";
// import { toWebp } from "./webp";

// Test cases
const d1: MorphionForm = {
  kind: "MorphionForm",
  base: int(10n),
  terms: new Map<string, { key: Expr; coeff: Expr }>([
    [JSON.stringify(int(0n), replacer), { key: int(0n), coeff: int(1n) }],
    [JSON.stringify(int(1n), replacer), { key: int(1n), coeff: int(2n) }],
    [JSON.stringify(int(2n), replacer), { key: int(2n), coeff: int(3n) }],
  ]),
};

const d2: MorphionForm = {
  kind: "MorphionForm",
  base: int(10n),
  terms: new Map<string, { key: Expr; coeff: Expr }>([
    [JSON.stringify(int(0n), replacer), { key: int(0n), coeff: int(4n) }],
    [JSON.stringify(int(1n), replacer), { key: int(1n), coeff: int(5n) }],
    [JSON.stringify(int(2n), replacer), { key: int(2n), coeff: int(6n) }],
  ]),
};

console.log(toNum(d1)); // 321
console.log(toNum(d2)); // 654
console.log(toExpression(d1)); // (1) * (10)^(0) + (2) * (10)^(1) + (3) * (10)^(2)
console.log(toExpression(d2)); // (4) * (10)^(0) + (5) * (10)^(1) + (6) * (10)^(2)
console.log(toJson(d1));
console.log(toJson(d2));

const p1: MorphionForm = {
  kind: "MorphionForm",
  base: sym("x"),
  terms: new Map<string, { key: Expr; coeff: Expr }>([
    [JSON.stringify(int(0n), replacer), { key: int(0n), coeff: int(1n) }],
    [JSON.stringify(int(1n), replacer), { key: int(1n), coeff: int(2n) }],
    [JSON.stringify(int(2n), replacer), { key: int(2n), coeff: int(3n) }],
  ]),
};

const p2: MorphionForm = {
  kind: "MorphionForm",
  base: sym("x"),
  terms: new Map<string, { key: Expr; coeff: Expr }>([
    [JSON.stringify(int(0n), replacer), { key: int(0n), coeff: int(4n) }],
    [JSON.stringify(int(1n), replacer), { key: int(1n), coeff: int(5n) }],
    [JSON.stringify(int(2n), replacer), { key: int(2n), coeff: int(6n) }],
  ]),
};

console.log(toNum(p1)); // NaN (シンボルが含まれているため数値に変換できない)
console.log(toNum(p2)); // NaN (シンボルが含まれているため数値に変換できない)
console.log(toExpression(p1)); // (1) * (x)^(0) + (2) * (x)^(1) + (3) * (x)^(2)
console.log(toExpression(p2)); // (4) * (x)^(0) + (5) * (x)^(1) + (6) * (x)^(2)
console.log(toJson(p1));
console.log(toJson(p2));

const p3 = addMorphionForms(p1, p2);
const p4 = mulMorphionForms(p1, p2);

console.log(toNum(p3)); // NaN (シンボルが含まれているため数値に変換できない)
console.log(toNum(p4)); // NaN (シンボルが含まれているため数値に変換できない)
console.log(toExpression(p3)); // (5) * (x)^(0) + (7) * (x)^(1) + (9) * (x)^(2)
console.log(toExpression(p4)); // (4) * (x)^(0) + (13) * (x)^(1) + (28) * (x)^(2) + (27) * (x)^(3) + (18) * (x)^(4)
console.log(toJson(p3));
console.log(toJson(p4));

const poly1 = poly("x", [
  { key: 0n, coeff: int(1n) },
  { key: 1n, coeff: int(2n) },
  { key: 2n, coeff: int(3n) },
]);

const poly2 = poly("x", [
  { key: 0n, coeff: int(4n) },
  { key: 1n, coeff: int(5n) },
  { key: 2n, coeff: int(6n) },
]);

console.log(toNum(poly1)); // NaN (シンボルが含まれているため数値に変換できない)
console.log(toNum(poly2)); // NaN (シンボルが含まれているため数値に変換できない)
console.log(toExpression(poly1)); // (1) * (x)^(0) + (2) * (x)^(1) + (3) * (x)^(2)
console.log(toExpression(poly2)); // (4) * (x)^(0) + (5) * (x)^(1) + (6) * (x)^(2)
console.log(toJson(poly1));
console.log(toJson(poly2));

const gi1 = gi(1n, 2n);
const gi2 = gi(3n, 4n);

const frac12 = rat(1n, 2n);

const sqrt2 = power(int(2n), rat(1n, 2n));

// Test outputs
const result1 = plus(int(1n), int(2n), int(3n));
console.log(toNum(result1)); // 6

const result2 = times(int(4n), int(5n), int(6n));
console.log(toNum(result2)); // 120

const result3 = power(int(2n), int(3n));
console.log(toNum(result3)); // 8

console.log(toComplex(int(5n))); // { re: 5, im: 0 }
console.log(toComplex(rat(1n, 2n))); // { re: 0.5, im: 0 }
console.log(toComplex(complex(int(1n), int(2n)))); // { re: 1, im: 2 }
console.log(toComplex(power(int(2n), int(3n)))); // { re: 8, im: 0 }
console.log(toComplex(power(int(-1n), int(2n)))); // { re: 1, im: 0 }
console.log(toComplex(power(int(-1n), int(3n)))); // { re: -1, im: 0 }
console.log(toComplex(power(int(-1n), int(0n)))); // { re: 1, im: 0 }
console.log(toComplex(power(int(-1n), frac12))); // { re: 0, im: 1 }
console.log(toComplex(power(int(2n), frac12))); // { re: 1.414213562373095, im: 0 }
console.log(toExpression(frac12)); // (1/2)
console.log(toMorphionForm(frac12)); // { kind: 'MorphionForm', base: { kind: 'Integer', value: 2n }, terms: Map(1) { '{"key":{"kind":"Integer","value":-1n},"coeff":{"kind":"Integer","value":1n}}' => { key: { kind: 'Integer', value: -1n }, coeff: { kind: 'Integer', value: 1n } } } }
console.log(toExpression(sqrt2)); // ((2)^(1/2))
console.log(toJson(sqrt2));
console.log(toComplex(sqrt2)); // { re: 1.414213562373095, im: 0 }
console.log(toComplex(power(int(2n), frac12))); // { re: 1.414213562373095, im: 0 }
console.log(toExpression(power(int(-1n), frac12))); // ((-1)^(1/2))
console.log(toComplex(power(int(-1n), frac12))); // { re: 0, im: 1 }
console.log(toExpression(power(int(2n), frac12))); // ((2)^(1/2))
console.log(toComplex(gi1)); // { re: 1, im: 2 }
console.log(toComplex(gi2)); // { re: 3, im: 4 }
