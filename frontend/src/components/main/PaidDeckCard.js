import { useEffect, useState } from "react";
import { GetService } from "../../scripts/get-service";
import Button from "../ui/Button";

const PaidDeckCards = ({}) => {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(false);
   const [internalError, setInternalError] = useState("");

   useEffect(() => {
      setData(null);
      const getInfo = async () => {
         setLoading(true);
         try {
            const result = await GetService.getData(`http://localhost:8000/paid_decks/`
            );
            
            if (result.data) {
               setData(result.data);
            }
         } catch (error) {
            setInternalError("Ошибка при получении данных");
         } finally {
            setLoading(false);
         }
      };

      getInfo();
      
   }, []);
   return (
      <div className="w-25">
         {internalError && (
            <div className="alert alert-danger">
               {internalError}
            </div>
         )}
         <div className="cards">
            <h3 className="title mb-4 text-center">Платные колоды</h3>
            <div className="row gap-2">
               {data?.map((card, index) => (
                  <div key={index} className="card p-2 m-2 col-5">
                     <h4 className="card-title mb-3 text-center">{card.name}</h4>
                     <div className="card-short-description text-center">{card.short_description}</div>
                     <hr class="my-3"></hr>
                     <h6 className="card-description text-center">{card.description}</h6>
                     <hr className="my-3"></hr>
                     <h4 className="card-price text-center" style={{color: '#0A9396'}}>{card.price}₽</h4>
                     <Button 
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        children='Купить'
                     ></Button>
                  </div>
               ))}
            </div>
         
         </div>       
      </div>
      
   );
}
export default PaidDeckCards;