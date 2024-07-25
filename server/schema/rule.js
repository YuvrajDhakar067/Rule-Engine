const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for storing rules
const ruleSchema = new Schema({
    rule_string: { type: String, required: true },
    ast: { type: Schema.Types.Mixed, required: true }  // Store the AST as a mixed type
});

// Create the model from the schema
const Rule = mongoose.model('Rule', ruleSchema);

module.exports = Rule;
