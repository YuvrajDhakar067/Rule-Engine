class Node {
    constructor(nodeType, value = null, left = null, right = null) {
        this.nodeType = nodeType; // "operator" or "operand"
        this.value = value;       // Optional value for operand nodes
        this.left = left;         // Reference to the left child (Node)
        this.right = right;       // Reference to the right child (Node)
    }
}

function tokenize(rule) {
    const regex = /\s*(=>|<=|==|!=|>=|<=|<|>|AND|OR|[()])\s*|([^()\s]+)|'[^']*'/g;
    const tokens = [];
    let match;

    while (match = regex.exec(rule)) {
        if (match[1]) {
            tokens.push(match[1]);
        } else if (match[2]) {
            tokens.push(match[2]);
        } else if (match[3]) {
            tokens.push(match[3]);
        }
    }

    return tokens;
}

function parseRule(rule) {
    const tokens = tokenize(rule);
    let index = 0;

    function parsePrimary() {
        if (tokens[index] === '(') {
            index++;
            const node = parseExpression();
            if (tokens[index] === ')') {
                index++; // Skip ')'
            }
            return node;
        }

        const attribute = tokens[index++];
        const comparison = tokens[index++];
        const value = tokens[index++].replace(/'/g, '');
        return new Node('operand', { attribute, comparison, value });
    }

    function parseOperator() {
        const token = tokens[index];
        if (token === 'AND' || token === 'OR') {
            index++;
            return new Node('operator', token);
        }
        return null;
    }

    function parseExpression() {
        let left = parsePrimary();

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

    if (ast.nodeType === 'operator') {
        if (ast.value === 'AND' || ast.value === 'OR') {
            operatorCounts[ast.value] = (operatorCounts[ast.value] || 0) + 1;
        }
        countOperators(ast.left, operatorCounts);
        countOperators(ast.right, operatorCounts);
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

    return root;
}

function combineRules(rules) {
    let asts = [];
    let operatorCounts = { AND: 0, OR: 0 };

    for (let rule of rules) {
        let ast = parseRule(rule);
        if (ast) {
            asts.push(ast);
            countOperators(ast, operatorCounts);
        }
    }

    let rootOperator = operatorCounts.AND >= operatorCounts.OR ? 'AND' : 'OR';
    return combineASTs(asts, rootOperator);
}

function evaluate_rule(ast, data, log = false) {
    if (!ast) {
        throw new Error("Invalid AST node");
    }
    if (log) console.log("Evaluating node:", JSON.stringify(ast, null, 2));
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

// Example Usage
const data = {
    "age": 35,
    "department": "Sales",
    "salary": 60000,
    "experience": 3
};

const rules = [
   "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)"

    
];

const combinedAST = combineRules(rules);
console.log(JSON.stringify(combinedAST, null, 2));
console.log("Evaluating nodes")
const result = evaluate_rule(combinedAST, data, false);
console.log("Final result is :"+ result)
