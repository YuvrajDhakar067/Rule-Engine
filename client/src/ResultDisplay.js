import React from 'react';

function ResultDisplay({ result }) {
  if (!result) {
    return null;
  }

  return (
    <div>
      <h2>Evaluation Result</h2>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}

export default ResultDisplay;
