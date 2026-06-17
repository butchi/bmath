import { Expr, MorphionForm } from "./types";
import { replacer } from "./json";
import { int, sym, plus, times } from "./expr";

type MorphionTerm = { key: Expr; coeff: Expr };

function morphion(
  base: Expr,
  entries: MorphionTerm[]
): MorphionForm {
  const terms = new Map<string, MorphionTerm>();
  for (const entry of entries) {
    mergeTerm(terms, entry);
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

function keyOf(e: Expr): string {
  return JSON.stringify(e, replacer);
}

function mergeTerm(terms: Map<string, MorphionTerm>, term: MorphionTerm): void {
  const keyStr = keyOf(term.key);
  if (terms.has(keyStr)) {
    const existing = terms.get(keyStr)!;
    terms.set(keyStr, {
      key: term.key,
      coeff: plus(existing.coeff, term.coeff),
    });
    return;
  }

  terms.set(keyStr, term);
}

function assertSameBase(a: MorphionForm, b: MorphionForm, operation: "add" | "multiply"): Expr {
  if (!sameExpr(a.base, b.base)) {
    if (operation === "add") {
      throw new Error("Cannot add MorphionForms with different bases");
    }
    throw new Error("Cannot multiply MorphionForms with different bases");
  }

  return a.base;
}

function sameExpr(a: Expr, b: Expr): boolean {
  return keyOf(a) === keyOf(b);
}

// same base only
function addMorphionForms(a: MorphionForm, b: MorphionForm): MorphionForm {
  const base = assertSameBase(a, b, "add");
  const terms = new Map<string, MorphionTerm>();

  for (const term of a.terms.values()) {
    terms.set(keyOf(term.key), term);
  }

  for (const term of b.terms.values()) {
    mergeTerm(terms, term);
  }

  return morphion(base, Array.from(terms.values()));
}

// same base only
function mulMorphionForms(a: MorphionForm, b: MorphionForm): MorphionForm {
  const base = assertSameBase(a, b, "multiply");
  const terms = new Map<string, MorphionTerm>();

  for (const { key: keyA, coeff: coeffA } of a.terms.values()) {
    for (const { key: keyB, coeff: coeffB } of b.terms.values()) {
      mergeTerm(terms, {
        key: plus(keyA, keyB),
        coeff: times(coeffA, coeffB),
      });
    }
  }

  return morphion(base, Array.from(terms.values()));
}

export { morphion, poly, addMorphionForms, mulMorphionForms };
