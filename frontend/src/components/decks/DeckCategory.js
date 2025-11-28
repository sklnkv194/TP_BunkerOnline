import CreateCardForm from "./CreateCardForm";
import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { PostService } from "../../scripts/post-service";
import { DeleteService } from "../../scripts/delete-service";

const DeckCategory = ({ 
   deck_id,
   category_id,   
   title,
   title_svg,
   name
}) => {
   const [cardsData, setCardsData] = useState([]);
   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [internalSuccess, setInternalSuccess] = useState("");
   const [internalErrorCreate, setInternalErrorCreate] = useState("");
   const [internalSuccessCreate, setInternalSuccessCreate] = useState("");
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
   };
   
   useEffect(() => {
      setInternalError("");
      setInternalSuccess("");
      const token = localStorage.getItem('token');
      const getCardsInfo = async () => {
         setLoading(true);
         try {
            const result = await PostService.postData(`http://localhost:8000/cards/get_info`, 
               {
                  deck_id: deck_id,
                  category_id: category_id
               }, "form",
               token);
            if (result.data) {
               setCardsData(result.data);
            }
         } catch (error) {
            setInternalError("Ошибка при получении данных");
         } finally {
            setLoading(false);
         }
      };
      if (token) {
         getCardsInfo();
      }
   }, [deck_id, category_id]);

   const handleCreate = async (formData) => {
      setInternalErrorCreate("");
      setInternalSuccessCreate("");
      const token = localStorage.getItem('token');
      try {
         setLoading(true);
         const result = await PostService.postData("http://localhost:8000/cards/create/",
            {
               name: formData.name,
               category_id: category_id,
               deck_id: deck_id
            }, 'json', token);
         if (result.id) {
            setInternalSuccessCreate("Карта успешно создана!");
            setTimeout(() => {
               closeModal();
               window.location.reload();
            }, 1000);
         }
      } catch (error) {
         setInternalErrorCreate(error.data?.error || error.data || "Произошла ошибка при создании карты");
      } finally {
         setLoading(false);
      }
   };

   const handleDelete = async (cardId) => {
      const token = localStorage.getItem('token');
      try {
         setInternalError("");
         setInternalSuccess("");
         setLoading(true);
         const result = await DeleteService.deleteData(`http://localhost:8000/cards/delete/${cardId}`,
            'json', token);
         if (result.ok) {
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
                                 {card.name}
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
                        onSubmit={handleCreate}
                        loading={loading}
                        internalError={internalErrorCreate}
                        internalSuccess={internalSuccessCreate}
                     />
                  )}
               </div>
            </div>
         </div>
   );
};

export default DeckCategory;
