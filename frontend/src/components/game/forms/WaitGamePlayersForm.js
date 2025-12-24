import { useState, useEffect } from "react";
import Button from "../../ui/Button";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../forms/DeleteModal";
import { DeleteService } from "../../../scripts/delete-service";
import { GetService } from "../../../scripts/get-service";
import { useParams, useSearchParams } from "react-router-dom";

const GameWaitingForm = () => {
   const { gameId } = useParams();
   const [searchParams] = useSearchParams();
   const is_owner = searchParams.get('is_owner') === 'true';

   const [roomData, setRoomData] = useState(null);
   const [players, setPlayers] = useState([]);
   const [connected_players_count, setConnectedPlayersCount] = useState(0);
   const [all_players_count, setAllPlayersCount] = useState(0);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [deleteModal, setDeleteModal] = useState({
      show: false,
      playerId: null
   });
   const navigate = useNavigate();

   const fetchRoomData = async () => {
      try {
         const token = localStorage.getItem('token');
         
         const result = await GetService.getData(`http://localhost:8000/rooms/${gameId}/`, token);
         
         if (result) {
            setRoomData(result);
            setPlayers(result.players || []);
            
            setConnectedPlayersCount(result.players_count);
            setAllPlayersCount(result.max_players );
            setError(""); 
         } else {
            setError(result.data?.error || "Ошибка загрузки данных комнаты");
         }
      } catch (error) {
         setError("Ошибка соединения с сервером");
      }
   };

   useEffect(() => {
      if (!gameId) return;
      fetchRoomData();
      
      const pollInterval = setInterval(() => {
         fetchRoomData();
      }, 3000);
      
      return () => {
         clearInterval(pollInterval);
      };
   }, [gameId]);

   const handleLeaveRoom = async () => {
      setLoading(true);
      setError("");
      try {
         const token = localStorage.getItem('token');
         const user_id = localStorage.getItem('id');
         const user = parseInt(user_id);
         
         const result = await DeleteService.deleteData(
            `http://localhost:8000/rooms/${gameId}/players/${user}/`,
            token
         );
         
         if (result) {
            navigate('/');
         } else {
            setError(result.data?.error || "Ошибка при выходе из комнаты");
         }
      } catch (error) {
         setError("Ошибка соединения");
      } finally {
         setLoading(false);
      }
   };

   const handleDeleteRoom = async () => {
      setLoading(true);
      setError("");
      try {
         const token = localStorage.getItem('token');
         const result = await DeleteService.deleteData(`http://localhost:8000/rooms/${gameId}/delete/`, token);
         
         if (result) {
            navigate('/');
         } else {
            setError(result.data?.error || "Ошибка удаления комнаты");
         }
      } catch (error) {
         setError("Ошибка соединения");
      } finally {
         setLoading(false);
      }
   };

   const handleDeletePlayer = (playerId) => {
      setDeleteModal({
         show: true,
         playerId,
         isPlayer: true 
      });
   };

   const handleStartGame = () => {
      navigate('/game');
   };

   const getRoomInfoFields = () => {
      if (!roomData) return [];
      
      return [
         {
            id: 'room_code',
            type: "text",
            name: 'room_code',
            label: 'Код комнаты',
            value: roomData.room_code,
            disabled: true,
            wrapperClass: 'mb-3'
         },
         {
            id: 'deck_name',
            type: "text",
            name: 'deck_name',
            label: 'Выбранная колода',
            value: roomData.deck_name,
            disabled: true,
            wrapperClass: 'mb-3'
         },
         {
            id: 'max_players',
            type: "text",
            name: 'max_players',
            label: 'Максимальное количество игроков',
            value: roomData.max_players?.toString(),
            disabled: true,
            wrapperClass: 'mb-3'
         }
      ];
   };

   return (
      <div className="game-room-form form-group w-100">
         <DeleteModal
            show={deleteModal.show}
            onClose={() => setDeleteModal({ show: false, playerId: null })}
            id={deleteModal.playerId}
            url={deleteModal.isPlayer 
               ? `http://localhost:8000/rooms/${gameId}/players/${deleteModal.playerId}/`  
               : `http://localhost:8000/rooms/${gameId}/delete/`}      
         />
                  
         <div className="room-header mb-4">
            <h2 className="text-center mb-2">Комната #{gameId}</h2>
         </div>
         
         <div className="room-info mb-4">
            <div className="row">
               <div className="col-md-6">
                  <div className="card m-4">
                    
                     <div className="card-body">
                        {getRoomInfoFields().map(field => (
                           <div key={field.id} className={field.wrapperClass}>
                              <label className="form-label">{field.label}</label>
                              <input 
                                 type={field.type}
                                 className="form-control"
                                 value={field.value}
                                 disabled={field.disabled}
                                 readOnly
                              />
                           </div>
                        ))}
                        
                     </div>
                     
                  </div>
                  {is_owner ? (
                     <Button
                        variant="secondary"
                        onClick={handleDeleteRoom}
                        disabled={loading}
                        className="ms-4"
                     >
                        {loading ? "Удаление..." : "Удалить комнату"}
                     </Button>
                  ) : (
                     
                     <Button
                        variant="secondary"
                        onClick={handleLeaveRoom}
                        disabled={loading}
                        className="ms-4"
                     >
                        {loading ? "Выход..." : "Покинуть комнату"}
                     </Button>
                  )}
               </div>
               
               <div className="col-md-6">
                  <div className="players-card card m-4">
                     <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Игроки в комнате</h5>
                           {connected_players_count}/{all_players_count}
                     </div>
                     <div className="card-body">
                        <ul className="list-group">
                           {players.length === 0 ? (
                              <li className="list-group-item text-center text-muted">
                                 Нет игроков
                              </li>
                           ) : (
                              players.map(player => (
                                 <li key={player.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                       {player.username}
                                       {player.is_owner && (
                                          <span className="badge bg-primary ms-2">Создатель</span>
                                       )}
                                    </div>
                                    <div>
                                       {player.is_owner ? (
                                          <span className="text-primary">Вы</span>
                                       ) : is_owner ? (
                                          <button 
                                             className="btn btn-sm btn-outline-danger"
                                             onClick={() => handleDeletePlayer(player.id)}
                                             disabled={loading}
                                             title="Удалить игрока"
                                          >
                                             <i className="bi bi-person-dash"></i>
                                          </button>
                                       ) : null}
                                    </div>
                                 </li>
                              ))
                           )}
                        </ul>
                        
                     </div>
                     
                  </div>
                    {is_owner ? (
                        <Button
                     
                           onClick={handleStartGame}
                           disabled={loading || connected_players_count < 2}
                        >
                           {loading ? (
                              <>
                                 <span className="spinner-border spinner-border-sm me-2"></span>
                                 Запуск игры...
                              </>
                           ) : (
                              <>
                        
                                 Начать игру
                              </>
                           )}
                        </Button>
                     ) : (
                        <div className="waiting-text alert alert-info m-4">
                           <i className="bi bi-clock me-2"></i>
                           Ожидание начала игры...
                        </div>
                     )}
               </div>
            </div>
         </div>
         
      
         
         {error && (
            <div className="alert alert-danger mt-4">
               {error}
            </div>
         )}
      </div>
   );
};

export default GameWaitingForm;