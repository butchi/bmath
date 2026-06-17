import { Expr } from "./types";

function normalize(m: Expr): Expr {
  if (m.kind === "Plus") {
    // 全ての整数項を合計
    let integerSum = 0n;
    const otherTerms = [];
    for (const term of m.terms) {
      if (term.kind === "Integer") {
        integerSum += term.value;
      } else {
        otherTerms.push(term);
      }
    }
    
    // 合計した整数がゼロでない場合は追加
    const allTerms = integerSum !== 0n ? [int(integerSum), ...otherTerms] : otherTerms;
    
    if (allTerms.length === 0) {
      return int(0n);
    } else if (allTerms.length === 1) {
      return allTerms[0];
    } else {
      return { kind: "Plus", terms: allTerms };
    }
  } else if (m.kind === "Times") {
    // 全ての整数項を乗算
    let integerProduct = 1n;
    const otherFactors = [];
    for (const factor of m.factors) {
      if (factor.kind === "Integer") {
        integerProduct *= factor.value;
      } else {
        otherFactors.push(factor);
      }
    }

    if (integerProduct === 0n) {
      return int(0n);
    }
    
    // 乗算した整数が1でない場合は追加
    const allFactors = integerProduct !== 1n ? [int(integerProduct), ...otherFactors] : otherFactors;
    
    if (allFactors.length === 0) {
      return int(1n);
    } else if (allFactors.length === 1) {
      return allFactors[0];
    } else {
      return { kind: "Times", factors: allFactors };
    }
  } else if (m.kind === "Power") {
    const base = m.base;
    const exp = m.exp;

    if (base.kind === "Integer" && exp.kind === "Integer") {
      if (exp.value === 0n) {
        return int(1n);
      }

      if (base.value === 0n) {
        return int(0n);
      }
    }

    return {
      kind: "Power",
      base,
      exp,
    };
  } else {
    return m;
  }
}

const int = (value: bigint): Expr => ({ kind: "Integer", value });

const gcd = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
};

const normalizeRational = (num: bigint, den: bigint): Expr => {
  // gcdで約分
  // den > 0 に正規化

  if (den === 0n) {
    throw new Error("Denominator cannot be zero");
  }

  const g = gcd(num, den);
  let n = num / g;
  let d = den / g;
  
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  
  return { kind: "Rational", num: n, den: d };
};

const sym = (name: string): Expr => ({ kind: "Symbol", name: name });

const rat = (num: bigint, den: bigint): Expr => {
  return normalizeRational(num, den);
};

const gi = (re: bigint, im: bigint): Expr => {
  return { kind: "GaussianInteger", re, im };
};

const complex = (re: Expr, im: Expr): Expr => {
  return { kind: "Complex", re, im };
};

const power = (base: Expr, exp: Expr): Expr => {
  return normalize({
    kind: "Power",
    base,
    exp,
  });
};

const plus = (...terms: Expr[]): Expr => {
  return normalize({
    kind: "Plus",
    terms: terms,
  });
}

const times = (...factors: Expr[]): Expr => {
  return normalize({
    kind: "Times",
    factors: factors,
  });
}

export { int, sym, rat, gi, complex, power, plus, times, normalizeRational };
