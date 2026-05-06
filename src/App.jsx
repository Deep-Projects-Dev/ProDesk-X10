//  import Modules and CSS
import { useState, useEffect } from 'react';
import './App.css';
import './Apps.css';

// import Apps
import Focus from './apps/todo.jsx';
import Cal from './apps/cal.jsx';
import Rev from './apps/rev.jsx';
import NCERT from './apps/ncert.jsx';

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
  const [openSet, setOpenSet] = useState(false);

  const [openTodo, setOpenTodo] = useState(false);
  const [openCal, setOpenCal] = useState(false);
  const [openRev, setOpenRev] = useState(false);
  const [openNCERT, setOpenNCERT] = useState(false);
  const [minTodo, setMinTodo] = useState(false);
  const [minRev, setMinRev] = useState(false);
  const [minCal, setMinCal] = useState(false);
  const [minNCERT, setMinNCERT] = useState(false);

  // ================================================== {Welcome} ==================================================
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(true);
  const handleCloseWel = () => {
    setClosing(true);
    setTimeout(() => setVisible(false), 1000);
  };

  // ================================================== {ZIndex and Settings} ==================================================
  const [ztodo, setZtodo] = useState(3);
  const [zcal, setZcal] = useState(3);
  const [zrev, setZrev] = useState(3);
  const [zNCERT, setZNCERT] = useState(3);
  function closeSet() {setOpenSet(false);}
  function zi(x) {
    setZtodo(prev => prev - 1);
    setZcal(prev => prev - 1);
    setZrev(prev => prev - 1);
    setZNCERT(prev => prev - 1);
    if(x === 't') {
      setZtodo(4);
    } else if(x === 'c') {
      setZcal(4);
    } else if(x === 'r') {
      setZrev(4);
    } else if(x === 'n') {
      setZNCERT(4);
    }
  }

  return (
    <>
    <section id="body">
      {visible && (
        <div className="welcome" onClick={handleCloseWel} style={{ transform: closing ? 'translateY(-150%)' : 'none' }}>
          <h1>Welcome</h1>
          <p>ProDesk cbseX</p>
        </div>
      )}
      
      {openTodo && <div className="appWindow" style={{transform: minTodo? 'translateY(-100dvh)':'none', zIndex: ztodo}}>
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
      

      {openCal && <div className="appWindow" style={{transform: minCal? 'translateY(-100dvh)':'none', zIndex: zcal}}>
        <div className="appTop">
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenCal(false)}></button>
            <button className="appCtrl yellow" onClick={() => setMinCal(true)}></button>
            <button className="appCtrl green"></button>
          </div>
          <div className="appName"><h1>Calendar</h1></div>
        </div>
        {openCal && <Cal />}
      </div>}

      
      {openRev && <div className="appWindow" style={{transform: minRev? 'translateY(-100dvh)':'none', zIndex: zrev}}>
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

      
      {openNCERT && <div className="appWindow" style={{transform: minNCERT? 'translateY(-100dvh)':'none', zIndex: zNCERT}}>
        <div className="appTop">
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenNCERT(false)}></button>
            <button className="appCtrl yellow" onClick={() => setMinNCERT(true)}></button>
            <button className="appCtrl green"></button>
          </div>
          <div className="appName"><h1>NCERT X Download</h1></div>
        </div>
        {openNCERT && <NCERT />}
      </div>}

      
      {openSet && <div className="appWindow set">
        <div className="appTop">
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenSet(false)}></button>
          </div>
          <div className="appName"><h1>Settings</h1></div>
        </div>
        <div className="settings" id="settings">
        </div>
      </div>}


      
      <div id="dock" style={{transform: visible? 'translateY(150%)':'none', background: (closing && visible)? 'linear-gradient(45deg, #acf, #fac)':'transparent' }}>
        <button className="icon" onClick={() => {setOpenSet(false); setOpenTodo(true); setMinTodo(false); zi('t')}} data-name="Focus Flow">✔</button>
        <button className="icon" onClick={() => {setOpenSet(false); setOpenCal(true); setMinCal(false); zi('c')}} data-name="Calendar">📅</button>
        <button className="icon" onClick={() => {setOpenSet(false); setOpenRev(true); setMinRev(false); zi('r')}} data-name="Revision">📑</button>
        <button className="icon" onClick={() => {setOpenSet(false); setOpenNCERT(true); setMinNCERT(false); zi('n')}} data-name="NCERT">📚</button>
        <button className="icon" onClick={() => {setOpenSet(false)}} data-name=""></button>
        <button className="icon" onClick={() => {setOpenSet(true);}} data-name="Settings">⚙</button>
      </div>
    </section>
    </>
  )
}
