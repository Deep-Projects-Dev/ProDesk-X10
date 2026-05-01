//  import Modules and CSS
import { useState, useEffect } from 'react';
import './App.css';
import './Apps.css';

// import Apps
import Focus from './apps/todo.jsx';
import Pomo from './apps/pomo.jsx';
import Rev from './apps/rev.jsx';

export default function App() {
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
  const [activeApp, setActiveApp] = useState(null);
  const [openTodo, setOpenTodo] = useState(false);
  const [openPomo, setOpenPomo] = useState(false);
  const [openRev, setOpenRev] = useState(false);
  const [openSet, setOpenSet] = useState(false);
  const [minTodo, setMinTodo] = useState(false);
  const [minPomo, setMinPomo] = useState(false);
  const [minRev, setMinRev] = useState(false);

  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(true);
  const handleCloseWel = () => {
    setClosing(true);
    setTimeout(() => setVisible(false), 1000);
  };

  useEffect(() => {
    setOpenSet(false);
  }, [openTodo, openPomo, openRev, minTodo, minPomo, minRev, activeApp])

  return (
    <>
    <section id="body">
      {visible && (
        <div className="welcome" onClick={handleCloseWel} style={{ transform: closing ? 'translateY(-150%)' : 'none' }}>
          <h1>Welcome</h1>
        </div>
      )}
      
      {openTodo && <div className="appWindow" style={{transform: minTodo? 'translateY(-100dvh)':'none', zIndex: activeApp==="t"? '3':'2'}}>
        <div className="appTop">
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenTodo(false)}></button>
            <button className="appCtrl yellow" onClick={() => setMinTodo(true)}></button>
            <button className="appCtrl green"></button>
          </div>
          <div className="appName"><h1>Focus Flow</h1></div>
        </div>
        {openTodo && <Focus />}
      </div>}
      
      {openPomo && <div className="appWindow" style={{transform: minPomo? 'translateY(-150%)':'none', zIndex: activeApp==="p"? '3':'2'}}>
        <div className="appTop">
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenPomo(false)}></button>
            <button className="appCtrl yellow" onClick={() => setMinPomo(true)}></button>
            <button className="appCtrl green"></button>
          </div>
          <div className="appName"><h1>Pomodoro</h1></div>
        </div>
        {openPomo && <Pomo />}
      </div>}

      
      {openRev && <div className="appWindow" style={{transform: minRev? 'translateY(-150%)':'none', zIndex: activeApp==="r"? '3':'2'}}>
        <div className="appTop">
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenRev(false)}></button>
            <button className="appCtrl yellow" onClick={() => setMinRev(true)}></button>
            <button className="appCtrl green"></button>
          </div>
          <div className="appName"><h1>Revision</h1></div>
        </div>
        {openRev && <Rev />}
      </div>}

      
      {openSet && <div className="appWindow set">
        <div className="appTop">
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenSet(false)}></button>
            <button className="appCtrl yellow" onClick={() => setMinSet(true)}></button>
            <button className="appCtrl green"></button>
          </div>
          <div className="appName"><h1>Settings</h1></div>
        </div>
        <div className="settings" id="settings">

        </div>
      </div>}


      
      <div id="dock" style={{transform: visible? 'translateY(150%)':'none', background: (closing && visible)? 'linear-gradient(45deg, #acf, #fac)':'transparent' }}>
        <button className="icon" onClick={() => {setOpenTodo(true); setMinTodo(false); setActiveApp('t')}}>✔</button>
        <button className="icon" onClick={() => {setOpenPomo(true); setMinPomo(false); setActiveApp('p')}}></button>
        <button className="icon" onClick={() => {setOpenRev(true); setMinRev(false); setActiveApp('r')}}></button>
        <button className="icon"></button>
        <button className="icon"></button>
        <button className="icon" onClick={() => {setOpenSet(true);}}>⚙</button>
      </div>
    </section>
    </>
  )
}
