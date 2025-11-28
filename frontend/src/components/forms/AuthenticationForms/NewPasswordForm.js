import Form from "../../ui/Form";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { PostService } from "../../../scripts/post-service";

const NewPasswordForm = ({className=""}) => {

   const navigate = useNavigate();

   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");

   const newPasswordFields = [
      {
         type: 'password',
         name: 'new_password',
         label: 'Пароль',
         placeholder: 'Введите пароль',
         required: true,
         wrapperClass: 'mb-3',
      },
      {
         type: 'password',
         name: 'password_conf',
         label: 'Подтверждение пароля',
         placeholder: 'Введите пароль повторно',
         required: true,
         wrapperClass: 'mb-3',
      },
   ];

   const newPasswordButton = {
      children: 'Сохранить',
      disabled: loading,
      size: "md"
   };

   const handleNewPassword = async (formData) => {
      try{
         setLoading(true);
         const result = await PostService.postData('http://localhost:8000/new_password/', {
               new_password: formData.new_password,
               password_conf: formData.password_conf
            }, 'form');
         if (result && result.ok){
            localStorage.removeItem('is_email_forget_password');
            navigate("/");
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
         className={`${className}`}
         title="Восстановление пароля"
         fields={newPasswordFields}
         button={newPasswordButton}
         onSubmit={handleNewPassword}  
         formError={internalError}
         link="Вернуться к авторизации"
         linkTo="/"
         >
      </Form>
      
   );
};

export default NewPasswordForm;