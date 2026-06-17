import type { Expr } from "./types"
import type { MorphionForm } from "./types"
import type { MatraNode } from "./ast-to-tex"
import { toMorphionForm } from "./utils"

type ExprMatraTag = "Integer" | "Symbol" | "Plus" | "Times" | "Power"
type ExprMatraNode = [ExprMatraTag, Record<string, any>, ExprMatraNode[]]
type FormulaNode = ["Formula", Record<string, any>, [ExprMatraNode]]

function isExprMatraNode(node: MatraNode): node is ExprMatraNode {
  return node[0] === "Integer" || node[0] === "Symbol" || node[0] === "Plus" || node[0] === "Times" || node[0] === "Power"
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

function exprToMorphion(expr: Expr): MorphionForm {
  return toMorphionForm(expr)
}

function formulaNodeToMorphion(node: MatraNode): MorphionForm {
  return exprToMorphion(formulaNodeToExpr(node))
}

export {
  exprToMatraExprNode,
  matraExprNodeToExpr,
  exprToFormulaNode,
  formulaNodeToExpr,
  toFormulaNode,
  parseFormula,
  exprToMorphion,
  formulaNodeToMorphion,
}
export type { ExprMatraNode, FormulaNode }
