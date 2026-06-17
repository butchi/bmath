/// <reference types="jest" />
import { morphion, poly, addMorphionForms, mulMorphionForms } from "./morphion";
import { int, sym } from "./expr";
import { toJson } from "./utils";

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