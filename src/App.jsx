import { useState, useEffect, useRef } from 'react';
import './App.scss';

export default function App() {
   const [points, setPoints] = useState(5);
   const [circles, setCircles] = useState([]);
   const [nextNumber, setNextNumber] = useState(1);
   const [time, setTime] = useState(0);
   const [running, setRunning] = useState(false);
   const [auto, setAuto] = useState(false);
   const [hasPlayed, setHasPlayed] = useState(false);
   const [highlighted, setHighlighted] = useState([]);
   const [showNext, setShowNext] = useState(true);
   const [hasClear, setHasClear] = useState(false);
   const [hasOver, setHasOver] = useState(false);
   const [tick, setTick] = useState(0);

   const timerRef = useRef(null);
   const finishTimeoutRef = useRef(null);

   // Spawn random circles
   const generateCircles = (count) => {
      const newCircles = [];
      for (let i = 1; i <= count; i++) {
         const x = Math.random() * 460;
         const y = Math.random() * 460;
         newCircles.push({ id: i, x, y });
      }
      return newCircles;
   };
   // Start game or Restart game
   const startGame = () => {
      // Fix restart game before finish timeout
      if (finishTimeoutRef.current) {
         clearTimeout(finishTimeoutRef.current);
         finishTimeoutRef.current = null;
      }
      // Start new game
      setCircles(generateCircles(points));
      setNextNumber(1);
      setShowNext(true);
      setTime(0);
      setRunning(true);
      setHighlighted([]);
      setHasClear(false);
      setHasOver(false);
   };

   // Timer game
   useEffect(() => {
      if (running) {
         timerRef.current = setInterval(() => {
            setTime((t) => t + 0.1);
         }, 100);
      } else {
         clearInterval(timerRef.current);
      }
      return () => clearInterval(timerRef.current);
   }, [running]);

   // Tự xóa circle khi countdown hết
   useEffect(() => {
      const now = Date.now();
      const expiredIds = highlighted.filter((h) => now - h.startTime >= 3000).map((h) => h.id);

      if (expiredIds.length > 0) {
         setCircles((prev) => prev.filter((c) => !expiredIds.includes(c.id)));
         setHighlighted((prev) => prev.filter((h) => !expiredIds.includes(h.id)));
      }
   }, [highlighted]);

   // Xử lý click
   const handleCircleClick = (id) => {
      if (id === nextNumber) {
         const now = Date.now();
         setHighlighted((prev) => [...prev, { id, startTime: now }]);

         if (id === points) {
            setShowNext(false);
            finishTimeoutRef.current = setTimeout(() => {
               setCircles([]);
               setRunning(false);
               setHasPlayed(true);
               setHasClear(true);
            }, 3000);
         } else {
            setNextNumber((n) => n + 1);
         }
      } else {
         setRunning(false);
         setHasOver(true);
         setHasPlayed(true);
      }
   };

   return (
      <div className="game-container">
         <div className="game-content">
            <div className="top-panel">
               <div>
                  {hasClear ? (
                     <strong className="has-clear">ALL CLEARED</strong>
                  ) : hasOver ? (
                     <strong className="has-over">GAME OVER</strong>
                  ) : (
                     <strong>LET'S PLAY</strong>
                  )}
               </div>
               <div>
                  Points:
                  <input
                     type="number"
                     min="1"
                     value={points}
                     onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                  />
               </div>
               <div>
                  Time: <span>{time.toFixed(1)}s</span>
               </div>
               {!running && !hasPlayed && <button onClick={startGame}>Play</button>}
               {(running || hasPlayed) && (
                  <>
                     <button className="restart-btn" onClick={startGame}>
                        Restart
                     </button>
                     {running && (
                        <>
                           {!auto && <button className="auto-btn">Auto Play ON</button>}
                           {auto && <button className="auto-btn">Auto Play OFF</button>}
                        </>
                     )}
                  </>
               )}
            </div>

            <div className={`wrapper-play-area ${hasOver ? 'game-over' : ''}`}>
               <div className="play-area">
                  {circles.map((circle) => {
                     const hl = highlighted.find((h) => h.id === circle.id);
                     const isHighlight = !!hl;
                     let countdown = null;

                     if (hl) {
                        const elapsed = (Date.now() - hl.startTime) / 1000;
                        const remain = Math.max(0, 3 - elapsed);
                        countdown = remain.toFixed(1);
                     }

                     return (
                        <div
                           key={circle.id}
                           className={`circle ${isHighlight ? 'highlight' : ''}`}
                           style={{
                              left: circle.x,
                              top: circle.y,
                              zIndex: points - circle.id,
                           }}
                           onClick={() => handleCircleClick(circle.id)}
                        >
                           {circle.id}
                           {isHighlight && <div className="countdown">{countdown}</div>}
                        </div>
                     );
                  })}
               </div>
            </div>
            {running && showNext && <div>Next: {nextNumber}</div>}
         </div>
      </div>
   );
}
