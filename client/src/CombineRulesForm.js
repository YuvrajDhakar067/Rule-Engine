import React, { useState } from 'react';
import axios from 'axios';

function CombineRulesForm() {
  const [rules, setRules] = useState(['']);
  const [combinedAst, setCombinedAst] = useState(null);

  const handleChange = (index, e) => {
    const newRules = [...rules];
    newRules[index] = e.target.value;
    setRules(newRules);
  };

  const addRule = () => {
    setRules([...rules, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/combine_rules', { rules });
      setCombinedAst(response.data);
      alert('Rules combined successfully!');
    } catch (error) {
      console.error('Error combining rules:', error);
    }
  };

  return (
    <div>
      <h2>Combine Rules</h2>
      <form onSubmit={handleSubmit}>
        {rules.map((rule, index) => (
          <div key={index}>
            <input type="text" value={rule} onChange={(e) => handleChange(index, e)} placeholder="Enter rule string" />
          </div>
        ))}
        <button type="button" onClick={addRule}>Add Rule</button>
        <button type="submit">Combine Rules</button>
      </form>
      {combinedAst && <pre>{JSON.stringify(combinedAst, null, 2)}</pre>}
    </div>
  );
}

export default CombineRulesForm;
