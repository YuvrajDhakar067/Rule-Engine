class Node {
    constructor(nodeType, value = null, left = null, right = null) {
        this.nodeType = nodeType; // "operator" or "operand"
        this.value = value;       // Optional value for operand nodes
        this.left = left;         // Reference to the left child (Node)
        this.right = right;       // Reference to the right child (Node)
    }
}

function tokenize(rule) {
    // Tokenize the input rule string
    const regex = /\s*(=>|<=|==|!=|>=|<=|<|>|AND|OR|[()])\s*|([^()\s]+)|'[^']*'/g;
    const tokens = [];
    let match;

    while (match = regex.exec(rule)) {
        if (match[1]) {
            // Match for operators and parentheses
            tokens.push(match[1]);
        } else if (match[2]) {
            // Match for attributes or numbers
            tokens.push(match[2]);
        } else if (match[3]) {
            // Match for quoted values
            tokens.push(match[3]);
        }
    }

    return tokens;
}






function parseRule(rule) {
    const tokens = tokenize(rule);
    i=0
    // tokens.forEach(element =>{
    //     console.log(element + ': ' + i++);
    // })
    let index = 0;

    function parsePrimary() {
        if (tokens[index] === '(') {
            //console.log("Index of opening bracket is " + index)
            index++;
            const node = parseExpression();
            index++; // Skip ')'
            if (tokens[index] === ')') {
                index++; // Skip ')'
            }
            return node;
        }

        const attribute = tokens[index++];
       // if(index > 5) console.log("Attribute is " + attribute)
        const comparison = tokens[index++];
        //if(index > 5) console.log("Comparison is " + comparison)
        const value = tokens[index++].replace(/'/g, '');
        //if(index > 5) console.log("Value is " + value) // Remove quotes from strings
        return new Node('operand', { attribute, comparison, value });
    }

    function parseOperator() {
        const token = tokens[index++];
        if (token === 'AND' || token === 'OR') {
            return new Node('operator', token);
        }
        return null;
    }

    function parseExpression() {
        let left = parsePrimary();
        //console.log(index)
        while (index < tokens.length && tokens[index] !== ')') {
            const op = parseOperator();
            if (!op) break;
            op.left = left;
            op.right = parsePrimary();
            left = op;
        }

        return left;
    }

    return parseExpression();
}

function countOperators(ast, operatorCounts) {
    if (!ast) return;
    console.log(`Visiting node: ${JSON.stringify(ast, null, 2)}`);
    if (ast.nodeType === 'operator') {
        if (ast.value === 'AND' || ast.value === 'OR') {
            operatorCounts[ast.value] = (operatorCounts[ast.value] || 0) + 1;
        }
        countOperators(ast.left, operatorCounts);
        countOperators(ast.right, operatorCounts);
    }
    else if(ast.nodeType==='operand')
    {
      console.log(`Visiting operand node: ${JSON.stringify(ast, null, 2)}`);
    }
  }

function combineASTs(asts, rootOperator) {
    if (asts.length === 0) return null;

    let root = new Node('operator', rootOperator, asts[0], null);
    let current = root;

    for (let i = 1; i < asts.length; i++) {
        current.right = new Node('operator', rootOperator, asts[i], null);
        current = current.right;
    }

    // if (!current.right) {
    //     current.right = asts[asts.length - 1];
    // }


    return root;
}

function combineRules(rules) {
    let asts = [];
    let operatorCounts = { AND: 0, OR: 0 };
    i=0
    for (let rule of rules) {
        let ast = parseRule(rule);
        // console.log("AST for "+ i++)
        // console.log(ast);
        asts.push(ast);
        countOperators(ast, operatorCounts);
        console.log("Count of AND is"+ operatorCounts.AND)
    console.log("Count of OR is"+ operatorCounts.OR)
    }
    

    let rootOperator = operatorCounts.AND >= operatorCounts.OR ? 'AND' : 'OR';
    return combineASTs(asts, rootOperator);
}

const rules = [
    "age > 30 AND department = Marketing",
  "salary > 20000 OR experience > 5",
  "age < 25 AND department = Sales"
];
const combinedAST = combineRules(rules);
console.log(JSON.stringify(combinedAST, null, 2));






// const smallRule = "age > 30";
// const mediumRules = [
//     "age > 30 AND department = 'Marketing'",
//     "salary > 20000 OR experience > 5"
// ];
// const largeRules = Array.from({ length: 1000 }, (_, i) => `rule${i} = 'value'`).join(' AND ');

// // Measure performance for each case
// console.time('Small Rule');
// tokenize(smallRule);
// parseRule(tokenize(smallRule));
// console.timeEnd('Small Rule');

// console.time('Medium Rules');
// tokenize(mediumRules.join(' AND '));
// parseRule(tokenize(mediumRules.join(' AND ')));
// console.timeEnd('Medium Rules');

// console.time('Large Rules');
// tokenize(largeRules);
// parseRule(tokenize(largeRules));
// console.timeEnd('Large Rules');
