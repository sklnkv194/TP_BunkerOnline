import { useState } from "react";
import PlayerCardVoteStack from "./PlayerCardVoteStack";
import { PostService } from "../../../scripts/post-service";

const PlayersVoteStack = ({ players, phase }) => {
const [userVote, setUserVote] = useState(null);

const handleVote = async (voteData) => {
   const { voterId, targetPlayerId } = voteData;
   const token = localStorage.getItem('token');

   try {
      const response = await PostService.postData('http://localhost:8000/vote/', {
            voter_id: voterId,
            player_id: targetPlayerId
         }, 'form', token);
      
      if (response.ok) {
         setUserVote(targetPlayerId);
      }
   } catch (error) {
      console.error("Ошибка отправки голоса:", error);
   }
};
const hasUserVoted = userVote !== null;

const currentUserId = parseInt(localStorage.getItem('user_id'));

return (
   <div className="d-flex flex-row flex-wrap w-100" style={{gap: "1rem"}}> 
      {players.map(player => {
         //проверяем может ли текущий пользователь голосовать за этого игрока
         const canVoteForThisPlayer = player.canVote && player.id !== currentUserId;
         
         return (
            <div key={player.id} className="mb-2" style={{width: 'calc(25% - 0.75rem)'}}>
               <PlayerCardVoteStack
                  nickname={player.nickname}
                  cards={player.cards || []}
                  phase={phase}
                  playerId={player.id}
                  canVote={canVoteForThisPlayer}
                  isVotedFor={userVote === player.id}
                  hasUserVoted={hasUserVoted}
                  onVote={hasUserVoted ? null : handleVote}
               />
            </div>
         );
      })}
   
   </div>
);
};

export default PlayersVoteStack;