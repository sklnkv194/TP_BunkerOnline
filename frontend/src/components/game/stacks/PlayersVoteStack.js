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
         return;
      }

      setSelectedPlayerId(playerId);
      
      if (onVote) {
         onVote(playerId);  
      }
   };

   const hasUserVoted = selectedPlayerId !== null;

   return (
      <div className="d-flex flex-row flex-wrap w-100" style={{gap: "1rem"}}> 
         {players.map(player => {
            const canVote = player.canVote && 
                           player.playerId !== currentUserId && 
                           !player.is_excluded &&
                           !hasUserVoted; //нельзя голосовать если уже проголосовал
            
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