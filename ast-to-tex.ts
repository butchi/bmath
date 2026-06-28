import type { MatraNode } from "./types"

type Mode = "consistent" | "conventional"

function astToTeX(node: MatraNode, mode: Mode = "conventional"): string {
  const { head, children: _children } = node
  const children = (Array.isArray(_children) ? _children : []) as (MatraNode | string)[]

  switch (head) {
    case "Const": {
      const val = String(children[0])
      if (val === "Pi") return "\\pi"
      if (val === "E") return "e"
      return val
    }

    case "Var":
      return String(children[0])

    case "Add":
      return children.map((c) => astToTeX(c as MatraNode, mode)).join(" + ")

    case "Mul": {
      const parts = children.map((c) => astToTeX(c as MatraNode, mode))
      return mode === "consistent" ? parts.join(" \\cdot ") : parts.join(" ")
    }

    case "Div":
      return `\\frac{${astToTeX(children[0] as MatraNode, mode)}}{${astToTeX(children[1] as MatraNode, mode)}}`

    case "Pow":
      return `${astToTeX(children[0] as MatraNode, mode)}^{${astToTeX(children[1] as MatraNode, mode)}}`

    case "Call": {
      const fn = astToTeX(children[0] as MatraNode, mode)
      const arg = astToTeX(children[1] as MatraNode, mode)
      return `${fn}(${arg})`
    }

    case "Sin": {
      const arg = astToTeX(children[0] as MatraNode, mode)
      return mode === "consistent" ? `\\sin(${arg})` : `\\sin ${arg}`
    }

    case "Cos": {
      const arg = astToTeX(children[0] as MatraNode, mode)
      return mode === "consistent" ? `\\cos(${arg})` : `\\cos ${arg}`
    }

    default:
      throw new Error(`Unknown tag: ${head}`)
  }
}

export { astToTeX }
export type { MatraNode }
