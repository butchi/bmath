const numberQ = arg => {
    if (arg == null) {
    } else if (typeof arg === 'string') {
        return false
    } else if (typeof arg === 'number') {
        const num = arg

        const ret = isFinite(num)

        return ret
    }
}

const integerQ = arg => {
    if (arg == null) {
    } else if (typeof arg === 'string') {
        return false
    } else if (typeof arg === 'number') {
        const num = arg

        const ret = num === parseInt(arg.toString())

        return ret
    }
}

const positive = arg => {
    if (arg == null) {
    } else if (typeof arg === 'string') {
        return false
    } else if (typeof arg === 'number') {
        const num = arg

        const ret = num > 0

        return ret
    }
}

const negative = arg => {
    if (arg == null) {
    } else if (typeof arg === 'string') {
        return false
    } else if (typeof arg === 'number') {
        const num = arg

        const ret = num < 0

        return ret
    }
}

// TODO: 明白ではない場合には未評価のままにするか検討
const nonNegative = arg => integerQ(arg) && !negative(arg)

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

const gcd = (a, b) => {
    if (b === 0) return a;
    return gcd(b, a % b);
}

const lcm = (a, b) => {
    return (a * b) / gcd(a, b);
}



const plus = (...argArr) => {
    if (argArr == null) {
    } else if (argArr.length === 1) {
        const arg  = argArr[0]

        return arg
    } else if (argArr.length === 2) {
        const [arg1, arg2] = argArr

        if (arg1 == null && arg2 == null) {
        } else if (typeof arg1 === 'string') {
            if (arg2 == null) {
            } else if (typeof arg2 === 'string') {
                const [str1, str2] = [arg1, arg2]

                if (str1 === str2) {
                    return `Twice("${str1}")`
                } else {
                    if (str1 < str2) {
                        return `Plus("${str1}", "${str2}")`
                    } else {
                        return `Plus("${str2}", "${str1}")`
                    }
                }
            } else if (typeof arg2 === 'number') {
                const [str, num] = [arg1, arg2]

                if (negative(num)) {
                    return `Minus("${str}", ${-num})`
                } else {
                    return `Plus("${str}", ${num})`
                }
            }
        } else if (typeof arg1 === 'number') {
            if (arg2 == null) {
            } else if (typeof arg2 === 'string') {
                const [num, str] = [arg1, arg2]

                return `Plus("${str}", ${num})`
            } else if (typeof arg2 === 'number') {
                const [num1, num2] = [arg1, arg2]

                const res = num1 + num2

                const ret = negative(res) ? `Minus${-res}` : res

                return ret
            }
        }
    } else if (argArr.length >= 3) {
    } else {
    }
}

const twice = arg => {
    if (arg == null) {
    } else if (typeof arg === 'string') {
        return `Twice("${arg}")`
    } else if (typeof arg === 'number') {
        const num = arg

        if (negative(num)) {
            return `Minus(Twice(${-num}))`
        } else {
            return `Twice(${num})`
        }
    }
}

const minus = (...argArr) => {
    if (argArr == null) {
    } else if (argArr.length === 1) {
        const arg  = argArr[0]

        if (arg == null) {
        } else if (typeof arg === 'string') {
            const str = arg

            return str
        } else if (typeof arg === 'number') {
            const num = arg

            return `Minus(${num})`
        }
    } else if (argArr.length === 2) {
        const [arg1, arg2] = argArr

        if (arg1 == null && arg2 == null) {
        } else if (typeof arg1 === 'string') {
            if (arg2 == null) {
            } else if (typeof arg2 === 'string') {
                const [str1, str2] = [arg1, arg2]

                if (str1 === str2) {
                    return 0
                } else {
                    if (str1 < str2) {
                        return `Minus("${str1}", "${str2}")`
                    } else {
                        return `Minus("${str2}", "${str1}")`
                    }
                }
            } else if (typeof arg2 === 'number') {
                const [str, num] = [arg1, arg2]

                return `Minus("${str}", ${num})`
            }
        } else if (typeof arg1 === 'number') {
            if (arg2 == null) {
            } else if (typeof arg2 === 'string') {
                const [num, str] = [arg1, arg2]

                return `Minus("${str}", ${num})`
            } else if (typeof arg2 === 'number') {
                const [num1, num2] = [arg1, arg2]

                const ret = num1 + num2

                return ret
            }
        }
    } else if (argArr.length >= 3) {
    } else {
    }
}

const times = (...argArr) => {
    if (argArr == null) {
    } else if (argArr.length === 1) {
        const arg  = argArr[0]

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
                    return `Square("${str1}", 2)`
                } else {
                    if (str1 < str2) {
                        return `Times("${str1}", "${str2}")`
                    } else {
                        return `Times("${str2}", "${str1}")`
                    }
                }
            } else if (typeof arg2 === 'number') {
                const [str, num] = [arg1, arg2]

                if (num === 0) {
                    return 0
                } else if (num === 1) {
                    return 1
                } else if (num === 2) {
                    return `Twice("${str}")`
                } else {
                    return `Times("${str}", ${num})`
                }
            }
        } else if (typeof arg1 === 'number') {
            if (arg2 == null) {
            } else if (typeof arg2 === 'string') {
                const [num, str] = [arg1, arg2]

                if (num === 0) {
                    return 0
                } else if (num === 1) {
                    return str
                } else if (num === 2) {
                    return `Twice("${str}")`
                } else {
                    return `Times("${str}", ${num})`
                }
            } else if (typeof arg2 === 'number') {
                const [num1, num2] = [arg1, arg2]

                const ret = num1 * num2

                return ret
            }
        }
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
        const arg  = argArr[0]

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
                } else if (num === 2) {
                    return `Half("${str}")`
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
                    } else if (num2 === 2) {
                        return `Half(1)`
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

const recip = arg => {
}

const power = (...argArr) => {
    if (argArr == null) {
    } else if (argArr.length === 1) {
        const arg  = argArr[0]

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

                return `Power("${str1}", "${str2}")`
            } else if (typeof arg2 === 'number') {
                const [str, num] = [arg1, arg2]

                if (num === 0) {
                    return 1
                } else if (num === 1) {
                    return str
                } else if (num === 2) {
                    return `Square("${str}")`
                } else {
                    return `Power("${str}", ${num})`
                }
            }
        } else if (typeof arg1 === 'number') {
            if (arg2 == null) {
            } else if (typeof arg2 === 'string') {
                const [num, str] = [arg1, arg2]

                if (num === 0) {
                    return 0
                } else if (num === 1) {
                    return 1
                } else if (num === 2) {
                    return `Exp2("${str}")`
                } else if (num === Math.E) {
                    // STUB

                    return `Exp("${str}")`
                } else {
                    return `Power(${num}, "${str}")`
                }
            } else if (typeof arg2 === 'number') {
                const [num1, num2] = [arg1, arg2]

                if (num1 === 0 && num2 === 0) {
                    // STUB

                    return NaN
                } else {
                    const ret = num1 ** num2

                    return ret
                }
            }
        }
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

globalThis.Plus = plus
globalThis.Twice = twice
globalThis.Minus = minus
globalThis.Times = times
globalThis.Square = square
globalThis.Frac = frac
globalThis.Recip = recip
globalThis.Power = power

const fixedPoint = (f, expr) => {
    const maxCnt = 99

    const cnt = { value: 0 }

    const loop = tmp => {
        cnt.value++

        if (cnt.value > maxCnt) {
            return "undefined"
        }

        const res = f(tmp)

        if (res === tmp) {
            return res
        }

        return loop(res)
    }

    return loop(expr)
}

console.log(fixedPoint(eval, 'Plus(5, 3)'))
