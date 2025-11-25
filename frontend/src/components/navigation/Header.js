import Logo from "./Logo";
import Button from "../ui/Button";

const Header = ({}) => {
   return (
      <nav className='py-2 position-sticky mb-5'>
         <div className="container-fluid">
            <div className="row align-items-center">
               <div className="col-3"></div>
               
               <div className="col-6 text-center">
                  <a href="/home">
                     <Logo width="30%" height="100%" />
                  </a>
               </div>
               
               <div className="col-3 text-center">
                  <Button variant="primary" size="lg">
                     <i className="bi bi-person-circle"></i> 
                     <span className="d-none d-md-inline"> Личный кабинет</span>
                  </Button>
               </div>
            </div>
         </div>
      </nav>
   );
};
export default Header;