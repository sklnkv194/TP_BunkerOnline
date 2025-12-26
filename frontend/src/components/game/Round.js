const Round = (
  { 
   id,
   is_current,
   current_phase = "",
   number
   }
) => {
   return (
      <div key={id} id={`round-${id}`} className="d-flex flex-row">
          <div style={{ 
            width: 'auto',
            height: '3rem', 
            border: '1px solid #F5F5F5',
            backgroundColor: '#F5F5F5',
            borderRadius: '3rem',
         }}>
            {(number === 1) && (
               <div className="d-flex flex-row">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-4" style={{ border: '1px solid black', width: '3rem', height: '3rem', backgroundColor: '#F5F5F5', marginLeft:'-0.05rem', marginTop: '-0.05rem'}}>
                     {number}
                  </div>
                  <i className={`bi bi-palette2 mx-2`}  style={{fontSize: '2rem', color: (is_current && current_phase === "game") ? 'red' : 'black'}}></i>
                  {(is_current && current_phase === "game") && (
                     <div className="my-auto me-2" style={{color: 'red'}}>Игровой стол</div>
                  )}
                  <i className={`bi bi-arrow-right`}  style={{fontSize: '2rem'}}></i>
                  <i className={`bi bi-mic-fill mx-2`}  style={{fontSize: '2rem', color: (is_current && current_phase === "discussion") ? 'red' : 'black', marginRight: (is_current && current_phase === "discussion") ? '0' : "2rem"}}></i>
                  {(is_current && current_phase === "discussion") && (
                     <div className="my-auto me-4" style={{color: 'red'}}>Обсуждение</div>
                  )}
               </div>
            )}
            {(number === 2 || number === 3) && (
               <div className="d-flex flex-row">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-4" style={{ border: '1px solid black', width: '3rem', height: '3rem', backgroundColor: '#F5F5F5', marginLeft:'-0.05rem', marginTop: '-0.05rem'}}>
                     {number}
                  </div>
                  <i className={`bi bi-palette2 mx-2`}  style={{fontSize: '2rem', color: (is_current && current_phase === "game") ? 'red' : 'black'}}></i>
                  {(is_current && current_phase === "game") && (
                     <div className="my-auto me-2" style={{color: 'red'}}>Игровой стол</div>
                  )}
                  <i className={`bi bi-arrow-right`}  style={{fontSize: '2rem'}}></i>
                  <i className={`bi bi-mic-fill mx-2`}  style={{fontSize: '2rem', color: (is_current && current_phase === "discussion") ? 'red' : 'black'}}></i>
                  {(is_current && current_phase === "discussion") && (
                     <div className="my-auto me-2" style={{color: 'red'}}>Обсуждение</div>
                  )}
                  <i className={`bi bi-arrow-right`}  style={{fontSize: '2rem'}}></i>
                  <i className={`bi bi-hourglass-split ms-2`}  style={{fontSize: '2rem', color: (is_current && current_phase === "voting") ? 'red' : 'black', marginRight: (is_current && current_phase === "voting") ? '0' : "2rem"}}></i>
                  {(is_current && current_phase === "voting") && (
                     <div className="my-auto me-4 ms-2" style={{color: 'red'}}>Голосование</div>
                  )}
               </div>
            )}
            {(number === 4) && (
               <div className="d-flex flex-row">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-4" style={{ border: '1px solid black', width: '3rem', height: '3rem', backgroundColor: '#F5F5F5', marginLeft:'-0.05rem', marginTop: '-0.05rem'}}>
                     {number}
                  </div>
                  <i className={`bi bi-trophy-fill ms-2`}  style={{fontSize: '2rem', color: (is_current && current_phase === "final") ? 'red' : 'black', marginRight: (is_current && current_phase === "final") ? '0' : "2rem"}}></i>
                  {(is_current && current_phase === "final") && (
                     <div className="my-auto me-5 ms-2" style={{color: 'red'}}>Финал</div>
                  )}
               </div>
            )}
         </div>
       
        
      </div>
    
   );
}

export default Round;