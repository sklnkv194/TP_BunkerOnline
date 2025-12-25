import PlayerCard from "../cards/PlayerCard";

const PlayerOwnCardStack = ({ 
   cards,
   onCardClick,
   phase
}) => {
   return (
      <div className={`flex-row p-1 mt-2`}>         
         <div className="d-flex flex-row flex-wrap" style={{gap: "1rem"}}>
            {cards.map((card) => (
               <PlayerCard
                  key={card.id}
                  card_id={card.id}
                  nickname={card.nickname}
                  category_id={card.category_id}
                  name={card.name}
                  is_choose={card.is_choose}
                  onClick={() => {
                     if (phase === "game" && !card.is_choose) {
                        onCardClick(card.id); 
                     }
                  }}
                  isClickable={phase === "game" && !card.is_choose}
               /> 
            ))}     
         </div>
      </div>
   );
}

export default PlayerOwnCardStack;