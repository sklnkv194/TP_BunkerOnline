const MainStatistic = ({}) => {
   return (
      <div style={{ marginTop: '150px'}}>
         <div style={{ backgroundColor: '#94D2BD', borderRadius: '30px'}} className="p-3">
            <h2 className="title mb-4 text-center" style={{ color: '#000000'}}>СТАТИСТИКА ПРОЕКТА</h2>
            <div className="row justify-content-around">
               <div className="col-2 card-main p-3 d-flex flex-column align-items-center" style={{backgroundColor: '#E9ECEF', borderRadius: '30px'}}>
                  <h3 className="card-title mb-3 text-center" style={{color: '#0A9396'}}>15 МЛН+</h3>
                  <h5 className="card-description text-center" style={{color: '#000000'}}>Активных игроков</h5>
               </div>
               <div className="col-2 card-main p-3 d-flex flex-column align-items-center" style={{backgroundColor: '#E9ECEF', borderRadius: '30px'}}>
                  <h3 className="card-title mb-3 text-center" style={{color: '#0A9396'}}>2+</h3>
                  <h5 className="card-description text-center" style={{color: '#000000'}}>Сыгранных партий</h5>
               </div>
               <div className="col-2 card-main p-3 d-flex flex-column align-items-center" style={{backgroundColor: '#E9ECEF', borderRadius: '30px'}}>
                  <h3 className="card-title mb-3 text-center" style={{color: '#0A9396'}}>5+</h3>
                  <h5 className="card-description text-center" style={{color: '#000000'}}>Уникальных колод</h5>
               </div>
               <div className="col-2 card-main p-3 d-flex flex-column align-items-center" style={{backgroundColor: '#E9ECEF', borderRadius: '30px'}}>
                  <h3 className="card-title mb-3 text-center" style={{color: '#0A9396'}}>24/7</h3>
                  <h5 className="card-description text-center" style={{color: '#000000'}}>Доступность игры</h5>
               </div>
            </div>
         
         </div>       
      </div>
      
   );
}
export default MainStatistic;