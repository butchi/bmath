/// <reference types="jest" />
import { int, plus, power, sym, times } from "./expr"
import { exprToFormulaNode, exprToMatraExprNode, formulaNodeToExpr, matraExprNodeToExpr } from "./matra-expr"

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
})
