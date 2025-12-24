import PageLayout from "../components/layout/PageLayout"
import Header from "../components/navigation/Header";
import GameForm from "../components/game/forms/GameForm";

const GamePage = () => {
   return (
      <PageLayout>
         <Header/>
         <div className="w-75 mx-auto">
            <GameForm phase="voting"/>
         </div>
      </PageLayout>
   );
}; 
export default GamePage;