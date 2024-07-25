import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [rules, setRules] = useState('');
  const [data, setData] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rules || !data) {
      setError('Both rule and data fields are required');
      return;
    }

    setError(''); // Clear any existing errors

    try {
      const rulesArray = rules.split('\n').filter(rule => rule.trim() !== '');
      const parsedData = JSON.parse(data);

      let response;
      if (rulesArray.length === 1) {
        response = await axios.post('http://localhost:8080/api/create_rule', {
          rule_string: rulesArray[0],
          data: parsedData,
        });
      } else {
        response = await axios.post('http://localhost:8080/api/combine_rule', {
          rules: rulesArray,
          data: parsedData,
        });
      }

      setResult(response.data);
    } catch (error) {
      console.error(error);
      setResult({ error: error.response?.data?.error || 'An error occurred' });
    }
  };

  return (
    <div className="app-container">
      <h1>Rule Engine</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <label>
          Rule(s):
          <textarea
            className="input-box"
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder="Enter rule(s) here, each on a new line"
          />
        </label>
        <label>
          Data:
          <textarea
            className="input-box"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder='Enter data attributes as JSON, e.g. {"age": 30, "department": "Sales"}'
          />
        </label>
        <button type="submit" className="submit-button">Evaluate</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {result && (
        <div className="result-container">
          <h2>Result:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
