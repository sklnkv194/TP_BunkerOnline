import Button from "../../ui/Button";

const IntroForm = (
  { 
   catastrophe,
   bunker
   }
) => {
   return (
      <div className="cont w-100 flex-column p-4">
         <h4 className="text-center">Катастрофа</h4>
         <div className="text-break text-center">{catastrophe}</div>
      
         <h4 className="text-center">Бункер</h4>
         <div className="text-break text-center">{bunker}</div>

         <Button
            children="Начать игру"

         />
      </div>
   );
}

export default IntroForm;