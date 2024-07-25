const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const Rule = require('./schema/rule');
const CombinedRule = require('./schema/combinedRule');  // Import the Rule model
app.use(bodyParser.json());
const uri = 'mongodb+srv://priyanshu:jayant172@ruleengine.smoonvf.mongodb.net/?retryWrites=true&w=majority&appName=RuleEngine';
const PORT =  8080;




// Connection to MONGO DB 
// mongoose.connect(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB Atlas');
// });
// 











class Node {
    constructor(type, value = null, left = null, right = null) {
      this.type = type;  // "operator" or "operand"
      this.value = value;  // Operator type (AND, OR) or operand details (variable, operator, value)
      this.left = left;  // Left child node
      this.right = right;  // Right child node
    }
  }
  
  class ASTEvaluator {
    constructor(context) {
      this.context = context;
    }
  
    evaluate(node) {
      if (node.type === "operand") {
        return this.evaluateOperand(node.value);
      } else if (node.type === "operator") {
        return this.evaluateOperator(node.value, node.left, node.right);
      } else {
        throw new Error(`Unknown node type: ${node.type}`);
      }
    }
  
    evaluateOperand(operand) {
      const { variable, operator, value } = operand;
      const contextValue = this.context[variable];
  
      switch (operator) {
        case '>=': return contextValue >= value;
        case '<=': return contextValue <= value;
        case '>': return contextValue > value;
        case '<': return contextValue < value;
        case '==': return contextValue == value;
        case '!=': return contextValue != value;
        default: throw new Error(`Unknown operator: ${operator}`);
      }
    }
  
    evaluateOperator(operator, leftNode, rightNode) {
      const leftValue = this.evaluate(leftNode);
      const rightValue = this.evaluate(rightNode);
  
      switch (operator) {
        case 'AND': return leftValue && rightValue;
        case 'OR': return leftValue || rightValue;
        default: throw new Error(`Unknown operator: ${operator}`);
      }
    }
  }


// ***************************************** API FOR CREATE RULE ************************
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
  




















// ****************************************************************
  
// ****************** COMBINE RULES FUNCTION ******************
function countOperators(ast, operatorCounts) {
  if (!ast) return;
  console.log(`Visiting node: ${JSON.stringify(ast, null, 2)}`);
  if (ast.type === 'operator') {
      if (ast.value === 'AND' || ast.value === 'OR') {
        console.log("Printing before ")
        console.log(ast.value)  
        operatorCounts[ast.value] = (operatorCounts[ast.value] || 0) + 1;
        console.log("Printing after ")
        console.log(ast.value)  
      }
      countOperators(ast.left, operatorCounts);
      countOperators(ast.right, operatorCounts);
  }
  else if(ast.type==='operand')
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


  
  // app.post('/api/combine_rules', (req, res) => {
  //   const { rules } = req.body;
  //   try {
  //     const combinedAst = combineRules(rules);
  //     res.json(combinedAst);
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // });


// ************************** EVALUATE _ ROOL _ API ********************************

function evaluate_rule(ast, data, log = false) {
  if (!ast) {
      throw new Error("Invalid AST node");
  }

  if (ast === null || ast.type === undefined) {
    return true;  // You might want to choose a more appropriate default based on your use case
}

  if (log) console.log("Evaluating node:", JSON.stringify(ast, null, 2));
  console.log(ast.nodeType)
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





app.post('/api/evaluate', (req, res) => {
  const { ast, data } = req.body;

  if (!ast || !data) {
      return res.status(400).json({ error: 'AST and data are required' });
  }

  try {
      const result = evaluate_rule(ast, data);
      res.json({ result });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
  






// app.post('/api/create_rule', async (req, res) => {
//   const { rule, data } = req.body;

//   try {
//     const ast = parseRule(rule);

//     // Save AST to MongoDB (optional, depends on your requirement)
//     const newRule = new Rule({ rule, ast });
//     await newRule.save();

//     // Evaluate the rule with the provided data
//     const result = evaluate_rule(ast, data);
    
//     res.json({ ast, result });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

app.post('/api/create_rule', async (req, res) => {
  const { rule_string, data } = req.body;
  
  if (!rule_string) return res.status(400).json({ error: 'rule_string is required' });
  if (!data) return res.status(400).json({ error: 'data is required' });

  try {
    // Parse the rule string to create AST
    const ast = parseRule(rule_string);
    console.log("Hello")
    console.log(ast);
    // Evaluate the rule against the provided data
    const result = evaluate_rule(ast, data,log=true);

    // Save the rule and AST in the database
    const rule = new Rule({
      rule_string: rule_string,
      ast: ast
    });
    await rule.save();

    // Respond with the AST and evaluation result
    res.json({ ast: ast, result: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API for combining rules, evaluating, and saving to the database
app.post('/api/combine_rule', async (req, res) => {
  const { rules, data } = req.body;

  try {
    const combinedAst = combineRules(rules);
    const result = evaluate_rule(combinedAst, data);

    // Save to the database
    const combinedRule = new CombinedRule({
      rules: rules,
      combined_ast: combinedAst,
      result: result
    });

    await combinedRule.save();

    res.json({ combinedAst, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
const rules = [
  "age > 30 AND department = Marketing",
  "salary > 20000 OR experience > 5",
  "age < 25 AND department = Sales"
];
const combinedAST = combineRules(rules);
console.log(JSON.stringify(combinedAST, null, 2));








//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));