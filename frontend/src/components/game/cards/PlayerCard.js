const PlayerCard = (
  { 
   id,
   category_id,
   name,
   is_choose,
   onClick,      
   isClickable 
   }
) => {
   let color = "";
   let category = "";
   let bi= "";

   switch(category_id) {
      case 2:
         color = "#0A7696";
         category = "Профессия";
         bi = "briefcase-fill";
         break;
      case 3: 
         color = "#9BFF70";
         category = "Здоровье";
         bi = "clipboard-plus-fill";
         break;
      case 4:
         color = "#FFCF48";
         category = "Хобби";
         bi = "palette-fill";
         break;
      case 5:
         color = "#445ed1ff";
         category = "Характер";
         bi = "star-fill"; 
         break;
      case 6:
         color = "#8A38F5";
         category = "Багаж";
         bi = "tools";  
         break;
      case 7:
         color = "#FF6E45";
         category = "Доп факт";
         bi = "info-circle-fill";  
         break;
      }
   return (
      <div key={id} id={`own-card-${id}`} onClick={onClick} className="cont flex-row p-4 mt-4" style={{ boxShadow: `0 0 5px 5px ${color}`, filter: is_choose ? 'brightness(0.7)' : 'none', width: 'calc(25% - 0.75rem)', cursor: isClickable ? 'pointer' : 'default'}}>
         <div className="col-md-8 d-flex flex-column justify-content-center">
            <div className="text-break fs-5 mt-2 fw-bolder">{category}</div>
            <div className="text-break mt-2">{name}</div>
         
         </div>
         <div className="col-md-4 d-flex justify-content-center align-items-center">
            <i className={`bi bi-${bi}`} style={{ color: `${color}`, fontSize: '4rem'}}></i>
         </div>         
      </div>
   );
}

export default PlayerCard;