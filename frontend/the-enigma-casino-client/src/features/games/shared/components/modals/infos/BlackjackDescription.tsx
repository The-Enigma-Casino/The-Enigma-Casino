const BlackjackDescription = ({ isMobile }: { isMobile: boolean }) => (
  <div
    className={`flex flex-col ${
      isMobile ? "gap-6" : "gap-4"
    } text-[1.6rem] leading-snug text-justify whitespace-pre-line`}
  >
    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        🎯 Objetivo
      </h3>
      <ul className="list-disc list-inside">
        <li>Superar al crupier sin pasarte de 21.</li>
        <li>
          Blackjack (21 con dos cartas) gana <strong>1.5×</strong> tu apuesta.
        </li>
      </ul>
    </section>

    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        🃠 Inicio de la ronda
      </h3>
      <ul className="list-disc list-inside">
        <li>Cada jugador apuesta antes de repartir.</li>
        <li>Se reparten 2 cartas a cada jugador y al crupier.</li>
      </ul>
    </section>

    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        🧠 Turnos de juego
      </h3>
      <p>
        {isMobile ? (
          <>
            - Pulsa “Hit” para carta y “Stand” para plantarte. <br />– Para
            doblar la apuesta, pulsa “Double”. Recibirás una sola carta
            adicional y no podrás realizar más acciones en ese turno.
          </>
        ) : (
          <>
            - Haz clic en “Hit” para carta y “Stand” para plantarte. <br />–
            Para doblar la apuesta, haz clic en “Double”. Recibirás una sola
            carta adicional y no podrás realizar más acciones en ese turno.
          </>
        )}
      </p>
    </section>

    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        👨‍⚖️ Reglas del crupier
      </h3>
      <p>El crupier pide cartas hasta alcanzar 17 o más.</p>
    </section>

    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        💰 Pagos y resultados
      </h3>
      <ul className="list-disc list-inside">
        <li>
          <strong>Blackjack:</strong> paga <strong>3:2</strong> (1.5× apuesta).
        </li>
        <li>
          <strong>Victoria normal:</strong> paga 1:1.
        </li>
        <li>
          <strong>Empate:</strong> recuperas tu apuesta.
        </li>
        <li>
          <strong>Pasarse (&gt;21):</strong> pierdes tu apuesta.
        </li>
      </ul>
    </section>

    <section>
      <h3 className="text-[2rem] font-bold text-[var(--Principal)]">
        🚷 Inactivida
      </h3>
      <p>
        Si no actúas en 20 segundos, se fuerza automáticamente la opción
        “Stand”.
        <br />
        Si repites esta inactividad en dos turnos seguidos o en distintas
        rondas, serás expulsado de la mesa.
      </p>
    </section>
  </div>
);

export default BlackjackDescription;
