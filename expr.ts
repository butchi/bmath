import { Expr } from "./types";

function normalize(m: Expr): Expr {
  if (m.head === "Plus") {
    // 全ての整数項を合計
    let integerSum = 0n;
    const otherTerms: Expr[] = [];
    for (const term of m.attributes.terms) {
      if (term.head === "Integer") {
        integerSum += term.attributes.value;
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
      return { head: "Plus", attributes: { terms: allTerms } };
    }
  } else if (m.head === "Times") {
    // 全ての整数項を乗算
    let integerProduct = 1n;
    const otherFactors: Expr[] = [];
    for (const factor of m.attributes.factors) {
      if (factor.head === "Integer") {
        integerProduct *= factor.attributes.value;
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
      return { head: "Times", attributes: { factors: allFactors } };
    }
  } else if (m.head === "Power") {
    const base = m.attributes.base;
    const exp = m.attributes.exp;

    if (base.head === "Integer" && exp.head === "Integer") {
      if (exp.attributes.value === 0n) {
        return int(1n);
      }

      if (base.attributes.value === 0n) {
        return int(0n);
      }
    }

    return {
      head: "Power",
      attributes: { base, exp },
    };
  } else if (m.head === "Call") {
    return m;
  } else {
    return m;
  }
}

const int = (value: bigint): Expr => ({ head: "Integer", attributes: { value } });

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
  
  return { head: "Rational", attributes: { num: n, den: d } };
};

const sym = (name: string): Expr => ({ head: "Symbol", attributes: { name } });

const rat = (num: bigint, den: bigint): Expr => {
  return normalizeRational(num, den);
};

const gi = (re: bigint, im: bigint): Expr => {
  return { head: "GaussianInteger", attributes: { re, im } };
};

const complex = (re: Expr, im: Expr): Expr => {
  return { head: "Complex", attributes: { re, im } };
};

const power = (base: Expr, exp: Expr): Expr => {
  return normalize({
    head: "Power",
    attributes: { base, exp },
  });
};

const plus = (...terms: Expr[]): Expr => {
  return normalize({
    head: "Plus",
    attributes: { terms },
  });
}

const times = (...factors: Expr[]): Expr => {
  return normalize({
    head: "Times",
    attributes: { factors },
  });
}

const call = (fn: string, arg: Expr): Expr => ({
  head: "Call",
  attributes: { fn, arg },
});

export { int, sym, rat, gi, complex, power, plus, times, call, normalizeRational };
