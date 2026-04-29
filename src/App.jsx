//  import Modules and CSS
import { useState, useEffect } from 'react';
import './App.css';
import './Apps.css';

// import Apps
import Todo from './apps/todo';

function App() {
  // ================================================== {DEVTOOL DISABLE} ==================================================
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ================================================== {APPS} ==================================================
  const [openApp, setOpenApp] = useState(null);
  const [openTodo, setOpenTodo] = useState(false);
  const [minTodo, setMinTodo] = useState(false);

  return (
    <>
    <section id="body">
      {openTodo && <div className="appWindow" style={{transform: minTodo? 'translateY(-150%)':'none'}}>
        <div className="appTop">
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenTodo(false)}></button>
            <button className="appCtrl yellow" onClick={() => setMinTodo(true)}></button>
            <button className="appCtrl green"></button>
          </div>
          <h1 className="appName">TODO</h1>
        </div>
        {openTodo && <Todo />}
      </div>}


      
      <div id="dock">
        <button className="icon" onClick={() => {setOpenTodo(true); setMinTodo(false)}}>✔</button>
        <button className="icon"></button>
        <button className="icon"></button>
        <button className="icon"></button>
        <button className="icon"></button>
        <button className="icon">⚙</button>
      </div>
    </section>
    </>
  )
}

export default App
