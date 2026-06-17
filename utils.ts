import { Expr, MorphionForm } from "./types";
import { replacer } from "./json";
import { int, sym, plus, times } from "./expr";
import { normalizeRational } from "./expr";
import { morphion } from "./morphion";

type ComplexNumber = { re: number; im: number };

function asComplexOrZero(n: Expr | MorphionForm): ComplexNumber {
  const c = toComplex(n);
  if (typeof c === "object" && "re" in c && "im" in c) {
    return { re: Number(c.re), im: Number(c.im) };
  }
  return { re: 0, im: 0 };
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

function toNum(n: Expr | MorphionForm): number {
  if (n.kind === "Integer") {
    return Number(n.value);
  } else if (n.kind === "Rational") {
    return Number(n.num) / Number(n.den);
  } else if (n.kind === "GaussianInteger") {
    return NaN; // ガウス整数は数値に変換できないのでNaNを返す
  } else if (n.kind === "Complex") {
    return NaN; // 複素数は数値に変換できないのでNaNを返す
  } else if (n.kind === "Power") {
    return Math.pow(toNum(n.base), toNum(n.exp));
  } else if (n.kind === "Plus") {
    return n.terms.reduce((sum, term) => sum + toNum(term), 0);
  } else if (n.kind === "Times") {
    return n.factors.reduce((product, factor) => product * toNum(factor), 1);
  } else if (n.kind === "MorphionForm") {
    let result = 0;
    for (const { key, coeff } of n.terms.values()) {
      result += toNum(coeff) * Math.pow(toNum(n.base), toNum(key));
    }
    return result;
  } else if (n.kind === "Symbol") {
    return NaN; // シンボルは数値に変換できないのでNaNを返す
  } else {
    throw new Error("Unsupported Morphion type for toNum");
  }
}

function gaussianToComplex(n: Expr): { re: number; im: number } {
  if (n.kind === "GaussianInteger") {
    return { re: Number(n.re), im: Number(n.im) };
  } else {
    throw new Error("Unsupported Expr type for gaussianToComplex");
  }
}

function toComplex(n: Expr | MorphionForm): { re: number; im: number } | MorphionForm {
  if (n.kind === "Integer") {
    return { re: Number(n.value), im: 0 };
  } else if (n.kind === "Rational") {
    return { re: Number(n.num) / Number(n.den), im: 0 };
  } else if (n.kind === "GaussianInteger") {
    return gaussianToComplex(n);
  } else if (n.kind === "Complex") {
    return {
      re: toNum(n.re),
      im: toNum(n.im),
    };
  } else if (n.kind === "MorphionForm") {
    return n; // MorphionFormはそのまま返す
  } else if (n.kind === "Symbol") {
    return { re: NaN, im: NaN }; // シンボルは複素数に変換できないのでNaNを返す
  } else if (n.kind === "Power") {
    const base = asComplexOrZero(n.base);

    if (n.exp.kind === "Integer") {
      return powComplexInteger(base, n.exp.value);
    }

    if (n.exp.kind === "Rational") {
      if (n.exp.den === 1n) {
        return powComplexInteger(base, n.exp.num);
      }

      // principal square root of -1 is exactly i
      if (n.exp.num === 1n && n.exp.den === 2n && base.re === -1 && base.im === 0) {
        return { re: 0, im: 1 };
      }
    }

    const expNum = toNum(n.exp);
    if (base.im === 0 && base.re >= 0) {
      return { re: Math.pow(base.re, expNum), im: 0 };
    }

    const r = Math.sqrt(base.re * base.re + base.im * base.im);
    const theta = Math.atan2(base.im, base.re);
    const rExp = Math.pow(r, expNum);
    const thetaExp = theta * expNum;

    return {
      re: rExp * Math.cos(thetaExp),
      im: rExp * Math.sin(thetaExp),
    };
  } else if (n.kind === "Plus") {
    let re = 0;
    let im = 0;
    for (const term of n.terms) {
      const termCplx = toComplex(term);
      const termCplxObj = (typeof termCplx === "object" && "re" in termCplx) ? termCplx : { re: 0, im: 0 };
      re += typeof termCplxObj.re === "number" ? termCplxObj.re : 0;
      im += typeof termCplxObj.im === "number" ? termCplxObj.im : 0;
    }
    
    return { re, im };
  } else if (n.kind === "Times") {
    let re = 1;
    let im = 0;
    for (const factor of n.factors) {
      const factorCplx = toComplex(factor);
      const factorCplxObj = (typeof factorCplx === "object" && "re" in factorCplx) ? factorCplx : { re: 0, im: 0 };
      const re_val = typeof factorCplxObj.re === "number" ? factorCplxObj.re : 0;
      const im_val = typeof factorCplxObj.im === "number" ? factorCplxObj.im : 0;
      const newRe = re * re_val - im * im_val;
      const newIm = re * im_val + im * re_val;
      re = newRe;
      im = newIm;
    }
    
    return { re, im };
  } else {
    throw new Error("Unsupported Morphion type for toComplex");
  }
}

function toExpression(n: Expr | MorphionForm): string {
  if (n.kind === "Integer") {
    return n.value.toString();
  } else if (n.kind === "Rational") {
    return `(${toExpression(int(n.num))}/${toExpression(int(n.den))})`;
  } else if (n.kind === "Complex") {
    return `(${toExpression(n.re)} + ${toExpression(n.im)}i)`;
  } else if (n.kind === "Power") {
    return `(${toExpression(n.base)}^(${toExpression(n.exp)}))`;
  } else if (n.kind === "Plus") {
    return n.terms.map(term => toExpression(term)).join(" + ");
  } else if (n.kind === "Times") {
    return n.factors.map(factor => toExpression(factor)).join(" * ");
  } else if (n.kind === "MorphionForm") {
    return Array.from(n.terms.values()).map(({ key, coeff }: { key: Expr; coeff: Expr }) => `(${toExpression(coeff)}) * (${toExpression(n.base)}^(${toExpression(key)}))`).join(" + ");
  } else if (n.kind === "Symbol") {
    return n.name;
  } else {
    throw new Error("Unsupported Morphion type for toExpression");
  }
}

function rationalAsMorphion(num: bigint, den: bigint): MorphionForm {
  const frac = normalizeRational(num, den);
  if (frac.kind === "Rational") {
    return morphion(int(frac.den), [{ key: int(-1n), coeff: int(frac.num) }]);
  }
  return morphion(int(1n), [{ key: int(0n), coeff: frac }]);
}

const ii = sym("i");

function complexAsMorphion(re: Expr, im: Expr): MorphionForm {
  return morphion(ii, [
    { key: int(0n), coeff: re },
    { key: int(1n), coeff: im },
  ]);
}

function toMorphionForm(n: Expr): MorphionForm {
  if (n.kind === "Integer") {
    return morphion(int(1n), [{ key: int(0n), coeff: n }]);
  } else if (n.kind === "Rational") {
    return rationalAsMorphion(n.num, n.den);
  } else if (n.kind === "GaussianInteger") {
    return complexAsMorphion(int(n.re), int(n.im));
  } else if (n.kind === "Complex") {
    return complexAsMorphion(n.re, n.im);
  } else if (n.kind === "Power") {
    if (n.base.kind === "Symbol" && n.base.name === "x") {
      return morphion(sym("x"), [{ key: n.exp, coeff: int(1n) }]);
    } else {
      throw new Error("Unsupported base for Power in toMorphionForm");
    }
  } else if (n.kind === "Symbol") {
    return morphion(n, [{ key: int(0n), coeff: int(1n) }]);
  } else {
    throw new Error(`Cannot morphionize ${n.kind}`);
  }
}

function toJson(n: Expr | MorphionForm): string {
  return JSON.stringify(n, replacer);
}

export { toNum, toComplex, toExpression, toJson, toMorphionForm };