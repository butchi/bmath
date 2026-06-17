/// <reference types="jest" />
import { morphion, poly, addMorphionForms, mulMorphionForms } from "./morphion";
import { int, sym, rat, power, complex, plus, times } from "./expr";
import { toJson, toNum, toExpression, toComplex, toMorphionForm } from "./utils";

describe("utility functions", () => {
  test("plus with multiple integers", () => {
    const result = plus(int(1n), int(2n), int(3n));
    expect(toNum(result)).toBe(6);
  });

  test("times with multiple integers", () => {
    const result = times(int(4n), int(5n), int(6n));
    expect(toNum(result)).toBe(120);
  });

  test("power of integers", () => {
    const result = power(int(2n), int(3n));
    expect(toNum(result)).toBe(8);
  });

  test("toComplex with integer", () => {
    expect(toComplex(int(5n))).toEqual({ re: 5, im: 0 });
  });

  test("toComplex with rational", () => {
    expect(toComplex(rat(1n, 2n))).toEqual({ re: 0.5, im: 0 });
  });

  test("toComplex with complex number", () => {
    expect(toComplex(complex(int(1n), int(2n)))).toEqual({ re: 1, im: 2 });
  });

  test("toComplex with power", () => {
    expect(toComplex(power(int(2n), int(3n)))).toEqual({ re: 8, im: 0 });
  });

  test("toComplex with negative power", () => {
    expect(toComplex(power(int(-1n), int(2n)))).toEqual({ re: 1, im: 0 });
  });

  test("toComplex with square root of -1", () => {
    expect(toComplex(power(int(-1n), rat(1n, 2n)))).toEqual({ re: 0, im: 1 });
  });

  test("toComplex with square root of 2", () => {
    const result = toComplex(power(int(2n), rat(1n, 2n)));
    if (typeof result === "object" && "re" in result && "im" in result) {
      expect(result.re).toBeCloseTo(1.414213562373095);
      expect(result.im).toBe(0);
    }
  });

  test("toComplex with odd root of negative integer", () => {
    expect(toComplex(power(int(-8n), rat(1n, 3n)))).toEqual({ re: -2, im: 0 });
  });

  test("toComplex with exact rational power", () => {
    expect(toComplex(power(rat(16n, 81n), rat(3n, 4n)))).toEqual({ re: 8 / 27, im: 0 });
  });

  test("toComplex with exact negative rational power", () => {
    expect(toComplex(power(int(-8n), rat(-2n, 3n)))).toEqual({ re: 1 / 4, im: 0 });
  });

  test("toComplex with exact rational phase on -1", () => {
    expect(toComplex(power(int(-1n), rat(3n, 2n)))).toEqual({ re: 0, im: -1 });
  });

  test("toComplex with exact rational phase on i", () => {
    expect(toComplex(power(complex(int(0n), int(1n)), rat(3n, 1n)))).toEqual({ re: 0, im: -1 });
  });

  test("toExpression with rational", () => {
    const result = toExpression(rat(1n, 2n));
    expect(result).toBe("(1/2)");
  });

  test("toExpression with square root", () => {
    const result = toExpression(power(int(2n), rat(1n, 2n)));
    expect(result).toContain("2");
  });

  test("toMorphionForm with rational", () => {
    const result = toMorphionForm(rat(1n, 2n));
    expect(result.kind).toBe("MorphionForm");
    expect(result.base).toEqual(int(2n));
  });
});

describe("morphion", () => {
  test("morphion of x^2 + 2x + 1", () => {
    const base = int(0n);
    const entries = [
      { key: int(2n), coeff: int(1n) },
      { key: int(1n), coeff: int(2n) },
      { key: int(0n), coeff: int(1n) },
    ];
    const result = morphion(base, entries);
    expect(result).toEqual({
      kind: "MorphionForm",
      base: int(0n),
      terms: new Map([
        [toJson(int(2n)), { key: int(2n), coeff: int(1n) }],
        [toJson(int(1n)), { key: int(1n), coeff: int(2n) }],
        [toJson(int(0n)), { key: int(0n), coeff: int(1n) }],
      ]),
    });
  });

  test("poly of x^2 + 2x + 1", () => {
    const result = poly("x", [
      { key: BigInt(2), coeff: int(1n) },
      { key: BigInt(1), coeff: int(2n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    expect(result).toEqual({
      kind: "MorphionForm",
      base: sym("x"),
      terms: new Map([
        [toJson(int(2n)), { key: int(2n), coeff: int(1n) }],
        [toJson(int(1n)), { key: int(1n), coeff: int(2n) }],
        [toJson(int(0n)), { key: int(0n), coeff: int(1n) }],
      ]),
    });
  });

  test("addMorphionForms of (x^2 + 2x + 1) and (x^2 + 3x + 4)", () => {
    const a = poly("x", [
      { key: BigInt(2), coeff: int(1n) },
      { key: BigInt(1), coeff: int(2n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    const b = poly("x", [
      { key: BigInt(2), coeff: int(1n) },
      { key: BigInt(1), coeff: int(3n) },
      { key: BigInt(0), coeff: int(4n) },
    ]);
    const result = addMorphionForms(a, b);
    expect(result).toEqual({
      kind: "MorphionForm",
      base: sym("x"),
      terms: new Map([
        [toJson(int(2n)), { key: int(2n), coeff: int(2n) }],
        [toJson(int(1n)), { key: int(1n), coeff: int(5n) }],
        [toJson(int(0n)), { key: int(0n), coeff: int(5n) }],
      ]),
    });
  });

  test("mulMorphionForms of (x + 1) and (x + 2)", () => {
    const a = poly("x", [
      { key: BigInt(1), coeff: int(1n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    const b = poly("x", [
      { key: BigInt(1), coeff: int(1n) },
      { key: BigInt(0), coeff: int(2n) },
    ]);
    const result = mulMorphionForms(a, b);
    expect(result).toEqual({
      kind: "MorphionForm",
      base: sym("x"),
      terms: new Map([
        [toJson(int(2n)), { key: int(2n), coeff: int(1n) }],
        [toJson(int(1n)), { key: int(1n), coeff: int(3n) }],
        [toJson(int(0n)), { key: int(0n), coeff: int(2n) }],
      ]),
    });
  });

  test("mulMorphionForms of (x + 1) and (x - 1)", () => {
    const a = poly("x", [
      { key: BigInt(1), coeff: int(1n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    const b = poly("x", [
      { key: BigInt(1), coeff: int(1n) },
      { key: BigInt(0), coeff: int(-1n) },
    ]);
    const result = mulMorphionForms(a, b);
    expect(result).toEqual({
      kind: "MorphionForm",
      base: sym("x"),
      terms: new Map([
        [toJson(int(2n)), { key: int(2n), coeff: int(1n) }],
        [toJson(int(1n)), { key: int(1n), coeff: int(0n) }],
        [toJson(int(0n)), { key: int(0n), coeff: int(-1n) }],
      ]),
    });
  });

  test("mulMorphionForms of (x + 1) and (x^2 + 2x + 1)", () => {
    const a = poly("x", [
      { key: BigInt(1), coeff: int(1n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    const b = poly("x", [
      { key: BigInt(2), coeff: int(1n) },
      { key: BigInt(1), coeff: int(2n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    const result = mulMorphionForms(a, b);
    expect(result).toEqual({
      kind: "MorphionForm",
      base: sym("x"),
      terms: new Map([
        [toJson(int(3n)), { key: int(3n), coeff: int(1n) }],
        [toJson(int(2n)), { key: int(2n), coeff: int(3n) }],
        [toJson(int(1n)), { key: int(1n), coeff: int(3n) }],
        [toJson(int(0n)), { key: int(0n), coeff: int(1n) }],
      ]),
    });
  });

  test("mulMorphionForms of (x + 1) and (x^3 + 3x^2 + 3x + 1)", () => {
    const a = poly("x", [
      { key: BigInt(1), coeff: int(1n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    const b = poly("x", [
      { key: BigInt(3), coeff: int(1n) },
      { key: BigInt(2), coeff: int(3n) },
      { key: BigInt(1), coeff: int(3n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    const result = mulMorphionForms(a, b);
    expect(result).toEqual({
      kind: "MorphionForm",
      base: sym("x"),
      terms: new Map([
        [toJson(int(4n)), { key: int(4n), coeff: int(1n) }],
        [toJson(int(3n)), { key: int(3n), coeff: int(4n) }],
        [toJson(int(2n)), { key: int(2n), coeff: int(6n) }],
        [toJson(int(1n)), { key: int(1n), coeff: int(4n) }],
        [toJson(int(0n)), { key: int(0n), coeff: int(1n) }],
      ]),
    });
  });

  test("mulMorphionForms of (x^2 + 2x + 1) and (x^3 + 3x^2 + 3x + 1)", () => {
    const a = poly("x", [
      { key: BigInt(2), coeff: int(1n) },
      { key: BigInt(1), coeff: int(2n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    const b = poly("x", [
      { key: BigInt(3), coeff: int(1n) },
      { key: BigInt(2), coeff: int(3n) },
      { key: BigInt(1), coeff: int(3n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    const result = mulMorphionForms(a, b);
    expect(result).toEqual({
      kind: "MorphionForm",
      base: sym("x"),
      terms: new Map([
        [toJson(int(5n)), { key: int(5n), coeff: int(1n) }],
        [toJson(int(4n)), { key: int(4n), coeff: int(5n) }],
        [toJson(int(3n)), { key: int(3n), coeff: int(10n) }],
        [toJson(int(2n)), { key: int(2n), coeff: int(10n) }],
        [toJson(int(1n)), { key: int(1n), coeff: int(5n) }],
        [toJson(int(0n)), { key: int(0n), coeff: int(1n) }],
      ]),
    });
  });

  test("mulMorphionForms of (x^2 + 2x + 1) and (x^4 + 4x^3 + 6x^2 + 4x + 1)", () => {
    const a = poly("x", [
      { key: BigInt(2), coeff: int(1n) },
      { key: BigInt(1), coeff: int(2n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    const b = poly("x", [
      { key: BigInt(4), coeff: int(1n) },
      { key: BigInt(3), coeff: int(4n) },
      { key: BigInt(2), coeff: int(6n) },
      { key: BigInt(1), coeff: int(4n) },
      { key: BigInt(0), coeff: int(1n) },
    ]);
    const result = mulMorphionForms(a, b);
    expect(result).toEqual({
      kind: "MorphionForm",
      base: sym("x"),
      terms: new Map([
        [toJson(int(6n)), { key: int(6n), coeff: int(1n) }],
        [toJson(int(5n)), { key: int(5n), coeff: int(6n) }],
        [toJson(int(4n)), { key: int(4n), coeff: int(15n) }],
        [toJson(int(3n)), { key: int(3n), coeff: int(20n) }],
        [toJson(int(2n)), { key: int(2n), coeff: int(15n) }],
        [toJson(int(1n)), { key: int(1n), coeff: int(6n) }],
        [toJson(int(0n)), { key: int(0n), coeff: int(1n) }],
      ]),
    });
  });
});