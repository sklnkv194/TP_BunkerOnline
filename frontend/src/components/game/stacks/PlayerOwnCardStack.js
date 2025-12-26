import PlayerCard from "../cards/PlayerCard";

const PlayerOwnCardStack = ({ 
   cards,
   onCardClick,
   phase
}) => {
   
   // Проверяем, есть ли карты у игрока
   const hasCards = cards && cards.length > 0;
   
   return (
      <div className={`flex-row p-1 mt-2`}>         
         {hasCards ? (
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
         ) : (
            <div className="text-center p-4 border rounded bg-light">
               <i className="bi bi-person-x" style={{fontSize: '2rem', color: '#7D7C7C'}}></i>
               <div className="mt-2 text-muted">
                  Вы выбыли из игры
               </div>
               <div className="small text-muted">
                  Нет возможности хода
               </div>
            </div>
         )}
      </div>
   );
}

export default PlayerOwnCardStack;