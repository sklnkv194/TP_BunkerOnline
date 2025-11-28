import Form from "../ui/Form";
import { useState, useEffect } from "react";
import { GetService } from "../../scripts/get-service";
import ChangeNicknameForm from "./ChangeNicknameForm";
import ChangePasswordForm from "./ChangePasswordForm";

const InfoAboutUserForm = ({ show = false, onClose, id }) => {
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
      if (show) {
         setLoading(true);
         setInternalError("");
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
               console.error('Error:', error);
            } finally {
               setLoading(false);
            }
         };

         if (token) {
            getInfo();
         }
      }
   }, [show]);



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


   

   return (
      <div style={{width: "calc(100% * 1 / 3)"}}>
          <Form
            className="w-100"
            title="Информация обо мне"
            fields={infoFields}
            formError={internalError}
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