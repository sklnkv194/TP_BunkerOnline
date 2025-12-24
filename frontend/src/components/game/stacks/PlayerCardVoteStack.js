import Button from "../../ui/Button";
import PlayerFullCard from "../cards/PlayerFullCard";
import { useState, useEffect } from "react";

const PlayerCardVoteStack = ({ 
   nickname, 
   cards, 
   phase, 
   playerId, 
   canVote, 
   onVote,
   hasUserVoted, 
}) => {
   const [isSelected, setIsSelected] = useState(false);
   const [loading, setLoading] = useState(false);
  
   //сбрасываем выделение, если сейчас не голосование
   useEffect(() => {
      if (phase !== "voting") {
         setIsSelected(false);
      }
   }, [phase]);


   const handleVote = async () => {

      if (!canVote || loading || hasUserVoted) return;
      
      setLoading(true);
      
      try {
         //получаем айди голосующего пользователя
         const voter_id = localStorage.getItem('user_id');
         
         if (onVote) {  
            await onVote({
               voterId: parseInt(voter_id),
               playerId: playerId, // за кого голосуем
            });
         }
         
         setIsSelected(true);
         
      } catch (error) {
         console.error("Ошибка при голосовании:", error);
      } finally {
         setLoading(false);
      }
   };


   return (
      <div className={`flex-column mt-4 ${isSelected ? 'border-primary border-3 rounded p-2' : ''}`} style={{filter: !canVote ? 'brightness(0.7)' : 'none'}}>
         <div className="text-break text-center fw-bolder mb-2" style={{ color: "#94D2BD"}}>
            {nickname}
         </div>
         
         <div className="d-flex flex-column">
            {cards.map((card) => (
               <PlayerFullCard 
                  key={card.id}
                  category_id={card.category_id}
                  name={card.name}
               /> 
            ))}
            {phase === "voting" && canVote && (
               <Button
                  children="Отдать голос"
                  onClick={handleVote}
                  disabled={loading || !canVote || hasUserVoted}
                  className="mt-4"
               />
            )}
               
         </div>
      </div>
   );
}

export default PlayerCardVoteStack;