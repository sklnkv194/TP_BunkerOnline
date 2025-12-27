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
         setLoading(true);
         setInternalError("");
         
         let user_id = localStorage.getItem('id');
         let requestData = { code: formData.room_code };
         
         if (user_id) {
            requestData.user_id = parseInt(user_id);
         }
         
         const result = await PostService.postData(
            'http://localhost:8000/rooms/join_room/', 
            requestData, 
            'json'
         );
         
         if (result && result.ok){
            const { user_id: returnedUserId, display_name, is_guest, room_code } = result.data;
            
            if (returnedUserId) {
               localStorage.setItem('current_user_id', returnedUserId);
               
               if (is_guest) {
                  localStorage.setItem('is_guest', 'true');
                  localStorage.setItem('guest_display_name', display_name);
               } else {
                  localStorage.setItem('is_guest', 'false');
               }
            }
            
            const roomId = room_code || result.data.room_code;
            navigate(`/wait_for_game/${roomId}?is_owner=false`);
            
         } else {
            setInternalError(result.data?.error || 'Ошибка подключения');
         }
      } catch (error) {
         setInternalError(error.message || 'Ошибка подключения');
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