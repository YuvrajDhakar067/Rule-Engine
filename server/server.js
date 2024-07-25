const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const Rule = require('./schema/rule');  // Import the Rule model
const { parseRule } = require('./index.js'); 

// Replace <username>, <password>, and <cluster-url> with your Atlas connection details
const uri = 'mongodb+srv://priyanshu:jayant172@ruleengine.smoonvf.mongodb.net/?retryWrites=true&w=majority&appName=RuleEngine';
const app = express();
app.use(bodyParser.json());


mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});


// Endpoint to create and store a rule
app.post('/api/create_rule', async (req, res) => {
    const { rule_string } = req.body;
    
    try {
        // Parse the rule string to generate the AST
        const ast = parseRule(rule_string);

        // Create a new rule document
        const newRule = new Rule({
            rule_string,
            ast
        });

        // Save the rule to the database
        await newRule.save();

        res.status(201).json({ message: 'Rule created successfully', rule: newRule });
    } catch (error) {
        console.error('Error creating rule:', error);
        res.status(500).json({ error: 'An error occurred while creating the rule' });
    }
});