import Form from "../ui/Form";
import { useState } from "react";
import { PostService } from "../../scripts/post-service";
import { useNavigate } from "react-router-dom";


const CreateDeckForm = ({ onClose, show, onSubmit, internalSuccessCreate,internalErrorCreate}) => {
   const navigate = useNavigate();

   const createFields = [
      {
         id: 'deck_name',
         type: "text",
         name: 'deck_name',
         label: 'Название колоды',
         required: true,
         wrapperClass: 'mb-3',
         placeholder: "Введите название колоды"
      }
   ];

   const createButton = {
      children: 'Создать'
   };

  

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
            title="Создать колоду"
            fields={createFields}
            button={createButton}
            onSubmit={onSubmit}  
            formError={internalErrorCreate}
            formSuccess={internalSuccessCreate}
            show={show}
            >
         </Form>
      </div>
   );
};

export default CreateDeckForm;