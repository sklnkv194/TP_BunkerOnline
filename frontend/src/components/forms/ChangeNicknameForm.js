import Form from "../ui/Form";
import { useState, useEffect } from "react";
import { GetService } from "../../scripts/get-service";
import { EditService } from "../../scripts/edit-service";

const ChangeNicknameForm = ({ show = false, onClose, id }) => {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [internalSuccess, setInternalSuccess] = useState("");

   useEffect(() => {
      if (show) {
         setInternalError("");
         setInternalSuccess("");
         setData(null);
         const token = localStorage.getItem('token');
         const getInfo = async () => {
            setLoading(true);
            try {
               const result = await GetService.getData(`http://localhost:8000/user/${id}`, 
                  token
               );
               
               if (result.data) {
                  setData(result.data);
               } 
            } catch (error) {
               setInternalError("Ошибка при получении данных");
            } finally {
               setLoading(false);
            }
         };

         if (token) {
            getInfo();
         }
      }
   }, [show]);



   const editFields = [
      {
         value: data?.nickname || '',
         id: 'name',
         type: 'text',
         name: 'name',
         label: 'Никнейм',
         wrapperClass: 'mb-3'
      }
   ];

   const editButton = {
      children: 'Изменить',
      disabled: loading
   };

   const handleEdit = async (formData) => {
      const token = localStorage.getItem('token');
      setInternalError("");
      setInternalSuccess("");
      try{
         setLoading(true);
         const result = await EditService.editData(`http://localhost:8000/user/edit/nickname`,
            {
            id: id,
            nickname: formData.nickname,
         }, 'form', token);
         
         if (result.success){
            setInternalSuccess("Информация успешно обновлена!");
            setTimeout(() => {
               onClose();
               window.location.reload();
            }, 2000);
         }
      } catch (error) {
         setInternalError(error.data || "Произошла ошибка при редактировании");
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
               key={JSON.stringify(data)}
               title="Смена никнейма"
               fields={editFields}
               button={editButton}
               onSubmit={handleEdit}  
               formError={internalError}
               formSuccess={internalSuccess}
            />
      </div>
  
   );
};

export default ChangeNicknameForm;