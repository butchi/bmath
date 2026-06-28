/// <reference types="jest" />
import { evaluateMatra, parseMatraMathJson } from "../src/matra-math-json"

describe("Matra MathJSON bridge", () => {
  test("converts Matra function syntax to MathJSON", () => {
    expect(parseMatraMathJson("Add(1, 2, 3)")).toEqual(["Add", 1, 2, 3])
    expect(parseMatraMathJson("Power(x, 2)")).toEqual(["Power", "x", 2])
  })

  test("evaluates MathJSON with Compute Engine", () => {
    expect(evaluateMatra("Add(1, 2, 3)")).toBe(6)
    expect(evaluateMatra("Multiply(4, Add(1, 2))")).toBe(12)
  })
})
