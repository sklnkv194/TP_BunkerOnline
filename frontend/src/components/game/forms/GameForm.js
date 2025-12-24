import CatastropheBunkerInfo from "../info/CatastropheBunkerInfo";
import DangerInfo from "../info/DangerInfo";
import OpenCardStack from "../stacks/OpenCardStack";
import PlayerOwnCardStack from "../stacks/PlayerOwnCardStack";
import PlayersVoteStack from "../stacks/PlayersVoteStack";
import DiscussionVotingForm from "./DiscussionVotingForm";
import RoundStack from "../stacks/RoundStack";

const GameForm = ({
  catastrophe,
  bunker,
  danger,
  phase
}) => {
  catastrophe = 'Глобальная экологическая катастрофа, вызванная массовыми ядерными взрывами. Солнечный свет блокируется пеплом и сажей, вызывая резкое похолодание по всей планете.'
  bunker = 'Бункер "Альфа-7"'
  danger = 'Повышенный уровень радиации проникает в бункер через систему вентиляции.'
  const openCards = [
    {
      id: 1,
      nickname: "Анна",
      category_id: 2,
      name: "Врач",
      is_choose: true,
      is_leave: false,
      is_wait: false
    },
    {
      id: 2,
      nickname: "Борис",
      category_id: 3,
      name: "Аллергия на пыльцу",
      is_choose: false,
      is_leave: true,
      is_wait: false
    },
    {
      id: 6,
      nickname: "Ольга",
      category_id: 7,
      name: "Занималась плаванием",
      is_choose: false,
      is_leave: false,
      is_wait: true
    },
    {
      id: 3,
      nickname: "Сергей",
      category_id: 4,
      name: "Фотография",
      is_choose: true,
      is_leave: false,
      is_wait: true
    },
    {
      id: 4,
      nickname: "Дарья",
      category_id: 5,
      name: "Оптимист",
      is_choose: false,
      is_leave: false,
      is_wait: false
    },
    {
      id: 5,
      nickname: "Евгений",
      category_id: 6,
      name: "Аптечка первой помощи",
      is_choose: true,
      is_leave: true,
      is_wait: false
    },
    
  ];

  // Моковые данные для карт текущего игрока (минимум 5)
  const playerCards = [
    {
      id: 101,
      nickname: "Вы",
      category_id: 2,
      name: "Инженер",
      is_choose: false,
      is_leave: false,
      is_wait: false
    },
    {
      id: 102,
      nickname: "Вы",
      category_id: 3,
      name: "Идеальное зрение",
      is_choose: true,
      is_leave: false,
      is_wait: false
    },
    {
      id: 103,
      nickname: "Вы",
      category_id: 4,
      name: "Программирование",
      is_choose: false,
      is_leave: false,
      is_wait: false
    },
    {
      id: 104,
      nickname: "Вы",
      category_id: 5,
      name: "Лидер",
      is_choose: true,
      is_leave: false,
      is_wait: false
    },
    {
      id: 105,
      nickname: "Вы",
      category_id: 6,
      name: "Набор инструментов",
      is_choose: false,
      is_leave: false,
      is_wait: false
    }
  ];

  // Моковые данные для игроков в голосовании (минимум 5)
  const playersData = [
    {
      id: 1,
      nickname: "Анна",
      canVote: true,
      cards: [
        { id: 1, category_id: 2, name: "Врач", is_choose: false },
        { id: 2, category_id: 3, name: "Здоров", is_choose: true },
        { id: 3, category_id: 4, name: "Рисование", is_choose: false },
      ]
    },
    {
      id: 2,
      nickname: "Борис",
      canVote: true,
      isVotedFor: true,
      cards: [
        { id: 4, category_id: 2, name: "Учитель", is_choose: false },
        { id: 5, category_id: 3, name: "Простуда", is_choose: false },
        { id: 6, category_id: 5, name: "Добрый", is_choose: true },
      ]
    },
    {
      id: 3,
      nickname: "Сергей",
      canVote: false, // выбыл
      cards: [
        { id: 7, category_id: 2, name: "Инженер", is_choose: false },
        { id: 8, category_id: 4, name: "Музыка", is_choose: true },
        { id: 9, category_id: 6, name: "Аптечка", is_choose: false },
      ]
    },
    {
      id: 4,
      nickname: "Дарья",
      canVote: true,
      cards: [
        { id: 10, category_id: 2, name: "Программист", is_choose: false },
        { id: 11, category_id: 3, name: "Отличное зрение", is_choose: true },
        { id: 12, category_id: 7, name: "Знает карту", is_choose: false },
      ]
    },
    {
      id: 5,
      nickname: "Евгений",
      canVote: true,
      cards: [
        { id: 13, category_id: 2, name: "Повар", is_choose: false },
        { id: 14, category_id: 3, name: "Диабет", is_choose: false },
        { id: 15, category_id: 5, name: "Трудолюбивый", is_choose: true },
      ]
    },
    {
      id: 6,
      nickname: "Ольга",
      canVote: true,
      cards: [
        { id: 16, category_id: 2, name: "Ученый", is_choose: false },
        { id: 17, category_id: 4, name: "Спорт", is_choose: true },
        { id: 18, category_id: 6, name: "Генератор", is_choose: false },
      ]
    }
  ];
  const roundsData = [
    { id: 1, number: 1, is_current: false, current_phase: "discussion" },
    { id: 2, number: 2, is_current: false, current_phase: "voting" },
    { id: 3, number: 3, is_current: false, current_phase: "game" },
    { id: 4, number: 4, is_current: true, current_phase: "final" }
  ];
  return(
    <div>
      <CatastropheBunkerInfo catastrophe={catastrophe} bunker={bunker}/>
      <DangerInfo danger={danger}/>
      <div className="fw-bolder mt-4 mb-4" style={{ color: "#94D2BD"}}>
        Комната
      </div>
      <RoundStack rounds={roundsData}/>
      <OpenCardStack cards={openCards}/>
      {(phase === "game") && (
        <div>
          <div className="fw-bolder mt-4" style={{ color: "#94D2BD"}}>
            Мои карты
          </div>
          <PlayerOwnCardStack cards={playerCards}/>
        </div>
      )}
      {(phase === "voting" || phase === "discussion") && (
        <DiscussionVotingForm phase="voting"/>
      )}
     
      <PlayersVoteStack players={playersData} phase="game" />
      
    </div>
  ); 
};
export default GameForm;