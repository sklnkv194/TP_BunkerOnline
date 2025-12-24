import Round from "../Round";

const RoundStack = ({ 
   rounds
}) => {
   return (
      <div className="d-flex flex-row flex-wrap justify-content-between">
         {rounds.map((round) => (
            <Round
               id={round.id}
               is_current={round.is_current}
               current_phase={round.current_phase}
               number={round.number}
            /> 
         ))}     
      </div>
   );
}

export default RoundStack;