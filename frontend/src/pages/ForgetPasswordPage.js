import Header from "../components/navigation/Header";
import PageLayout from "../components/layout/PageLayout";
import ForgetPasswordForm from "../components/forms/AuthenticationForms/ForgetPasswordForm";

const ForgetPasswordPage = () => {
   return (
      <PageLayout>
         <Header/>
         <ForgetPasswordForm className="mx-auto my-auto"/>
      </PageLayout>
   );
};

export default ForgetPasswordPage;