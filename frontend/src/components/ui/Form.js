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
   button = null, 
   className = "", 
   onSubmit = null, 
   formError = "", 
   formSuccess="", 
   link = "",
   linkTo = "",
   secondLink = "",
   secondLinkTo = ""
 }) => {
   const [formData, setFormData] = useState({});

   const handleInputChange = (fieldName, value) => {
      setFormData(prev => ({
         ...prev, 
         [fieldName]: value
      }));
   };

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

      if (onSubmit){
         onSubmit(formData);
      }
   };


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
                  required={field.required}
                  value={formData[field.name] || ''}
                  disabled={field.disabled}
                  wrapperClass={field.wrapperClass}     
                  inputClass={field.inputClass}
                  onChange={handleInputChange}
                  edit={field.edit}
                  editClick={field.editClick}
                  del={field.del}
                  delClick={field.delClick}
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
                  required={field.required}
                  value={formData[field.name] || ''}
                  disabled={field.disabled}
                  onChange={handleInputChange}
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
                  required={field.required}
                  disabled={field.disabled}
                  onChange={handleInputChange}
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

         {button && (
            <Button 
               type="submit"
               variant={button?.variant}
               disabled={button?.disabled}
               className={`${button?.className} mt-4 d-block mx-auto w-50`}
               size={button?.size}
            >
               {button.children}
            </Button>
         )}
         
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