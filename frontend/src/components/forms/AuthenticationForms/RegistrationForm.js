import Form from "../../ui/Form";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { PostService } from "../../../scripts/post-service";

const RegistrationForm = ({className=""}) => {

   const navigate = useNavigate();
   localStorage.removeItem('is_email_forget_password');
   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");

   const registrationFields = [
      {
         type: 'text',
         name: 'nickname',
         label: 'Никнейм',
         placeholder: 'Введите никнейм',
         required: true,
         wrapperClass: 'mb-3',
      },
      {
         type: 'email',
         name: 'email',
         label: 'Email',
         placeholder: 'Введите адрес электронной почты',
         required: true,
         wrapperClass: 'mb-3',
      },
      {
         type: 'password',
         name: 'password',
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

   const registrationButton = {
      children: 'Создать аккаунт',
      disabled: loading,
      size: "md"
   };

   const handleRegistration = async (formData) => {
      try{
         setLoading(true);
         const result = await PostService.postData('http://localhost:8000/registration/', {
               nickname: formData.nickname,
               email: formData.email,
               password: formData.password,
               password_conf: formData.password_conf
            }, 'form');
         if (result && result.ok){
            navigate("/");
         } else {
            setInternalError(result.data.error);
         }
      } catch (error) {
         setInternalError(error.data);
      } finally {
         setLoading(false);
      }
   };


   return (
      <Form
         className={`${className}`}
         title="Регистрация"
         fields={registrationFields}
         button={registrationButton}
         onSubmit={handleRegistration}  
         formError={internalError}
         link="Вернуться к авторизации"
         linkTo="/"
         >
      </Form>
      
   );
};

export default RegistrationForm;