// 第1層: 一般式
type Expr =
  | { head: "Integer"; attributes: { value: bigint } }
  | { head: "Rational"; attributes: { num: bigint; den: bigint } }
  | { head: "GaussianInteger"; attributes: { re: bigint; im: bigint } }
  | { head: "Complex"; attributes: { re: Expr; im: Expr } }
  | { head: "Symbol"; attributes: { name: string } }
  | { head: "Plus"; attributes: { terms: Expr[] } }
  | { head: "Times"; attributes: { factors: Expr[] } }
  | { head: "Power"; attributes: { base: Expr; exp: Expr } }
  | { head: "Call"; attributes: { fn: string; arg: Expr } };

// 第2層: モーフィオン標準形
type MorphionForm = {
  head: "MorphionForm";
  attributes: {
    base: Expr;
    terms: Map<string, {
      key: Expr;
      coeff: Expr;
    }>;
  };
};

export type { Expr, MorphionForm };