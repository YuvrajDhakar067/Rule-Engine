import React, { useState } from 'react';
import axios from 'axios';

function EvaluateRuleForm() {
  const [data, setData] = useState({});
  const [ast, setAst] = useState('');
  const [result, setResult] = useState(null);

  const handleDataChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAstChange = (e) => {
    setAst(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/evaluate_rule', { ast: JSON.parse(ast), data });
      setResult(response.data.result);
      alert('Rule evaluated successfully!');
    } catch (error) {
      console.error('Error evaluating rule:', error);
    }
  };

  return (
    <div>
      <h2>Evaluate Rule</h2>
      <form onSubmit={handleSubmit}>
        <textarea value={ast} onChange={handleAstChange} placeholder="Enter AST JSON" rows="10" cols="50"></textarea>
        <div>
          <label>
            Age:
            <input type="number" name="age" onChange={handleDataChange} />
          </label>
        </div>
        <div>
          <label>
            Department:
            <input type="text" name="department" onChange={handleDataChange} />
          </label>
        </div>
        <div>
          <label>
            Salary:
            <input type="number" name="salary" onChange={handleDataChange} />
          </label>
        </div>
        <div>
          <label>
            Experience:
            <input type="number" name="experience" onChange={handleDataChange} />
          </label>
        </div>
        <button type="submit">Evaluate Rule</button>
      </form>
      {result !== null && <p>Result: {result.toString()}</p>}
    </div>
  );
}

export default EvaluateRuleForm;
