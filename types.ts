// 第1層: 一般式
type Expr =
  | { kind: "Integer"; value: bigint }
  | { kind: "Rational"; num: bigint; den: bigint }
  | { kind: "GaussianInteger"; re: bigint; im: bigint }
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

export type { Expr, MorphionForm };