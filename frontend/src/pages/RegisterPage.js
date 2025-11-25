import Header from "../components/navigation/Header";
import PageLayout from "../components/layout/PageLayout";
import RegistrationForm from "../components/forms/AuthenticationForms/RegistrationForm";

const RegisterPage = () => {
   return (
      <PageLayout>
         <Header/>
         <RegistrationForm className="mx-auto my-auto"/>
      </PageLayout>
   );
};

export default RegisterPage;