import { useState, useEffect } from "react";
import Button from "../../ui/Button";
import { useNavigate } from "react-router-dom";
import { DeleteService } from "../../../scripts/delete-service";
import { GetService } from "../../../scripts/get-service";
import { PostService } from "../../../scripts/post-service";
import { useParams, useSearchParams } from "react-router-dom";

const useUserId = () => {
   const [userId, setUserId] = useState(null);
   const [isGuest, setIsGuest] = useState(false);
   
   useEffect(() => {
      const authUserId = localStorage.getItem('id');
      const currentUserId = localStorage.getItem('current_user_id');
      const guestFlag = localStorage.getItem('is_guest');
      
      if (authUserId) {
         setUserId(parseInt(authUserId));
         setIsGuest(false);
      } else if (currentUserId) {
         setUserId(parseInt(currentUserId));
         setIsGuest(guestFlag === 'true');
      }
   }, []);
   
   return { userId, isGuest };
};

const GameWaitingForm = () => {
   const { gameId } = useParams();
   const [searchParams] = useSearchParams();
   const is_owner = searchParams.get('is_owner') === 'true';
   
   const { userId, isGuest } = useUserId();

   const [roomData, setRoomData] = useState(null);
   const [players, setPlayers] = useState([]);
   const [connected_players_count, setConnectedPlayersCount] = useState(0);
   const [all_players_count, setAllPlayersCount] = useState(0);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const navigate = useNavigate();

   const fetchRoomData = async () => {
      try {
         const token = isGuest ? null : localStorage.getItem('token');
         
         const params = userId ? `?user_id=${userId}` : '';
         
         const result = await GetService.getData(
            `http://localhost:8000/rooms/${gameId}/${params}`, 
            token
         );
         
         if (result) {
            setRoomData(result);
            setPlayers(result.players || []);
            
            setConnectedPlayersCount(result.players_count);
            setAllPlayersCount(result.max_players);

            //проверяем, находится ли текущий пользователь в комнате
            if (userId && result.players) {
               const isPlayerInRoom = result.players.some(player => player.id === userId);
               
               if (!isPlayerInRoom) {
                  //если пользователя нет в комнате - возвращаем на главную
                  navigate('/');
                  return;
               }
            }

            if (result.status === 'active') {
               //игра началась - редирект на страницу игры
               navigate(`/game/${gameId}`);
               return;
            }

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
      
      if (!userId) {
         const timer = setTimeout(() => {
            fetchRoomData();
         }, 500);
         return () => clearTimeout(timer);
      }
      
      fetchRoomData();
      
      const pollInterval = setInterval(() => {
         fetchRoomData();
      }, 3000);
      
      return () => {
         clearInterval(pollInterval);
      };
   }, [gameId, userId]);

   const handleLeaveRoom = async () => {
      if (!window.confirm("Вы уверены, что хотите покинуть комнату?")) {
         return;
      }
      
      setLoading(true);
      setError("");
      try {
         const url = `http://localhost:8000/rooms/${gameId}/players/${userId}/`;
         
         const result = await DeleteService.deleteData(
            url,
            null 
         );
         
         if (result) {
            if (isGuest) {
               localStorage.removeItem('current_user_id');
               localStorage.removeItem('is_guest');
               localStorage.removeItem('guest_display_name');
            }
            navigate('/');
         } else {
            setError(result.data?.error || "Ошибка при выходе из комнаты");
         }
      } catch (error) {
         setError("Ошибка соединения: " + error.message);
      } finally {
         setLoading(false);
      }
   };

   const handleDeleteRoom = async () => {
      if (!is_owner) return; 
      
      if (!window.confirm("Вы уверены, что хотите удалить комнату? Все игроки будут исключены.")) {
         return;
      }
      
      setLoading(true);
      setError("");
      try {
         const token = isGuest ? null : localStorage.getItem('token');
         const result = await DeleteService.deleteData(
            `http://localhost:8000/rooms/${gameId}/delete/`, 
            token
         );
         
         if (result) {
            if (isGuest) {
               localStorage.removeItem('current_user_id');
               localStorage.removeItem('is_guest');
               localStorage.removeItem('guest_display_name');
            }
            navigate('/');
         } else {
            setError(result.data?.error || "Ошибка удаления комнаты");
         }
      } catch (error) {
         setError("Ошибка соединения: " + error.message);
      } finally {
         setLoading(false);
      }
   };

   const handleDeletePlayer = async (playerId) => {
      if (!is_owner) return;
      
      if (!window.confirm("Вы уверены, что хотите удалить этого игрока из комнаты?")) {
         return;
      }
      
      setLoading(true);
      setError("");
      try {
         const token = isGuest ? null : localStorage.getItem('token');
         const result = await DeleteService.deleteData(
            `http://localhost:8000/rooms/${gameId}/players/${playerId}/`,
            token
         );
         
         if (result) {
            fetchRoomData();
         } else {
            setError(result.data?.error || "Ошибка удаления игрока");
         }
      } catch (error) {
         setError("Ошибка соединения: " + error.message);
      } finally {
         setLoading(false);
      }
   };

   const handleStartGame = async () => {
      if (!is_owner) return;
      
      setLoading(true);
      setError("");
      
      try {
         const token = isGuest ? null : localStorage.getItem('token');
         
         const result = await PostService.postData(
            `http://localhost:8000/rooms/${gameId}/start/`,
            { user_id: userId },
            'json',
            token
         );
         if (result?.ok || result?.success) {
            navigate(`/game/${gameId}`);
         } else {
            setError(result?.error || "Ошибка начала игры");
         }
      } catch (error) {
         setError("Ошибка соединения: " + error.message);
      } finally {
         setLoading(false);
      }
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
         <div className="room-header mb-4">
            <h2 className="text-center mb-2">Комната #{gameId}</h2>
            {isGuest && (
               <div className="alert alert-info text-center">
                  <i className="bi bi-person-badge me-2"></i>
                  Вы играете как гость
               </div>
            )}
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
                        <span>{connected_players_count}/{all_players_count}</span>
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
                                       {player.id === userId && (
                                          <span className="badge bg-info ms-2">Вы</span>
                                       )}
                                    </div>
                                    <div>
                                       {is_owner && !player.is_owner && (
                                          <button 
                                             className="btn btn-sm btn-outline-danger"
                                             onClick={() => handleDeletePlayer(player.id)}
                                             disabled={loading}
                                             title="Удалить игрока"
                                          >
                                             <i className="bi bi-person-dash"></i>
                                          </button>
                                       )}
                                    </div>
                                 </li>
                              ))
                           )}
                        </ul>
                     </div>
                  </div>
                  {is_owner ? (
                     <Button
                        className="ms-4"
                        onClick={handleStartGame}
                        disabled={loading || connected_players_count < 3}
                     >
                        {loading ? (
                           <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Запуск игры...
                           </>
                        ) : (
                           "Начать игру"
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