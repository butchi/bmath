type Morphion =
  | { kind: "Integer"; value: bigint }
  | { kind: "Rational"; num: bigint; den: bigint }
  | { kind: "Complex"; re: Morphion; im: Morphion }
  | { kind: "Polynarion"; variable: string; terms: Map<string, Morphion> }
  | { kind: "Gridarion"; variable: string; data: Map<Morphion, Morphion>; base: Morphion }
  | { kind: "Power"; base: Morphion; exp: Morphion }
  | { kind: "Plus"; terms: Morphion[] }
  | { kind: "Times"; factors: Morphion[] };
  // | { kind: "Polynomial"; data: Map<Morphion, Morphion>; base: Morphion }

const int = (value: bigint): Morphion => ({
  kind: "Integer",
  value,
});

const gcd = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
};

const normalizeRational = (num: bigint, den: bigint): Morphion => {
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

const rat = (num: bigint, den: bigint): Morphion => {
  return normalizeRational(num, den);
};

const power = (base: Morphion, exp: Morphion): Morphion => {
  return normalize({
    kind: "Power",
    base,
    exp,
  });
};

const plus = (terms: Morphion[]): Morphion => {
  return normalize({
    kind: "Plus",
    terms,
  });
}

const times = (factors: Morphion[]): Morphion => {
  return normalize({
    kind: "Times",
    factors,
  });
}

function normalize(m: Morphion): Morphion {
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

function addMorphion(a: Morphion, b: Morphion): Morphion {
  if (a.kind === "Integer" && b.kind === "Integer") {
    return { kind: "Integer", value: a.value + b.value };
  } else {
    // For simplicity, we will just convert both to numbers and add them
    const sum = toNum(a) + toNum(b);
    return { kind: "Integer", value: BigInt(sum) };
  }
}

function subMorphion(a: Morphion, b: Morphion): Morphion {
  if (a.kind === "Integer" && b.kind === "Integer") {
    return { kind: "Integer", value: a.value - b.value };
  } else {
    const diff = toNum(a) - toNum(b);
    return { kind: "Integer", value: BigInt(diff) };
  }
}

function mulMorphion(a: Morphion, b: Morphion): Morphion {
  if (a.kind === "Integer" && b.kind === "Integer") {
    return { kind: "Integer", value: a.value * b.value };
  } else {
    const product = toNum(a) * toNum(b);
    return { kind: "Integer", value: BigInt(product) };
  }
}

function divMorphion(a: Morphion, b: Morphion): Morphion {
  if (a.kind === "Integer" && b.kind === "Integer") {
    return { kind: "Rational", num: a.value, den: b.value };
  } else {
    const quotient = toNum(a) / toNum(b);
    return { kind: "Integer", value: BigInt(quotient) };
  }
}

function modMorphion(a: Morphion, b: Morphion): Morphion {
  if (a.kind === "Integer" && b.kind === "Integer") {
    return { kind: "Integer", value: a.value % b.value };
  // } else {
  //   const modResult = toNum(a) % toNum(b);
  //   return { kind: "Integer", value: BigInt(modResult) };
  } else {
    throw new Error("Modulus operation is only defined for integers");
  }
}

function powMorphion(base: Morphion, exp: Morphion): Morphion {
  if (base.kind === "Integer" && exp.kind === "Integer") {
    return { kind: "Integer", value: base.value ** exp.value };
  } else {
    const power = Math.pow(toNum(base), toNum(exp));
    return { kind: "Integer", value: BigInt(power) };
  }
}

function sqrtMorphion(n: Morphion): Morphion {
  if (n.kind === "Integer") {
    return { kind: "Integer", value: BigInt(Math.sqrt(Number(n.value))) };
  // } else {
  //   const sqrtValue = Math.sqrt(toNum(n));
  //   return { kind: "Integer", value: BigInt(sqrtValue) };
  } else {    throw new Error("Square root operation is only defined for integers");
  }
}

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
  } else {
    throw new Error("Unsupported Morphion type for toExpression");
  }
}

function toJson(n: Morphion): string {
  return JSON.stringify(n, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    } else if (value instanceof Map) {
      return Object.fromEntries(value);
    } else {
      return value;
    }
  });
}

const p1: Morphion = plus([
  times([int(1n), power(int(10n), int(0n))]),
  times([int(2n), power(int(10n), int(1n))]),
  times([int(3n), power(int(10n), int(2n))]),
]);

const p2: Morphion = plus([
  times([int(4n), power(int(10n), int(0n))]),
  times([int(5n), power(int(10n), int(1n))]),
  times([int(6n), power(int(10n), int(2n))]),
]);

const ii: Morphion = {
  kind: "Complex",
  re: int(0n),
  im: int(1n),
} as Morphion;

const frac12 = rat(1n, 2n);

const sqrt2 = power(int(2n), rat(1n, 2n));

console.log(toNum(p1)); // 321
console.log(toJson(p1)); // {"kind":"Polynomial","data":{"0":"1","1":"2","2":"3"},"base":"10"}
console.log(toExpression(p1)); // (1) * (10)^(0) + (2) * (10)^(1) + (3) * (10)^(2)
console.log(toNum(p2)); // 654
console.log(toNum(frac12)); // 0.5
console.log(toNum(power(int(2n), int(3n)))); // 8
console.log(toNum(sqrt2)); // 1.4142135623730951
console.log(toNum(power(sqrt2, int(2n)))); // 2
console.log(toExpression(power(int(-1n), frac12))); // ((-1)^(1/2))
console.log(toComplex(power(int(-1n), frac12))); // { re: 0, im: 1 }

export { Morphion, toNum, power, toComplex };