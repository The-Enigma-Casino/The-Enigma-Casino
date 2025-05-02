import Roulette from "../games/roulette/components/Roulette";

export const TestingPage = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Roulette />
    </div>
  );
};
