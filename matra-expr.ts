import type { Expr } from "./types"
import type { MorphionForm } from "./types"
import type { MatraNode } from "./ast-to-tex"
import { texToAst } from "./tex-to-ast"
import { int, plus, power, sym, times, call } from "./expr"
import { toMorphionForm } from "./utils"

type ExprMatraTag = "Integer" | "Symbol" | "Plus" | "Times" | "Power" | "Call"
type ExprMatraNode = [ExprMatraTag, Record<string, any>, ExprMatraNode[]]
type FormulaNode = ["Formula", Record<string, any>, [ExprMatraNode]]

function isExprMatraNode(node: MatraNode): node is ExprMatraNode {
  return node[0] === "Integer" || node[0] === "Symbol" || node[0] === "Plus" || node[0] === "Times" || node[0] === "Power" || node[0] === "Call"
}

function exprToMatraExprNode(expr: Expr): ExprMatraNode {
  if (expr.kind === "Integer") {
    return ["Integer", { value: expr.value.toString() }, []]
  }

  if (expr.kind === "Symbol") {
    return ["Symbol", { name: expr.name }, []]
  }

  if (expr.kind === "Plus") {
    return ["Plus", {}, expr.terms.map(exprToMatraExprNode)]
  }

  if (expr.kind === "Times") {
    return ["Times", {}, expr.factors.map(exprToMatraExprNode)]
  }

  if (expr.kind === "Power") {
    return ["Power", {}, [exprToMatraExprNode(expr.base), exprToMatraExprNode(expr.exp)]]
  }

  if (expr.kind === "Call") {
    return ["Call", {}, [["Symbol", { name: expr.fn }, []], exprToMatraExprNode(expr.arg)]]
  }

  throw new Error(`Unsupported Expr kind for Matra conversion: ${expr.kind}`)
}

function matraExprNodeToExpr(node: ExprMatraNode): Expr {
  const [tag, props, body] = node

  if (tag === "Integer") {
    if (typeof props.value !== "string") {
      throw new Error("Invalid Integer node: props.value must be string")
    }
    return { kind: "Integer", value: BigInt(props.value) }
  }

  if (tag === "Symbol") {
    if (typeof props.name !== "string") {
      throw new Error("Invalid Symbol node: props.name must be string")
    }
    return { kind: "Symbol", name: props.name }
  }

  if (tag === "Plus") {
    return { kind: "Plus", terms: body.map(matraExprNodeToExpr) }
  }

  if (tag === "Times") {
    return { kind: "Times", factors: body.map(matraExprNodeToExpr) }
  }

  if (tag === "Power") {
    if (body.length !== 2) {
      throw new Error("Invalid Power node: body length must be 2")
    }
    return {
      kind: "Power",
      base: matraExprNodeToExpr(body[0]),
      exp: matraExprNodeToExpr(body[1]),
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
      kind: "Call",
      fn: String((fnNode as any)[1].name),
      arg: matraExprNodeToExpr(body[1]),
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

function parseFormula(node: MatraNode): Expr {
  return formulaNodeToExpr(node)
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

export {
  exprToMatraExprNode,
  matraExprNodeToExpr,
  exprToFormulaNode,
  formulaNodeToExpr,
  toFormulaNode,
  parseFormula,
  texMathNodeToExpr,
  texToExpr,
  texToFormulaNode,
  exprToMorphion,
  formulaNodeToMorphion,
  texToMorphion,
}
export type { ExprMatraNode, FormulaNode }
