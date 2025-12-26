import { useState } from "react";
import PlayerCardVoteStack from "./PlayerCardVoteStack";

const PlayersVoteStack = ({ 
   players, 
   phase, 
   onVote 
}) => {
   const [selectedPlayerId, setSelectedPlayerId] = useState(null);
   const currentUserId = parseInt(localStorage.getItem('user_id'));

   const handlePlayerVote = async (playerId) => {
      if (selectedPlayerId !== null) {
         // Уже проголосовали
         return;
      }

      // Обновляем UI сразу для лучшего UX
      setSelectedPlayerId(playerId);
      
      // Вызываем родительскую функцию для отправки на сервер
      if (onVote) {
         onVote(playerId);  // ← Это должен вызвать handleVote в GamePage
      }
   };

   const hasUserVoted = selectedPlayerId !== null;

   return (
      <div className="d-flex flex-row flex-wrap w-100" style={{gap: "1rem"}}> 
         {players.map(player => {
            // Проверяем может ли текущий пользователь голосовать за этого игрока
            // 1. Нельзя голосовать за себя
            // 2. Должен быть canVote = true от сервера
            // 3. Игрок не должен быть исключен
            const canVote = player.canVote && 
                           player.playerId !== currentUserId && 
                           !player.is_excluded &&
                           !hasUserVoted; // Нельзя голосовать если уже проголосовал
            
            return (
               <div key={player.playerId} className="mb-2" style={{width: 'calc(25% - 0.75rem)'}}>
                  <PlayerCardVoteStack
                     nickname={player.nickname}
                     cards={player.cards || []}
                     phase={phase}
                     playerId={player.playerId}
                     canVote={canVote}
                     isVotedFor={selectedPlayerId === player.playerId}
                     hasUserVoted={hasUserVoted}
                     onVote={() => handlePlayerVote(player.playerId)}
                  />
               </div>
            );
         })}
      </div>
   );
};

export default PlayersVoteStack;