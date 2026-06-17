import type { MatraNode } from "./ast-to-tex"

type TokenKind = "number" | "ident" | "command" | "symbol" | "eof"
type Token = { kind: TokenKind; value: string }

class Tokenizer {
  private readonly src: string
  private pos = 0

  constructor(input: string) {
    this.src = input
  }

  next(): Token {
    this.skipSpaces()
    if (this.pos >= this.src.length) {
      return { kind: "eof", value: "" }
    }

    const ch = this.src[this.pos]

    if (ch === "\\") {
      this.pos += 1
      let name = ""
      while (this.pos < this.src.length && /[A-Za-z]/.test(this.src[this.pos])) {
        name += this.src[this.pos]
        this.pos += 1
      }
      return { kind: "command", value: name }
    }

    if (/[0-9]/.test(ch)) {
      let value = ""
      while (this.pos < this.src.length && /[0-9]/.test(this.src[this.pos])) {
        value += this.src[this.pos]
        this.pos += 1
      }
      return { kind: "number", value }
    }

    if (/[A-Za-z]/.test(ch)) {
      let value = ""
      while (this.pos < this.src.length && /[A-Za-z]/.test(this.src[this.pos])) {
        value += this.src[this.pos]
        this.pos += 1
      }
      return { kind: "ident", value }
    }

    this.pos += 1
    return { kind: "symbol", value: ch }
  }

  private skipSpaces(): void {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) {
      this.pos += 1
    }
  }
}

function constNode(v: string): MatraNode {
  return ["Const", {}, [v]]
}

function varNode(v: string): MatraNode {
  return ["Var", {}, [v]]
}

function addNode(terms: MatraNode[]): MatraNode {
  if (terms.length === 1) return terms[0]
  return ["Add", {}, terms]
}

function mulNode(factors: MatraNode[]): MatraNode {
  if (factors.length === 1) return factors[0]
  return ["Mul", {}, factors]
}

function texToAst(input: string): MatraNode {
  const tokenizer = new Tokenizer(input)
  let current = tokenizer.next()

  function eat(kind: TokenKind, value?: string): Token {
    if (current.kind !== kind || (value !== undefined && current.value !== value)) {
      throw new Error(`Unexpected token: ${current.kind} ${current.value}`)
    }
    const t = current
    current = tokenizer.next()
    return t
  }

  function isStartOfPrimary(t: Token): boolean {
    if (t.kind === "number" || t.kind === "ident" || t.kind === "command") return true
    if (t.kind === "symbol" && (t.value === "(" || t.value === "{")) return true
    return false
  }

  function matchSymbol(value: string): boolean {
    return current.kind === "symbol" && current.value === value
  }

  function parseExpression(): MatraNode {
    return parseAdd()
  }

  function parseAdd(): MatraNode {
    const terms: MatraNode[] = [parseMul()]

    while (current.kind === "symbol" && (current.value === "+" || current.value === "-")) {
      const op = current.value
      eat("symbol", op)
      const rhs = parseMul()
      if (op === "+") {
        terms.push(rhs)
      } else {
        terms.push(mulNode([constNode("-1"), rhs]))
      }
    }

    return addNode(terms)
  }

  function parseMul(): MatraNode {
    const factors: MatraNode[] = [parsePow()]

    while (true) {
      if (current.kind === "command" && current.value === "cdot") {
        eat("command", "cdot")
        factors.push(parsePow())
        continue
      }

      if (isStartOfPrimary(current)) {
        factors.push(parsePow())
        continue
      }

      break
    }

    return mulNode(factors)
  }

  function parsePow(): MatraNode {
    let left = parsePrimary()

    while (matchSymbol("^")) {
      eat("symbol", "^")

      let exp: MatraNode
      if (matchSymbol("{")) {
        eat("symbol", "{")
        exp = parseExpression()
        eat("symbol", "}")
      } else {
        exp = parsePrimary()
      }

      left = ["Pow", {}, [left, exp]]
    }

    return left
  }

  function parseGroup(open: "(" | "{"): MatraNode {
    const close = open === "(" ? ")" : "}"
    eat("symbol", open)
    const expr = parseExpression()
    eat("symbol", close)
    return expr
  }

  function parseFunctionArg(): MatraNode {
    if (matchSymbol("(")) {
      return parseGroup("(")
    }
    return parsePrimary()
  }

  function parsePrimary(): MatraNode {
    if (current.kind === "number") {
      const v = eat("number").value
      return constNode(v)
    }

    if (current.kind === "ident") {
      const name = eat("ident").value
      const base = name === "e" ? constNode("E") : varNode(name)

      if (name !== "e" && matchSymbol("(")) {
        const arg = parseGroup("(")
        return ["Call", {}, [varNode(name), arg]]
      }

      return base
    }

    if (current.kind === "command") {
      const cmd = eat("command").value

      if (cmd === "pi") {
        return constNode("Pi")
      }

      if (cmd === "frac") {
        const num = parseGroup("{")
        const den = parseGroup("{")
        return ["Div", {}, [num, den]]
      }

      if (cmd === "sin") {
        return ["Sin", {}, [parseFunctionArg()]]
      }

      if (cmd === "cos") {
        return ["Cos", {}, [parseFunctionArg()]]
      }

      throw new Error(`Unsupported command: ${cmd}`)
    }

    if (matchSymbol("(")) {
      return parseGroup("(")
    }

    if (matchSymbol("{")) {
      return parseGroup("{")
    }

    throw new Error(`Unexpected token in primary: ${current.kind} ${current.value}`)
  }

  const ast = parseExpression()
  if (current.kind !== "eof") {
    throw new Error(`Unexpected trailing token: ${current.kind} ${current.value}`)
  }
  return ast
}

export { texToAst }
