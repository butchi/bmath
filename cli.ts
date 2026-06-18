#!/usr/bin/env node

/// <reference types="node" />

import { texToExpr, texToFormulaNode, texToMorphion, processMatrixTeX, processBatchTeX } from "./index"
import { toExpression } from "./utils"

const args = process.argv.slice(2)

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  console.log(`
bmath TeX Processor CLI

Usage:
  npx ts-node cli.ts "<tex>" [--mode MODE] [--output FORMAT]

Options:
  --mode       Output mode: "conventional" (default) or "consistent"
  --output     Output format: "tex", "expr", "formula", "morphion" (default: "tex")

Examples:
  npx ts-node cli.ts "2x + 1"
  npx ts-node cli.ts "\\sin(x)" --output expr
  npx ts-node cli.ts "x^2 + y^2" --mode consistent
  npx ts-node cli.ts "\\frac{1}{2}" --output formula
`)
  process.exit(0)
}

let texInput = args[0]
let mode: "conventional" | "consistent" = "conventional"
let outputFormat: "tex" | "expr" | "formula" | "morphion" = "tex"

for (let i = 1; i < args.length; i++) {
  if (args[i] === "--mode") {
    mode = (args[i + 1] as any) || "conventional"
    i++
  } else if (args[i] === "--output") {
    outputFormat = (args[i + 1] as any) || "tex"
    i++
  }
}

try {
  let result: any

  if (outputFormat === "tex") {
    result = processMatrixTeX(texInput, mode)
  } else if (outputFormat === "expr") {
    const expr = texToExpr(texInput)
    result = toExpression(expr)
  } else if (outputFormat === "formula") {
    const formula = texToFormulaNode(texInput)
    result = JSON.stringify(formula, null, 2)
  } else if (outputFormat === "morphion") {
    const morphion = texToMorphion(texInput)
    result = JSON.stringify(morphion, null, 2)
  }

  console.log(result)
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
  console.error(`Input: ${texInput}`)
  process.exit(1)
}
