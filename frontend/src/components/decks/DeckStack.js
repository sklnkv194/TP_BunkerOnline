import DeckCategory from "./DeckCategory";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { GetService } from "../../scripts/get-service";
import { useEffect, useState } from "react";
import ChangeDeckNameForm from "./ChangeDeckNameForm";

const DeckStack = ({deck_id}) => {
  const [showEditDeckNameModal, setShowEditDeckNameModal] = useState(false);
  const [name, setName] = useState(null);
  const [internalError, setInternalError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cardsByCategory, setCardsByCategory] = useState({});

  const navigate = useNavigate();
  const returnToPersonalAccount = () => {
    navigate("/personal_account");
  }

  const editDeckName = () => {
    try{
      setLoading(true);
      setShowEditDeckNameModal(true);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const closeEditDeckNameModal = () => {
    setShowEditDeckNameModal(false); 
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const getInfo = async () => {
      try {
        setLoading(true); 
        const result = await GetService.getData(`http://localhost:8000/decks/${deck_id}/cards/`, 
          token
        );
        if (result && result.deck_name && result.cards_by_category) {
          setName(result.deck_name);
          setCardsByCategory(result.cards_by_category);
        } 
      } catch (error) {
        setInternalError("Ошибка при получении данных колоды");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getInfo();
    }
  }, [deck_id]);

  const categories = {
    1: 'catastrophe',     
    2: 'profession',     
    3: 'health',         
    4: 'hobby',           
    5: 'personality',    
    6: 'luggage',         
    7: 'additional',      
  };

  const getCategoryCards = (categoryId) => {
    const categoryName = categories[categoryId];
    return cardsByCategory[categoryName] || [];
  };

  return (
    <div className="w-75 mx-auto">
      <div className="d-flex align-items-center mb-4">
          <button 
            className="me-3"
            onClick={returnToPersonalAccount}
            style={{ 
              backgroundColor: '#0A9396', 
              borderRadius: "20px",
              color: 'white'
            }}
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          <div className="d-flex flex-row">
            <h2 className="mb-0 text-white">
              {loading ? "Загрузка..." : (name || "Название колоды")}
            </h2>
            {(parseInt(deck_id) !== 1) && (<i className="ms-3 mt-1 text-white align-self-center bi bi-pencil-square" onClick={editDeckName}></i>)}
          </div>
          
      </div>

      {internalError && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            {internalError}
          </div> 
      )}

      <div className="accordion" deck_id="mainAccordion">
        <DeckCategory
          deck_id={deck_id}
          title="Катастрофа"
          title_svg="exclamation-triangle-fill"
          name="catastrophe"
          cardsData={getCategoryCards(1)}
        />
        <DeckCategory
          deck_id={deck_id}
          title="Профессия"
          title_svg="briefcase-fill"
          name="profession"
          cardsData={getCategoryCards(2)}
        />
        <DeckCategory
          deck_id={deck_id}
          title="Здоровье"
          title_svg="clipboard-plus-fill"
          name="health"
          cardsData={getCategoryCards(3)}
        />
        
        <DeckCategory
          deck_id={deck_id}
          title="Хобби"
          title_svg="palette-fill"
          name="hobby"
          cardsData={getCategoryCards(4)}
        />
        <DeckCategory
          deck_id={deck_id}
          title="Характер"
          title_svg="star-fill"
          name="personality"
          cardsData={getCategoryCards(5)}
        />
        <DeckCategory
          deck_id={deck_id}
          title="Багаж"
          title_svg="tools"
          name="luggage"
          cardsData={getCategoryCards(6)}
        />
        <DeckCategory
          deck_id={deck_id}
          title="Дополнительный факт"
          title_svg="info-circle-fill"
          name="fact"
          cardsData={getCategoryCards(7)}
        />
       
      </div>
     
      <ChangeDeckNameForm
        id={deck_id}
        show={showEditDeckNameModal}
        onClose={closeEditDeckNameModal}
        edit="true"
        editClick={editDeckName}
      />
    </div>
  

  );

};

export default DeckStack;