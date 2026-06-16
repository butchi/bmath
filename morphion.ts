// # 2026-06-07: Matra Core Math

// 第1層: 一般式
type Expr =
  | { kind: "Integer"; value: bigint }
  | { kind: "Rational"; value: { num: bigint; den: bigint } }
  | { kind: "GaussianInteger"; value: { re: bigint; im: bigint } }
  | { kind: "Complex"; value: { re: Expr; im: Expr } }
  | { kind: "Polynarion"; value: { variable: string; terms: Map<string, MorphionForm> } }
  | { kind: "Symbol"; value: string }
  | { kind: "Plus"; value: Expr[] }
  | { kind: "Times"; value: Expr[] }
  | { kind: "Power"; value: { base: Expr; exp: Expr } }

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
    // 全ての整数項を合計
    let integerSum = 0n;
    const otherTerms = [];
    for (const term of m.value) {
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
      return { kind: "Plus", value: allTerms };
    }
  } else if (m.kind === "Times") {
    // 全ての整数項を乗算
    let integerProduct = 1n;
    const otherFactors = [];
    for (const factor of m.value) {
      if (factor.kind === "Integer") {
        integerProduct *= factor.value;
      } else {
        otherFactors.push(factor);
      }
    }
    
    // 乗算した整数が1でない場合は追加
    const allFactors = integerProduct !== 1n ? [int(integerProduct), ...otherFactors] : otherFactors;
    
    if (allFactors.length === 0) {
      return int(1n);
    } else if (allFactors.length === 1) {
      return allFactors[0];
    } else {
      return { kind: "Times", value: allFactors };
    }
  } else if (m.kind === "Power") {
    // Integer ^ Integer の場合は計算
    if (m.value.base.kind === "Integer" && m.value.exp.kind === "Integer") {
      const base = m.value.base.value;
      const exp = m.value.exp.value;
      if (exp >= 0n) {
        return int(base ** exp);
      }
    }
    return m;
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
    const keyStr = JSON.stringify(entry.key, replacer);
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

function toNum(n: Expr | MorphionForm): number {
  if (n.kind === "Integer") {
    return Number(n.value);
  } else if (n.kind === "Rational") {
    return Number(n.value.num) / Number(n.value.den);
  } else if (n.kind === "Complex") {
    return NaN; // 複素数は数値に変換できないのでNaNを返す
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

function toComplex(n: Expr | MorphionForm): { re: number; im: number } | MorphionForm {
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
    
    return { re, im };
  } else if (n.kind === "Symbol") {
    return { re: NaN, im: NaN }; // シンボルは複素数に変換できないのでNaNを返す
  } else {
    throw new Error("Unsupported Morphion type for toComplex");
  }
}

function toExpression(n: Expr | MorphionForm): string {
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

function toJson(n: Expr | MorphionForm): string {
  return JSON.stringify(n, replacer);
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
  } else if (n.kind === "Symbol") {
    return morphion(n, [{ key: int(0n), coeff: int(1n) }]);
  } else {
    throw new Error(`Cannot morphionize ${n.kind}`);
  }
}

function addMorphionForms(a: MorphionForm, b: MorphionForm): MorphionForm {
  if (a.value.base.kind === "Symbol" && b.value.base.kind === "Symbol" && a.value.base.value === b.value.base.value) {
    const base = a.value.base;
    const terms = new Map<string, { key: Expr; coeff: Expr }>();

    for (const { key, coeff } of a.value.terms.values()) {
      const keyStr = JSON.stringify(key, replacer);
      terms.set(keyStr, { key, coeff });
    }

    for (const { key, coeff } of b.value.terms.values()) {
      const keyStr = JSON.stringify(key, replacer);
      if (terms.has(keyStr)) {
        const existing = terms.get(keyStr)!;
        terms.set(keyStr, {
          key,
          coeff: plus(existing.coeff, coeff),
        });
      } else {
        terms.set(keyStr, { key, coeff });
      }
    }

    return { kind: "MorphionForm", value: { base, terms } };
  } else {
    throw new Error("Cannot add MorphionForms with different bases");
  }
}

function mulMorphionForms(a: MorphionForm, b: MorphionForm): MorphionForm {
  if (a.value.base.kind === "Symbol" && b.value.base.kind === "Symbol" && a.value.base.value === b.value.base.value) {
    const base = a.value.base;
    const terms = new Map<string, { key: Expr; coeff: Expr }>();

    for (const { key: keyA, coeff: coeffA } of a.value.terms.values()) {
      for (const { key: keyB, coeff: coeffB } of b.value.terms.values()) {
        const newKey = plus(keyA, keyB);
        const newCoeff = times(coeffA, coeffB);
        const newKeyStr = JSON.stringify(newKey, replacer);
        if (terms.has(newKeyStr)) {
          const existing = terms.get(newKeyStr)!;
          terms.set(newKeyStr, {
            key: newKey,
            coeff: plus(existing.coeff, newCoeff),
          });
        } else {
          terms.set(newKeyStr, { key: newKey, coeff: newCoeff });
        }
      }
    }

    return { kind: "MorphionForm", value: { base, terms } };
  } else {
    throw new Error("Cannot multiply MorphionForms with different bases");
  }
}

// Test cases
const d1: MorphionForm = {
  kind: "MorphionForm",
  value: {
    base: int(10n),
    terms: new Map<string, { key: Expr; coeff: Expr }>([
      [JSON.stringify(int(0n), replacer), { key: int(0n), coeff: int(1n) }],
      [JSON.stringify(int(1n), replacer), { key: int(1n), coeff: int(2n) }],
      [JSON.stringify(int(2n), replacer), { key: int(2n), coeff: int(3n) }],
    ]),
  },
};

const d2: MorphionForm = {
  kind: "MorphionForm",
  value: {
    base: int(10n),
    terms: new Map<string, { key: Expr; coeff: Expr }>([
      [JSON.stringify(int(0n), replacer), { key: int(0n), coeff: int(4n) }],
      [JSON.stringify(int(1n), replacer), { key: int(1n), coeff: int(5n) }],
      [JSON.stringify(int(2n), replacer), { key: int(2n), coeff: int(6n) }],
    ]),
  },
};

console.log(toNum(d1)); // 321
console.log(toNum(d2)); // 654
console.log(toExpression(d1)); // (1) * (10)^(0) + (2) * (10)^(1) + (3) * (10)^(2)
console.log(toExpression(d2)); // (4) * (10)^(0) + (5) * (10)^(1) + (6) * (10)^(2)
console.log(toJson(d1));
console.log(toJson(d2));

const p1: MorphionForm = {
  kind: "MorphionForm",
  value: {
    base: sym("x"),
    terms: new Map<string, { key: Expr; coeff: Expr }>([
      [JSON.stringify(int(0n), replacer), { key: int(0n), coeff: int(1n) }],
      [JSON.stringify(int(1n), replacer), { key: int(1n), coeff: int(2n) }],
      [JSON.stringify(int(2n), replacer), { key: int(2n), coeff: int(3n) }],
    ]),
  },
};

const p2: MorphionForm = {
  kind: "MorphionForm",
  value: {
    base: sym("x"),
    terms: new Map<string, { key: Expr; coeff: Expr }>([
      [JSON.stringify(int(0n), replacer), { key: int(0n), coeff: int(4n) }],
      [JSON.stringify(int(1n), replacer), { key: int(1n), coeff: int(5n) }],
      [JSON.stringify(int(2n), replacer), { key: int(2n), coeff: int(6n) }],
    ]),
  },
};

console.log(toNum(p1)); // NaN (シンボルが含まれているため数値に変換できない)
console.log(toNum(p2)); // NaN (シンボルが含まれているため数値に変換できない)
console.log(toExpression(p1)); // (1) * (x)^(0) + (2) * (x)^(1) + (3) * (x)^(2)
console.log(toExpression(p2)); // (4) * (x)^(0) + (5) * (x)^(1) + (6) * (x)^(2)
console.log(toJson(p1));
console.log(toJson(p2));

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

export { MorphionForm, toNum, power, toComplex };