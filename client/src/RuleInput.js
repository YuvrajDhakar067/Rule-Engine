import React, { useState } from 'react';

function RuleInput({ setRules, setData }) {
  const [ruleInput, setRuleInput] = useState("");
  const [dataInput, setDataInput] = useState("");

  const handleRuleChange = (e) => {
    setRuleInput(e.target.value);
  };

  const handleDataChange = (e) => {
    setDataInput(e.target.value);
  };

  const parseRules = () => {
    const rules = ruleInput.split("\n").map(rule => rule.trim()).filter(rule => rule);
    setRules(rules);
  };

  const parseData = () => {
    try {
      const data = JSON.parse(dataInput);
      setData(data);
    } catch (error) {
      alert("Invalid JSON format for data attributes.");
    }
  };

  return (
    <div>
      <textarea
        rows="4"
        cols="50"
        placeholder="Enter rule strings, one per line"
        value={ruleInput}
        onChange={handleRuleChange}
      />
      <textarea
        rows="4"
        cols="50"
        placeholder="Enter data attributes as JSON"
        value={dataInput}
        onChange={handleDataChange}
      />
      <button onClick={parseRules}>Set Rules</button>
      <button onClick={parseData}>Set Data</button>
    </div>
  );
}

export default RuleInput;
