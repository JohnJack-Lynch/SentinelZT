import React from 'react';
import './App.css';
import policy from '../policy.json';

function App() {
  const handleClick = () => {
    alert("button clicked");
  }

  return (
    <div>
      <button onClick={handleClick}>Test</button>
    </div>
  );
}

function Button() {
  
}

export default App
