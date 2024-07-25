const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for storing combined rules
const combinedRuleSchema = new Schema({
  rules: [{ type: String, required: true }],
  combined_ast: { type: Schema.Types.Mixed, required: true },  // Store the combined AST as a mixed type
  result: { type: Boolean, required: true }  // Store the result of evaluation
});

// Create the model from the schema
const CombinedRule = mongoose.model('CombinedRule', combinedRuleSchema);

module.exports = CombinedRule;
