import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

const FinalModal = ({ 
   isOpen, 
   survivors = []
}) => {
   const navigate = useNavigate();
   
   const handleFinish = () => {
      navigate("/"); // Перенаправляем на главную страницу
   };
   
   if (!isOpen) return null;
   
   return (
      <div className="modal fade show d-block" style={{ 
         backgroundColor: 'rgba(0,0,0,0.5)'
      }}>
         <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
               <div className="modal-header text-white" style={{backgroundColor: "#0A9396"}}>
                  <h5 className="modal-title">
                     Игра окончена!
                  </h5>
               </div>
               
               <div className="modal-body text-center">
                  <div className="mb-3">
                     <i className="bi bi-trophy" style={{ fontSize: '3rem', color: '#ffc107' }}></i>
                  </div>
                  
                  <h6 className="mb-3">Выжившие:</h6>
                  
                  {survivors.length > 0 ? (
                     <div className="list-group">
                        {survivors.map((survivor, index) => (
                           <div 
                              key={survivor.id} 
                              className="list-group-item d-flex justify-content-between align-items-center"
                           >
                              <span>{survivor.nickname || `Игрок ${index + 1}`}</span>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-muted">Никто не выжил</p>
                  )}
               </div>
               
               <div className="modal-footer">
                  <Button
                     className="btn btn-success w-100"
                     onClick={handleFinish}
                  >
                     Завершить
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default FinalModal;