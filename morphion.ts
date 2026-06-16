type Morphion = {
  data: Map<Morphion, Morphion>;
  base: Morphion
} | bigint

const p1: Morphion = {
  data: new Map([
    [0n, 1n],
    [1n, 2n],
    [2n, 3n],
  ]),
  base: 10n,
};

const p2: Morphion = {
  data: new Map([
    [0n, 4n],
    [1n, 5n],
    [2n, 6n],
  ]),
  base: 10n,
};

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

function toExpression(n: Morphion): string {
  if (typeof n === "bigint") {
    return n.toString();
  } else {
    let result = "";
    for (const [key, value] of n.data) {
      result += `(${toExpression(value)}) * (${toExpression(n.base)})^(${toExpression(key)}) + `;
    }
    return result.slice(0, -3);
  }
}

function toNumber(n: Morphion): number {
  if (typeof n === "bigint") {
    return Number(n);
  } else {
    let result = 0;
    for (const [key, value] of n.data) {
      result += toNumber(value) * Math.pow(toNumber(n.base), toNumber(key));
    }
    return result;
  }
}

function toComplex(n: Morphion): { re: number; im: number } {
  if (typeof n === "bigint") {
    return { re: Number(n), im: 0 };
  } else {
    let re = 0;
    let im = 0;
    for (const [key, value] of n.data) {
      const complexValue = toComplex(value);
      const baseCplx = toComplex(n.base);
      const keyNum = toNumber(key);
      
      // Calculate base^key in complex form
      const baseAbsolute = Math.sqrt(baseCplx.re * baseCplx.re + baseCplx.im * baseCplx.im);
      const baseAngle = Math.atan2(baseCplx.im, baseCplx.re);
      const resultAbsolute = Math.pow(baseAbsolute, keyNum);
      const resultAngle = baseAngle * keyNum;
      
      const basePowRe = resultAbsolute * Math.cos(resultAngle);
      const basePowIm = resultAbsolute * Math.sin(resultAngle);
      
      // Multiply complexValue by base^key
      re += complexValue.re * basePowRe - complexValue.im * basePowIm;
      im += complexValue.re * basePowIm + complexValue.im * basePowRe;
    }
    return { re, im };
  }
}

function frac(num: bigint, den: bigint): Morphion {
  const data = new Map<Morphion, Morphion>([
    [-1n, num],
  ]);
  return {
    data,
    base: den,
  };
}

function pow(base: Morphion, exp: Morphion): Morphion {
  if (typeof base === "bigint" && typeof exp === "bigint") {
    return base ** exp;
  } else {
    return {
      data: new Map([[exp, 1n]]),
      base,
    }
  }
}

const frac12: Morphion = frac(1n, 2n);

function sqrt(n: Morphion): Morphion {
  return pow(n, frac12);
}

const sqrt2: Morphion = sqrt(2n);

console.log(toNumber(p1)); // 321
console.log(toJson(p1)); // {"data":{"0":"1","1":"2","2":"3"},"base":"10"}
console.log(toExpression(p1)); // (1) * (10)^(0) + (2) * (10)^(1) + (3) * (10)^(2)
console.log(toNumber(p2)); // 654
console.log(toNumber(frac12)); // 0.5
console.log(toNumber(pow(2n, 3n))); // 8
console.log(toNumber(sqrt2)); // 1.4142135623730951
console.log(toNumber(pow(sqrt2, 2n))); // 2
console.log(toExpression(pow(-1n, frac12))); // { re: 0, im: 1 }
console.log(toComplex(pow(-1n, frac12))); // { re: 0, im: 1 }

export { Morphion, toNumber, frac, pow, sqrt, toComplex };