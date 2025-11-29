import Form from "../ui/Form";
import { useState, useEffect } from "react";
import { EditService } from "../../scripts/edit-service";

const ChangePasswordForm = ({ show = false, onClose, id }) => {
   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [internalSuccess, setInternalSuccess] = useState("");
   const [data, setData] = useState("");

   const editFields = [
      {
         id: 'current_password',
         type: 'password',
         name: 'current_password',
         label: 'Введите текущий пароль',
         required: true,
         wrapperClass: 'mb-3'
      },
      {
         id: 'new_password',
         type: 'password',
         name: 'new_password',
         label: 'Введите новый пароль',
         required: true,
         wrapperClass: 'mb-3'
      },
      {
         id: 'new_password_conf',
         type: 'password',
         name: 'new_password_conf',
         label: 'Введите новый пароль повторно',
         required: true,
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
      const result = await EditService.editData(`http://localhost:8000/api/users/user/${id}/change-password/`,
         {
            current_password: formData.current_password,
            new_password: formData.new_password,
            new_password_conf: formData.new_password_conf
         }, 'json', token);
      
      
      if (result && result.ok){
         setInternalSuccess("Пароль успешно изменен!");
         setTimeout(() => {
            onClose();
         }, 2000);
      } else if (result && result.error) {
         setInternalError(result.error);
      } else {
         setInternalError("Неизвестная ошибка");
      }
   } catch (error) {
      setInternalError(error.data || "Введен недействительный пароль или пароли не совпадают");
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
               title="Смена пароля"
               fields={editFields}
               button={editButton}
               onSubmit={handleEdit}  
               formError={internalError}
               formSuccess={internalSuccess}
            />
         </div>
   );
};

export default ChangePasswordForm;