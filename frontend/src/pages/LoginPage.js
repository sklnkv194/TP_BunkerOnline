import Header from "../components/navigation/Header";
import PageLayout from "../components/layout/PageLayout";
import LoginForm from "../components/forms/AuthenticationForms/LoginForm";

const LoginPage = () => {
   return (
      <PageLayout>
         <Header/>
         <LoginForm className="mx-auto my-auto"/>
      </PageLayout>
   );
};

export default LoginPage;