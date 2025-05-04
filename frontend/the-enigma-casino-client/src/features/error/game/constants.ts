export const GAME_WIDTH = 600;
export const GAME_HEIGHT = 300;

export const PLAYER = {
  x: 50,
  width: 70,
  height: 90,
  ground: 210,
  jumpStrength: 14,
  gravity: 0.8,
};


export const OBSTACLE = {
  width: 20,
  height: 60,
  speed: 6,
};


export const LOSS_MESSAGES = [
  "💥 Te estampaste como un trébol distraído.",
  "🧱 El muro fue más rápido que tus reflejos.",
  "🌪️ El viento se llevó tu suerte.",
  "💀 RIP Leprechaun 2025 - 2025.",
  "🚧 Te olvidaste de mirar a ambos lados.",
  "💍 Es mío, solo mío... mi tesoro.",
  "💨 Te volaste como un trébol en el viento.",
  "🪙 Por poco pillas la olla de oro... por poco.",
  "⚡ La inteligencia te persigue, pero tú eres más rápido.",
  "🍀 El trébol dorado se escapó de tus manos.",
  "🪙 El oro se escurrió entre tus dedos.",
  "🍀 Eso tuvo que doler.",
  "💀 Tu partida fue un Dark Souls sin rodar.",
  "⭐ Sentiste un gran disturbio en la Fuerza.",
  "🧟 Tu suerte murió más rápido que un aldeano en Minecraft.",
  "🚗 Esquivar no es lo tuyo, ¿verdad, Toretto?",
  "💡 Fue un plan brillante... hasta que saltaste.",
  "🕷️ Tu sentido arácnido no funcionó a tiempo.",
  "🧙‍♂️ El hechizo del trébol no fue suficiente.",
  "🧚‍♂️ El hada de la suerte no estaba de tu lado.",
  "🎩 No eres un mago, Harry.",
  "💡 La inteligencia te abandonó en el último segundo.",
  "🧢 Ah sh*t, here we go again...",
];

export const SCORE_RANKS = [
  { score: 0, label: "Corredor sin suerte" },
  { score: 100, label: "Cazador de tréboles" },
  { score: 200, label: "Saltador de tréboles" },
  { score: 300, label: "Corredor de arcoíris" },
  { score: 400, label: "Esquivador profesional" },
  { score: 500, label: "Maestro del trébol" },
  { score: 600, label: "Leyenda del trébol dorado" },
  { score: 700, label: "Leprechaun invencible" },
  { score: 800, label: "Semidiós del 404" },
  { score: 900, label: "Leyenda del oro perdido" },
  { score: 1000, label: "Dios Inmortal del trébol" },
];
