import Header from "../components/navigation/Header";
import PageLayout from "../components/layout/PageLayout";
import InfoAboutUserForm from "../components/forms/InfoAboutUserForm";
import CreateRoomForm from "../components/forms/CreateRoomForm";
import DecksForm from "../components/forms/DecksForm";

const PersonalAccountPage = () => {
   const user = localStorage.getItem('id');
   return (
      <PageLayout>
         <Header/>
         <div className="w-75 mx-auto d-flex justify-content-between mb-5">
            <InfoAboutUserForm id={user}/>
            <CreateRoomForm id={user}/>
         </div>
         <div className="w-75 mx-auto d-flex justify-content-between mt-5">
         <DecksForm/>
         </div>
      </PageLayout>
   );
};

export default PersonalAccountPage;