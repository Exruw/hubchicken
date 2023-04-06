let currentThemes = [ // ADD YOUR THEMES HERE
    "themeName"
]

class Tokenizer {
    constructor(input) {
        this.str = input
        this.pos = 0
    }

    getContext(lim, offset) {
        let char = this.pos
        let text = this.str
        let min = Math.max(0, char - lim)
        let max = Math.min(text.length, char + lim + 1)

        if (min === 0) {
            lim = char
        }

        offset = offset || 0

        return text.substring(min, max) + "\n" + (" ").repeat(lim + offset) + "^"
    }

    next() {
        this.pos += 1
        return this.peek()
    }

    peek() {
        return this.str[this.pos]
    }

    back() {
        this.pos -= 1
        if (this.pos < 0) this.pos = 0
        return this.peek()
    }

    eof() {
        return typeof this.peek() === "undefined"
    }

    error(type, err) {
        return this.getContext(32, 0) + "\n" + type + ": " + err
    }
}

export function parseTheme(str) {
    let ast = []
    let token = new Tokenizer(str)
    let currentStr = ""
    let boundary

    let parseAssign = function() {
        let currentObject = {
            type: "option",
            idx: currentStr,
            value: ""
        }
        let allowSpaces = false

        while (!token.eof()) {
            let tk = token.next()

            if (tk === ";") {
                break
            }

            if (tk === "\n") {
                return token.error("SyntaxError", "Unexpected option assign ending.")
            }

            if (tk === " " && !allowSpaces) continue

            allowSpaces = true
            currentObject.value += tk
        }

        if (token.eof()) return token.error("SyntaxError", "Unexpected end of input.")

        if (currentObject.value === "") return token.error("SyntaxError", "Unexpected end of input.")

        return currentObject
    }

    while (!token.eof()) {
        let currentToken = token.peek()

        if (currentToken === ":") {
            let o = parseAssign()

            if (typeof o === "string") return o

            if (o.idx === "Boundary") {
                boundary = o.value
                currentStr = ""
                token.next()
                continue
            }

            ast.push(o)
            currentStr = ""
            token.next()
            continue
        }

        if (currentToken === "\n") {
            if (currentStr === boundary) {
                currentStr = ""
                let obj = {
                    type: "closure",
                    ast: []
                }
                let ignoreAssigns = false
                let boundaryIdx = 0

                while (true) {
                    if (token.eof()) return token.error("SyntaxError", "Unexpected end of input.")
                    let current = token.next()

                    if (current === ":" && !ignoreAssigns) {
                        let o = parseAssign()

                        if (typeof o === "string") return o

                        if (o.idx === "Start-Content") {
                            ignoreAssigns = true
                            currentStr = ""
                            continue
                        }

                        obj.ast.push(o)
                        currentStr = ""
                        continue
                    }

                    if (!ignoreAssigns) {
                        if (current === "\n") {
                            currentStr = ""
                            continue
                        }
                        currentStr += current
                        continue
                    }

                    if (ignoreAssigns) {
                        currentStr += current

                        if (current === "\n") {
                            boundaryIdx = 0
                            continue
                        }

                        if (boundaryIdx === -1) continue

                        if (current === boundary[boundaryIdx]) {
                            boundaryIdx += 1
                            if (boundaryIdx === boundary.length) {
                                currentStr = currentStr.substring(0, currentStr.length - boundary.length)
                                obj.ast.push({
                                    type: "text",
                                    value: currentStr
                                })
                                break
                            }
                        } else {
                            boundaryIdx = -1
                        }
                    }
                }

                if (!ignoreAssigns) return token.error("SyntaxError", "Expected content for closure.")

                currentStr = ""
                token.next()
                ast.push(obj)

                continue
            }

            currentStr = ""
            token.next()
            continue
        }


        if (currentToken !== " ") currentStr += currentToken

        token.next()
    }

    if (!boundary) return token.error("SyntaxError", "No boundary was declared.")

    return ast
}

export function getThemes() {
    
}
