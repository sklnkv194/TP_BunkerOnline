import { useState, useEffect, useRef } from "react";

// Timer.js - упрощенная версия
const Timer = ({ duration, onTimeEnd, phase }) => {
   const [timeLeft, setTimeLeft] = useState(duration);
   const hasEnded = useRef(false);

   useEffect(() => {
      setTimeLeft(duration);
      hasEnded.current = false;
   }, [duration, phase]); // Сбрасываем при смене фазы

   useEffect(() => {
      if (timeLeft <= 0 || hasEnded.current) return;

      const timer = setTimeout(() => {
         setTimeLeft(prev => {
            if (prev <= 1) {
               if (!hasEnded.current) {
                  hasEnded.current = true;
                  onTimeEnd?.();
               }
               return 0;
            }
            return prev - 1;
         });
      }, 1000);

      return () => clearTimeout(timer);
   }, [timeLeft, onTimeEnd]);

   const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
   };

   return (
      <div className="timer-container text-center">
         <div className='timer-display fs-1 fw-bold'>
            {formatTime(timeLeft)}
         </div>
         {timeLeft === 0 && (
            <div className="text-danger small mt-1">
               Время вышло!
            </div>
         )}
      </div>
   );
};

export default Timer;