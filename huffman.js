class Node {
    constructor(letter, freq, leftChild, rightChild) {
        this.letter = letter
        this.freq = freq
        this.leftChild = leftChild
        this.rightChild = rightChild
        this.used = false
    }
}


class CodeTableEntry {
    constructor(letter, code) {
        this.letter = letter;
        this.code = code;
    }
}


class Tree {
    constructor(str) {
        this.nodes = []
        this.unusedNodes = 0

        for (let i = 0; i < str.length; i++) {
            let found = false
            for (let j = 0; j < this.nodes.length; j++) {
                if (this.nodes[j].letter === str[i]) {
                    this.nodes[j].freq++
                    found = true
                }
            }
            if (!found) {
                this.nodes.push(new Node(str[i], 1))
                this.unusedNodes++
            }
        }

        this.#connectNodes()
    }

    #connectNodes() {
        while (this.unusedNodes != 1) {
            const lowFreqNodes = this.#lowestFreqNodes()
            // Создадим новый узел в дереве.
            if (lowFreqNodes[0] && lowFreqNodes[1]) {
                const parentNode = new Node(
                    lowFreqNodes[0].letter + lowFreqNodes[1].letter,
                    lowFreqNodes[0].freq + lowFreqNodes[1].freq,
                    lowFreqNodes[0],
                    lowFreqNodes[1]
                )
                this.nodes.push(parentNode)
            
                // Помечаем их как использованных. Уменьшаем счётчик
                // неиспользованных узлов (два убралось, один добавился).
                lowFreqNodes[0].used = true
                lowFreqNodes[1].used = true
                this.unusedNodes--
            }
        }
    }
    
    #lowestFreqNodes() {
        // Находим два наиболее редко встречаемых неиспользованных узла.
        const lowFreqNodes = [null, null]
        for (let i = 0; i < this.nodes.length; ++i) {
            if (this.nodes[i].used) {
                continue
            }

            if (!lowFreqNodes[1] || this.nodes[i].freq <= lowFreqNodes[1].freq) {
                lowFreqNodes[1] = this.nodes[i]
            }

            if (!lowFreqNodes[0] || this.nodes[i].freq <= lowFreqNodes[0].freq) {
                lowFreqNodes[1] = lowFreqNodes[0]
                lowFreqNodes[0] = this.nodes[i]
            }
        }

        return lowFreqNodes
    }

    #createCodeTable(
        node=this.nodes[this.nodes.length - 1],
        digit='', codeTable=[]
    ) {
        codeTable.push(new CodeTableEntry(node.letter, digit))

        if (node.leftChild) {
            this.#createCodeTable(node.leftChild, digit + '0', codeTable)
            this.#createCodeTable(node.rightChild, digit + '1', codeTable)
        }
        return codeTable
    }

    getCharTable() {
        return this.#createCodeTable()
            .filter((el) => el.letter.length === 1)
    }
}


const compress = (str, charTable) => {
    let coded = ""
    for (let i = 0; i < str.length; ++i) {
        for (let j = 0; j < charTable.length; ++j) {
            if (charTable[j].letter === str[i]) {
                coded += charTable[j].code
                break
            }
        }
    }
    return coded
}


const decompress = (str, charTable) => {
    let decoded = ""
    let remainder = ""

    for (let i = 0; i < str.length; ++i) {
        remainder += str[i]
        for (let j = 0; j < charTable.length; ++j) {
            if (charTable[j].code === remainder) {
                decoded += charTable[j].letter
                remainder = ""
            }
        }
    }
    return decoded
}


const main = (str) => {
    if (!str) {
        console.error("Not enough argumemts: expected string")
        return
    }

    const tree = new Tree(str)
    const charTable = tree.getCharTable()
    console.table(charTable)
    
    const coded = compress(str, charTable)
    console.log(coded)

    const decoded = decompress(coded, charTable)
    console.log(decoded)
}


main(process.argv[2])

