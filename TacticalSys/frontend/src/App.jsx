import React from 'react';
import { useState } from 'react';
import './App.css';
import policy from '../policy.json';

function App() {
  
  return (
    <>
      <div>
        <PageButton display={"passiveSonar"}/>
        <PageButton display={"activeSonar"}/>
        <PageButton display={"defenseSystem"}/>
      </div>
    </>
  );
}

function PageButton({display}) {
  const hasAccess = policy[display];

  function ChangePage() {
    alert("button clicked!");
  }

  return (
    <button onClick={ChangePage} disabled={!hasAccess}>{display}</button>
  );
}

export default App
