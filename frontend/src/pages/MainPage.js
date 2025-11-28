import Header from "../components/navigation/Header";
import PageLayout from "../components/layout/PageLayout";
import PaidDeckCards from "../components/main/PaidDeckCard";
import ConnectToRoomForm from "../components/forms/ConnectToRoomForm";
import MainDescriptionCard from "../components/main/MainDescriptionCard";
import MainStatistic from "../components/main/MainStatistic";

const MainPage = () => {
   const user = localStorage.getItem('id');
   return (
      <PageLayout>
         <Header/>
         <div className="w-75 mx-auto d-flex justify-content-between">
            <ConnectToRoomForm id={user}/>
            <PaidDeckCards/>
         </div>
         <div className="w-75 mx-auto pb-5">
            <MainDescriptionCard/>
            <MainStatistic/>
         </div>
      </PageLayout>
   );
};

export default MainPage;