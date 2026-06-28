import { LatexSyntax } from "@cortex-js/compute-engine/latex-syntax"
import type { MatraNode } from "./types"

type Mode = "consistent" | "conventional"
type MathJson = number | string | { num: string } | [string, ...MathJson[]]

const latexSyntax = new LatexSyntax()

function astToMathJson(node: MatraNode): MathJson {
  const children = node.children
  const expressions = () => children.map((child) => astToMathJson(child as MatraNode))

  switch (node.head) {
    case "Const": {
      const value = String(children[0])
      if (value === "Pi") return "Pi"
      if (value === "E") return "e"
      return { num: value }
    }
    case "Var":
      return String(children[0])
    case "Add":
      return ["Add", ...expressions()]
    case "Mul":
      return ["Multiply", ...expressions()]
    case "Div":
      return ["Divide", ...expressions()]
    case "Pow":
      return ["Power", ...expressions()]
    case "Sin":
    case "Cos":
      return [node.head, ...expressions()]
    case "Call": {
      const fn = children[0] as MatraNode
      if (fn.head !== "Var" || typeof fn.children[0] !== "string") {
        throw new Error("Call function must be a Var node")
      }
      return [fn.children[0], ...children.slice(1).map((child) => astToMathJson(child as MatraNode))]
    }
    default:
      throw new Error(`Unknown Matra head: ${node.head}`)
  }
}

function formatLatex(latex: string, mode: Mode): string {
  let result = latex
    .replace(/\+/g, " + ")
    .replace(/\^(?!\{)(-?\w+)/g, "^{$1}")
    .replace(/\\alpha\b/g, "alpha")

  if (mode === "consistent") {
    return result.replace(/\\cdot\s*/g, " \\cdot ")
  }

  result = result.replace(/\\,/g, " ")
  return result.replace(/\\(sin|cos)\(([^()]*)\)/g, "\\$1 $2")
}

function astToTeX(node: MatraNode, mode: Mode = "conventional"): string {
  const multiply = mode === "consistent" ? "\\cdot" : "\\,"
  const latex = latexSyntax.serialize(astToMathJson(node) as never, {
    invisibleMultiply: multiply,
    multiply,
  })
  return formatLatex(latex, mode)
}

export { astToTeX }
export type { MatraNode }
