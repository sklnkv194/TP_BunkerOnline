import { useState, useEffect, useRef } from "react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../forms/DeleteModal";
import { DeleteService } from "../../scripts/delete-service";
import { GetService } from "../../scripts/get-service";
import { useParams, useSearchParams } from "react-router-dom";

const GameWaitingForm = ({ 
}) => {
   const { roomId } = useParams();
   const [searchParams] = useSearchParams();
   const is_owner = searchParams.get('is_owner') === 'true';

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
   const ws = useRef(null);

   const fetchPlayers = async () => {
      try {
         const token = localStorage.getItem('token');
         const result = await GetService.getData(`http://localhost:8000/rooms/${roomId}/players/`, token);
         
         if (result.ok) {
            setPlayers(result.data.players || []);
            setConnectedPlayersCount(result.data.connected_count || 0);
            setAllPlayersCount(result.data.total_count || 0);
         } else {
            setError("Ошибка загрузки игроков");
         }
      } catch (error) {
         setError("Ошибка соединения");
      }
   };

   const initWebSocket = () => {
      const token = localStorage.getItem('token');
      ws.current = new WebSocket(`ws://localhost:8000/ws/game-room/${roomId}/?token=${token}`);

      ws.current.onopen = () => {
         console.log("WebSocket подключен");
      };

      ws.current.onmessage = (event) => {
         const data = JSON.parse(event.data);
         
         if (data.type === 'player_joined') {
            fetchPlayers();
         } else if (data.type === 'player_left') {
            fetchPlayers(); 
         } else if (data.type === 'game_started') {
            navigate('/game');
         } else if (data.type === 'room_deleted') {
            navigate('/'); 
         }
      };

      ws.current.onclose = () => {
         console.log("WebSocket отключен");
         setTimeout(() => {
            if (ws.current) {
               initWebSocket();
            }
         }, 5000);
      };

      ws.current.onerror = (error) => {
         console.error("WebSocket ошибка:", error);
      };
   };

   useEffect(() => {
      fetchPlayers();
      initWebSocket();

      return () => {
         if (ws.current) {
            ws.current.close();
         }
      };
   }, [roomId]);

   const handleDeleteRoom = async () => {
      setLoading(true);
      setError("");
      try {
         const token = localStorage.getItem('token');
         const result = await DeleteService.deleteData(`http://localhost:8000/rooms/${roomId}/`, token);
         
         if (result.ok) {
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
         playerId
      });
   };

   const handleStartGame = () => {
      navigate('/game');
   };

   return (
      <div className="game-room-form form-group">
         <DeleteModal
            show={deleteModal.show}
            onClose={() => setDeleteModal({ show: false, playerId: null })}
            id={deleteModal.playerId}
            url={`http://localhost:8000/rooms/${roomId}/`}
         />
         
         <div className="room-header mb-4">
            <h2 className="text-center mb-2">Комната #{roomId}</h2>
         </div>
         
         <div className="row">
            <div className="col-md-6">
               {is_owner && (
                  <div className="mt-4 pt-3 border-top">
                     <Button
                        onClick={handleDeleteRoom}
                        disabled={loading}
                     >
                        {loading ? "Удаление..." : "Удалить комнату"}
                     </Button>
                  </div>
               )}
            </div>
            
            <div className="col-md-6">
               <div className="players-card">
                  <h4 className="mb-3">{connected_players_count}/{all_players_count} ожидают</h4>
         
                  <ul className="players-list">
                     {players.map(player => (
                        <li key={player.id} className="list-group-item d-flex justify-content-between align-items-center">
                           {player.username}
                           {player.is_owner ? (
                              <div>
                                 Вы
                              </div>
                           ) : is_owner ? (
                              <button 
                                 className="btn btn-sm"
                                 onClick={() => handleDeletePlayer(player.id)}
                                 disabled={loading}
                              >
                                 <i className="bi bi-trash"></i>
                              </button>
                           ) : null}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
         
         {error && (
            <div className="alert alert-danger mt-4">
               {error}
            </div>
         )}
         
         <div className="start-game mt-4 text-center">
            {is_owner ? (
               <Button
                  variant="success"
                  size="lg"
                  onClick={handleStartGame}
                  disabled={loading || connected_players_count < 3}
                  className="px-5"
               >
                  {loading ? (
                     <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Запуск игры...
                     </>
                  ) : (
                     <>
                        <i className="bi bi-play-circle me-2"></i>
                        Начать игру
                     </>
                  )}
               </Button>
            ) : (
               <div className="waiting-text">
                  Ожидание начала игры...
               </div>
            )}
         </div>
      </div>
   );
};

export default GameWaitingForm;