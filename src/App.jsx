//  import Modules and CSS
import { useState, useEffect } from 'react';
import './Apps.css';
import './App.css';

// import Apps
import Focus from './apps/todo.jsx';
import Cal from './apps/cal.jsx';
import Rev from './apps/rev.jsx';
import NCERT from './apps/ncert.jsx';
import Guide from './apps/guide.jsx';

export default function App() {
  // ================================================== {DEVTOOLS} ==================================================
  useEffect(() => {
    // Avoid Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // ================================================== {APPS} ==================================================
  const [openSet, setOpenSet] = useState(false);

  const [openTodo, setOpenTodo] = useState(false);
  const [openCal, setOpenCal] = useState(false);
  const [openRev, setOpenRev] = useState(false);
  const [openNCERT, setOpenNCERT] = useState(false);
  const [openGui, setOpenGui] = useState(false);

  const [minTodo, setMinTodo] = useState(false);
  const [minRev, setMinRev] = useState(false);
  const [minCal, setMinCal] = useState(false);
  const [minNCERT, setMinNCERT] = useState(false);
  const [minGui, setMinGui] = useState(false);

  const [maxTodo, setMaxTodo] = useState(false);
  const [maxRev, setMaxRev] = useState(false);
  const [maxCal, setMaxCal] = useState(false);
  const [maxNCERT, setMaxNCERT] = useState(false);
  const [maxGui, setMaxGui] = useState(false);

  // ================================================== {Welcome} ==================================================
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(true);
  const handleCloseWel = () => {
    document.documentElement.requestFullscreen();
    setTimeout(() => setClosing(true), 300);
    setTimeout(() => setVisible(false), 1300);
  };

  // ================================================== {ZIndex and Settings} ==================================================
  const [ztodo, setZtodo] = useState(3);
  const [zcal, setZcal] = useState(3);
  const [zrev, setZrev] = useState(3);
  const [zNCERT, setZNCERT] = useState(3);
  const [zGui, setZgui] = useState(3);
  function closeSet() {setOpenSet(false);}
  function zi(x) {
    setZtodo(prev => prev - 1);
    setZcal(prev => prev - 1);
    setZrev(prev => prev - 1);
    setZNCERT(prev => prev - 1);
    setZgui(prev => prev - 1);
    if(x === 't') {
      setZtodo(4);
    } else if(x === 'c') {
      setZcal(4);
    } else if(x === 'r') {
      setZrev(4);
    } else if(x === 'n') {
      setZNCERT(4);
    } else if(x === 'g') {
      setZgui(4);
    }
  }

  return (
    <>
    <section id="body">
      {visible && (
        <div className="welcome" onClick={handleCloseWel} style={{ transform: closing ? 'translateY(-150%)' : 'none' }}>
          <h1>Welcome</h1>
          <p>ProDesk X10</p>
        </div>
      )}
      
      {openTodo && <div className={"appWindow" + (maxTodo ? " appWinFull" : "")} style={{
        transform: minTodo? 'translateY(-100dvh)':'none',
        zIndex: ztodo,
        }}>
        <div className="appTop" style={{width: maxTodo? '100dvw':'85dvw'}}>
          <div className="traffic">
            <button className="appCtrl red" onClick={() => {setOpenTodo(false); setMinTodo(false); setMaxTodo(false)}}></button>
            <button className="appCtrl yellow" onClick={() => {setMinTodo(true);}}></button>
            {/* <button className="appCtrl green" onClick={() => {if (!maxTodo){setMaxTodo(true)} else {setMaxTodo(false)}}}></button> */}
            {maxTodo && <button className="appCtrl green" onClick={() => {setMaxTodo(false);}}></button>}
            {!maxTodo && <button className="appCtrl green" onClick={() => {setMaxTodo(true);}}></button>}
          </div>
          <div className="appName"><h1>Focus Flow</h1></div>
        </div>
        {openTodo && <Focus />}
      </div>}
      

      {openCal && <div className={"appWindow" + (maxCal ? " appWinFull" : "")} style={{
        transform: minCal? 'translateY(-100dvh)':'none',
        zIndex: zcal,
        }}>
        <div className="appTop" style={{width: maxCal? '100dvw':'85dvw'}}>
          <div className="traffic">
            <button className="appCtrl red" onClick={() => {setOpenCal(false); setMinCal(false); setMaxCal(false)}}></button>
            <button className="appCtrl yellow" onClick={() => setMinCal(true)}></button>
            <button className="appCtrl green" onClick={() => {if (!maxCal){setMaxCal(true)} else {setMaxCal(false)}}}></button>
          </div>
          <div className="appName"><h1>Calendar</h1></div>
        </div>
        {openCal && <Cal />}
      </div>}

      
      {openRev && <div className={"appWindow" + (maxRev ? " appWinFull" : "")} style={{
        transform: minRev? 'translateY(-100dvh)':'none',
        zIndex: zrev,
      }}>
        <div className="appTop" style={{width: maxRev? '100dvw':'85dvw'}}>
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenRev(false)}></button>
            <button className="appCtrl yellow" onClick={() => setMinRev(true)}></button>
            <button className="appCtrl green" onClick={() => {if (!maxRev){setMaxRev(true)} else {setMaxRev(false)}}}></button>
          </div>
          <div className="appName"><h1>Revision</h1></div>
        </div>
        {openRev && <Rev />}
      </div>}

      
      {openNCERT && <div className={"appWindow" + (maxNCERT ? " appWinFull" : "")} style={{
        transform: minNCERT? 'translateY(-100dvh)':'none',
        zIndex: zNCERT,
      }}>
        <div className="appTop" style={{width: maxNCERT? '100dvw':'85dvw'}}>
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenNCERT(false)}></button>
            <button className="appCtrl yellow" onClick={() => setMinNCERT(true)}></button>
            <button className="appCtrl green" onClick={() => {if (!maxNCERT){setMaxNCERT(true)} else {setMaxNCERT(false)}}}></button>
          </div>
          <div className="appName"><h1>NCERT X Download</h1></div>
        </div>
        {openNCERT && <NCERT />}
      </div>}

      
      {openGui && <div className={"appWindow" + (maxGui ? " appWinFull" : "")} style={{
        transform: minGui? 'translateY(-100dvh)':'none',
        zIndex: zGui,
      }}>
        <div className="appTop" style={{width: maxGui? '100dvw':'85dvw'}}>
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenGui(false)}></button>
            <button className="appCtrl yellow" onClick={() => setMinGui(true)}></button>
            <button className="appCtrl green" onClick={() => {if (!maxGui){setMaxGui(true)} else {setMaxGui(false)}}}></button>
          </div>
          <div className="appName"><h1>Guide</h1></div>
        </div>
        {openGui && <Guide />}
      </div>}

      
      {openSet && <div className="appWindow set">
        <div className="appTop" style={{width: maxTodo? '100dvw':'85dvw'}}>
          <div className="traffic">
            <button className="appCtrl red" onClick={() => setOpenSet(false)}></button>
          </div>
          <div className="appName"><h1>Settings</h1></div>
        </div>
        <div className="settings app" id="settings">
          <button id="FS" onClick={handleCloseWel}>Fullscreen</button>
        </div>
      </div>}


      
      <div id="dock"
      className={"dock" + (((maxTodo && !minTodo) || (maxCal && !minCal) || (maxRev && !minRev) || (maxNCERT && !minNCERT) || (maxGui && !minGui))? ' dockMax':'')}
      style={{
        transform: visible? 'translateY(150%)':'',
      }}>
        <button className="icon" onClick={() => {setOpenSet(false); setOpenTodo(true); if(!minTodo && ztodo == 4) {setMinTodo(true);} else {setMinTodo(false); zi('t');}}} data-name="Focus Flow">✅</button>
        <button className="icon" onClick={() => {setOpenSet(false); setOpenCal(true); if(!minCal && zcal == 4) {setMinCal(true);} else {setMinCal(false); zi('c');}}} data-name="Calendar">📅</button>
        <button className="icon" onClick={() => {setOpenSet(false); setOpenRev(true); if(!minRev && zrev == 4) {setMinRev(true);} else {setMinRev(false); zi('r');}}} data-name="Revision">📑</button>
        <button className="icon" onClick={() => {setOpenSet(false); setOpenNCERT(true); if(!minNCERT && zNCERT == 4) {setMinNCERT(true);} else {setMinNCERT(false); zi('n');}}} data-name="NCERT">📚</button>
        <button className="icon" onClick={() => {setOpenSet(false); setOpenGui(true); if(!minGui && zGui == 4) {setMinGui(true);} else {setMinGui(false); zi('g');}}} data-name="Guide">🧭</button>
        <button className="icon" onClick={() => {setOpenSet(true);}} data-name="Settings">⚙</button>
      </div>
    </section>
    </>
  )
}
