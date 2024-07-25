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
    tokens.forEach(element =>{
        console.log(element + ': ' + i++);
    })
    let index = 0;

    function parsePrimary() {
        if (tokens[index] === '(') {
            console.log("Index of opening bracket is " + index)
            index++;
            const node = parseExpression();
            index++; // Skip ')'
            if (tokens[index] === ')') {
                index++; // Skip ')'
            }
            return node;
        }

        const attribute = tokens[index++];
        if(index > 5) console.log("Attribute is " + attribute)
        const comparison = tokens[index++];
        if(index > 5) console.log("Comparison is " + comparison)
        const value = tokens[index++].replace(/'/g, '');
        if(index > 5) console.log("Value is " + value) // Remove quotes from strings
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
        console.log(index)
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

// Example usage
const rule = "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)"
//console.log(rule);
const ast = parseRule(rule);
console.log("Hello")
console.log(JSON.stringify(ast, null, 2));

function evaluate_rule(ast, data, log = false) {
    if (!ast) {
        throw new Error("Invalid AST node");
    }
    if (log) console.log("Evaluating node:", JSON.stringify(ast, null, 2));

    if (ast === null || ast === undefined) {
        return true;  // You might want to choose a more appropriate default based on your use case
    }


    if (ast.nodeType === 'operand') {
        return evaluateOperand(ast.value, data);
    } else if (ast.nodeType === 'operator') {
        return evaluateOperator(ast, data, log);
    } else {
        throw new Error(`Unknown node type: ${ast.nodeType}`);
    }
  }
  
  function evaluateOperand(operand, data) {
    const { attribute, comparison, value } = operand;
    const dataValue = data[attribute];
  
    switch (comparison) {
        case '>':
            return dataValue > value;
        case '<':
            return dataValue < value;
        case '=':
            return dataValue === value;
        case '>=':
            return dataValue >= value;
        case '<=':
            return dataValue <= value;
        case '!=':
            return dataValue !== value;
        default:
            throw new Error(`Unknown comparison operator: ${comparison}`);
    }
  }
  
  function evaluateOperator(node, data, log = false) {
    const leftResult = evaluate_rule(node.left, data, log);
    const rightResult = node.right ? evaluate_rule(node.right, data, log) : true; // Treat null right nodes as true
  
    switch (node.value) {
        case 'AND':
            return leftResult && rightResult;
        case 'OR':
            return leftResult || rightResult;
        default:
            throw new Error(`Unknown operator: ${node.value}`);
    }
  }
const data = {
    "age": 35,
    "department": "Sales",
    "salary": 60000,
    "experience": 3
  }
  const result = evaluate_rule(ast, data);
  console.log(result);