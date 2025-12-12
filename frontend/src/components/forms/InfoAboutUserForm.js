import Form from "../ui/Form";
import { useState, useEffect } from "react";
import { GetService } from "../../scripts/get-service";
import ChangeNicknameForm from "./ChangeNicknameForm";
import ChangePasswordForm from "./ChangePasswordForm";
import { useNavigate } from "react-router-dom";

const InfoAboutUserForm = ({ show = false, onClose, id }) => {
   const navigate = useNavigate();

   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [showEditNicknameModal, setShowEditNicknameModal] = useState(false);
   const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);

   const editNickname = () => {
      try{
         setLoading(true);
         setShowEditPasswordModal(false);
         setShowEditNicknameModal(true);
         setLoading(false);
      } finally {
         setLoading(false);
      }
   };
   

   const closeEditNicknameModal = () => {
      setShowEditNicknameModal(false); 
   };

   const editPassword = () => {
      try{
         setLoading(true);
         setShowEditPasswordModal(true);
         setShowEditNicknameModal(false);
         setLoading(false);
      } finally {
         setLoading(false);
      }
   };

   const closeEditPasswordModal = () => {
      setShowEditPasswordModal(false); 
   };


   useEffect(() => {
   if (show && id) {
      setLoading(true);
      setInternalError("");
      setData(null);
      const token = localStorage.getItem('token');
      const getInfo = async () => {
         try {
            const url = `http://localhost:8000/user/${id}/`;
            const result = await GetService.getData(url, token);
            
            if (result && result.nickname) {
               setData(result);
            }
         } catch (error) {
            setInternalError("Ошибка при получении данных: " + error.message);
         } finally {
            setLoading(false);
         }
      };

      if (token) {
         getInfo();
      } else {
         setInternalError("Нет авторизации");
         setLoading(false);
      }
   }
}, [show, id]);



   const infoFields = [
      {
         value: data?.nickname || '',
         id: 'name',
         type: 'text',
         name: 'name',
         disabled: true,
         label: 'Никнейм',
         wrapperClass: 'mb-3',
         edit: true,
         editClick: editNickname
      },
       {
         id: 'password',
         type: 'password',
         name: 'password',
         label: 'Пароль',
         placeholder: "********",
         disabled: true,
         wrapperClass: 'mb-3',
         edit: true,
         editClick: editPassword
      },
   ];

   const logoutButton = {
      children: 'Выйти из аккаунта',
      size: "md"
   };
   
   const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      window.location.reload();
      navigate("/");
      
   }
   

   return (
      <div style={{width: "calc(100% * 1 / 3)"}}>
          <Form
            className="w-100"
            title="Информация обо мне"
            fields={infoFields}
            formError={internalError}
            button={logoutButton}
            onSubmit={handleLogout} 
            >
         </Form>
         <ChangeNicknameForm
            id={id}
            show={showEditNicknameModal}
            onClose={closeEditNicknameModal}
            edit="true"
            editClick={editNickname}
         />
         <ChangePasswordForm
            id={id}
            show={showEditPasswordModal}
            onClose={closeEditPasswordModal}
            edit="true"
            editClick={editPassword}
         />
      </div>
     
   );
};

export default InfoAboutUserForm;