const OpenCard = (
  { 
   id,
   nickname,
   category_id,
   name,
   is_leave,
   is_wait,
   is_choose
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
   if (is_choose){
      color = "#000000";
      category = "Ход игрока";
      name="Думает..."
      bi = "stopwatch-fill";  
   }
   if (is_leave){
      color = "#7D7C7C";
      category = "Не активен";
      name="Выбыл из бункера";
      bi="x-square-fill";
   }
   if (is_wait){
      color = "#000000";
      category = "Карта не раскрыта";
      name="Ожидает ход";
      bi="question-square-fill";
   }

   return (
      <div key={id} id={`open-card-${id}`} className="cont flex-row p-3 mt-4" style={{ boxShadow: `0 0 5px 5px ${color}`, width: 'calc(25% - 0.75rem)'}}>
         <div className="col-md-7">
            <h5 className="fw-bold">{nickname}</h5>
            <div className="text-break mt-4 fs-5 fw-bolder">{category}</div>
            <div className="text-break mt-2">{name}</div>
         
         </div>
         <div className="col-md-5 d-flex align-items-center justify-content-center">
            <i 
            className={`bi bi-${bi} my-auto`} 
            style={{ color: `${color}`, fontSize: '5rem' }}
            ></i>
         </div>       
      </div>
   );
}

export default OpenCard;