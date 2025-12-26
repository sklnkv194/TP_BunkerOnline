import CatastropheBunkerInfo from "../info/CatastropheBunkerInfo";
import DangerInfo from "../info/DangerInfo";
import OpenCardStack from "../stacks/OpenCardStack";
import PlayerOwnCardStack from "../stacks/PlayerOwnCardStack";
import PlayersVoteStack from "../stacks/PlayersVoteStack";
import DiscussionVotingForm from "./DiscussionVotingForm";
import RoundStack from "../stacks/RoundStack";

const GameForm = ({
  code,
  catastrophe,
  bunker,
  danger,
  phase,
  rounds,
  openCards,
  playerCards,
  playersData,
  onMakeMove,
  onVote,
  onDiscussionEnd,
  onVotingEnd,
  votingResult
}) => {

  return(
    <div>
      <CatastropheBunkerInfo catastrophe={catastrophe} bunker={bunker}/>
      <DangerInfo danger={danger}/>
      <div className="fw-bolder mt-4 mb-4" style={{ color: "#94D2BD"}}>
        Комната #{code}
      </div>
      <RoundStack rounds={rounds}/>
      
      {(phase === "game") && (

        <div>
          <OpenCardStack cards={openCards}/>
          <div className="fw-bolder mt-4" style={{ color: "#94D2BD"}}>
            Мои карты
          </div>
          <PlayerOwnCardStack cards={playerCards} onCardClick={onMakeMove} phase={phase}/>
        </div>
      )}
      {(phase === "voting" || phase === "discussion") && (
        <DiscussionVotingForm 
          phase={phase}
          onDiscussionEnd={onDiscussionEnd}
          onVotingEnd={onVotingEnd}
          votingResult={votingResult}
        />
      )}
     
      <PlayersVoteStack players={playersData} phase={phase} onVote={onVote}/>
      
    </div>
  ); 
};
export default GameForm;