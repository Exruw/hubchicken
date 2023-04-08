! function() {

    let settingTheme = false
    let currentThemes = [ // ADD YOUR THEMES HERE
        "themeName"
    ]
    let topbar = document.getElementById("topbar")
    let currentSet
    let currentElements = []

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

    function parseTheme(str) {
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

    function getThemes() {
        let t = {}

        currentThemes.forEach((theme) => {
            t[theme] = "https://hubchicken.tk/themes/" + theme + ".theme"
        })

        return t
    }

    function loadTheme(parsed) {
        parsed.forEach((t) => {
            if (t.type === "closure") {
                let objType = ""
                let objContent = ""
                t.ast.forEach((obj) => {
                    if (obj.type === "option" && obj.idx.toLowerCase() === "type") {
                        objType = obj.value.toLowerCase()
                    }
                    if (obj.type === "text") objContent += obj.value
                })

                if (objType === "script") {
                    let e = document.createElement("script")
                    e.textContent = "!function(){\n" + objContent + "\n}()"
                    document.head.appendChild(e)
                    currentElements.push(e)
                }

                if (objType === "style") {
                    let e = document.createElement("style")
                    e.textContent = objContent
                    document.head.appendChild(e)
                    currentElements.push(e)
                }
            }
        })
    }
    
    function unloadTheme() {
        window.postMessage("SIGKILL")
        currentElements.forEach((e) => {
            e.remove()
        })
    }

    function setTheme(newTheme) {
        let themes = getThemes()
        
        if (!themes[newTheme])
        if (settingTheme) return
        settingTheme = true

        try {
            if (!localStorage.getItem("themeCache")) {
                localStorage.setItem("themeCache", "{}")
            }

            let themeCache = JSON.parse(localStorage.getItem("themeCache"))

            let cached = themeCache[newTheme]

            if (typeof cached === "string") {
                delete themeCache[cached]
                localStorage.setItem("themeCache", JSON.stringify(themeCache))
                console.error("ThemeParse (theme '" + newTheme + "'):\n" + cached)
            } else {
                unloadTheme()
                loadTheme(cached)
                return
            }

            fetch(themes[theme]).then(async (response) => {
                if (!response.ok) {
                    settingTheme = false
                    console.error(response)
                    return alert("Failed to download theme '" + newTheme + "'")
                }

                let text = await response.text()
                let parsed = parseTheme(text)

                if (typeof parsed === "string") {
                    settingTheme = false
                    alert("Failed to parse theme '" + newTheme + "', read the DevTools console for more info.")
                    return console.error("ThemeParse (theme '" + newTheme + "'):\n" + parsed)
                }

                if (!localStorage.getItem("themeCache")) {
                    localStorage.setItem("themeCache", "{}")
                }
                
                themeCache = JSON.parse(localStorage.getItem("themeCache"))
                themeCache[newTheme] = parsed
                localStorage.setItem("themeCache", JSON.stringify(themeCache))
                unloadTheme()
                loadTheme(parsed)
                settingTheme = false
            })
        } catch (err) {
            alert("Error while download theme: " + err)
            settingTheme = false
        }
    }

    function loadTopbar() {
        let themes = getThemes()

        let themeButtonContainer = document.createElementById("div")
        themeButtonContainer.style.right = "20px"
        themeButtonContainer.style.position = "absolute"

        let themeButton = document.createElement("img")
        themeButton.src = "https://media.discordapp.net/attachments/1064746016491978863/1093410248401891328/cog.png"
        themeButton.style.filter = "invert(90%)"
        themeButton.style.cursor = "pointer"
        themeButtonContainer.appendChild(themeButton)

        let themeContainer = document.createElement("div")

        themeContainer.setAttribute("style", "position: absolute;top: 100%;right: 0;z-index: 1;display: none;background-color: #262626;word-wrap: break-word;border: 1px solid gray;box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);padding: 10px;width: 200px;font-family: Inconsolata;color: white;")
        themeButtonContainer.appendChild(themeContainer)

        let themeSearch = document.createElement("input")

        themeSearch.placeholder = "Search themes..."
        themeSearch.type = "text"
        themeSearch.setAttribute("style", "width: calc(100% - 20px);outline: none;background-color: #212121;border: none;font-family: Inconsolata;font-weight: 300;font-size: 15px;color: white;padding: 5px 10px;")

        themeContainer.appendChild(themeSearch)

        let themeList = document.createElement("div")

        themeContainer.appendChild(themeList)
        topbar.appendChild(themeButtonContainer)

        function hideThemeContainer() {
            themeContainer.style.display = "none";
        }

        for (let theme in themes) {
            let themeElement = document.createElement("div");
            themeElement.textContent = theme;
            themeElement.classList.add("theme");

            themeElement.addEventListener("click", () => {
                setTheme(theme)
                themeButton.textContent = theme
                hideThemeContainer()
            });

            themeList.appendChild(themeElement);
        }

        themeButton.addEventListener("click", () => {
            if (themeContainer.style.display === "block") return hideThemeContainer()
            themeContainer.style.display = "block";
        });

        themeSearch.addEventListener("keyup", () => {
            let searchValue = themeSearch.value.trim().toLowerCase();

            for (let i = 0; i < themeList.children.length; i++) {
                let themeElement = themeList.children[i];

                if (themeElement.textContent.trim().toLowerCase().includes(searchValue)) {
                    themeElement.style.display = "block";
                } else {
                    themeElement.style.display = "none";
                }
            }
        });
    }

    function initThemes() {

        let themes = getThemes()
        let theme = localStorage.getItem("currentTheme")

        if (!localStorage.getItem("themeCache")) {
            localStorage.setItem("themeCache", "{}")
        }

        let themeCache = JSON.parse(localStorage.getItem("themeCache"))
        let currentTheme
        let doLoad = true

        if (!themes[theme]) {
            if (themeCache[theme]) {
                delete themeCache[theme]
                localStorage.setItem("themeCache", JSON.stringify(themeCache))
            }
            return localStorage.setItem("currentTheme", null)
        }

        if (themeCache[theme]) {
            let parsed = themeCache[theme]

            if (typeof parsed === "string") {
                delete themeCache[theme]
                localStorage.setItem("themeCache", JSON.stringify(themeCache))
                console.error("ThemeParse (theme '" + theme + "'):\n" + parsed)
            } else {
                doLoad = false
                loadTheme(parsed)
            }

            fetch(themes[theme]).then(async (response) => {
                if (!response.ok) return console.error("Failed to get theme '" + theme + "'")

                let text = await response.text()
                parsed = parseTheme(text)

                if (typeof parsed === "string") return console.error("ThemeParse (theme '" + theme + "'):\n" + parsed)

                if (!localStorage.getItem("themeCache")) {
                    localStorage.setItem("themeCache", "{}")
                }

                themeCache = JSON.parse(localStorage.getItem("themeCache"))
                themeCache[theme] = parsed
                localStorage.setItem("themeCache", JSON.stringify(themeCache))
                if (doLoad) loadTheme(parsed)
            })

            return
        }

        fetch(themes[theme]).then(async (response) => {
            if (!response.ok) return console.error("Failed to get theme '" + theme + "'")

            let text = await response.text()
            let parsed = parseTheme(text)

            if (typeof parsed === "string") return console.error("ThemeParse (theme '" + theme + "'):\n" + parsed)

            if (!localStorage.getItem("themeCache")) {
                localStorage.setItem("themeCache", "{}")
            }

            themeCache = JSON.parse(localStorage.getItem("themeCache"))
            themeCache[theme] = parsed
            localStorage.setItem("themeCache", JSON.stringify(themeCache))
            if (doLoad) loadTheme(parsed)
        })

        if (topbar) loadTopbar()
    }

    initThemes()
}()
