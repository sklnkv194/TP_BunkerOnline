import PageLayout from "../components/layout/PageLayout"
import Header from "../components/navigation/Header";
import GameForm from "../components/game/forms/GameForm";
import FinalModal from "../components/game/FinalModal";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetService } from "../scripts/get-service";
import { PostService } from "../scripts/post-service";

// Хук для получения userId
const useUserId = () => {
   const [userId, setUserId] = useState(null);
   const [isGuest, setIsGuest] = useState(false);
   const [displayName, setDisplayName] = useState('');
   
   useEffect(() => {
      // Проверяем авторизованного пользователя
      const authUserId = localStorage.getItem('id');
      const currentUserId = localStorage.getItem('current_user_id');
      const guestFlag = localStorage.getItem('is_guest');
      const guestName = localStorage.getItem('guest_display_name');
      
      if (authUserId) {
         // Авторизованный пользователь
         setUserId(parseInt(authUserId));
         setIsGuest(false);
         setDisplayName('');
      } else if (currentUserId) {
         // Гостевой пользователь
         setUserId(parseInt(currentUserId));
         setIsGuest(guestFlag === 'true');
         setDisplayName(guestName || 'Гость');
      }
   }, []);
   
   return { userId, isGuest, displayName };
};

const GamePage = () => {
   const { code } = useParams();
   const navigate = useNavigate();
   
   const { userId, isGuest, displayName } = useUserId();

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [showFinalModal, setShowFinalModal] = useState(false);
   const [currentUserExcluded, setCurrentUserExcluded] = useState(false);

   const [catastrophe, setCatastrophe] = useState("");
   const [bunker, setBunker] = useState("");
   const [danger, setDanger] = useState("");
   const [phase, setPhase] = useState("");
   const [rounds, setRounds] = useState([]);
   const [openCards, setOpenCards] = useState([]);
   const [playerCards, setPlayerCards] = useState([]);
   const [playersData, setPlayerData] = useState([]);
   const [votingResult, setVotingResult] = useState(null);
   const [winners, setWinners] = useState([]);
   const [roomStatus, setRoomStatus] = useState("active");
   const hasShownModalRef = useRef(false);

   useEffect(() => {
      if (!code || !userId) {
         return;
      }
      
      fetchInit();
      
      const pollInterval = setInterval(() => {
         fetchGameData();
      }, 1000);
      
      return () => {
         clearInterval(pollInterval);
      };
   }, [code, userId]); 

   useEffect(() => {
      //если фаза финальная И осталось больше 0 игроков
      const shouldShowModal = (phase === 'final' || roomStatus === 'finished') && winners.length > 0;
      
      if (shouldShowModal && !hasShownModalRef.current) {
         setShowFinalModal(true);
         hasShownModalRef.current = true;
      }
   }, [phase, winners, roomStatus]);

   //инициализация игры
   const fetchInit = async () => {
      try {
         setLoading(true);
         const token = isGuest ? null : localStorage.getItem('token');
         
         const result = await GetService.getData(
            `http://localhost:8000/game_info_init/${code}/?user_id=${userId}`, 
            token
         );

         if (result) {
            const data = result;
            setCatastrophe(data.catastrophe || "");
            setBunker(data.bunker || "");
            setError("");
         } else {
            setError(result?.data?.error || result?.error || "Ошибка загрузки данных об игре");
         }
      } catch (error) {
         setError("Ошибка соединения с сервером: " + error.message);
      } finally {
         setLoading(false);
      }
   };

   //обновление информации об игре
   const fetchGameData = async () => {
      try {
         const token = isGuest ? null : localStorage.getItem('token');
         
         const result = await GetService.getData(
            `http://localhost:8000/game_info/${code}/?user_id=${userId}`, 
            token
         );
         
         if (result) {
            const data = result.data || result;
            
            setDanger(data.danger || "");
            setPhase(data.phase || "");
            setRounds(data.rounds || []);
            setOpenCards(data.openCards || []);
            setPlayerCards(data.playerCards || []);
            setPlayerData(data.playersData || []);
            setRoomStatus(data.room_status || "active");
            setCurrentUserExcluded(data.current_user_is_excluded || false);
            
            if (data.winners) {
               setWinners(data.winners);
            }
            
            if (data.vote_results || data.vote_counts) {
               setVotingResult(data.vote_results || {
                  vote_counts: data.vote_counts,
                  total_votes: data.total_votes
               });
               
               if (data.vote_results?.excluded_player_name) {
                  setError(`Игрок ${data.vote_results.excluded_player_name} выбыл!`);
               } else if (data.vote_results?.tie) {
                  setError("Ничья! Никто не выбывает в этом раунде.");
               }
            }

            setError("");
         } else {
            setError(result?.data?.error || result?.error || "Ошибка загрузки данных об игре");
         }
      } catch (error) {
         console.error("Fetch game data error:", error);
         if (!isGuest) {
            setError("Ошибка соединения с сервером");
         }
      }
   };

   //игрок делает ход
   const makeMove = async (cardId) => {
      try {
         if (!userId) {
            setError("Ошибка: не найден ID пользователя");
            return;
         }
         
         if (currentUserExcluded) {
            setError("Вы не можете делать ход, так как выбыли из игры");
            return;
         }
         
         const token = isGuest ? null : localStorage.getItem('token');
         
         const result = await PostService.postData(
            `http://localhost:8000/make_move/${code}/`,
            {
               player_id: userId,
               card_id: parseInt(cardId)
            },
            'json',
            token
         );
         
         if (result?.ok || result?.success) {
            fetchGameData();
         } else {
            setError("Ошибка хода: " + (result?.data?.error || result?.error || 'Неизвестная ошибка'));
         }
      } catch (error) {
         setError("Ошибка отправки хода: " + error.message);
      }
   };

   //флаг окончания времени голосования
   const endDiscussionTime = async () => {
      try {
         if (currentUserExcluded) {
            setError("Вы не можете управлять временем, так как выбыли из игры");
            return;
         }
         
         const token = isGuest ? null : localStorage.getItem('token');
         
         const result = await PostService.postData(
            `http://localhost:8000/time_discussion_end/${code}/`,
            {
               time_discussion_over: true
            },
            'json',
            token
         );
         
         if (result?.ok || result?.success) {
            fetchGameData();
         }
      } catch (error) {
         setError("Ошибка завершения обсуждения: " + error.message);
      }
   };

   //игрок отдает голос
   const handleVote = async (playerId) => {
      try {
         if (!userId) {
            setError("Ошибка: не найден ID пользователя");
            return;
         }
         
         if (currentUserExcluded) {
            setError("Вы не можете голосовать, так как выбыли из игры");
            return;
         }
         
         const token = isGuest ? null : localStorage.getItem('token');
         
         const result = await PostService.postData(
            `http://localhost:8000/vote/${code}/`,
            {
               voter_id: userId,
               player_id: playerId
            },
            'json',
            token
         );
         
         if (result?.ok || result?.success) {
            console.log("Голос успешно отдан");
            fetchGameData();
         }
      } catch (error) {
         console.error("Ошибка голосования:", error);
         setError("Ошибка голосования: " + error.message);
      }
   };

   //флаг об окончании голосования
   const endVotingTime = async () => {
      try {
         if (currentUserExcluded) {
            setError("Вы не можете управлять временем, так как выбыли из игры");
            return;
         }
         
         const token = isGuest ? null : localStorage.getItem('token');
         
         const result = await PostService.postData(
            `http://localhost:8000/time_voting_end/${code}/`,
            {
               time_voting_over: true
            },
            'json',
            token
         );
         
         if (result?.ok || result?.success) {
            fetchGameData();
         }
      } catch (error) {
         setError("Ошибка завершения голосования: " + error.message);
      }
   };

   //подготавливаем список выживших
   const survivors = winners.map(winner => ({
      id: winner.player_id,
      nickname: winner.nickname,
      cards: winner.cards || []
   }));

   //если пользователь выбыл, показываем сообщение
   if (currentUserExcluded && roomStatus === "active") {
      return (
         <PageLayout>
            <Header/>
            <div className="w-75 mx-auto mt-4">
               <div className="alert alert-warning">
                  <h4 className="alert-heading">Вы выбыли из игры</h4>
                  <p>Вы можете наблюдать за продолжением игры, но не можете участвовать в голосованиях и ходах.</p>
                  {isGuest && (
                     <p className="mb-0">
                        <i className="bi bi-person-badge me-1"></i>
                        Вы играете как гость: <strong>{displayName}</strong>
                     </p>
                  )}
               </div>
               
               <div className="card">
                  <div className="card-header">
                     <h5>Текущее состояние игры</h5>
                  </div>
                  <div className="card-body">
                     <GameForm
                        code={code}
                        catastrophe={catastrophe}
                        bunker={bunker}
                        danger={danger}
                        phase={phase}
                        rounds={rounds}
                        openCards={openCards}
                        playerCards={[]} 
                        playersData={playersData}
                        onMakeMove={() => {}} 
                        onVote={() => {}} 
                        onDiscussionEnd={() => {}}
                        onVotingEnd={() => {}} 
                        votingResult={votingResult}
                     />
                  </div>
               </div>
            </div>
         </PageLayout>
      );
   }

   return (
      <PageLayout>
         <Header/>
         <div className="w-75 mx-auto">
            {isGuest && (
               <div className="alert alert-info my-3">
                  <i className="bi bi-person-badge me-2"></i>
                  Вы играете как гость: <strong>{displayName}</strong>
               </div>
            )}
            
            {loading && (
               <div className="text-center my-4">
                  <div className="spinner-border text-primary"></div>
                  <div className="mt-2">Загрузка игры...</div>
               </div>
            )}
            
            {error && (
               <div className="alert alert-danger my-4">
                  {error}
               </div>
            )}
            
            <GameForm
               code={code}
               catastrophe={catastrophe}
               bunker={bunker}
               danger={danger}
               phase={phase}
               rounds={rounds}
               openCards={openCards}
               playerCards={playerCards}
               playersData={playersData}
               onMakeMove={makeMove}             
               onVote={handleVote}             
               onDiscussionEnd={endDiscussionTime} 
               onVotingEnd={endVotingTime} 
               votingResult={votingResult} 
            />
            
            <FinalModal
               isOpen={showFinalModal}
               survivors={survivors}
            />
         </div>
      </PageLayout>
   );
}; 

export default GamePage;