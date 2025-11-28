import Form from "../ui/Form";


const CreateCardForm = ({ handleCreate, loading, onClose, internalError, internalSuccess  }) => {

   const createFields = [
      {
         id: 'card_name',
         type: "text",
         name: 'card_name',
         label: 'Название карты',
         required: true,
         wrapperClass: 'mb-3',
         placeholder: "Введите название карты"
      }
   ];

   const createButton = {
      children: 'Создать',
      disabled: loading
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
            title="Создать карту"
            fields={createFields}
            button={createButton}
            onSubmit={handleCreate}  
            formError={internalError}
            formSuccess={internalSuccess}
            >
         </Form>
      </div>
   );
};

export default CreateCardForm;