import Logo from "./Logo";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

const Header = ({}) => {
   const isAuthenticated = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('id');
      return !!(token && user);
   };

   const navigate = useNavigate();
   const goHome = () => {
      navigate("/personal_account");
   }

   const goLogin = () => {
      navigate("/");
   }
   return (
      <nav className='py-2 position-sticky mb-5'>
         <div className="container-fluid">
            <div className="row align-items-center">
               <div className="col-3"></div>
               
               <div className="col-6 text-center">
                  <a href="/main">
                     <Logo width="30%" height="100%" />
                  </a>
               </div>
               
               <div className="col-3 text-center">
                  {
                     isAuthenticated() ? 
                     <Button variant="primary" size="lg" onClick={goHome}>
                        <i className="bi bi-person-circle"></i> 
                        <span className="d-none d-md-inline"> Личный кабинет</span>
                     </Button> :
                      <Button variant="primary" size="lg" onClick={goLogin}>
                        <i className="bi bi-door-closed-fill"></i> 
                        <span className="d-none d-md-inline"> Войти</span>
                     </Button>
                  }
                  
               </div>
            </div>
         </div>
      </nav>
   );
};
export default Header;