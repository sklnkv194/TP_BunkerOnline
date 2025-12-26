const CatastropheBunkerInfo = (
  { 
   catastrophe,
   bunker
   }
) => {
   return (
      <div className="cont w-100 flex-row p-4">
         <div className="col-md-6 me-4">
            <h4>Катастрофа</h4>
            <div className="text-break">{catastrophe}</div>
         </div>
         <div className="col-md-6">
            <h4>Бункер</h4>
            <div className="text-break">{bunker}</div>
         </div>
      </div>
   );
}

export default CatastropheBunkerInfo;