import Header from "../components/navigation/Header";
import PageLayout from "../components/layout/PageLayout";
import GameWaitingForm from "../components/game/forms/WaitGamePlayersForm";

const WaitGamePage = () => {
   const user_id = localStorage.getItem('id');
   return (
      <PageLayout>
         <Header/>
         <div className="w-75 mx-auto">
            <GameWaitingForm/>
         </div>
      </PageLayout>
   );
};

export default WaitGamePage;