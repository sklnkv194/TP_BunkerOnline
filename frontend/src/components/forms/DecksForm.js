import Form from "../ui/Form";
import Button from "../ui/Button";
import { useState, useEffect } from "react";
import { GetService } from "../../scripts/get-service";
import DeleteModal from "./DeleteModal";
import { useNavigate } from "react-router-dom";


const DecksForm = ({ id }) => {

   const navigate = useNavigate();

   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [decksData, setDecksData] = useState([]);
   const [decks, setDecks] = useState([]);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [selectedDeckId, setSelectedDeckId] = useState(null);

   useEffect(() => {
    
         setInternalError("");
         const token = localStorage.getItem('token');
         const getDecksInfo = async () => {
            setLoading(true);
            try {
               const result = await GetService.getData(`http://localhost:8000/decks/${id}/`, 
                  token);
               if (result.data) {
                  setDecksData(result.data);
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
  
   }, []);

  useEffect(() => {
      const getDecks = () => {
         const decksFields = decksData.map(deck => ({
            id: deck.id,        
            type: "text",
            name: `deck-${deck.id}`,      
            value: deck.name,
            disabled: true,
            wrapperClass: 'mb-3',
            inputClass: 'form-control-lg',
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
   

   return (
      <div style={{width: "calc(100% * 1 / 3)"}}>
         <Form
            className="w-100"
            title="Мои колоды"
            fields={decks}
            formError={internalError}
            >
         </Form>
         <Button 
            className="mt-3"
            variant="primary"
            disabled={loading}
         >
            <i className="bi bi-plus-circle"></i> Добавить колоду
         </Button>
         <DeleteModal
            url="http://localhost:8000/decks"
            id={selectedDeckId}
            show={showDeleteModal}
            onClose={closeDeleteModal}
         />
      
      </div>
     
   );
};

export default DecksForm;