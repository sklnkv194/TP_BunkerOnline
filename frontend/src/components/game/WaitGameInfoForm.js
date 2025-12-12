import Form from "../ui/Form";
import { useState, useEffect } from "react";
import { GetService } from "../../scripts/get-service";
import { DeleteService } from "../../scripts/delete-service";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../forms/DeleteModal";

const WaitGameInfoForm = ({ show = false, onClose, id }) => {
   const navigate = useNavigate();

   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");
   const [showDeleteModal, setShowDeleteModal] = useState(false);

 

   useEffect(() => {
      if (id) {
         setLoading(true);
         setInternalError("");
         setData(null);
         const token = localStorage.getItem('token');
         const getInfo = async () => {
            try {
               const url = `http://localhost:8000/game/${id}/`;
               const result = await GetService.getData(url, token);
               
               if (result && result.count && result.deck && result.code) {
                  setData(result);
               } else if (result && result.error) {
                  setInternalError(result.error);
               } else {
                  setInternalError("Неизвестная ошибка");
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

   const closeDeleteModal = () => {
      setShowDeleteModal(false); 
   };

   const openDeleteModal = () => {
      setShowDeleteModal(true); 
   };
   

   const infoFields = [
      {
         value: data?.count || '',
         id: 'count',
         type: 'text',
         name: 'count',
         disabled: true,
         label: 'Количество игроков',
         wrapperClass: 'mb-3'
      },
       {
         value: data?.deck || '',
         id: 'deck',
         type: 'text',
         name: 'deck',
         label: 'Колода',
         disabled: true,
         wrapperClass: 'mb-3'
      },
   ];

   const deleteButton = {
      children: 'Удалить комнату',
      size: "md",
      disabled: loading
   };
   

   return (
      <div style={{width: "calc(100% * 1 / 3)"}}>
         <Form
            className="w-100"
            fields={infoFields}
            formError={internalError}
            button={deleteButton}
            onSubmit={openDeleteModal} 
            >
         </Form>
         <DeleteModal
            url="http://localhost:8000/deck"
            id={selectedDeckId}
            show={showDeleteModal}
            onClose={closeDeleteModal}
         />
      </div>
     
   );
};

export default WaitGameInfoForm;