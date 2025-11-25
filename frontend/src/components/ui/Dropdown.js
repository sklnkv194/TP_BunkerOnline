const Dropdown = ({
  name,
  label,
  options = [],
  value = "",
  required = false,
  error = "",
  wrapperClass = "",      
  inputClass = "", 
  selectClass = "",
  onChange,
  placeholder,
  disabled = false,
  ...props
}) => {
   const handleChange = (event) => {
      if (onChange) {
         onChange(name, event.target.value);
      }
   };


   return (
      <div className={wrapperClass}>
         {label && (
         <label htmlFor={name} className="form-label">
            {label}
         </label>
         )}
         
         <select
         className={`form-select ${error ? 'is-invalid' : ''} ${selectClass}`}
         id={name}
         name={name}
         value={value}
         required={required}
         disabled={disabled}
         onChange={handleChange}
         {...props}
         >
         {placeholder && (
            <option value="" disabled>
               {placeholder}
            </option>
         )}
         
         {options.map((option, index) => (
            <option 
               key={option.value || option.id || index} 
               value={option.value}
               disabled={option.disabled}
            >
               {option.label || option.text || option.value}
            </option>
         ))}
         </select>
         
         {error && (
         <div className="invalid-feedback">
            {error}
         </div>
         )}
      </div>
   );
};

export default Dropdown;