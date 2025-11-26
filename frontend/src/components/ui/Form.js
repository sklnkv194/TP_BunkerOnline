import { useState } from "react";
import InputWithLabel from "./InputWithLabel";
import Dropdown from "./Dropdown";
import Checkbox from "./Checkbox";
import Button from "./Button";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Form = ({ 
   title, 
   fields, 
   button, 
   className = "", 
   onSubmit, 
   formError = "", 
   formSuccess="", 
   link = "",
   linkTo = "",
   secondLink = "",
   secondLinkTo = ""
 }) => {
   const [formData, setFormData] = useState({});
   const [errors, setErrors] = useState({});

   useEffect(() => {
      const initialData = {};
      fields?.forEach(field => {
         if (field.value !== undefined) {
            initialData[field.name] = field.value;
         }
      });
      setFormData(initialData);
   }, [fields]);

   const handleSubmit = (event) => {
      event.preventDefault();

      const newErrors = validateForm(formData, fields || []);
      if (Object.keys(newErrors).length > 0) {
         setErrors(newErrors);
         return;
      }

      if (onSubmit){
         onSubmit(formData);
      }
   };

   const handleInputChange = (fieldName, value) => {
      setFormData(prev => ({
         ...prev, 
         [fieldName]: value
      }));

      if (errors[fieldName]) {
         setErrors(prev => ({
            ...prev,
            [fieldName]: ""
         }));
      }
   };

   const validateField = (field, value) => {
      if (field.required) {
         if (field.type === 'checkbox'){
            if (!value) {
               return field.invalid || 'Это поле обязательно';
            }
         } else {
            if (!value?.toString().trim()) {
               return field.invalid || 'Это поле обязательно';
            }
         }
      }

      if (field.type === "password"){
         if (value && value.length < 8){
            let passwordError = "Пароль должен содержать не менее 8 символов"
            let newError = field.error ? field.error : passwordError
            return newError
         }
      }

      if (field.name === "nickname" && value.length < 3){
         let nicknameError = "Никнейм должен содержать не менее 3 символов"
         let newError = field.error ? field.error : nicknameError
            return newError
      }

      if (field.type === "number"){
         if (value && value.length > 5){
            let digitsError = "Слишком большое значение"
            let newError = field.error ? field.error : digitsError
            return newError
         }
         
         if (value && !/^\d+$/.test(value)) {
            let digitsError = "Разрешены только цифры"
            let newError = field.error ? field.error : digitsError
            return newError
         }
      }

      if (value && field.type === "email"){
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(value) || value.length > 254) {
            let emailError = "Введите корректный адрес почты"
            let newError = field.error ? field.error : emailError
            return newError
         }
      }

      return "";
   };

   const validateForm = (data, fields) => {
      const errors = {};

      fields.forEach(field => {
         const error = validateField(field, data[field.name]);
         if (error) {
            errors[field.name] = error;
         }
      });

      return errors;
   }

   const renderField = (field, index) => {
      const fieldKey = field.id || field.name || `field-${index}`;

      switch (field.type) {
         case 'text':
         case 'email':
         case 'password':
         case 'date':
         case 'number':
            return (
               <InputWithLabel
                  key={fieldKey}
                  type={field.type}
                  placeholder={field.placeholder}
                  label={field.label}
                  name={field.name}
                  onChange={handleInputChange}
                  required={field.required}
                  value={formData[field.name] || ''}
                  error={errors[field.name]}
                  disabled={field.disabled}
                  wrapperClass={field.wrapperClass}     
                  inputClass={field.inputClass}
               />
            );
         
         case 'dropdown':
            return (
               <Dropdown
                  key={fieldKey} 
                  options={field.options}
                  placeholder={field.placeholder}
                  label={field.label}
                  name={field.name}
                  onChange={handleInputChange}
                  required={field.required}
                  value={formData[field.name] || ''}
                  error={errors[field.name]}
                  disabled={field.disabled}
                  wrapperClass={field.wrapperClass}     
                  inputClass={field.inputClass}
               />
            );
         
         case 'checkbox':
            return (
               <Checkbox
                  key={fieldKey} 
                  checked={formData[field.name] || field.value || ''}
                  label={field.label}
                  name={field.name}
                  onChange={handleInputChange}
                  required={field.required}
                  error={errors[field.name]}
                  disabled={field.disabled}
                  wrapperClass={field.wrapperClass}     
                  inputClass={field.inputClass}
               />
            );
         
         default:
            return null;
      }
   };

   return (
      <form className={`form-group ${className}`} onSubmit={handleSubmit}>
         {title && (
            <h3 className="form-title mb-4 text-center">
               {title}
            </h3>
         )}

         {formError && (
            <div className="alert alert-danger">
               {formError}
            </div>
         )}

         {formSuccess && (
            <div className="alert alert-success">
               {formSuccess}
            </div>
         )}

         {fields?.map((field, index) => renderField(field, index))}

         <Button 
            type="submit"
            variant={button?.variant}
            disabled={button?.disabled}
            className={`${button?.className} mt-4 d-block mx-auto w-50`}
            size={button?.size}
         >
            {button?.children}
         </Button>
         {link && (
            <div className="text-center mt-3">
               <Link to={linkTo} className="text-decoration-none">
                  {link}
               </Link>
            </div>
         )}
         {secondLink && (
            <div className="text-center mt-3">
               <Link to={secondLinkTo} className="text-decoration-none">
                  {secondLink}
               </Link>
            </div>
         )}
      </form>
   );
};

export default Form;