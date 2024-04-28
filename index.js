class BMath {
    constructor(head, ...seq) {
        this.head = head
        this.seq = seq
    }

    toInt() {
        if (intQ(this)) {
            if (this.head === 'Num0') {
                return 0
            } else if (this.head === 'Num1') {
                return 1
            } else if (this.head === 'Minus1') {
                return -1
            } else if (this.head === 'Minus') {
                const [intN] = this.seq

                const [absN] = intN.seq

                return -absN
            } else if (this.head === 'Int') {
                const [n] = this.seq

                return n
            }
        }
    }

    toFloat() {
        if (this.head === 'Num0') {
            return 0
        } else if (this.head === 'Num1') {
            return 1
        } else if (this.head === 'Minus1') {
            return -1
        } else if (this.head === 'Minus') {
            const [intN] = this.seq

            const [absN] = intN.seq

            return -absN
        } else if (this.head === 'Int') {
            const [n] = this.seq

            return parseInt(n)
        } else {
            const [n] = this.seq

            return parseFloat(n)
        }
    }

    toBigInt() {
        if (intQ(this)) {
            if (this.head === 'Num0') {
                return 0n
            } else if (this.head === 'Num1') {
                return 1n
            } else if (this.head === 'Minus1') {
                return -1n
            } else if (this.head === 'Minus') {
                const [absN] = this.seq

                return -BigInt(absN)
            } else if (this.head === 'Int') {
                const [n] = this.seq

                return BigInt(n)
            }
        }
    }

    toArrStr() {
        const head = this.head
        const seq = this.seq.map(item => {
            if (item == null) {
            } else if (item instanceof BMath) {
                return item.valueOf()
            } else {
                return JSON.stringify(item)
            }
        })

        if (seq.length === 0) {
            return `["${head}"]`
        } else {
            return `["${head}", ${seq.join(', ')}]`
        }
    }

    valueOf() {
        const head = this.head

        if (head == null) {
        } else if (numQ(this)) {
            return parseFloat(this.seq[0])
        } else if (head === 'indet') {
            return undefined
        }
    }

    toString() {
        const head = this.head
        const seq = this.seq.map(item => {
            if (item == null) {
            } else if (item instanceof BMath) {
                return item.toString()
            } else {
                return JSON.stringify(item)
            }
        })

        return `${head}(${seq.join(', ')})`
    }
}

const gcd = (a, b) => {
    if (b === 0) return a
    return gcd(b, a % b)
}

const lcm = (a, b) => {
    return (a * b) / gcd(a, b)
}

const indet = _ => {
    return new BMath('Indet')
}

const bool0 = _ => {
    return new BMath('Bool0')
}

const bool1 = _ => {
    return new BMath('Bool1')
}

const num0 = _ => {
    return new BMath('Num0')
}

const num1 = _ => {
    return new BMath('Num1')
}

const minus1 = _ => {
    return new BMath('Minus1')
}

const numI = _ => {
    return new BMath('NumI')
}

const minusI = _ => {
    return new BMath('MinusI')
}

const numE = _ => {
    return new BMath('NumE')
}

const pi = _ => {
    return new BMath('Pi')
}

const infty = _ => {
    return new BMath('Infty')
}

const intQ = arg => {
    if (arg instanceof BMath) {
        if (arg.head === 'Minus') {
            const [val] = arg.seq
            return intQ(val)
        }

        return arg.head === 'Num0' || arg.head === 'Num1' || arg.head === 'Int'
    }

    return indet()
}

const numQ = arg => {
    if (arg instanceof BMath) {
        const expr = arg

        if (expr.head === 'Sym') {
            return false
        }

        return intQ(expr) || expr.head === 'Real' || expr.head === 'Complex'
    }

    return indet()
}

const symQ = arg => {
    if (arg instanceof BMath) {
        const expr = arg

        return expr.head === 'Sym'
    }

    return indet()
}

const monoQ = arg => {
    if (arg instanceof BMath) {
        const expr = arg

        return symQ(expr) || numQ(expr)
    }

    return indet()
}

const powGroupQ = arg => {
    if (arg instanceof BMath) {
        const expr = arg

        return (
            expr.head === 'Power' ||
            expr.head === 'LogE' ||
            expr.head === 'Log2' ||
            expr.head === 'Log10' ||
            expr.head === 'Log' ||
            expr.head === 'Square'
        )
    }

    return indet()
}

const multGroupQ = arg => {
    if (arg instanceof BMath) {
        const expr = arg

        return (
            expr.head === 'Times' ||
            expr.head === 'Frac' ||
            expr.head === 'Recip'
        )
    }

    return indet()
}

const addGroupQ = arg => {
    if (arg instanceof BMath) {
        const expr = arg

        return expr.head === 'Plus' || expr.head === 'Minus'
    }

    return indet()
}

// const positive = arg => {
// }

const negative = arg => {
    if (arg instanceof BMath) {
        const expr = arg

        return expr.head === 'Minus'
    } else {
        return negative(parse(arg))
    }
}

// TODO: 明白ではない場合には未評価のままにするか検討
const nonNegative = arg => intQ(arg) && !negative(arg)

const divisible = (n, m) => {
    const ret = n % m === 0

    return ret
}

const factorInteger = n => {
    if (n === 0) {
        return [[0, 1]]
    }

    if (n === 1) {
        return [[1, 1]]
    }

    const factorArr = []

    const temp = { value: n }

    for (let i = 2; i <= n / 2; i++) {
        const cnt = { value: 0 }

        while (divisible(temp.value, i)) {
            cnt.value++

            temp.value /= i
        }

        if (cnt.value > 0) {
            factorArr.push([i, cnt.value])
        }
    }

    if (temp.value > 1) {
        factorArr.push([temp.value, 1])
    }

    const ret = factorArr

    return ret
}

const squareFreeQ = n => {
    if (n === 0) {
        return false
    }

    const ret = factorInteger(n).filter(keyVal => keyVal[1] > 1).length === 0

    return ret
}

const bool = arg => {
    if (arg == null) {
    } else if (typeof arg === 'boolean') {
        const b = arg

        return bool(b.toString())
    } else if (typeof arg === 'number') {
        const n = arg

        return bool(n.toString())
    } else if (typeof arg === 'bigint') {
        const n = arg

        return bool(n.toString())
    } else if (typeof arg === 'string') {
        const str = arg

        if (str === '') {
        } else if (str === '1' || str.toLocaleLowerCase() === 'true') {
            return true
        } else if (str === '0' || str.toLocaleLowerCase() === 'false') {
            return false
        }
    }

    return indet()
}

const complex = (...argArr) => {}

const real = (...argArr) => {}

const int = arg => {
    if (arg == null) {
    } else if (typeof arg === 'number') {
        return int(arg.toString())
    } else if (typeof arg === 'bigint') {
        return int(arg.toString())
    } else if (typeof arg === 'string') {
        const str = arg

        if (str === '') {
        } else if (str === '0') {
            return num0()
        } else if (str === '1') {
            return num1()
        } else if (str.match(/^[1-9]+[0-9]*$/)) {
            return new BMath('Int', str)
        } else if (str.match(/^-[1-9]+[0-9]*$/)) {
            return minus(int(str.slice(1)))
        } else {
            // TODO: Real Number
        }
    } else if (arg instanceof BMath) {
        const expr = arg

        if (intQ(expr)) {
            return expr
        } else {
            return int(arg)
        }
    }

    return indet()
}

const sym = arg => {
    if (arg == null) {
    } else if (typeof arg === 'string') {
        if (arg.match(/[a-z][0-9a-zA-Z]*/)) {
            return new BMath('Sym', arg.toString())
        }
    }

    return indet()
}

const num = arg => {
    if (arg == null) {
    } else if (typeof arg === 'number') {
        return num(arg.toString())
    } else if (typeof arg === 'bigint') {
        return num(arg.toString())
    } else if (typeof arg === 'string') {
        const str = arg

        if (str[0] === '-') {
            return minus(parse(str.slice(1)))
        } else if (str === '0') {
            return num0()
        } else if (str.match(/^[1-9]+[0-9]*$/)) {
            return int(str)
        }
    }

    return indet()
}

const rule = (key, val) => {
    const [keyExpr, valExpr] = [parse(key), parse(val)]

    return new BMath('Rule', keyExpr, valExpr)
}

const arr = (...argArr) => {
    if (argArr == null) {
    } else if (argArr.length >= 1) {
        const exprArr = argArr.map(arg => parse(arg))

        return new BMath('Arr', ...exprArr)
    }
}

const plus = (...argArr) => {
    if (argArr == null) {
    } else if (argArr.length === 1) {
        const [arg] = argArr

        const expr = parse(arg)

        return expr
    } else if (argArr.length === 2) {
        const [arg1, arg2] = argArr

        const [expr1, expr2] = [parse(arg1), parse(arg2)]

        if (intQ(expr1) && intQ(expr2)) {
            const num1 = expr1.toBigInt()
            const num2 = expr2.toBigInt()

            return num(num1 + num2)
        }

        // TODO Plus式等の結合

        return new BMath('Plus', expr1, expr2)
    } else if (argArr.length >= 3) {
        const exprArr = argArr.map(arg => parse(arg))

        const n = exprArr
            .filter(expr => numQ(expr))
            .reduce((p, c) => plus(p, c))

        const poly = exprArr.filter(expr => !numQ(expr))

        // TODO さらなる簡約化
        return new BMath('Plus', ...poly, n)
    } else {
    }

    return indet()
}

const minus = (...argArr) => {
    if (argArr == null) {
    } else if (argArr.length === 1) {
        const [arg] = argArr

        const expr = parse(arg)

        if (negative(expr)) {
            return new BMath('Minus', expr.seq[0])
        }

        if (expr.head === 'Num1') {
            return minus1()
        }

        return new BMath('Minus', expr)
    } else if (argArr.length === 2) {
        const [arg1, arg2] = argArr

        const [expr1, expr2] = [parse(arg1), parse(arg2)]

        if (intQ(expr1).valueOf() && intQ(expr2).valueOf()) {
            const num1 = expr1.toBigInt()
            const num2 = expr2.toBigInt()

            return num(num1 - num2)
        }

        return plus(expr1, minus(expr2))
    } else {
    }

    return indet()
}

const times = (...argArr) => {
    if (argArr == null) {
    } else if (argArr.length === 1) {
        const [arg] = argArr

        const expr = parse(arg)

        return expr
    } else if (argArr.length === 2) {
        const [arg1, arg2] = argArr

        const [expr1, expr2] = [parse(arg1), parse(arg2)]

        if (intQ(expr1) && intQ(expr2)) {
            const num1 = expr1.toBigInt()
            const num2 = expr2.toBigInt()

            return num(num1 * num2)
        }

        return new BMath('Times', expr1, expr2)
    } else if (argArr.length >= 3) {
    } else {
    }
}

const square = arg => {
    if (arg == null) {
    } else if (typeof arg === 'string') {
        return `Square("${arg}")`
    } else if (typeof arg === 'number') {
        const num = arg

        return num * num
    }
}

const frac = (...argArr) => {
    if (argArr == null) {
    } else if (argArr.length === 1) {
        const arg = argArr[0]

        if (arg == null) {
        } else if (typeof arg === 'string') {
            const str = arg

            return str
        } else if (typeof arg === 'number') {
            const num = arg

            return num
        }
    } else if (argArr.length === 2) {
        const [arg1, arg2] = argArr

        if (arg1 == null && arg2 == null) {
        } else if (typeof arg1 === 'string') {
            if (arg2 == null) {
            } else if (typeof arg2 === 'string') {
                const [str1, str2] = [arg1, arg2]

                if (str1 === str2) {
                    return 1
                } else {
                    return `Frac("${str1}", "${str2}")`
                }
            } else if (typeof arg2 === 'number') {
                const [str, num] = [arg1, arg2]

                if (num === 0) {
                    return NaN
                } else if (num === 1) {
                    return str
                } else {
                    return `Frac("${str}", ${num})`
                }
            }
        } else if (typeof arg1 === 'number') {
            if (arg2 == null) {
            } else if (typeof arg2 === 'string') {
                const [num, str] = [arg1, arg2]

                if (num === 0) {
                    return 0
                } else if (num === 1) {
                    return `Recip("${str}")`
                } else {
                    return `Frac(${num}, "${str}")`
                }
            } else if (typeof arg2 === 'number') {
                const [num1, num2] = [arg1, arg2]

                if (num1 === 0) {
                    if (num2 === 0) {
                        return NaN
                    } else {
                        return 0
                    }
                } else if (num1 === 1) {
                    if (num2 === 1) {
                        return 1
                    } else {
                        return `Recip(${num2})`
                    }
                } else {
                    const gcdVal = gcd(num1, num2)

                    if (num1) {
                    } else {
                        const ret = `Frac(${num1 / gcdVal}, ${num2 / gcdVal})`

                        return ret
                    }
                }
            }
        }
    } else if (argArr.length >= 3) {
    } else {
    }
}

const recip = arg => {}

const power = (...argArr) => {
    if (argArr == null) {
    } else if (argArr.length === 1) {
        const arg = argArr[0]

        if (arg == null) {
        } else if (typeof arg === 'string') {
            const str = arg

            return str
        } else if (typeof arg === 'number') {
            const num = arg

            return num
        }
    } else if (argArr.length === 2) {
        const [arg1, arg2] = argArr

        const [expr1, expr2] = [parse(arg1), parse(arg2)]

        if (intQ(expr1) && intQ(expr2)) {
            const num1 = expr1.toBigInt()
            const num2 = expr2.toBigInt()

            return num(num1 ** num2)
        }

        return new BMath('Power', expr1, expr2)
    } else if (argArr.length >= 3) {
    } else {
    }
}

const sqrt = arg => {
    if (arg == null) {
    } else if (typeof arg === 'string') {
        const str = arg

        return `Sqrt("${str}")`
    } else if (typeof arg === 'number') {
        const num = arg

        const ret = factorInteger(num)

        return num
    }
}

const parse = arg => {
    if (arg == null) {
    } else if (typeof arg === 'number') {
        const n = arg

        return num(n)
    } else if (typeof arg === 'bigint') {
        const n = arg

        return num(n)
    } else if (typeof arg === 'string') {
        const str = arg

        if (str === '') {
            return indet()
        } else if (str.match(/-?[1-9][0-9]+/)) {
            const bigInt = str

            return num(bigInt)
        } else if (str.match(/[a-z][0-9a-zA-Z]*/)) {
            const s = str

            return sym(s)
        }

        try {
            const val = JSON.parse(str)
            if (val == null) {
            } else if (typeof val === 'number') {
                return num(val)
            } else if (typeof val === 'string') {
                return parse(val)
            } else if (val instanceof Array) {
                return arr(...val)
            } else if (val instanceof Object) {
                return arr(
                    ...Object.entries(val).map(([key, val]) => rule(key, val))
                )
            } else {
            }
        } catch (err) {
            console.log(`parse error with ${str}`, err)
        }
    } else if (arg instanceof BMath) {
        const expr = arg

        return expr
    } else if (arg instanceof Array) {
        return arr(...arg)
    } else if (arg instanceof Object) {
        return arr(...Object.entries(arg).map(([key, val]) => rule(key, val)))
    }

    return indet()
}

// const evaluate = arg => {
//     if (arg == null) {
//     } else if (arg instanceof BMath) {
//         const expr = arg

//         if (expr.head == null) {
//         } else if (expr.head === 'Plus') {
//             return plus(...expr.seq)
//         }
//     }
// }

console.log(times(plus(sym('a'), int('5')), '3').toString())
console.log(plus(int('5'), minus('6'), sym('a'), sym('b')).toString())
