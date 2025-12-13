import { useState } from "react";
import Form from "../ui/Form";
import { PostService } from "../../scripts/post-service";

const CreateCardForm = ({ 
   show, 
   onClose, 
   deck_id, 
   card_type,  
   onSuccess   
}) => {
   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [internalSuccess, setInternalSuccess] = useState("");

   const createFields = [
      {
         id: 'card_name',
         type: "text",
         name: 'card_name',
         label: 'Название карты',
         required: true,
         wrapperClass: 'mb-3',
         placeholder: "Введите название карты"
      },
      {
         id: 'card_description',
         type: "text",
         name: 'card_description',
         label: 'Описание карты',
         required: true,
         wrapperClass: 'mb-3',
         placeholder: "Введите описание карты"
      }
   ];

   const createButton = {
      children: 'Создать',
      disabled: loading
   };

   // Функция создания карты прямо в форме
   const handleCreate = async (formData) => {
      setInternalError("");
      setInternalSuccess("");
      const token = localStorage.getItem('token');
      
      try {
         setLoading(true);
         console.log("Creating card with:", {
            title: formData.card_name,
            description: formData.card_description,
            card_type: card_type,
            deck_id: deck_id
         });
         
         const result = await PostService.postData("http://localhost:8000/cards/create/",
            {
               title: formData.card_name,
               description: formData.card_description,
               card_type: card_type,
               deck: deck_id
            }, 'json', token);
         
         console.log(result.data)
         if (result && result.data.card) {
            setInternalSuccess("Карта успешно создана!");
            setTimeout(() => {
               if (onSuccess) onSuccess(); 
               onClose(); 
            }, 1000);
         
         } else {
            setInternalError("Произошла ошибка при создании карты");
         }
      } catch (error) {
         console.error("Error:", error);
         setInternalError(error.data?.error || error.data || "Произошла ошибка при создании карты");
      } finally {
         setLoading(false);
      }
   };

   if (!show) {
      return null;
   }

   return (
      <div style={{
         position: 'fixed',
         top: 0,
         left: 0,
         width: '100%',
         height: '100%',
         backgroundColor: 'rgba(0,0,0,0.5)',
         display: 'flex',
         flexDirection: 'column',
         justifyContent: 'center',
         alignItems: 'center',
         zIndex: 1000
      }}>
         <button 
            style={{backgroundColor: '#E9ECEF', marginLeft: "35%"}}
            type="button" 
            className="btn-close" 
            onClick={onClose}
            aria-label="Close"
         ></button>
         <Form
            title="Создать карту"
            fields={createFields}
            button={createButton}
            onSubmit={handleCreate}  
            formError={internalError}
            formSuccess={internalSuccess}
         >
         </Form>
      </div>
   );
};

export default CreateCardForm;