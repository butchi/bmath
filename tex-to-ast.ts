import type { MatraNode } from "./types"

type TokenHead = "number" | "ident" | "command" | "symbol" | "eof"
type Token = { head: TokenHead; attributes: { value: string } }

class Tokenizer {
  private readonly src: string
  private pos = 0

  constructor(input: string) {
    this.src = input
  }

  next(): Token {
    this.skipSpaces()
    if (this.pos >= this.src.length) {
      return { head: "eof", attributes: { value: "" } }
    }

    const ch = this.src[this.pos]

    if (ch === "\\") {
      this.pos += 1
      let name = ""
      while (this.pos < this.src.length && /[A-Za-z]/.test(this.src[this.pos])) {
        name += this.src[this.pos]
        this.pos += 1
      }
      return { head: "command", attributes: { value: name } }
    }

    if (/[0-9]/.test(ch)) {
      let value = ""
      while (this.pos < this.src.length && /[0-9]/.test(this.src[this.pos])) {
        value += this.src[this.pos]
        this.pos += 1
      }
      return { head: "number", attributes: { value } }
    }

    if (/[A-Za-z]/.test(ch)) {
      let value = ""
      while (this.pos < this.src.length && /[A-Za-z]/.test(this.src[this.pos])) {
        value += this.src[this.pos]
        this.pos += 1
      }
      return { head: "ident", attributes: { value } }
    }

    this.pos += 1
    return { head: "symbol", attributes: { value: ch } }
  }

  private skipSpaces(): void {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) {
      this.pos += 1
    }
  }
}

function constNode(v: string): MatraNode {
  return { head: "Const", attributes: {}, children: [v] }
}

function varNode(v: string): MatraNode {
  return { head: "Var", attributes: {}, children: [v] }
}

function addNode(terms: MatraNode[]): MatraNode {
  if (terms.length === 1) return terms[0]
  return { head: "Add", attributes: {}, children: terms }
}

function mulNode(factors: MatraNode[]): MatraNode {
  if (factors.length === 1) return factors[0]
  return { head: "Mul", attributes: {}, children: factors }
}

function texToAst(input: string): MatraNode {
  const tokenizer = new Tokenizer(input)
  let current = tokenizer.next()

  function eat(head: TokenHead, value?: string): Token {
    if (current.head !== head || (value !== undefined && current.attributes.value !== value)) {
      throw new Error(`Unexpected token: ${current.head} ${current.attributes.value}`)
    }
    const t = current
    current = tokenizer.next()
    return t
  }

  function isStartOfPrimary(t: Token): boolean {
    if (t.head === "number" || t.head === "ident" || t.head === "command") return true
    if (t.head === "symbol" && (t.attributes.value === "(" || t.attributes.value === "{")) return true
    return false
  }

  function matchSymbol(value: string): boolean {
    return current.head === "symbol" && current.attributes.value === value
  }

  function parseExpression(): MatraNode {
    return parseAdd()
  }

  function parseAdd(): MatraNode {
    const terms: MatraNode[] = [parseMul()]

    while (current.head === "symbol" && (current.attributes.value === "+" || current.attributes.value === "-")) {
      const op = current.attributes.value
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
      if (current.head === "command" && current.attributes.value === "cdot") {
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

      left = { head: "Pow", attributes: {}, children: [left, exp] }
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
    if (current.head === "number") {
      const v = eat("number").attributes.value
      return constNode(v)
    }

    if (current.head === "ident") {
      const name = eat("ident").attributes.value
      const base = name === "e" ? constNode("E") : varNode(name)

      if (name !== "e" && matchSymbol("(")) {
        const arg = parseGroup("(")
        return { head: "Call", attributes: {}, children: [varNode(name), arg] }
      }

      return base
    }

    if (current.head === "command") {
      const cmd = eat("command").attributes.value

      if (cmd === "pi") {
        return constNode("Pi")
      }

      if (cmd === "frac") {
        const num = parseGroup("{")
        const den = parseGroup("{")
        return { head: "Div", attributes: {}, children: [num, den] }
      }

      if (cmd === "sin") {
        return { head: "Sin", attributes: {}, children: [parseFunctionArg()] }
      }

      if (cmd === "cos") {
        return { head: "Cos", attributes: {}, children: [parseFunctionArg()] }
      }

      throw new Error(`Unsupported command: ${cmd}`)
    }

    if (matchSymbol("(")) {
      return parseGroup("(")
    }

    if (matchSymbol("{")) {
      return parseGroup("{")
    }

    throw new Error(`Unexpected token in primary: ${current.head} ${current.attributes.value}`)
  }

  const ast = parseExpression()
  if (current.head !== "eof") {
    throw new Error(`Unexpected trailing token: ${current.head} ${current.attributes.value}`)
  }
  return ast
}

export { texToAst }
