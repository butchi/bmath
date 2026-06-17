import { Expr } from "./types";

type ComplexNumber = { re: number; im: number };
type RationalParts = { num: bigint; den: bigint };
type ComplexRational = { re: RationalParts; im: RationalParts };

function absBigInt(n: bigint): bigint {
  return n < 0n ? -n : n;
}

function powBigInt(base: bigint, exp: bigint): bigint {
  if (exp < 0n) {
    throw new Error("powBigInt exponent must be non-negative");
  }
  let e = exp;
  let b = base;
  let result = 1n;
  while (e > 0n) {
    if ((e & 1n) === 1n) {
      result *= b;
    }
    b *= b;
    e >>= 1n;
  }
  return result;
}

function exactNthRoot(value: bigint, n: bigint): bigint | null {
  if (n <= 0n || value < 0n) {
    return null;
  }
  if (value === 0n || value === 1n || n === 1n) {
    return value;
  }

  let low = 0n;
  let high = value;

  while (low <= high) {
    const mid = (low + high) >> 1n;
    const midPow = powBigInt(mid, n);
    if (midPow === value) {
      return mid;
    }
    if (midPow < value) {
      low = mid + 1n;
    } else {
      high = mid - 1n;
    }
  }

  return null;
}

function normalizeFraction(num: bigint, den: bigint): RationalParts {
  if (den === 0n) {
    throw new Error("Denominator cannot be zero");
  }

  let n = num;
  let d = den;
  if (d < 0n) {
    n = -n;
    d = -d;
  }

  const g = absBigInt(gcdBigInt(n, d));
  return { num: n / g, den: d / g };
}

function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = absBigInt(a);
  let y = absBigInt(b);
  while (y !== 0n) {
    [x, y] = [y, x % y];
  }
  return x;
}

function intOrRatParts(e: Expr): RationalParts | null {
  if (e.kind === "Integer") {
    return { num: e.value, den: 1n };
  }
  if (e.kind === "Rational") {
    return normalizeFraction(e.num, e.den);
  }
  return null;
}

function mulFraction(a: RationalParts, b: RationalParts): RationalParts {
  return normalizeFraction(a.num * b.num, a.den * b.den);
}

function subFraction(a: RationalParts, b: RationalParts): RationalParts {
  return normalizeFraction(a.num * b.den - b.num * a.den, a.den * b.den);
}

function divFraction(a: RationalParts, b: RationalParts): RationalParts | null {
  if (b.num === 0n) {
    return null;
  }
  return normalizeFraction(a.num * b.den, a.den * b.num);
}

function addFraction(a: RationalParts, b: RationalParts): RationalParts {
  return normalizeFraction(a.num * b.den + b.num * a.den, a.den * b.den);
}

function isZeroFraction(a: RationalParts): boolean {
  return a.num === 0n;
}

function addComplexFraction(a: ComplexRational, b: ComplexRational): ComplexRational {
  return {
    re: addFraction(a.re, b.re),
    im: addFraction(a.im, b.im),
  };
}

function mulComplexFraction(a: ComplexRational, b: ComplexRational): ComplexRational {
  return {
    re: subFraction(mulFraction(a.re, b.re), mulFraction(a.im, b.im)),
    im: addFraction(mulFraction(a.re, b.im), mulFraction(a.im, b.re)),
  };
}

function mulComplexFractionByI(value: ComplexRational): ComplexRational {
  return {
    re: normalizeFraction(-value.im.num, value.im.den),
    im: value.re,
  };
}

function invComplexFraction(a: ComplexRational): ComplexRational | null {
  const denom = addFraction(mulFraction(a.re, a.re), mulFraction(a.im, a.im));
  if (isZeroFraction(denom)) {
    return null;
  }

  const re = divFraction(a.re, denom);
  const im = divFraction(normalizeFraction(-a.im.num, a.im.den), denom);
  if (!re || !im) {
    return null;
  }

  return { re, im };
}

function powComplexFractionByInteger(base: ComplexRational, exp: bigint): ComplexRational | null {
  if (exp === 0n) {
    return {
      re: { num: 1n, den: 1n },
      im: { num: 0n, den: 1n },
    };
  }

  let e = exp < 0n ? -exp : exp;
  let b: ComplexRational = { re: base.re, im: base.im };
  let result: ComplexRational = {
    re: { num: 1n, den: 1n },
    im: { num: 0n, den: 1n },
  };

  while (e > 0n) {
    if ((e & 1n) === 1n) {
      result = mulComplexFraction(result, b);
    }
    b = mulComplexFraction(b, b);
    e >>= 1n;
  }

  if (exp > 0n) {
    return result;
  }

  return invComplexFraction(result);
}

function powRationalByInteger(base: RationalParts, exp: bigint): RationalParts {
  if (exp === 0n) {
    return { num: 1n, den: 1n };
  }

  const absExp = absBigInt(exp);
  const numPow = powBigInt(base.num, absExp);
  const denPow = powBigInt(base.den, absExp);

  if (exp > 0n) {
    return { num: numPow, den: denPow };
  }

  return { num: denPow, den: numPow };
}

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

function exprToComplexFraction(e: Expr): ComplexRational | null {
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
    const re = exprToComplexFraction(e.re);
    const im = exprToComplexFraction(e.im);
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
      const t = exprToComplexFraction(term);
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
      const f = exprToComplexFraction(factor);
      if (!f) {
        return null;
      }
      acc = mulComplexFraction(acc, f);
    }
    return acc;
  }

  if (e.kind === "Power") {
    const base = exprToComplexFraction(e.base);
    const exp = exprToFraction(e.exp);
    if (base && exp && exp.den === 1n) {
      return powComplexFractionByInteger(base, exp.num);
    }

    const exactAxis = exactAxisUnitMagnitudePowerAsFraction(e.base, e.exp);
    if (exactAxis) {
      return exactAxis;
    }

    return null;
  }

  return null;
}

function unitRootAngleOverPi(base: ComplexNumber): RationalParts | null {
  if (base.re === 1 && base.im === 0) {
    return { num: 0n, den: 1n };
  }
  if (base.re === -1 && base.im === 0) {
    return { num: 1n, den: 1n };
  }
  if (base.re === 0 && base.im === 1) {
    return { num: 1n, den: 2n };
  }
  if (base.re === 0 && base.im === -1) {
    return { num: -1n, den: 2n };
  }
  return null;
}

function exactUnitRootPower(base: ComplexNumber, exp: Expr): ComplexNumber | null {
  const thetaOverPi = unitRootAngleOverPi(base);
  const expFrac = exprToFraction(exp);
  if (!thetaOverPi || !expFrac) {
    return null;
  }

  const phase = mulFraction(thetaOverPi, expFrac);
  const twicePhase = normalizeFraction(2n * phase.num, phase.den);
  if (twicePhase.den !== 1n) {
    return null;
  }

  const mod = ((twicePhase.num % 4n) + 4n) % 4n;
  if (mod === 0n) {
    return { re: 1, im: 0 };
  }
  if (mod === 1n) {
    return { re: 0, im: 1 };
  }
  if (mod === 2n) {
    return { re: -1, im: 0 };
  }
  return { re: 0, im: -1 };
}

function exactPositiveRationalPower(base: RationalParts, expExpr: Expr): RationalParts | null {
  if (base.num < 0n || base.den <= 0n) {
    return null;
  }

  const exp = exprToFraction(expExpr);
  if (!exp) {
    return null;
  }

  if (exp.den <= 0n) {
    return null;
  }

  const rootNum = exactNthRoot(base.num, exp.den);
  const rootDen = exactNthRoot(base.den, exp.den);
  if (rootNum === null || rootDen === null) {
    return null;
  }

  return powRationalByInteger({ num: rootNum, den: rootDen }, exp.num);
}

function exactRealRationalPower(baseExpr: Expr, expExpr: Expr): ComplexNumber | null {
  const base = intOrRatParts(baseExpr);
  const exp = exprToFraction(expExpr);
  if (!base || !exp) {
    return null;
  }

  const p = exp.num;
  const q = exp.den;

  if (q <= 0n) {
    return null;
  }

  if (base.num < 0n && (q & 1n) === 0n) {
    return null;
  }

  const rootNumAbs = exactNthRoot(absBigInt(base.num), q);
  const rootDen = exactNthRoot(base.den, q);
  if (rootNumAbs === null || rootDen === null) {
    return null;
  }

  const rootNum = base.num < 0n ? -rootNumAbs : rootNumAbs;
  const rooted: RationalParts = { num: rootNum, den: rootDen };
  const raised = powRationalByInteger(rooted, p);

  return { re: Number(raised.num) / Number(raised.den), im: 0 };
}

function axisUnitAndMagnitude(baseExpr: Expr): { unit: ComplexNumber; magnitude: RationalParts } | null {
  const exactBase = exprToComplexFraction(baseExpr);
  if (exactBase) {
    const re = exactBase.re;
    const im = exactBase.im;

    if (isZeroFraction(im) && !isZeroFraction(re)) {
      const sign = re.num < 0n ? -1 : 1;
      return {
        unit: sign < 0 ? { re: -1, im: 0 } : { re: 1, im: 0 },
        magnitude: { num: absBigInt(re.num), den: re.den },
      };
    }

    if (isZeroFraction(re) && !isZeroFraction(im)) {
      const sign = im.num < 0n ? -1 : 1;
      return {
        unit: sign < 0 ? { re: 0, im: -1 } : { re: 0, im: 1 },
        magnitude: { num: absBigInt(im.num), den: im.den },
      };
    }
  }

  const real = intOrRatParts(baseExpr);
  if (real) {
    const absVal = absBigInt(real.num);
    return {
      unit: real.num < 0n ? { re: -1, im: 0 } : { re: 1, im: 0 },
      magnitude: { num: absVal, den: real.den },
    };
  }

  const imagPart = (expr: Expr): RationalParts | null => intOrRatParts(expr);

  if (baseExpr.kind === "GaussianInteger") {
    if (baseExpr.re === 0n && baseExpr.im !== 0n) {
      return {
        unit: baseExpr.im < 0n ? { re: 0, im: -1 } : { re: 0, im: 1 },
        magnitude: { num: absBigInt(baseExpr.im), den: 1n },
      };
    }
    return null;
  }

  if (baseExpr.kind === "Complex") {
    const re = imagPart(baseExpr.re);
    const im = imagPart(baseExpr.im);
    if (!re || !im) {
      return null;
    }

    if (re.num === 0n && im.num !== 0n) {
      return {
        unit: im.num < 0n ? { re: 0, im: -1 } : { re: 0, im: 1 },
        magnitude: { num: absBigInt(im.num), den: im.den },
      };
    }
  }

  return null;
}

function exactAxisUnitMagnitudePower(baseExpr: Expr, expExpr: Expr): ComplexNumber | null {
  const axis = axisUnitAndMagnitude(baseExpr);
  if (!axis) {
    return null;
  }

  const unitPow = exactUnitRootPower(axis.unit, expExpr);
  if (!unitPow) {
    return null;
  }

  const magPow = exactPositiveRationalPower(axis.magnitude, expExpr);
  if (!magPow) {
    return null;
  }

  const amp = Number(magPow.num) / Number(magPow.den);
  return {
    re: unitPow.re * amp,
    im: unitPow.im * amp,
  };
}

function exactAxisUnitMagnitudePowerAsFraction(baseExpr: Expr, expExpr: Expr): ComplexRational | null {
  const axis = axisUnitAndMagnitude(baseExpr);
  if (!axis) {
    return null;
  }

  const unitPow = exactUnitRootPower(axis.unit, expExpr);
  if (!unitPow) {
    return null;
  }

  const magPow = exactPositiveRationalPower(axis.magnitude, expExpr);
  if (!magPow) {
    return null;
  }

  const zero: RationalParts = { num: 0n, den: 1n };
  const negativeMag = normalizeFraction(-magPow.num, magPow.den);

  if (unitPow.re === 1 && unitPow.im === 0) {
    return { re: magPow, im: zero };
  }
  if (unitPow.re === -1 && unitPow.im === 0) {
    return { re: negativeMag, im: zero };
  }
  if (unitPow.re === 0 && unitPow.im === 1) {
    return { re: zero, im: magPow };
  }
  if (unitPow.re === 0 && unitPow.im === -1) {
    return { re: zero, im: negativeMag };
  }

  return null;
}

function mulComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function invComplex(a: ComplexNumber): ComplexNumber {
  const denom = a.re * a.re + a.im * a.im;
  return {
    re: a.re / denom,
    im: -a.im / denom,
  };
}

function powComplexInteger(base: ComplexNumber, exp: bigint): ComplexNumber {
  if (exp === 0n) {
    return { re: 1, im: 0 };
  }

  let e = exp < 0n ? -exp : exp;
  let b = { re: base.re, im: base.im };
  let result: ComplexNumber = { re: 1, im: 0 };

  while (e > 0n) {
    if ((e & 1n) === 1n) {
      result = mulComplex(result, b);
    }
    b = mulComplex(b, b);
    e >>= 1n;
  }

  if (exp < 0n) {
    return invComplex(result);
  }

  return result;
}

export { exactAxisUnitMagnitudePower, exactRealRationalPower, exactUnitRootPower, powComplexInteger };
export type { ComplexNumber };