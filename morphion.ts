// # 2026-06-07: Matra Core Math

// 第1層: 一般式
type Expr =
  | { kind: "Integer"; value: bigint }
  | { kind: "Rational"; value: { num: bigint; den: bigint } }
  | { kind: "GaussianInteger"; value: { re: bigint; im: bigint } }
  | { kind: "Complex"; value: { re: Expr; im: Expr } }
  | { kind: "Polynarion"; value: { variable: string; terms: Map<string, Morphion> } }
  | { kind: "Symbol"; value: string }
  | { kind: "Plus"; value: Expr[] }
  | { kind: "Times"; value: Expr[] }
  | { kind: "Power"; value: { base: Expr; exp: Expr } }
  | { kind: "MorphionForm"; value: { base: Expr; terms: Map<string, { key: Expr; coeff: Expr }> } };

// 第2層: モーフィオン標準形
type MorphionForm = {
  kind: "MorphionForm";
  value: {
    base: Expr;
    terms: Map<string, {
      key: Expr;
      coeff: Expr;
    }>;
  };
};

type Morphion = MorphionForm | Expr;

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
  
  return { kind: "Rational", value: { num: n, den: d } };
};

const sym = (name: string): Expr => ({ kind: "Symbol", value: name });

const rat = (num: bigint, den: bigint): Expr => {
  return normalizeRational(num, den);
};

const gi = (re: bigint, im: bigint): Expr => {
  return { kind: "GaussianInteger", value: { re, im } };
};

const complex = (re: Expr, im: Expr): Expr => {
  return { kind: "Complex", value: { re, im } };
};

const power = (base: Expr, exp: Expr): Expr => {
  return normalize({
    kind: "Power",
    value: { base, exp },
  });
};

const plus = (...terms: Expr[]): Expr => {
  return normalize({
    kind: "Plus",
    value: terms,
  });
}

const times = (...factors: Expr[]): Expr => {
  return normalize({
    kind: "Times",
    value: factors,
  });
}

function normalize(m: Expr): Expr {
  if (m.kind === "Plus") {
    // 0を消す
    const nonZeroTerms = m.value.filter(term => !(term.kind === "Integer" && term.value === 0n));
    if (nonZeroTerms.length === 0) {
      return int(0n);
    } else if (nonZeroTerms.length === 1) {
      return nonZeroTerms[0];
    } else {
      return { kind: "Plus", value: nonZeroTerms };
    }
  } else if (m.kind === "Times") {
    // 1を消す
    const nonOneFactors = m.value.filter(factor => !(factor.kind === "Integer" && factor.value === 1n));
    if (nonOneFactors.length === 0) {
      return int(1n);
    } else if (nonOneFactors.length === 1) {
      return nonOneFactors[0];
    } else {
      return { kind: "Times", value: nonOneFactors };
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
  return { kind: "MorphionForm", value: { base, terms } };
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
    return morphion(int(frac.value.den), [{ key: int(-1n), coeff: int(frac.value.num) }]);
  }
  return morphion(int(1n), [{ key: int(0n), coeff: frac }]);
}

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
    return Number(n.value.num) / Number(n.value.den);
  } else if (n.kind === "Complex") {
    return toNum(n.value.re) + toNum(n.value.im);
  } else if (n.kind === "Power") {
    return Math.pow(toNum(n.value.base), toNum(n.value.exp));
  } else if (n.kind === "Plus") {
    return n.value.reduce((sum, term) => sum + toNum(term), 0);
  } else if (n.kind === "Times") {
    return n.value.reduce((product, factor) => product * toNum(factor), 1);
  } else if (n.kind === "MorphionForm") {
    let result = 0;
    for (const { key, coeff } of n.value.terms.values()) {
      result += toNum(coeff) * Math.pow(toNum(n.value.base), toNum(key));
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
    return { re: Number(n.value.re), im: Number(n.value.im) };
  } else {
    throw new Error("Unsupported Expr type for gaussianToComplex");
  }
}

function toComplex(n: Morphion): { re: number; im: number } | Morphion {
  if (n.kind === "Integer") {
    return { re: Number(n.value), im: 0 };
  } else if (n.kind === "Rational") {
    return { re: Number(n.value.num) / Number(n.value.den), im: 0 };
  } else if (n.kind === "GaussianInteger") {
    return gaussianToComplex(n);
  } else if (n.kind === "Complex") {
    return {
      re: toNum(n.value.re),
      im: toNum(n.value.im),
    };
  } else if (n.kind === "Power") {
    const baseCplx = toComplex(n.value.base);
    const baseCplxObj = (typeof baseCplx === "object" && "re" in baseCplx) ? baseCplx : { re: 0, im: 0 };
    const expNum = toNum(n.value.exp);
    
    // Convert base to polar form: r * e^(i*theta)
    const re = Number(baseCplxObj.re);
    const im = Number(baseCplxObj.im);
    const r = Math.sqrt(re * re + im * im);
    const theta = Math.atan2(im, re);
    
    // Calculate (r * e^(i*theta))^exp = r^exp * e^(i*theta*exp)
    const rExp = Math.pow(r, expNum);
    const thetaExp = theta * expNum;
    
    // Convert back to rectangular form
    const result = {
      re: rExp * Math.cos(thetaExp),
      im: rExp * Math.sin(thetaExp),
    };
    
    // 実部、虚部ともに整数の場合、複素数を返す
    if (Number.isInteger(result.re) && Number.isInteger(result.im)) {
      return complex(int(BigInt(result.re)), int(BigInt(result.im)));
    }
    return result;
  } else if (n.kind === "Plus") {
    let re = 0;
    let im = 0;
    for (const term of n.value) {
      const termCplx = toComplex(term);
      const termCplxObj = (typeof termCplx === "object" && "re" in termCplx) ? termCplx : { re: 0, im: 0 };
      re += typeof termCplxObj.re === "number" ? termCplxObj.re : 0;
      im += typeof termCplxObj.im === "number" ? termCplxObj.im : 0;
    }
    
    // 実部、虚部ともに整数の場合、複素数を返す
    if (Number.isInteger(re) && Number.isInteger(im)) {
      return complex(int(BigInt(re)), int(BigInt(im)));
    }
    return { re, im };
  } else if (n.kind === "Times") {
    let re = 1;
    let im = 0;
    for (const factor of n.value) {
      const factorCplx = toComplex(factor);
      const factorCplxObj = (typeof factorCplx === "object" && "re" in factorCplx) ? factorCplx : { re: 0, im: 0 };
      const re_val = typeof factorCplxObj.re === "number" ? factorCplxObj.re : 0;
      const im_val = typeof factorCplxObj.im === "number" ? factorCplxObj.im : 0;
      const newRe = re * re_val - im * im_val;
      const newIm = re * im_val + im * re_val;
      re = newRe;
      im = newIm;
    }
    
    // 実部、虚部ともに整数の場合、複素数を返す
    if (Number.isInteger(re) && Number.isInteger(im)) {
      return complex(int(BigInt(re)), int(BigInt(im)));
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
    return `(${toExpression(int(n.value.num))}/${toExpression(int(n.value.den))})`;
  } else if (n.kind === "Complex") {
    return `(${toExpression(n.value.re)} + ${toExpression(n.value.im)}i)`;
  } else if (n.kind === "Power") {
    return `(${toExpression(n.value.base)}^(${toExpression(n.value.exp)}))`;
  } else if (n.kind === "Plus") {
    return n.value.map(term => toExpression(term)).join(" + ");
  } else if (n.kind === "Times") {
    return n.value.map(factor => toExpression(factor)).join(" * ");
  } else if (n.kind === "MorphionForm") {
    return Array.from(n.value.terms.values()).map(({ key, coeff }: { key: Expr; coeff: Expr }) => `(${toExpression(coeff)}) * (${toExpression(n.value.base)}^(${toExpression(key)}))`).join(" + ");
  } else if (n.kind === "Symbol") {
    return n.value;
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
    return rationalAsMorphion(n.value.num, n.value.den);
  } else if (n.kind === "GaussianInteger") {
    return complexAsMorphion(int(n.value.re), int(n.value.im));
  } else if (n.kind === "Complex") {
    return complexAsMorphion(n.value.re, n.value.im);
  } else if (n.kind === "Power") {
    if (n.value.base.kind === "Symbol" && n.value.base.value === "x") {
      return morphion(sym("x"), [{ key: n.value.exp, coeff: int(1n) }]);
    } else {
      throw new Error("Unsupported base for Power in toMorphionForm");
    }
  } else if (n.kind === "Plus" || n.kind === "Times") {
    const termsOrFactors = n.kind === "Plus" ? n.value : n.value;
    
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

const gi1 = gi(1n, 2n);
const gi2 = gi(3n, 4n);

const frac12 = rat(1n, 2n);

const sqrt2 = power(int(2n), rat(1n, 2n));

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

export { Morphion, toNum, power, toComplex };