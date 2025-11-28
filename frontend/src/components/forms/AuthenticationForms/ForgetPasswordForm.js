import Form from "../../ui/Form";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { PostService } from "../../../scripts/post-service";

const ForgetPasswordForm = ({className=""}) => {

   const navigate = useNavigate();

   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [internalSuccess, setInternalSuccess] = useState("");

   const forgetPasswordFields = [
      {
         type: 'email',
         name: 'email',
         label: 'Email',
         placeholder: 'Введите адрес электронной почты',
         required: true,
         wrapperClass: 'mb-3',
      }
   ];

   const forgetPasswordButton = {
      children: 'Продолжить',
      disabled: loading,
      size: "md"
   };

   const handleForgetPassword = async (formData) => {
      try{
         setLoading(true);
         const result = await PostService.postData('http://localhost:8000/forget_password/', {
               email: formData.email
            }, 'form');
         if (result && result.ok){
            localStorage.setItem('is_email_forget_password', true);
            setInternalSuccess(result.success);
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
         fields={forgetPasswordFields}
         button={forgetPasswordButton}
         onSubmit={handleForgetPassword}  
         formError={internalError}
         formSuccess={internalSuccess}
         link="Вернуться к авторизации"
         linkTo="/"
         >
      </Form>
      
   );
};

export default ForgetPasswordForm;