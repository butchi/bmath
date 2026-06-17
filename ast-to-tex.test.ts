/// <reference types="jest" />
import { astToTeX } from "./ast-to-tex"
import type { MatraNode } from "./ast-to-tex"

describe("astToTeX", () => {
  test("Const: Pi, E, 数字", () => {
    expect(astToTeX(["Const", {}, ["Pi"]])).toBe("\\pi")
    expect(astToTeX(["Const", {}, ["E"]])).toBe("e")
    expect(astToTeX(["Const", {}, ["42"]])).toBe("42")
  })

  test("Var", () => {
    expect(astToTeX(["Var", {}, ["x"]])).toBe("x")
    expect(astToTeX(["Var", {}, ["alpha"]])).toBe("alpha")
  })

  test("Add", () => {
    const ast: MatraNode = [
      "Add",
      {},
      [
        ["Var", {}, ["x"]],
        ["Const", {}, ["1"]],
      ],
    ]
    expect(astToTeX(ast)).toBe("x + 1")
  })

  test("Mul: consistent vs conventional", () => {
    const ast: MatraNode = [
      "Mul",
      {},
      [
        ["Const", {}, ["2"]],
        ["Var", {}, ["x"]],
      ],
    ]
    expect(astToTeX(ast, "consistent")).toBe("2 \\cdot x")
    expect(astToTeX(ast, "conventional")).toBe("2 x")
  })

  test("Div", () => {
    const ast: MatraNode = [
      "Div",
      {},
      [
        ["Const", {}, ["1"]],
        ["Const", {}, ["2"]],
      ],
    ]
    expect(astToTeX(ast)).toBe("\\frac{1}{2}")
  })

  test("Pow", () => {
    const ast: MatraNode = [
      "Pow",
      {},
      [
        ["Var", {}, ["y"]],
        ["Const", {}, ["2"]],
      ],
    ]
    expect(astToTeX(ast)).toBe("y^{2}")
  })

  test("Call: f(x)", () => {
    const ast: MatraNode = [
      "Call",
      {},
      [
        ["Var", {}, ["f"]],
        ["Var", {}, ["x"]],
      ],
    ]
    expect(astToTeX(ast)).toBe("f(x)")
  })

  test("Sin / Cos: consistent vs conventional", () => {
    const sinAst: MatraNode = ["Sin", {}, [["Var", {}, ["x"]]]]
    const cosAst: MatraNode = ["Cos", {}, [["Var", {}, ["x"]]]]

    expect(astToTeX(sinAst, "consistent")).toBe("\\sin(x)")
    expect(astToTeX(sinAst, "conventional")).toBe("\\sin x")

    expect(astToTeX(cosAst, "consistent")).toBe("\\cos(x)")
    expect(astToTeX(cosAst, "conventional")).toBe("\\cos x")
  })

  test("複合式: 2x + y^2", () => {
    const ast: MatraNode = [
      "Add",
      {},
      [
        [
          "Mul",
          {},
          [
            ["Const", {}, ["2"]],
            ["Var", {}, ["x"]],
          ],
        ],
        [
          "Pow",
          {},
          [
            ["Var", {}, ["y"]],
            ["Const", {}, ["2"]],
          ],
        ],
      ],
    ]
    expect(astToTeX(ast, "consistent")).toBe("2 \\cdot x + y^{2}")
    expect(astToTeX(ast, "conventional")).toBe("2 x + y^{2}")
  })

  test("ネスト: (1 + x) / (1 - x)", () => {
    const ast: MatraNode = [
      "Div",
      {},
      [
        [
          "Add",
          {},
          [
            ["Const", {}, ["1"]],
            ["Var", {}, ["x"]],
          ],
        ],
        [
          "Add",
          {},
          [
            ["Const", {}, ["1"]],
            [
              "Mul",
              {},
              [
                ["Const", {}, ["-1"]],
                ["Var", {}, ["x"]],
              ],
            ],
          ],
        ],
      ],
    ]
    expect(astToTeX(ast)).toBe("\\frac{1 + x}{1 + -1 x}")
  })
})
