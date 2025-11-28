import { useState, useRef } from "react";

const InputWithLabel = ({
   label = '',
   type = "text",
   placeholder = "",
   value = "",
   name,
   required = false,
   disabled = false,
   wrapperClass = "",     
   inputClass = "",
   edit = false, 
   editClick = null,
   del = false,
   delClick = null,
   onChange,
   ...props
}) => {
   const [internalError, setInternalError] = useState("");
   const prevErrorRef = useRef(""); 

   const validateInput = (valueToValidate) => {
      if (required && !valueToValidate?.toString().trim()) {
         return 'Это поле обязательно';
      }

      if (!valueToValidate?.toString().trim()) return "";

      if (type === "password" && valueToValidate.length < 8) {
         return "Пароль должен содержать не менее 8 символов";
      }

      if (name === "nickname" && valueToValidate.length < 3) {
         return "Никнейм должен содержать не менее 3 символов";
      }

      if (type === "number") {
         if (name === "players_count" && (valueToValidate < 3 || valueToValidate > 15)) {
            return "Должно быть от 3 до 15 игроков";
         }
         if (!/^\d+$/.test(valueToValidate)) {
            return "Разрешены только цифры";
         }
      }

      if (type === "email") {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(valueToValidate) || valueToValidate.length > 254) {
            return "Введите корректный адрес почты";
         }
      }

      return "";
   };

   const handleInputChange = (event) => {
      const newValue = event.target.value;
      const newError = validateInput(newValue);
   
      if (newError !== prevErrorRef.current) {
         setInternalError(newError);
         prevErrorRef.current = newError;
      } 
      
      if (onChange) {
         onChange(name, newValue);
      }
   };

    console.log("🔍 InputWithLabel props:", { name, del, delClick, value });
   return (
      <div className={wrapperClass}>
         {label && <label className="form-label">{label}</label>}
         <div className={(edit || del) ? "d-flex flex-row gap-3 me-5" : ""}>
            <input
               onChange={handleInputChange}
               type={type}
               placeholder={placeholder}
               value={value}
               id={name}
               name={name}
               required={required}
               disabled={disabled}
               className={`form-control ${internalError ? 'is-invalid' : ''} ${inputClass}`}
               {...props}
            />
            {edit && <i className="bi bi-pencil-square" onClick={editClick}></i>}
            {(del && !(value === "Стандартная")) && (<i className="bi bi-trash-fill" onClick={delClick}></i>)}
         </div>
         
         {internalError && (
            <div className="invalid-feedback d-block">
               {internalError}
            </div>
         )}
      </div>
   );
};

export default InputWithLabel;