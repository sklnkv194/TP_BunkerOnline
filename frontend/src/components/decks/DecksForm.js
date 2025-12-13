import Form from "../ui/Form";
import Button from "../ui/Button";
import { useState, useEffect } from "react";
import { GetService } from "../../scripts/get-service";
import DeleteModal from "../forms/DeleteModal";
import { useNavigate } from "react-router-dom";
import CreateDeckForm from "./CreateDeckForm";
import { PostService } from "../../scripts/post-service";

const DecksForm = ({ id }) => {

   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [decksData, setDecksData] = useState([]);
   const [decks, setDecks] = useState([]);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [showAddModal, setShowAddModal] = useState(false);
   const [selectedDeckId, setSelectedDeckId] = useState(null);
   
   const [internalErrorCreate, setInternalErrorCreate] = useState("");
   const [internalSuccessCreate, setInternalSuccessCreate] = useState("");

   useEffect(() => {
    
         setInternalError("");
         const token = localStorage.getItem('token');
         const getDecksInfo = async () => {
            setLoading(true);
            try {
               const result = await GetService.getData(`http://localhost:8000/decks/${id}/`, 
                  token);
               if (result && result.decks) {
                  setDecksData(result.decks);
               }
            } catch (error) {
               setInternalError("Ошибка при получении данных");
            } finally {
               setLoading(false);
            }
         };
         if (token) {
            getDecksInfo();
         }
  
   }, [id]);

  useEffect(() => {
      const getDecks = () => {
         const decksFields = decksData.map(deck => ({
            id: deck.id,        
            type: "text",
            name: `deck-${deck.id}`,      
            value: deck.name,
            disabled: true,
            wrapperClass: 'mb-3',
            del: true,
            delClick: () => deleteComponent(deck.id),
            edit: true,
            editClick: () => editComponent(deck.id) 
         }));
         setDecks(decksFields);          
      };
      
      if (decksData && decksData.length > 0) {
         getDecks();
      }
   }, [decksData]); 

   const closeDeleteModal = () => {
      setShowDeleteModal(false); 
   };

   const closeAddModal = () => {
      setShowAddModal(false); 
   };


   const deleteComponent = (deck_id) => {
      try{
         setLoading(true);
         setSelectedDeckId(deck_id);
         setShowDeleteModal(true);
         setLoading(false);
      } finally {
         setLoading(false);
      }
   };

   const editComponent = (deck_id) => {
      navigate(`/deck/${deck_id}`);
   };
   
   const openDeckModal = () => {
      setShowAddModal(true);
   };

   const handleCreate = async (formData) => {
      setInternalErrorCreate("");
      setInternalSuccessCreate("");
      const token = localStorage.getItem('token');
      try {
         setLoading(true);
         const result = await PostService.postData("http://localhost:8000/decks/create/",
            {
               name: formData.deck_name,
               user_id: id
            }, 'json', token);
         if (result && result.data.deck.id) {
            setInternalSuccessCreate("Колода успешно создана!");
            setTimeout(() => {
               navigate(`/deck/${result.data.deck.id}`)
            }, 1000);
         }
      } catch (error) {
         setInternalErrorCreate(error.data?.error || error.data || "Произошла ошибка при создании колоды");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div style={{width: "calc(100% * 1 / 3)"}}>
         {loading && <div>Загрузка колод...</div>}
         
         {!loading && decksData && decksData.length === 0 && (
            <div className="alert alert-info">
            У вас пока нет колод
            </div>
         )}
         
         {!loading && decksData && decksData.length > 0 && (
         <Form
            className="w-100"
            title="Мои колоды"
            fields={decks}
            formError={internalError}
            >
         </Form>
         )}
         <Button 
            className="mt-3"
            variant="primary"
            disabled={loading}
            onClick={openDeckModal}
         >
            <i className="bi bi-plus-circle"></i> Добавить колоду
         </Button>
         <DeleteModal
            url="http://localhost:8000/decks"
            id={selectedDeckId}
            show={showDeleteModal}
            onClose={closeDeleteModal}
         />
         {showAddModal &&(
            <CreateDeckForm 
               id={id}
               show={showAddModal}
               onClose={closeAddModal}
               onSubmit={handleCreate}
               internalErrorCreate={internalErrorCreate}
               internalSuccessCreate={internalSuccessCreate}
            />
         )}
         
      </div>
     
   );
};

export default DecksForm;