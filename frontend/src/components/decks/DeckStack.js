import DeckCategory from "./DeckCategory";

const DeckStack = ({id, name}) => {
  return (
    <div>
      <h3 style={{color: "white"}}>{name}</h3>
      <div className="accordion" id="mainAccordion">
        <DeckCategory
          deck_id={id}
          category_id={1}
          title="Биология"
          title_svg="heart-fill"
          name="biology"
        />
        <DeckCategory
          deck_id={id}
          category_id={2}
          title="Здоровье"
          title_svg="clipboard-plus-fill"
          name="health"
        />
        <DeckCategory
          deck_id={id}
          category_id={3}
          title="Профессии"
          title_svg="briefcase-fill"
          name="profession"
        />
        <DeckCategory
          deck_id={id}
          category_id={4}
          title="Хобби"
          title_svg="palette-fill"
          name="hobby"
        />
        <DeckCategory
          deck_id={id}
          category_id={5}
          title="Багаж"
          title_svg="tools"
          name="luggage"
        />
        <DeckCategory
          deck_id={id}
          category_id={6}
          title="Факты"
          title_svg="info-circle-fill"
          name="fact"
        />
        <DeckCategory
          deck_id={id}
          category_id={7}
          title="Особые возможности"
          title_svg="star-fill"
          name="unicality"
        />
      </div>
   
    </div>
    

  );

};

export default DeckStack;