import { Expr, MorphionForm } from "./types";
import { replacer } from "./json";
import { int, sym } from "./expr";
import { ComputeEngine } from "@cortex-js/compute-engine";

const compute = (op: string, ...args: any[]) => new ComputeEngine().parse(`${op}(${args.join(', ')})`).evaluate();

type MorphionTerm = { key: Expr; coeff: Expr };

function morphion(
  base: Expr,
  entries: MorphionTerm[]
): MorphionForm {
  const terms = new Map<string, MorphionTerm>();
  for (const entry of entries) {
    mergeTerm(terms, entry);
  }
  return { head: "MorphionForm", attributes: { base, terms } };
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
  const existing = terms.get(keyStr);
  terms.set(keyStr, existing
    ? { key: term.key, coeff: compute("Add", existing.coeff, term.coeff) as unknown as Expr }
    : term);
}

function assertSameBase(a: MorphionForm, b: MorphionForm, operation: "add" | "multiply"): Expr {
  if (!sameExpr(a.attributes.base, b.attributes.base)) {
    if (operation === "add") {
      throw new Error("Cannot add MorphionForms with different bases");
    }
    throw new Error("Cannot multiply MorphionForms with different bases");
  }

  return a.attributes.base;
}

function sameExpr(a: Expr, b: Expr): boolean {
  return keyOf(a) === keyOf(b);
}

// same base only
function addMorphionForms(a: MorphionForm, b: MorphionForm): MorphionForm {
  const base = assertSameBase(a, b, "add");
  const terms = new Map<string, MorphionTerm>();

  for (const term of a.attributes.terms.values()) {
    terms.set(keyOf(term.key), term);
  }

  for (const term of b.attributes.terms.values()) {
    mergeTerm(terms, term);
  }

  return morphion(base, Array.from(terms.values()));
}

// same base only
function mulMorphionForms(a: MorphionForm, b: MorphionForm): MorphionForm {
  const base = assertSameBase(a, b, "multiply");
  const terms = new Map<string, MorphionTerm>();

  for (const { key: keyA, coeff: coeffA } of a.attributes.terms.values()) {
    for (const { key: keyB, coeff: coeffB } of b.attributes.terms.values()) {
      mergeTerm(terms, {
        key: compute("Add", keyA, keyB) as unknown as Expr,
        coeff: compute("Multiply", coeffA, coeffB) as unknown as Expr,
      });
    }
  }

  return morphion(base, Array.from(terms.values()));
}

export { morphion, poly, addMorphionForms, mulMorphionForms };
