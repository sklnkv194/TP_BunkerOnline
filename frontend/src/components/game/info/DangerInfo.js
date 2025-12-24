const DangerInfo = (
  { 
   danger
   }
) => {
   if (danger === ""){
      danger = "В этом раунде нет угрозы"
   }
   return (
      <div className="cont w-100 flex-column p-4 mt-4">
         <h4>Угроза</h4>
         <div className="text-break">{danger}</div>
      </div>
   );
}

export default DangerInfo;