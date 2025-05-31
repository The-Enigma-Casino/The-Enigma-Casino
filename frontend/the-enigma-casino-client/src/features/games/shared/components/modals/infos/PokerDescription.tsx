const PokerDescription = ({ isMobile }: { isMobile: boolean }) => (
  <div
    className={`flex flex-col ${
      isMobile ? "gap-6" : "gap-4"
    } text-[1.6rem] leading-snug text-justify whitespace-pre-line`}
  >
    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        🎯 Objetivo
      </h3>
      <p>
        Consigue la mejor mano de poker de 5 cartas tras las cartas
        comunitarias.
      </p>
    </section>

    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        💰 Ciegas y reparto
      </h3>
      <ul className="list-disc list-inside">
        <li>El dealer rota cada ronda.</li>
        <li>Small blind y big blind apuestan antes del reparto.</li>
        <li>A cada jugador se reparten 2 cartas ocultas.</li>
      </ul>
    </section>

    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        🎬 Fases de juego
      </h3>
      <ul className="list-disc list-inside">
        <li>Preflop: apuestas tras reparto inicial.</li>
        <li>
          Flop:{" "}
          {isMobile
            ? "toca 3 cartas comunitarias con toque"
            : "se revelan 3 cartas comunitarias"}{" "}
          y apuestas.
        </li>
        <li>Turn: se revela 1 carta más y apuestas.</li>
        <li>River: se revela la última carta y apuestas.</li>
      </ul>
    </section>

    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        🙋‍♂️ Acciones del jugador
      </h3>
      <p>
        {isMobile
          ? "Toca “Check” para pasar, “Call” para igualar, “Raise” para subir, “All-in” para apostar todo, “Fold” para retirarte."
          : "Haz clic en “Check”, “Call”, “Raise”, “All-in” o “Fold” según quieras pasar, igualar, subir, apostar todo o retirarte."}
      </p>
    </section>

    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        🏁 Showdown y bote
      </h3>
      <ul className="list-disc list-inside">
        <li>Tras el river, los que queden muestran su mano.</li>
        <li>Se generan pots y side-pots según apuestas.</li>
        <li>
          El bote principal y secundarios se reparten según la mejor mano.
        </li>
      </ul>
    </section>

    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        🚷 Inactivida
      </h3>
      <ul className="list-disc list-inside">
        <li>
          Cada turno dura 20s; si no actúas, se te marca automáticamente como
          “Fold”.
        </li>
        <li>
          Si permaneces inactivo en dos turnos seguidos o en rondas distintas,
          serás expulsado del match.
        </li>
        <li>
          Si solo queda un jugador activo, gana automáticamente sin llegar al
          showdown.
        </li>
      </ul>
    </section>

    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        🃏 Ranking de manos (mayor a menor)
      </h3>
      <ol className="list-decimal list-inside">
        <li>Escalera de color (Straight Flush)</li>
        <li>Póker (Four of a Kind)</li>
        <li>Full House</li>
        <li>Color (Flush)</li>
        <li>Escalera (Straight)</li>
        <li>Trío (Three of a Kind)</li>
        <li>Doble pareja (Two Pair)</li>
        <li>Pareja (One Pair)</li>
        <li>Carta alta (High Card)</li>
      </ol>
    </section>
  </div>
);

export default PokerDescription;
