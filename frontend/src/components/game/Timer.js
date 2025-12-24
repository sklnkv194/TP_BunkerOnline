import { useState, useEffect } from "react";

const Timer = ({ duration, onTimeEnd }) => {
   const [timeLeft, setTimeLeft] = useState(duration);
   const [isRunning, setIsRunning] = useState(true);

   useEffect(() => {
      let timer;
      
      if (isRunning && timeLeft > 0) {
         timer = setInterval(() => {
            setTimeLeft(prev => {
               if (prev <= 1) {
                  clearInterval(timer);
                  setIsRunning(false);
                  if (onTimeEnd) {
                     onTimeEnd(); 
                  }
                  return 0;
               }
               return prev - 1;
            });
         }, 1000);
      }

      return () => {
         if (timer) clearInterval(timer);
      };
   }, [isRunning, timeLeft, onTimeEnd]);

   const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
   };

   return (
      <div className="timer-container">
         <div className='timer-display fs-1 fw-bold'>
            {formatTime(timeLeft)}
         </div>
   
      </div>
   );
};

export default Timer;