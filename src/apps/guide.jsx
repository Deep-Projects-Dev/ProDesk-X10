import { useState } from 'react';
import './guide.css';
import '../class.css';

const genGuide = [
  "To be Written...", "We will complete it ASAP."
]

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
          <h1 className='pw'>Welcome to <b>ProDesk X10</b>, a Deep Projects Product.</h1>
          <h2>Specially designed for CBSE class 10 students.</h2>
          <span className="space" />
          {genGuide.map((gl, index) => {
            <h4 key={index}>{gl}</h4>
          })}
        </div>
      </div>
    </>
  )
}