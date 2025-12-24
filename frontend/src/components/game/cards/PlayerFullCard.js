const PlayerFullCard = (
  { 
   id,
   category_id,
   name
   }
) => {
   let category = "";

   switch(category_id) {
      case 2:
         category = "Профессия";
         break;
      case 3: 
         category = "Здоровье";
         break;
      case 4:
         category = "Хобби";
         break;
      case 5:
         category = "Характер";
         break;
      case 6:
         category = "Багаж";
         break;
      case 7:
         category = "Доп факт";
         break;
      }
   if (name === ""){
      name = "Не раскрыто";
   }

   return (
      <div key={id} id={`full-card-${id}`} className="flex-column p-1 mt-4" style={{backgroundColor: '#F5F5F5', borderRadius: '20px'}}>
         <div className="text-break text-center fw-bolder">{category}</div>
         <div className="text-break text-center mt-2">{name}</div>       
      </div>
   );
}

export default PlayerFullCard;