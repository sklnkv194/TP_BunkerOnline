import Form from "../../ui/Form";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { PostService } from "../../../scripts/post-service";

const LoginForm = ({className=""}) => {

   const navigate = useNavigate();
   localStorage.removeItem('is_email_forget_password');

   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");

   const loginFields = [
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
      }
   ];

   const loginButton = {
      children: 'Войти',
      disabled: loading,
      size: "md"
   };

   const handleLogin = async (formData) => {
      try{
         setLoading(true);
         const result = await PostService.postData('http://localhost:8000/login/', {
               email: formData.email,
               password: formData.password
            }, 'form');
         if (result && result.ok){
            navigate("/home");
         } else if (result.error) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('id', result.user.id);
            setInternalError(result.error);
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
         title="Вход"
         fields={loginFields}
         button={loginButton}
         onSubmit={handleLogin}  
         formError={internalError}
         link="Зарегистрироваться"
         linkTo="/register"
         secondLink="Забыли пароль?"
         secondLinkTo="/forget_password"
         >
      </Form>
      
   );
};

export default LoginForm;