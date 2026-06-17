type MatraNode = [string, Record<string, any>, (MatraNode | string)[]]

type Mode = "consistent" | "conventional"

function astToTeX(node: MatraNode, mode: Mode = "conventional"): string {
  const [tag, _props, body] = node
  const children = (Array.isArray(body) ? body : []) as (MatraNode | string)[]

  switch (tag) {
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
      throw new Error(`Unknown tag: ${tag}`)
  }
}

export { astToTeX }
export type { MatraNode }
