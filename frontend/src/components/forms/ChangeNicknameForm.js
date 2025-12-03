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
               const result = await GetService.getData(`http://localhost:8000/user/${id}/`,
                     token
                  );
               
               if (result.data) {
                  setData(result.data);
               } else if (result.nickname) {
                  setData(result);
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
         id: 'nickname',
         type: 'text',
         name: 'nickname',
         label: 'Никнейм',
         wrapperClass: 'mb-3',
         required: true
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
         const result = await EditService.editData(`http://localhost:8000/user/${id}/update-nickname/`,
            {
               nickname: formData.nickname,
            }, 'json', token);
         
         if (result && result.ok) {
            setInternalSuccess("Никнейм успешно изменен!");
            setTimeout(() => {
               onClose();
               window.location.reload();
            }, 2000);
         } else if (result && result.success) {
            setInternalSuccess("Никнейм успешно изменен!");
            setTimeout(() => {
               onClose();
               window.location.reload();
            }, 2000);
         } else if (result && result.data && result.data.success) {
            setInternalSuccess("Никнейм успешно изменен!");
            setTimeout(() => {
               onClose();
               window.location.reload();
            }, 2000);
         } else if (result && result.error) {
            setInternalError(result.error);
         } else if (result && result.data && result.data.error) {
            setInternalError(result.data.error);
         } else {
            setInternalError("Произошла неизвестная ошибка");
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