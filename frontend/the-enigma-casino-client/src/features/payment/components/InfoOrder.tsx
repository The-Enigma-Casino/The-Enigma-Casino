import CoinsCard from "../../catalog/components/CoinsCard";

function InfoOrder() {




  return (
    <div>
      <CoinsCard
        id={1}
        price={1000}
        quantity={100}
        image={"/img/pack1.webp"}
        offer={20}
        // size={"large"}
        isSelected={false}
        onSelect={() => {}}
      />
      <div>

      </div>
    </div>
  );
}

export default InfoOrder;
