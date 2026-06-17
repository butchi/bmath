/// <reference types="jest" />
import { texToAst } from "./tex-to-ast"

type MatraNode = [string, Record<string, any>, (MatraNode | string)[]]

describe("texToAst", () => {
  test("Const: Pi, E, 数字", () => {
    expect(texToAst("\\pi")).toEqual(["Const", {}, ["Pi"]])
    expect(texToAst("e")).toEqual(["Const", {}, ["E"]])
    expect(texToAst("42")).toEqual(["Const", {}, ["42"]])
  })

  test("Var", () => {
    expect(texToAst("x")).toEqual(["Var", {}, ["x"]])
    expect(texToAst("alpha")).toEqual(["Var", {}, ["alpha"]])
  })

  test("Add", () => {
    expect(texToAst("x + 1")).toEqual([
      "Add",
      {},
      [
        ["Var", {}, ["x"]],
        ["Const", {}, ["1"]],
      ],
    ])
  })

  test("Mul: conventional (暗黙の掛け算)", () => {
    expect(texToAst("2x")).toEqual([
      "Mul",
      {},
      [
        ["Const", {}, ["2"]],
        ["Var", {}, ["x"]],
      ],
    ])
  })

  test("Mul: consistent (明示的)", () => {
    expect(texToAst("2 \\cdot x")).toEqual([
      "Mul",
      {},
      [
        ["Const", {}, ["2"]],
        ["Var", {}, ["x"]],
      ],
    ])
  })

  test("Div", () => {
    expect(texToAst("\\frac{1}{2}")).toEqual([
      "Div",
      {},
      [
        ["Const", {}, ["1"]],
        ["Const", {}, ["2"]],
      ],
    ])
  })

  test("Pow", () => {
    expect(texToAst("y^{2}")).toEqual([
      "Pow",
      {},
      [
        ["Var", {}, ["y"]],
        ["Const", {}, ["2"]],
      ],
    ])
  })

  test("Call: f(x)", () => {
    expect(texToAst("f(x)")).toEqual([
      "Call",
      {},
      [
        ["Var", {}, ["f"]],
        ["Var", {}, ["x"]],
      ],
    ])
  })

  test("Sin / Cos: conventional", () => {
    expect(texToAst("\\sin x")).toEqual(["Sin", {}, [["Var", {}, ["x"]]]])
    expect(texToAst("\\cos x")).toEqual(["Cos", {}, [["Var", {}, ["x"]]]])
  })

  test("Sin / Cos: consistent", () => {
    expect(texToAst("\\sin(x)")).toEqual(["Sin", {}, [["Var", {}, ["x"]]]])
    expect(texToAst("\\cos(x)")).toEqual(["Cos", {}, [["Var", {}, ["x"]]]])
  })

  test("複合式: 2x + y^2", () => {
    expect(texToAst("2x + y^{2}")).toEqual([
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
    ])
  })

  test("ネスト: (1 + x) / (1 - x)", () => {
    expect(texToAst("\\frac{1+x}{1-x}")).toEqual([
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
    ])
  })
})
