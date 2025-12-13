import CreateCardForm from "./CreateCardForm";
import { useState } from "react"; 
import Button from "../ui/Button";
import { DeleteService } from "../../scripts/delete-service";

const DeckCategory = ({ 
   deck_id,
   title,
   title_svg,
   name,
   cardsData = [],
   onCardCreated 
}) => {
   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [internalSuccess, setInternalSuccess] = useState("");
   const [showModal, setShowModal] = useState(false); 

   const button_child = (
      <h5>
         <i className={`bi bi-${title_svg}`}></i> {title}
      </h5>
   );

   const openModal = () => {
      setShowModal(true);
   };

   const closeModal = () => {
      setShowModal(false);
      setInternalError("");
      setInternalSuccess("");
   };

   const handleCardCreated = () => {
      if (onCardCreated) {
         onCardCreated();
      }
   };

   const handleDelete = async (cardId) => {
      const token = localStorage.getItem('token');
      try {
         setInternalError("");
         setInternalSuccess("");
         setLoading(true);
         const result = await DeleteService.deleteData(`http://localhost:8000/cards/${cardId}/`,
            'json', token);
         if (result.message) {
            setInternalSuccess("Карта успешно удалена!");
            setTimeout(() => {
               window.location.reload();
            }, 1000);
         }
      } catch (error) {
         setInternalError("Ошибка при удалении карты");
      } finally {
         setLoading(false);
      }
   };

   const canEdit = parseInt(deck_id) !== 1;
   
   return (
         <div className="accordion-item">
            <h2 className="accordion-header">
               <button 
                  className="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target={`#collapse-${name}`} 
                  aria-expanded="false" 
                  aria-controls={`collapse-${name}`}
                  data-bs-parent="#mainAccordion"
               >
                  {button_child}
               
               </button>
            </h2>
            <div 
               id={`collapse-${name}`} 
               className="accordion-collapse collapse" >
               <div className="accordion-body">
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

                  {canEdit && (
                     <Button 
                        className="mb-3"
                        variant="primary"
                        disabled={loading}
                        onClick={openModal}
                     >
                        <i className="bi bi-plus-circle"></i> Добавить карту
                     </Button>
                  )}

                  <div className="cards-list">
                     {cardsData.length === 0 ? (
                        <div className="alert alert-info">
                           Пока что не добавлено ни одной карты
                        </div>
                     ) : (
                        <ul className="list-group">
                           {cardsData.map(card => (
                              <li key={card.id} className="list-group-item d-flex justify-content-between align-items-center">
                                 {card.title} - {card.description}
                                 {canEdit && (
                                    <button 
                                       className="btn btn-sm btn-outline-danger"
                                       onClick={() => handleDelete(card.id)}
                                       disabled={loading}
                                    >
                                       <i className="bi bi-trash"></i>
                                    </button>
                                 )}
                              </li>
                           ))}
                        </ul>
                     )}
                  </div>

                  {showModal && (
                     <CreateCardForm 
                        show={showModal}
                        onClose={closeModal}
                        deck_id={deck_id}
                        card_type={name} 
                        onSuccess={handleCardCreated} 
                     />
                  )}
               </div>
            </div>
         </div>
   );
};

export default DeckCategory;