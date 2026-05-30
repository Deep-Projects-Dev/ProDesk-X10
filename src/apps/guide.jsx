import { useState } from 'react';
import './guide.css';

export default function Guide() {
  const [filter, setFilter] = useState('General')
  
  return (
    <>
      <div id="guide" className="app">
        <div id="optPanel">
          {["General", "Arc", "Chrome", "Edge", "Firefox", "Safari"].map((option) => (
            <button key={option} className={`option ${filter === option ? "active" : ""}`}
              onClick={() => setFilter(option)} type="button">
              {option}
            </button>
          ))}
        </div> 
        <div id="gRight">
          <h1>Welcome to ProDesk X10.</h1>
          <h2>Specially designed for CBSE class 10 students.</h2>
        </div>
      </div>
    </>
  )
}