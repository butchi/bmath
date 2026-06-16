// # 2026-06-07: Matra Core Math

// 第1層: 一般式
type Expr =
  | { kind: "Integer"; value: bigint }
  | { kind: "Rational"; num: bigint; den: bigint }
  | { kind: "Complex"; re: Expr; im: Expr }
  | { kind: "Symbol"; name: string }
  | { kind: "Plus"; terms: Expr[] }
  | { kind: "Times"; factors: Expr[] }
  | { kind: "Power"; base: Expr; exp: Expr };

// 第2層: モーフィオン標準形
type MorphionForm = {
  kind: "MorphionForm";
  base: Expr;
  terms: Map<string, {
    key: Expr;
    coeff: Expr;
  }>;
};

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
  const g = gcd(num, den);
  let n = num / g;
  let d = den / g;
  
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  
  return { kind: "Rational", num: n, den: d };
};

const sym = (name: string): Expr => ({ kind: "Symbol", name });

const rat = (num: bigint, den: bigint): Expr => {
  return normalizeRational(num, den);
};

const pow = (base: Expr, exp: Expr): Expr => {
  return normalize({
    kind: "Power",
    base,
    exp,
  });
};

const plus = (...terms: Expr[]): Expr => {
  return normalize({
    kind: "Plus",
    terms,
  });
}

const times = (...factors: Expr[]): Expr => {
  return normalize({
    kind: "Times",
    factors,
  });
}

function normalize(m: Expr): Expr {
  if (m.kind === "Plus") {
    // 0を消す
    const nonZeroTerms = m.terms.filter(term => !(term.kind === "Integer" && term.value === 0n));
    if (nonZeroTerms.length === 0) {
      return int(0n);
    } else if (nonZeroTerms.length === 1) {
      return nonZeroTerms[0];
    } else {
      return { kind: "Plus", terms: nonZeroTerms };
    }
  } else if (m.kind === "Times") {
    // 1を消す
    const nonOneFactors = m.factors.filter(factor => !(factor.kind === "Integer" && factor.value === 1n));
    if (nonOneFactors.length === 0) {
      return int(1n);
    } else if (nonOneFactors.length === 1) {
      return nonOneFactors[0];
    } else {
      return { kind: "Times", factors: nonOneFactors };
    }
  } else {
    return m;
  }
}

function morphion(
  base: Expr,
  entries: Array<{ key: Expr; coeff: Expr }>
): MorphionForm {
  const terms = new Map<string, { key: Expr; coeff: Expr }>();
  for (const entry of entries) {
    const keyStr = JSON.stringify(entry.key, (k, v) => {
      if (typeof v === "bigint") {
        return v.toString();
      }
      return v;
    });
    if (terms.has(keyStr)) {
      const existing = terms.get(keyStr)!;
      terms.set(keyStr, {
        key: entry.key,
        coeff: plus(existing.coeff, entry.coeff),
      });
    } else {
      terms.set(keyStr, entry);
    }
  }
  return { kind: "MorphionForm", base, terms };
}

function poly(
  variable: string,
  coeffs: Array<{ key: bigint; coeff: Expr }>
): MorphionForm {
  const x = sym(variable);

  return morphion(x, coeffs.map(({ key, coeff }) => ({ key: int(key), coeff })));
}

function rationalAsMorphion(num: bigint, den: bigint): MorphionForm {
  const frac = normalizeRational(num, den);
  if (frac.kind === "Rational") {
    return morphion(int(frac.den), [{ key: int(-1n), coeff: int(frac.num) }]);
  }
  return morphion(int(1n), [{ key: int(0n), coeff: frac }]);
}

type Morphion = MorphionForm | Expr;

const p1: Morphion = poly("x", [
  { key: 0n, coeff: int(1n) },
  { key: 1n, coeff: int(2n) },
  { key: 2n, coeff: int(3n) },
]);

const p2: Morphion = poly("x", [
  { key: 0n, coeff: int(4n) },
  { key: 1n, coeff: int(5n) },
  { key: 2n, coeff: int(6n) },
]);

function toNum(n: Morphion): number {
  if (n.kind === "Integer") {
    return Number(n.value);
  } else if (n.kind === "Rational") {
    return Number(n.num) / Number(n.den);
  } else if (n.kind === "Complex") {
    return toNum(n.re) + toNum(n.im);
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

function toComplex(n: Morphion): { re: number; im: number } {
  if (n.kind === "Integer") {
    return { re: Number(n.value), im: 0 };
  } else if (n.kind === "Rational") {
    return { re: Number(n.num) / Number(n.den), im: 0 };
  } else if (n.kind === "Complex") {
    return {
      re: toNum(n.re),
      im: toNum(n.im),
    };
  } else if (n.kind === "Power") {
    const baseCplx = toComplex(n.base);
    const expNum = toNum(n.exp);
    
    // Convert base to polar form: r * e^(i*theta)
    const r = Math.sqrt(baseCplx.re * baseCplx.re + baseCplx.im * baseCplx.im);
    const theta = Math.atan2(baseCplx.im, baseCplx.re);
    
    // Calculate (r * e^(i*theta))^exp = r^exp * e^(i*theta*exp)
    const rExp = Math.pow(r, expNum);
    const thetaExp = theta * expNum;
    
    // Convert back to rectangular form
    return {
      re: rExp * Math.cos(thetaExp),
      im: rExp * Math.sin(thetaExp),
    };
  } else if (n.kind === "Plus") {
    let re = 0;
    let im = 0;
    for (const term of n.terms) {
      const termCplx = toComplex(term);
      re += termCplx.re;
      im += termCplx.im;
    }
    return { re, im };
  } else if (n.kind === "Times") {
    let re = 1;
    let im = 0;
    for (const factor of n.factors) {
      const factorCplx = toComplex(factor);
      const newRe = re * factorCplx.re - im * factorCplx.im;
      const newIm = re * factorCplx.im + im * factorCplx.re;
      re = newRe;
      im = newIm;
    }
    return { re, im };
  } else if (n.kind === "Symbol") {
    return { re: NaN, im: NaN }; // シンボルは複素数に変換できないのでNaNを返す
  } else {
    throw new Error("Unsupported Morphion type for toComplex");
  }
}

function toExpression(n: Morphion): string {
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

function toJson(n: Morphion): string {
  const replacer = (_key: string, value: unknown) => {
    if (typeof value === "bigint") {
      return value.toString();
    } else if (value instanceof Map) {
      const arr: unknown[] = [];
      for (const [k, v] of value) {
        arr.push([typeof k === "string" ? JSON.parse(k) : k, v]);
      }
      return arr;
    } else {
      return value;
    }
  };
  return JSON.stringify(n, replacer);
}

const ii = sym("i");

function complexAsMorphion(re: Expr, im: Expr): MorphionForm {
  return morphion(ii, [
    { key: int(0n), coeff: re },
    { key: int(1n), coeff: im },
  ]);
}

function toMorphionForm(n: Morphion): MorphionForm {
  if (n.kind === "Integer") {
    return morphion(int(1n), [{ key: int(0n), coeff: n }]);
  } else if (n.kind === "Rational") {
    return rationalAsMorphion(n.num, n.den);
  } else if (n.kind === "Complex") {
    return complexAsMorphion(n.re, n.im);
  } else if (n.kind === "Power") {
    if (n.base.kind === "Symbol" && n.base.name === "x") {
      return morphion(sym("x"), [{ key: n.exp, coeff: int(1n) }]);
    } else {
      throw new Error("Unsupported base for Power in toMorphionForm");
    }
  } else if (n.kind === "Plus" || n.kind === "Times") {
    const termsOrFactors = n.kind === "Plus" ? n.terms : n.factors;
    
    if (n.kind === "Plus") {
      return morphion(sym("x"), termsOrFactors.map((term, index) => ({
        key: int(BigInt(index)),
        coeff: term,
      })));
    } else {
      // For Times, we can only handle a single factor for simplicity
      if (termsOrFactors.length !== 1) {
        throw new Error("Only single factor supported in Times for toMorphionForm");
      }
      return morphion(sym("x"), [
        { key: int(0n), coeff: termsOrFactors[0] },
      ]);
    }
  } else if (n.kind === "Symbol") {
    return morphion(n, [{ key: int(0n), coeff: int(1n) }]);
  } else {
    throw new Error("Unsupported Morphion type for toMorphionForm");
  }
}

const frac12 = rat(1n, 2n);

const sqrt2 = pow(int(2n), rat(1n, 2n));

console.log(toExpression(frac12)); // (1/2)
console.log(toExpression(sqrt2)); // ((2)^(1/2))
console.log(toComplex(sqrt2)); // { re: 1.414213562373095, im: 0 }
console.log(toExpression(pow(int(-1n), frac12))); // ((-1)^(1/2))
console.log(toComplex(pow(int(-1n), frac12))); // { re: 0, im: 1 }
console.log(toExpression(pow(int(2n), frac12))); // ((2)^(1/2))
console.log(toComplex(pow(int(2n), frac12))); // { re: 1.414213562373095, im: 0 }

export { Morphion, toNum, pow as power, toComplex };