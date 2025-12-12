import Form from "../ui/Form";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PostService } from "../../scripts/post-service";
import { GetService } from "../../scripts/get-service";

const CreateRoomForm = ({ id }) => {
   const navigate = useNavigate();

   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [decksData, setDecksData] = useState([]);
   const [decks, setDecks] = useState([]);

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
  
   }, []);

   useEffect(() => {
      const getDecks = () => {
         const decksOptions = decksData.map(deck => ({
            value: deck.id,
            label: deck.name
         }));
         setDecks(decksOptions);
      };
      if (decksData) {
         getDecks();
      }
      
   }, [decksData]);


   const createFields = [
      {
         id: 'players_count',
         type: "number",
         name: 'players_count',
         label: 'Количество игроков',
         required: true,
         wrapperClass: 'mb-3',
         placeholder: "Введите количество игроков"
      },
      {
         id: 'deck',
         type: 'dropdown',
         name: 'deck',
         label: 'Колода',
         required: true,
         wrapperClass: 'mb-3',
         options: decks,
         placeholder: "Выберите колоду"
      }
   ];

   const createButton = {
      children: 'Создать',
      disabled: loading
   };

   const handleCreate = async (formData) => {

      const token = localStorage.getItem('token');
      setInternalError("");
      try{
         setLoading(true);
         const result = await PostService.postData("http://localhost:8000/rooms/create/",
            {
            deck: parseInt(formData.deck),
            count: formData.count,
            user_id: id
         }, 'json', token);
         if (result.id){
            const roomId = result.data.room_id;
            navigate(`/wait_for_game/${roomId}?is_owner=true`);
         }
      } catch (error) {
         setInternalError(error.data || "Произошла ошибка при создании комнаты");
      } finally {
         setLoading(false);
      }
   };



   return (
         <Form
            title="Создать комнату"
            fields={createFields}
            button={createButton}
            onSubmit={handleCreate}  
            formError={internalError}
            >
         </Form>
    
   );
};

export default CreateRoomForm;