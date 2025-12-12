import Header from "../components/navigation/Header";
import PageLayout from "../components/layout/PageLayout";
import InfoAboutUserForm from "../components/forms/InfoAboutUserForm";
import CreateRoomForm from "../components/forms/CreateRoomForm";
import DecksForm from "../components/decks/DecksForm";

const PersonalAccountPage = () => {
   const user_id = localStorage.getItem('id');
   return (
      <PageLayout>
         <Header/>
         <div className="w-75 mx-auto d-flex justify-content-between mb-5">
            <InfoAboutUserForm show={true} id={user_id} />
            <CreateRoomForm id={user_id}/>
         </div>
         <div className="w-75 mx-auto d-flex justify-content-between mt-5">
         <DecksForm user_id={user_id}/>
         </div>
      </PageLayout>
   );
};

export default PersonalAccountPage;