import { useState, useEffect } from "react";
import { DeleteService } from "../../scripts/delete-service";

const DeleteModal = ({ show = false, onClose, id, url }) => {
   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [internalSuccess, setInternalSuccess] = useState("");

   useEffect(() => {
      if (show) {
         setInternalError("");
         setInternalSuccess("");
      }
   }, [show]);

   const handleDelete = async () => {
      const token = localStorage.getItem('token');
      setInternalError("");
      setInternalSuccess("");
      try{
         setLoading(true);
         const result = await DeleteService.deleteData(`${url}/${id}/`,
            token);
         
         if (result.success){
            setInternalSuccess("Успешно удалено!");
            setTimeout(() => {
               onClose();
               window.location.reload();
            }, 2000);
         }
         console.log(id)
         console.log(result)
      } catch (error) {
         setInternalError(error.data || "Произошла ошибка при удалении");
      } finally {
         setLoading(false);
      }
   };

   if (!show) {
      return null;
   }

   return (
      <div className="modal modal-delete show d-block" id="delete" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
               <div className="modal-content">
                  <div className="modal-header">
                     <h5 className="modal-title">Удаление</h5>
                     <button 
                        type="button" 
                        className="btn-close" 
                        onClick={onClose}
                        aria-label="Close"
                        disabled={loading}
                     ></button>
                  </div>

                  {internalError && (
                     <div className="alert alert-danger">
                        {internalError}
                     </div>
                  )}

                  {internalSuccess && (
                     <div className="alert alert-success">
                        {internalSuccess}
                     </div>
                  )}

                  <div className="modal-body">
                     Вы уверены, что хотите удалить?
                  </div>
                  <div class="modal-footer">
                     <button type="button" class="btn btn-primary" onClick={handleDelete} >Удалить</button>
                  </div>
               </div>
            </div>
         </div>
   );
};

export default DeleteModal;