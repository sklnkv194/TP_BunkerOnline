const Checkbox = ({
  name,
  label,
  checked = false,
  required = false,
  error = "",
  wrapperClass = "",      
  inputClass = "", 
  onChange,
  disabled = false,
  ...props
}) => {
   const handleChange = (event) => {
      if (onChange) {
         onChange(name, event.target.checked);
      }
   };

   return (
      <div className={wrapperClass}>
         <div className="form-check">
            <input
               type="checkbox"
               checked={checked}
               id={name}
               name={name}
               required={required}
               onChange={handleChange}
               disabled={disabled}
               className={`form-check-input ${error ? 'is-invalid' : ''} ${inputClass}`}
               {...props}
            />
            {label && (
               <label htmlFor={name} className="form-check-label">
                  {label}
                  {required && <span className="text-danger"> *</span>}
               </label>
            )}
         </div>
         {error && (
            <div className="invalid-feedback">
               {error}
            </div>
         )}      
      </div>
   );
};

export default Checkbox;