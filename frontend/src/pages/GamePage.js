import PageLayout from "../components/layout/PageLayout"
import Header from "../components/navigation/Header";
import GameForm from "../components/game/forms/GameForm";
import FinalModal from "../components/game/FinalModal";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetService } from "../scripts/get-service";
import { PostService } from "../scripts/post-service";

const GamePage = () => {
   const { code } = useParams();
   const navigate = useNavigate();

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [showFinalModal, setShowFinalModal] = useState(false);

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
   const hasShownModalRef = useRef(false);

   useEffect(() => {
      if (!code) return;
      fetchInit();
      
      const pollInterval = setInterval(() => {
         fetchGameData();
      }, 1000);
      
      return () => {
         clearInterval(pollInterval);
      };
   }, [code]);

   useEffect(() => {
      // Если фаза финальная И осталось больше 0 игроков
      const shouldShowModal = phase === 'final' && winners.length > 0;
      console.log(phase, playersData.length)
      if (shouldShowModal && !hasShownModalRef.current) {
         console.log("Показываем модалку финала - игра завершена");
         setShowFinalModal(true);
         hasShownModalRef.current = true;
      }
   }, [phase, winners]);

   //инициализация игры
   const fetchInit = async () => {
      try {
         setLoading(true);
         const token = localStorage.getItem('token');
         const userId = localStorage.getItem('id');
         
         const result = await GetService.getData(`http://localhost:8000/game_info_init/${code}/?user_id=${userId}`, token);
         console.log(result)

         if (result) {
            const data = result;
            setCatastrophe(data.catastrophe || "");
            setBunker(data.bunker || "");
            setError("");
         } else {
            setError(result?.data?.error || result?.error || "Ошибка загрузки данных об игре");
         }
      } catch (error) {
         setError("Ошибка соединения с сервером");
      } finally {
         setLoading(false);
      }
   };

   //обновление информации об игре
   const fetchGameData = async () => {
      try {
         const token = localStorage.getItem('token');
         const userId = localStorage.getItem('id');
         const result = await GetService.getData(`http://localhost:8000/game_info/${code}/?user_id=${userId}`, token);
         if (result) {
            const data = result.data || result;
            
            setDanger(data.danger || "");
            setPhase(data.phase || "");
            setRounds(data.rounds || []);
            setOpenCards(data.openCards || []);
            setPlayerCards(data.playerCards || []);
            setPlayerData(data.playersData || []);
            if (data.winners) {
               setWinners(data.winners);
            }
            if (data.vote_results) {
               setVotingResult(data.vote_results);
               
               if (data.vote_results.excluded_player_name) {
                  setError(`Игрок ${data.vote_results.excluded_player_name} выбыл!`);
               } else if (data.vote_results.tie) {
                  setError("Ничья! Никто не выбывает в этом раунде.");
               }
            }

            setError("");
         } else {
            setError(result?.data?.error || result?.error || "Ошибка загрузки данных об игре");
         }
      } catch (error) {
         console.error("Fetch game data error:", error);
      }
   };

   //игрок делает ход
   const makeMove = async (cardId) => {
      try {
         const token = localStorage.getItem('token');
         const playerId = localStorage.getItem('id');
         
         if (!playerId) {
            setError("Ошибка: не найден ID пользователя");
            return;
         }
         
         const result = await PostService.postData(
            `http://localhost:8000/make_move/${code}/`,
            {
               player_id: parseInt(playerId),
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
         setError("Ошибка отправки хода");
      }
   };

   //флаг окончания времени голосования
   const endDiscussionTime = async () => {
      try {
         const token = localStorage.getItem('token');
         
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
         setError("Ошибка завершения обсуждения");
      }
   };

   //игрок отдает голос
   const handleVote = async (playerId) => {
      try {
         const token = localStorage.getItem('token');
         const voterId = localStorage.getItem('id');
         
         const result = await PostService.postData(
            `http://localhost:8000/vote/${code}/`,
            {
            voter_id: parseInt(voterId),
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
      }
   };

   //флаг об окончании голосования
   const endVotingTime = async () => {
      try {
         const token = localStorage.getItem('token');
         
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
         setError("Ошибка завершения голосования");
      }
   };

   // Подготавливаем список выживших
   const survivors = winners.map(winner => ({
      id: winner.player_id,
      nickname: winner.nickname,
      cards: winner.cards || []
   }));

   return (
      <PageLayout>
         <Header/>
         <div className="w-75 mx-auto">
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
            
            {/* Простое модальное окно окончания игры */}
            <FinalModal
               isOpen={showFinalModal}
               survivors={survivors}
            />
         </div>
      </PageLayout>
   );
}; 

export default GamePage;