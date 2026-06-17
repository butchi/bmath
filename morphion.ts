import { Expr, MorphionForm } from "./types";
import { replacer } from "./json";
import { int, sym, plus, times } from "./expr";

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

function sameExpr(a: Expr, b: Expr): boolean {
  return keyOf(a) === keyOf(b);
}

// same base only
function addMorphionForms(a: MorphionForm, b: MorphionForm): MorphionForm {
  if (sameExpr(a.base, b.base)) {
    const base = a.base;
    const terms = new Map<string, { key: Expr; coeff: Expr }>();

    for (const { key, coeff } of a.terms.values()) {
      const keyStr = JSON.stringify(key, replacer);
      terms.set(keyStr, { key, coeff });
    }

    for (const { key, coeff } of b.terms.values()) {
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

    const entries = Array.from(terms.values());

    return morphion(base, entries);
  } else {
    throw new Error("Cannot add MorphionForms with different bases");
  }
}

// same base only
function mulMorphionForms(a: MorphionForm, b: MorphionForm): MorphionForm {
  if (sameExpr(a.base, b.base)) {
    const base = a.base;
    const terms = new Map<string, { key: Expr; coeff: Expr }>();

    for (const { key: keyA, coeff: coeffA } of a.terms.values()) {
      for (const { key: keyB, coeff: coeffB } of b.terms.values()) {
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

    const entries = Array.from(terms.values());

    return morphion(base, entries);
  } else {
    throw new Error("Cannot multiply MorphionForms with different bases");
  }
}

export { morphion, poly, addMorphionForms, mulMorphionForms };
