import Timer from "../Timer";
import {GetService} from "../../../scripts/get-service";

const DiscussionVotingForm = (
  { 
   phase
   }
) => {
   const handleTimeEnd = async () => {
   
   try {
      const token = localStorage.getItem('token');      
      const response = await GetService.getData(`http://localhost:8000/time-end/`, token);

      if (response.ok) {         
        
      }
   } catch (error) {
      console.error("Ошибка отправки запроса:", error);
   }
   };
   return (
      <div className="cont w-100 flex-row p-4 mt-4">
         <div className="col-md-9 d-flex flex-column align-items-center">
            {(phase === "discussion") && (<h3 className="fw-bold text-center">Пришло время обсудить открытые карты!</h3>)}
            {(phase === "voting") && (<h3 className="fw-bold text-center">Пришло время выбрать того, кто покинет нас!</h3>)} 
            <div className="text-center mt-4">
               <Timer
                  duration = {120}
                  onTimeEnd={()=>{
                     handleTimeEnd();
                  }}
               />
            </div>
         
         </div>
         <div className="col-md-3">
            <i className={`bi bi-clock p-5`}  style={{fontSize: '5rem'}}></i>
         </div>         
      </div>
   );
}

export default DiscussionVotingForm;