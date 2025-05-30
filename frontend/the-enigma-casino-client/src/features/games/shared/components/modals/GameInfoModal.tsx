import Modal from "../../../../../components/ui/modal/Modal";
import { useMediaQuery } from "../../../../../utils/useMediaQuery";
import styles from "./GameInfoModal.module.css";

interface GameInfoModalProps {
  isOpen: boolean;
  gameType: "poker" | "blackjack" | "roulette";
  onClose: () => void;
}

export const GameInfoModal = ({
  gameType,
  onClose,
  isOpen,
}: GameInfoModalProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      position="center"
      closePosition="top-left"
    >
      <section
        className={`flex flex-col gap-4 px-8 sm:px-12 md:px-16 py-6 text-white max-h-[70vh] overflow-y-auto ${styles.modalScroll}`}
      >
        <h2 className="text-[2.8rem] font-bold text-[var(--Principal)] text-center mb-2">
          {getTitle(gameType)}
        </h2>
        <p className="text-[1.6rem] leading-snug whitespace-pre-line text-justify">
          {getDescription(gameType, isMobile)}
        </p>
      </section>
    </Modal>
  );
};

const getTitle = (gameType: string) => {
  switch (gameType) {
    case "poker":
      return "Póker clásico";
    case "blackjack":
      return "Blackjack 21";
    case "roulette":
      return "Ruleta europea";
    default:
      return "Juego";
  }
};

const getDescription = (gameType: string, isMobile: boolean): string => {
  switch (gameType) {
    case "poker":
      return `
1. Objetivo
   - Consigue la mejor mano de poker de 5 cartas tras community cards.

2. Ciegas y reparto
   - El dealer rota cada ronda.
   - Small blind y big blind apuestan antes del reparto.
   - A cada jugador se reparten 2 cartas ocultas.

3. Fases de juego
   - Preflop: apuestas tras reparto inicial.
   - Flop: ${
     isMobile
       ? "toca 3 cartas comunitarias con toque"
       : "se revelan 3 cartas comunitarias"
   } y apuestas.
   - Turn: se revela 1 carta más y apuestas.
   - River: se revela la última carta y apuestas.

4. Acciones del jugador
${
  isMobile
    ? `   - Toca “Check” para pasar, “Call” para igualar, “Raise” para subir, “All-in” para apostar todo, “Fold” para retirarte.`
    : `   - Haz clic en “Check”, “Call”, “Raise”, “All-in” o “Fold” según quieras pasar, igualar, subir, apostar todo o retirarte.`
}

5. Showdown y bote
   - Tras el river, los que queden muestran su mano.
   - Se generan pots y side-pots según apuestas.
   - El bote principal y secundarios se reparten según la mejor mano.

6. Temporizadores
   - Cada turno dura 20 s; si no actúas, se te hace “Fold” automático.
   - Si solo queda un jugador, gana automáticamente sin llegar al showdown.

7. Ranking de manos (de mayor a menor)
   - 1. Escalera de color (Straight Flush)
   - 2. Póker (Four of a Kind)
   - 3. Full House
   - 4. Color (Flush)
   - 5. Escalera (Straight)
   - 6. Trío (Three of a Kind)
   - 7. Doble pareja (Two Pair)
   - 8. Pareja (One Pair)
   - 9. Carta alta (High Card)
`;
    case "blackjack":
      return `
      1. Objetivo
   - Superar al crupier sin pasarte de 21.
   - Blackjack (21 con dos cartas) gana 1.5× tu apuesta.

2. Inicio de la ronda
   - Cada jugador apuesta antes de repartir.
   - Se reparten 2 cartas a cada jugador y al crupier.

3. Turnos de juego
${
  isMobile
    ? `   - Pulsa “Pedir” para carta y “Plantarse” para parar.
   - Para doblar apuesta, pulsa “Doblar” tras tu primera mano.`
    : `   - Haz clic en “Hit” para carta y “Stand” para plantarte.
   - Para “Double Down”, haz clic en dicho botón tras recibir tus 2 cartas.`
}

4. Reglas del crupier
   - El crupier pide cartas hasta alcanzar 17 o más.
   - Con “Soft 17” (A+6), el crupier también para.

5. Pagos y resultados
   - Blackjack: paga 3:2 (1.5× apuesta).
   - Victoria normal: paga 1:1.
   - Empate: recuperas tu apuesta.
   - Si te pasas (>21): pierdes tu apuesta.

6. Inactividad
   - Si no actúas en 20s, se fuerza “Stand” automáticamente.

      `;
    case "roulette":
      return `
1. Objetivo del juego
Apuesta a un número o grupo de números y espera que la bola caiga en una casilla ganadora tras el giro de la ruleta.

2. Inicio de la ronda
- Cada ronda comienza con una fase de apuestas de 30 segundos.
- Puedes colocar, aumentar, reducir o quitar tus apuestas durante ese tiempo.
- Solo los jugadores activos pueden apostar.

3. ¿Cómo realizar una apuesta?
${
  isMobile
    ? `- Pulsa sobre las fichas para elegir una cantidad y luego pulsa en el tablero para apostar.
- Si pulsas donde ya hay una apuesta, sumarás más fichas.
- Si mantienes pulsado sobre una apuesta, la quitarás.`
    : `- Usa clic izquierdo sobre el tablero para apostar.
- Si haces clic donde ya hay fichas, añadirás más.
- Haz clic derecho para eliminar la apuesta.`
}

4. Tipos de apuestas disponibles
- Pleno (Straight): Un único número del 0 al 36. (Paga x35)
- Color: Rojo o negro. (Paga x1)
- Par / Impar (Even / Odd): Número par o impar (excepto el 0). (Paga x1)
- Docena: 1–12, 13–24 o 25–36. (Paga x2)
- Columna: Primera, segunda o tercera columna. (Paga x2)
- Alta / Baja: 1–18 (baja) o 19–36 (alta). (Paga x1)

5. Resultado y ganancias
- Si aciertas, recibes la ganancia correspondiente.
- Si no aciertas, pierdes tu apuesta.
- Las ganancias se actualizan automáticamente al finalizar el giro.

6. Cierre de ronda
- Si ningún jugador apuesta, la ronda se cancela.
- Después del giro hay una pausa antes de la siguiente ronda.

7. Inactividad
- Si no apuestas durante varias rondas consecutivas, podrías ser expulsado automáticamente.

8. Colores
- Los números pueden ser Rojo, Negro o Verde (solo el 0).
`;
    default:
      return "";
  }
};
