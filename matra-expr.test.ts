/// <reference types="jest" />
import { int, plus, power, sym, times, call } from "./expr"
import { toExpression } from "./utils"
import {
  exprToFormulaNode,
  exprToMatraExprNode,
  formulaNodeToExpr,
  formulaNodeToMorphion,
  matraExprNodeToExpr,
  parseFormula,
  texMathNodeToExpr,
  texToExpr,
  texToFormulaNode,
  texToMorphion,
  toFormulaNode,
} from "./matra-expr"

describe("matra-expr bridge", () => {
  test("Expr -> ExprMatraNode", () => {
    const expr = plus(times(int(2n), sym("x")), power(sym("y"), int(2n)))

    expect(exprToMatraExprNode(expr)).toEqual([
      "Plus",
      {},
      [
        [
          "Times",
          {},
          [
            ["Integer", { value: "2" }, []],
            ["Symbol", { name: "x" }, []],
          ],
        ],
        [
          "Power",
          {},
          [
            ["Symbol", { name: "y" }, []],
            ["Integer", { value: "2" }, []],
          ],
        ],
      ],
    ])
  })

  test("ExprMatraNode -> Expr", () => {
    const node = [
      "Times",
      {},
      [
        ["Integer", { value: "3" }, []],
        ["Symbol", { name: "x" }, []],
      ],
    ] as const

    expect(matraExprNodeToExpr(node as any)).toEqual(times(int(3n), sym("x")))
  })

  test("Expr -> FormulaNode -> Expr", () => {
    const expr = plus(sym("x"), int(1n))
    const formula = exprToFormulaNode(expr)

    expect(formula).toEqual([
      "Formula",
      {},
      [["Plus", {}, [["Integer", { value: "1" }, []], ["Symbol", { name: "x" }, []]]]],
    ])
    expect(formulaNodeToExpr(formula as any)).toEqual(expr)
  })

  test("FormulaNode validation", () => {
    expect(() => formulaNodeToExpr(["Formula", {}, []] as any)).toThrow("Invalid Formula node: body length must be 1")
  })

  test("ExprMatraNode -> FormulaNode (normalize entry)", () => {
    const node = ["Integer", { value: "7" }, []] as any
    expect(toFormulaNode(node)).toEqual(["Formula", {}, [["Integer", { value: "7" }, []]]])
  })

  test("parseFormula is alias of Formula -> Expr", () => {
    const formula = ["Formula", {}, [["Power", {}, [["Symbol", { name: "x" }, []], ["Integer", { value: "2" }, []]]]]] as any
    expect(parseFormula(formula)).toEqual(power(sym("x"), int(2n)))
  })

  test("FormulaNode -> MorphionForm", () => {
    const formula = ["Formula", {}, [["Power", {}, [["Symbol", { name: "x" }, []], ["Integer", { value: "2" }, []]]]]] as any
    const morphion = formulaNodeToMorphion(formula)

    expect(morphion.kind).toBe("MorphionForm")
    expect(morphion.base).toEqual(sym("x"))
    expect(Array.from(morphion.terms.values())).toEqual([{ key: int(2n), coeff: int(1n) }])
  })

  test("TeX AST node -> Expr", () => {
    const node = ["Pow", {}, [["Var", {}, ["x"]], ["Const", {}, ["2"]]]] as any
    expect(texMathNodeToExpr(node)).toEqual(power(sym("x"), int(2n)))
  })

  test("TeX string -> Expr", () => {
    expect(texToExpr("2x + y^{2}")).toEqual(plus(times(int(2n), sym("x")), power(sym("y"), int(2n))))
  })

  test("TeX string -> FormulaNode", () => {
    expect(texToFormulaNode("x^{2}")).toEqual([
      "Formula",
      {},
      [["Power", {}, [["Symbol", { name: "x" }, []], ["Integer", { value: "2" }, []]]]],
    ])
  })

  test("TeX string -> MorphionForm", () => {
    const morphion = texToMorphion("x^{2}")
    expect(morphion.kind).toBe("MorphionForm")
    expect(morphion.base).toEqual(sym("x"))
    expect(Array.from(morphion.terms.values())).toEqual([{ key: int(2n), coeff: int(1n) }])
  })

  test("TeX sin/cos -> Expr Call (not an error anymore)", () => {
    expect(texToExpr("\\sin x")).toEqual(call("sin", sym("x")))
    expect(texToExpr("\\cos(x)")).toEqual(call("cos", sym("x")))
  })

  test("Call construction", () => {
    const expr = call("sin", sym("x"))
    expect(expr).toEqual({ kind: "Call", fn: "sin", arg: sym("x") })
  })

  test("Call to expression string", () => {
    const expr = call("sin", plus(sym("x"), int(1n)))
    expect(toExpression(expr)).toBe("sin(1 + x)")
  })

  test("Expr with Call -> Matra ExprNode", () => {
    const expr = call("cos", sym("x"))
    expect(exprToMatraExprNode(expr)).toEqual(["Call", {}, [["Symbol", { name: "cos" }, []], ["Symbol", { name: "x" }, []]]])
  })

  test("TeX sin in complex expression", () => {
    expect(texToExpr("\\sin x + 1")).toEqual(plus(int(1n), call("sin", sym("x"))))
  })
})
