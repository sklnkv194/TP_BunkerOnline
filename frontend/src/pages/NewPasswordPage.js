import Header from "../components/navigation/Header";
import PageLayout from "../components/layout/PageLayout";
import NewPasswordForm from "../components/forms/AuthenticationForms/NewPasswordForm";

const NewPasswordPage = () => {
   return (
      <PageLayout>
         <Header/>
         <NewPasswordForm className="mx-auto my-auto"/>
      </PageLayout>
   );
};

export default NewPasswordPage;