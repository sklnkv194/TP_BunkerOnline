import OpenCard from "../cards/OpenCard";

const OpenCardStack = ({ 
   cards
}) => {
   return (
      <div className="d-flex flex-row p-1 mt-2 flex-wrap" style={{gap: '1rem'}}>        
            {cards.map((card) => (
               <OpenCard
                  id={card.id}
                  nickname={card.nickname}
                  category_id={card.category_id}
                  name={card.name}
                  is_choose={card.is_choose}
                  is_leave={card.is_leave}
                  is_wait={card.is_wait}
               /> 
            ))}     
      </div>
   );
}

export default OpenCardStack;