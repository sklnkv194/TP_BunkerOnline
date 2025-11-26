import Gamepad from "../svg/Gamepad";
import Society from "../svg/Society";
import Talks from "../svg/Talks";

const MainDescriptionCard = ({}) => {
   return (
      <div style={{ marginTop: '150px'}}>
         <div style={{ border: '3px solid #94D2BD', borderRadius: '30px', borderColor: '#94D2BD'}} className="p-3">
            <h2 className="title mb-4 text-center" style={{ color: '#94D2BD'}}>ЧТО ТАКОЕ БУНКЕР ОНЛАЙН?</h2>
            <div className="title mb-4 text-center" style={{ color: '#FFFFFF'}}>Добро пожаловать в "Бункер Онлайн" — психологическую ролевую игру о выживании после глобальной катастрофы.
Вместе с другими игроками вы окажетесь в закрытом бункере, где вам предстоит принимать сложные решения, договариваться, раскрывать секреты и бороться за ограниченные ресурсы.
Каждый игрок получает уникальную профессию, характеристику здоровья, багаж и личную карту — скрытую информацию, которая может стать ключом к выживанию или причиной конфликта.
Цель игры — коллективно принять решение, кто останется в бункере, а кто будет исключен. Проявите стратегическое мышление, убеждение и интуицию, чтобы доказать свою ценность для общего выживания!</div>
            <div className="row justify-content-around">
               <div className="col-3 card-main p-3 m-3 d-flex flex-column align-items-center" style={{backgroundColor: '#0A9396', borderRadius: '30px'}}>
                  <Gamepad/>
                  <h4 className="card-title mb-3 text-center" style={{color: '#FFFFFF'}}>ДИНАМИЧНЫЙ ГЕЙМПЛЕЙ</h4>
                  <h6 className="card-description text-center" style={{color: '#FFFFFF'}}>Каждая игра уникальна благодаря случайным событиям и разным комбинациям персонажей</h6>
               </div>
               <div className="col-3 card-main p-3 m-3 d-flex flex-column align-items-center" style={{backgroundColor: '#0A9396', borderRadius: '30px'}}>
                  <Society/>
                  <h4 className="card-title mb-3 text-center" style={{color: '#FFFFFF'}}>РАСШИРЯЮЩЕЕСЯ СООБЩЕСТВО</h4>
                  <h6 className="card-description text-center" style={{color: '#FFFFFF'}}>Играйте с друзьями или находите новых собеседников по всему миру</h6>
               </div>
               <div className="col-3 card-main p-3 m-3 d-flex flex-column align-items-center" style={{backgroundColor: '#0A9396', borderRadius: '30px'}}>
                  <Talks/>
                  <h4 className="card-title mb-3 text-center" style={{color: '#FFFFFF'}}>НАПРЯЖЕННЫЕ ПЕРЕГОВОРЫ</h4>
                  <h6 className="card-description text-center" style={{color: '#FFFFFF'}}>Каждое решение имеет цену, а время ограничено - докажите свою ценность для убеждения других</h6>
               </div>
            </div>
         
         </div>       
      </div>
      
   );
}
export default MainDescriptionCard;