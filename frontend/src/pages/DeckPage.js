import Header from "../components/navigation/Header";
import PageLayout from "../components/layout/PageLayout";
import DeckStack from "../components/decks/DeckStack";
import { useParams, useNavigate } from "react-router-dom";
import { GetService } from "../scripts/get-service";
import { useEffect, useState } from "react";

const DeckPage = () => {
   const { deck_id } = useParams();
   const navigate = useNavigate();
   const [name, setName] = useState(null);
   const [internalError, setInternalError] = useState("");
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const token = localStorage.getItem('token');
      const getInfo = async () => {
         try {
            setLoading(true);
            const result = await GetService.getData(`http://localhost:8000/deck/${deck_id}`, 
               token
            );
            
            if (result.name) {
               setName(result.name);
            } 
         } catch (error) {
            setInternalError("Ошибка при получении данных колоды");
         } finally {
            setLoading(false);
         }
      };

      if (token) {
         getInfo();
      }
   }, [deck_id]);

   const handleBack = () => {
      navigate("/personal_account");
   };

   return (
      <PageLayout>
         <Header/>
         <div className="w-75 mx-auto">
            <div className="d-flex align-items-center mb-4">
               <button 
                  className="me-3"
                  onClick={handleBack}
                  style={{ 
                     backgroundColor: '#0A9396', 
                     borderRadius: "20px",
                     color: 'white'
                  }}
               >
                  <i className="bi bi-arrow-left"></i>
               </button>
               <h2 className="mb-0">
                  {loading ? "Загрузка..." : (name || "Название колоды")}
               </h2>
            </div>

            {internalError && (
               <div className="alert alert-danger d-flex align-items-center" role="alert">
                  {internalError}
               </div> 
            )}

            <DeckStack id={deck_id} name={name}/>
         </div>
      </PageLayout>
   );
};

export default DeckPage;