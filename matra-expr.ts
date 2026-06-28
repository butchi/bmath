import type { Expr } from "./types"
import type { MorphionForm } from "./types"
import type { MatraNode } from "./ast-to-tex"
import { astToTeX } from "./ast-to-tex"
import { texToAst } from "./tex-to-ast"
import { int, plus, power, sym, times, call } from "./expr"
import { toMorphionForm } from "./utils"
import { parse as parseMatra } from "./matra-parser.mjs"

type ExprMatraTag = "Integer" | "Symbol" | "Plus" | "Times" | "Power" | "Call"
type ExprMatraNode = [ExprMatraTag, Record<string, any>, ExprMatraNode[]]
type FormulaNode = ["Formula", Record<string, any>, [ExprMatraNode]]
type ParsedMatraNode = {
  head: string
  attributes: Record<string, unknown>
  children: Array<ParsedMatraNode | string | number | boolean>
}

function asParsedNode(value: unknown): ParsedMatraNode {
  if (
    typeof value !== "object" || value === null ||
    !("head" in value) || !("attributes" in value) || !("children" in value)
  ) {
    throw new Error("Matra expression must produce a node")
  }
  return value as ParsedMatraNode
}

function parsedMatraNodeToExpr(node: ParsedMatraNode): Expr {
  const children = () => node.children.map((child) =>
    parsedMatraNodeToExpr(asParsedNode(child)))

  switch (node.head) {
    case "Integer":
      return int(BigInt(String(node.attributes.value)))
    case "Symbol":
      return sym(String(node.attributes.name))
    case "Plus":
      return plus(...children())
    case "Times":
      return times(...children())
    case "Power": {
      const [base, exponent, ...rest] = children()
      if (!base || !exponent || rest.length > 0) {
        throw new Error("Invalid Power node: children length must be 2")
      }
      return power(base, exponent)
    }
    case "Call": {
      const [argument, ...rest] = children()
      if (!argument || rest.length > 0 || typeof node.attributes.fn !== "string") {
        throw new Error("Invalid Call node: fn and one argument are required")
      }
      return call(node.attributes.fn, argument)
    }
    default:
      throw new Error(`Unsupported parsed Matra head: ${node.head}`)
  }
}

function parseMatraExpr(source: string): Expr {
  return parsedMatraNodeToExpr(asParsedNode(parseMatra(source)))
}

function parseMatraFormula(source: string): Expr {
  const formula = asParsedNode(parseMatra(source))
  if (formula.head !== "Formula" || formula.children.length !== 1) {
    throw new Error("Matra formula must contain exactly one expression")
  }
  return parsedMatraNodeToExpr(asParsedNode(formula.children[0]))
}

function isExprMatraNode(node: MatraNode): node is ExprMatraNode {
  return node[0] === "Integer" || node[0] === "Symbol" || node[0] === "Plus" || node[0] === "Times" || node[0] === "Power" || node[0] === "Call"
}

function exprToMatraExprNode(expr: Expr): ExprMatraNode {
  if (expr.head === "Integer") {
    return ["Integer", { value: expr.attributes.value.toString() }, []]
  }

  if (expr.head === "Symbol") {
    return ["Symbol", { name: expr.attributes.name }, []]
  }

  if (expr.head === "Plus") {
    return ["Plus", {}, expr.attributes.terms.map(exprToMatraExprNode)]
  }

  if (expr.head === "Times") {
    return ["Times", {}, expr.attributes.factors.map(exprToMatraExprNode)]
  }

  if (expr.head === "Power") {
    return ["Power", {}, [exprToMatraExprNode(expr.attributes.base), exprToMatraExprNode(expr.attributes.exp)]]
  }

  if (expr.head === "Call") {
    return ["Call", {}, [["Symbol", { name: expr.attributes.fn }, []], exprToMatraExprNode(expr.attributes.arg)]]
  }

  throw new Error(`Unsupported Expr head for Matra conversion: ${expr.head}`)
}

function matraExprNodeToExpr(node: ExprMatraNode): Expr {
  const [tag, props, body] = node

  if (tag === "Integer") {
    if (typeof props.value !== "string") {
      throw new Error("Invalid Integer node: props.value must be string")
    }
    return { head: "Integer", attributes: { value: BigInt(props.value) } }
  }

  if (tag === "Symbol") {
    if (typeof props.name !== "string") {
      throw new Error("Invalid Symbol node: props.name must be string")
    }
    return { head: "Symbol", attributes: { name: props.name } }
  }

  if (tag === "Plus") {
    return { head: "Plus", attributes: { terms: body.map(matraExprNodeToExpr) } }
  }

  if (tag === "Times") {
    return { head: "Times", attributes: { factors: body.map(matraExprNodeToExpr) } }
  }

  if (tag === "Power") {
    if (body.length !== 2) {
      throw new Error("Invalid Power node: body length must be 2")
    }
    return {
      head: "Power",
      attributes: {
        base: matraExprNodeToExpr(body[0]),
        exp: matraExprNodeToExpr(body[1]),
      },
    }
  }

  if (tag === "Call") {
    if (body.length !== 2) {
      throw new Error("Invalid Call node: body length must be 2")
    }
    const fnNode = body[0]
    if (fnNode[0] !== "Symbol") {
      throw new Error("Call function must be a Symbol node")
    }
    return {
      head: "Call",
      attributes: {
        fn: String((fnNode as any)[1].name),
        arg: matraExprNodeToExpr(body[1]),
      },
    }
  }

  throw new Error(`Unsupported Matra tag for Expr conversion: ${tag}`)
}

function exprToFormulaNode(expr: Expr): FormulaNode {
  return ["Formula", {}, [exprToMatraExprNode(expr)]]
}

function toFormulaNode(node: MatraNode): FormulaNode {
  if (node[0] === "Formula") {
    const body = node[2]
    if (!Array.isArray(body) || body.length !== 1) {
      throw new Error("Invalid Formula node: body length must be 1")
    }
    const exprNode = body[0]
    if (!Array.isArray(exprNode) || !isExprMatraNode(exprNode as MatraNode)) {
      throw new Error("Invalid Formula node: body[0] must be Expr Matra node")
    }
    return node as FormulaNode
  }

  if (isExprMatraNode(node)) {
    return ["Formula", {}, [node]]
  }

  throw new Error(`Unsupported node for formula conversion: ${node[0]}`)
}

function formulaNodeToExpr(node: MatraNode): Expr {
  const formula = toFormulaNode(node)
  return matraExprNodeToExpr(formula[2][0])
}

function parseFormula(node: MatraNode | string): Expr {
  return typeof node === "string" ? parseMatraFormula(node) : formulaNodeToExpr(node)
}

function texMathNodeToExpr(node: MatraNode): Expr {
  const [tag, _props, body] = node

  if (tag === "Const") {
    const val = String(body[0])
    if (/^-?\d+$/.test(val)) {
      return int(BigInt(val))
    }
    if (val === "E") {
      return sym("e")
    }
    if (val === "Pi") {
      return sym("pi")
    }
    throw new Error(`Unsupported Const value for Expr conversion: ${val}`)
  }

  if (tag === "Var") {
    return sym(String(body[0]))
  }

  if (tag === "Add") {
    return plus(...(body as MatraNode[]).map(texMathNodeToExpr))
  }

  if (tag === "Mul") {
    return times(...(body as MatraNode[]).map(texMathNodeToExpr))
  }

  if (tag === "Pow") {
    if (body.length !== 2) {
      throw new Error("Invalid Pow node: body length must be 2")
    }
    return power(texMathNodeToExpr(body[0] as MatraNode), texMathNodeToExpr(body[1] as MatraNode))
  }

  if (tag === "Div") {
    if (body.length !== 2) {
      throw new Error("Invalid Div node: body length must be 2")
    }
    return times(
      texMathNodeToExpr(body[0] as MatraNode),
      power(texMathNodeToExpr(body[1] as MatraNode), int(-1n)),
    )
  }

  if (tag === "Sin" || tag === "Cos") {
    if (body.length !== 1) {
      throw new Error(`Invalid ${tag} node: body length must be 1`)
    }
    return call(tag.toLowerCase(), texMathNodeToExpr(body[0] as MatraNode))
  }

  if (tag === "Call") {
    if (body.length !== 2) {
      throw new Error("Invalid Call node: body length must be 2")
    }
    const fn = body[0] as MatraNode
    if (fn[0] !== "Var") {
      throw new Error("Call function must be a Var node")
    }
    return call(String(fn[2][0]), texMathNodeToExpr(body[1] as MatraNode))
  }

  throw new Error(`Unsupported TeX math node for Expr conversion: ${tag}`)
}

function texToExpr(tex: string): Expr {
  return texMathNodeToExpr(texToAst(tex))
}

function texToFormulaNode(tex: string): FormulaNode {
  return exprToFormulaNode(texToExpr(tex))
}

function exprToMorphion(expr: Expr): MorphionForm {
  return toMorphionForm(expr)
}

function formulaNodeToMorphion(node: MatraNode): MorphionForm {
  return exprToMorphion(formulaNodeToExpr(node))
}

function texToMorphion(tex: string): MorphionForm {
  return exprToMorphion(texToExpr(tex))
}

// Mock: TeX input → Matra AST → TeX output (direct TeX processing)
function processMatrixTeX(texInput: string, mode: "conventional" | "consistent" = "conventional"): string {
  try {
    const ast = texToAst(texInput)
    return astToTeX(ast, mode)
  } catch (error) {
    // On parse error, return input as-is
    return texInput
  }
}

// Mock: Batch process multiple TeX expressions
function processBatchTeX(texExpressions: string[], mode: "conventional" | "consistent" = "conventional"): string[] {
  return texExpressions.map((tex) => processMatrixTeX(tex, mode))
}

export {
  exprToMatraExprNode,
  matraExprNodeToExpr,
  exprToFormulaNode,
  formulaNodeToExpr,
  toFormulaNode,
  parseFormula,
  parseMatraExpr,
  parseMatraFormula,
  texMathNodeToExpr,
  texToExpr,
  texToFormulaNode,
  exprToMorphion,
  formulaNodeToMorphion,
  texToMorphion,
  processMatrixTeX,
  processBatchTeX,
}
export type { ExprMatraNode, FormulaNode }
