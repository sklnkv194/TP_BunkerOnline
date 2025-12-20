import Form from "../ui/Form";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { PostService } from "../../scripts/post-service";

const ConnectToRoomForm = ({id=""}) => {

   const navigate = useNavigate();

   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [internalSuccess, setInternalSuccess] = useState("");

   const connectToRoomFields = [
      {
         id:'room_code',
         type: 'text',
         name: 'room_code',
         label: 'Код комнаты',
         placeholder: 'Пример: А00С00',
         required: true,
         wrapperClass: 'mb-3',
      }
   ];

   const connectToRoomButton = {
      children: 'Подключиться',
      disabled: loading,
      size: "md"
   };

   const handleConnectToRoom = async (formData) => {
      try{
         const user_id = localStorage.getItem('id');
         setLoading(true);
         const result = await PostService.postData('http://localhost:8000/rooms/join_room/', {
               code: formData.room_code,
               user_id: parseInt(user_id) 
            }, 'json');
         if (result && result.ok){
            const roomId = result.data.room_code;
            navigate(`/wait_for_game/${roomId}?is_owner=false`);
         } else {
            setInternalError(result.data.error);
         }
      } catch (error) {
         setInternalError(error.message);
      } finally {
         setLoading(false);
      }
   };


   return (
      <Form
         title="Подключиться к комнате"
         fields={connectToRoomFields}
         button={connectToRoomButton}
         onSubmit={handleConnectToRoom}  
         formError={internalError}
         formSuccess={internalSuccess}
         >
      </Form>
      
   );
};

export default ConnectToRoomForm;