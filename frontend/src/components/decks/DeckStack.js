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
        const result = await GetService.getData(`http://localhost:8000/deck/${deck_id}`, 
          token
        );
        
        if (result.name) {
          setName(result.name);
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

      <h3 style={{color: "white"}}>{name}</h3>
      <div className="accordion" deck_id="mainAccordion">
        <DeckCategory
          deck_id={deck_id}
          category_id={1}
          title="Биология"
          title_svg="heart-fill"
          name="biology"
        />
        <DeckCategory
          deck_id={deck_id}
          category_id={2}
          title="Здоровье"
          title_svg="clipboard-plus-fill"
          name="health"
        />
        <DeckCategory
          deck_id={deck_id}
          category_id={3}
          title="Профессии"
          title_svg="briefcase-fill"
          name="profession"
        />
        <DeckCategory
          deck_id={deck_id}
          category_id={4}
          title="Хобби"
          title_svg="palette-fill"
          name="hobby"
        />
        <DeckCategory
          deck_id={deck_id}
          category_id={5}
          title="Багаж"
          title_svg="tools"
          name="luggage"
        />
        <DeckCategory
          deck_id={deck_id}
          category_id={6}
          title="Факты"
          title_svg="info-circle-fill"
          name="fact"
        />
        <DeckCategory
          deck_id={deck_id}
          category_id={7}
          title="Особые возможности"
          title_svg="star-fill"
          name="unicality"
        />
      </div>
      {(parseInt(deck_id) !== 1) && (<div className="d-flex flex-row gap-1">
        <Button
          className="mt-3"
          children="Сохранить"
        />
        <Button
          className="mt-3"
          type="outline-secondary"
          children="Отменить"
          onClick={returnToPersonalAccount}
        />
      </div>)}
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