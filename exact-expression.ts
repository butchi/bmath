import { Expr } from "./types";
import {
  addComplexFraction,
  addFraction,
  mulComplexFraction,
  mulComplexFractionByI,
  mulFraction,
  normalizeFraction,
  powComplexFractionByInteger,
  powRationalByInteger,
} from "./exact-fraction";
import type { ComplexRational, RationalParts } from "./exact-fraction";

type ExactPowerFractionResolver = (baseExpr: Expr, expExpr: Expr) => ComplexRational | null;

function exprToFraction(e: Expr): RationalParts | null {
  if (e.kind === "Integer") {
    return { num: e.value, den: 1n };
  }
  if (e.kind === "Rational") {
    return normalizeFraction(e.num, e.den);
  }
  if (e.kind === "Plus") {
    let acc: RationalParts = { num: 0n, den: 1n };
    for (const term of e.terms) {
      const t = exprToFraction(term);
      if (!t) {
        return null;
      }
      acc = addFraction(acc, t);
    }
    return acc;
  }
  if (e.kind === "Times") {
    let acc: RationalParts = { num: 1n, den: 1n };
    for (const factor of e.factors) {
      const f = exprToFraction(factor);
      if (!f) {
        return null;
      }
      acc = mulFraction(acc, f);
    }
    return acc;
  }
  if (e.kind === "Power") {
    const base = exprToFraction(e.base);
    const exp = exprToFraction(e.exp);
    if (!base || !exp || exp.den !== 1n) {
      return null;
    }
    return powRationalByInteger(base, exp.num);
  }
  return null;
}

function exprToComplexFraction(e: Expr, resolveExactPower: ExactPowerFractionResolver): ComplexRational | null {
  const frac = exprToFraction(e);
  if (frac) {
    return { re: frac, im: { num: 0n, den: 1n } };
  }

  if (e.kind === "GaussianInteger") {
    return {
      re: { num: e.re, den: 1n },
      im: { num: e.im, den: 1n },
    };
  }

  if (e.kind === "Complex") {
    const re = exprToComplexFraction(e.re, resolveExactPower);
    const im = exprToComplexFraction(e.im, resolveExactPower);
    if (!re || !im) {
      return null;
    }
    return addComplexFraction(re, mulComplexFractionByI(im));
  }

  if (e.kind === "Plus") {
    let acc: ComplexRational = {
      re: { num: 0n, den: 1n },
      im: { num: 0n, den: 1n },
    };
    for (const term of e.terms) {
      const t = exprToComplexFraction(term, resolveExactPower);
      if (!t) {
        return null;
      }
      acc = addComplexFraction(acc, t);
    }
    return acc;
  }

  if (e.kind === "Times") {
    let acc: ComplexRational = {
      re: { num: 1n, den: 1n },
      im: { num: 0n, den: 1n },
    };
    for (const factor of e.factors) {
      const f = exprToComplexFraction(factor, resolveExactPower);
      if (!f) {
        return null;
      }
      acc = mulComplexFraction(acc, f);
    }
    return acc;
  }

  if (e.kind === "Power") {
    const base = exprToComplexFraction(e.base, resolveExactPower);
    const exp = exprToFraction(e.exp);
    if (base && exp && exp.den === 1n) {
      return powComplexFractionByInteger(base, exp.num);
    }

    return resolveExactPower(e.base, e.exp);
  }

  return null;
}

export { exprToComplexFraction, exprToFraction };
export type { ExactPowerFractionResolver };