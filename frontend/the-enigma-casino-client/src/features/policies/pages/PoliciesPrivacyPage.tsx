import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PoliciesPage() {
  const navigate = useNavigate();

  const [showHiddenClause, setShowHiddenClause] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.altKey) {
        setShowHiddenClause(true);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleErrorRedirect = () => {
    navigate("/error");
  };

  return (
    <div className="min-h-screen bg-Background-Page text-white px-4 sm:px-8 md:px-20 lg:px-32 xl:px-80 py-12 font-reddit">
      <h1 className="text-5xl font-bold text-center text-Principal mb-4">
        ☘️ Términos y Política de Privacidad
      </h1>

      <div className="space-y-14 text-lg sm:text-xl leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-2">☘️ Introducción</h2>
          <p>
            Bienvenido a{" "}
            <strong className="text-white">The Enigma Casino</strong>, un reino
            de fortuna incierta, hechizos tentadores y contratos que brillan más
            cuanto menos se leen. Al cruzar nuestras puertas digitales, el
            Usuario (también conocido como “el Visitante”, “el Afortunado” o
            simplemente “la Víctima Consentida”) acepta, sin pestañear y
            probablemente sin leer, estos Términos y Condiciones sellados por el{" "}
            <strong className="text-white">Gran Leprechaun Dorado</strong> en
            los sótanos sagrados del mismísimo Enigma Casino… donde todo es
            vinculante, excepto la lógica.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            📜 Acuerdo con el Usuario
          </h2>
          <p>
            Este acuerdo es vinculante. Al registrarte y utilizar esta
            plataforma, declaras que tienes al menos 18 años, resides en una
            jurisdicción donde el juego online es legal, y que has leído y
            aceptado todas las cláusulas, visibles, ocultas y aquellas que solo
            se muestran si mantienes presionada la tecla Alt mientras giras
            sobre ti mismo.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>
              <strong>Leprechaun:</strong> Ser ancestral custodio del oro, los
              botes y los errores contractuales a favor de la casa. Habla en
              verso legal y a veces en hexámetros.
            </li>
            <li>
              <strong>El Caldero:</strong> Repositorio donde va el oro perdido.
              Ríe por las noches, llora por las mañanas y calcula tus
              probabilidades con una cuchara de madera... torcida.
            </li>
            <li>
              <strong>Jugador:</strong> Mortal con esperanza, saldo, y un
              historial de navegación que ya hemos examinado cuidadosamente con
              una lupa mágica.
            </li>
          </ul>
          <p className="mt-3">
            También concedes un modesto 40% de tu alma por cada tirada fallida.
            Este valor puede aumentar si juegas en viernes 13, te burlas del
            crupier o pronuncias “suerte” tres veces frente a un espejo.
          </p>
          <p className="mt-3">
            Este contrato incluye las cláusulas de uso estándar, la protección
            de datos bajo el RGPD, el compromiso de juego responsable y, si
            marcas la casilla correcta (que no existe), el acceso temporal a la
            biblioteca secreta de los Leprechauns. Spoiler: está desordenada, y
            hay ratas con toga. (No preguntes por qué).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            🥹 Política de Privacidad
          </h2>
          <p>
            Recopilamos tu IP, correo electrónico, imagen de perfil, ubicación
            aproximada (y no tan aproximada), entidad bancaria, hábitos de
            gasto, lugar donde escondes tus ahorros, más de 7 variables
            esotéricas, tus horarios favoritos para jugar, tu tipo de suerte
            preferida y tus deseos más profundos de gloria eterna. Esta
            información se utiliza para mejorar tu experiencia, personalizar las
            ofertas que te aparecen justo cuando más vulnerable estás, y
            alimentar el Árbol de la Suerte (no preguntes dónde está plantado,
            ni por qué brilla por las noches). Además, de conformidad con la
            normativa vigente en materia de juego responsable, empleamos estos
            datos para detectar posibles patrones de riesgo y ofrecer mecanismos
            de autoexclusión o límites personalizados. En ocasiones, también
            analizamos tus interacciones con el casino para cumplir con
            requisitos de seguridad, prevención de fraude y lavado de dinero. Lo
            de los tréboles de cuatro hojas es puramente decorativo... o eso nos
            han dicho los de legal.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">⚖️ Juego Justo</h2>
          <p>
            Todos los juegos de esta plataforma están regulados y certificados
            por entidades independientes que verifican la aleatoriedad y equidad
            de los resultados mediante sistemas como RNG (Random Number
            Generator), auditados periódicamente conforme a los requisitos de la
            Dirección General de Ordenación del Juego. El azar en esta
            plataforma es auditado y equilibrado mediante runas antiguas,
            revisiones legales y encantamientos certificados. Si ganas, el
            crupier lo celebra. Si pierdes, el crupier lo celebra más fuerte.
            Además, aplicamos mecanismos para garantizar que ningún usuario o
            sistema tenga ventaja injusta, y mantenemos registros verificables
            de todas las partidas por si algún elfo litigante exige revisión.
            <strong>Excepto el sistema de gachapón.</strong> Ese está más
            trucado que los árbitros de la Liga, un dado de seis caras con cinco
            ceros y una ilusión. Literalmente es magia negra envuelta en bolas
            de colores. Te lo advertimos.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">🔐 Seguridad</h2>
          <p>
            La seguridad de tu información es una prioridad para nosotros.
            Utilizamos protocolos de cifrado estándar de la industria (como TLS
            1.3) para proteger tus datos personales y financieros durante todas
            las transacciones. Además, empleamos protección mediante hongos
            mágicos de grado 7, custodios arcanos certificados por el Consejo de
            Seguridad Digital de Avalon. Nunca compartimos tus datos con
            entidades no autorizadas... salvo que ofrezcan oro real o promesas
            imposibles. También aplicamos medidas adicionales como monitoreo
            constante de actividad sospechosa y políticas internas de acceso
            restringido, todo conforme a lo exigido por las autoridades del
            juego online y el Reglamento General de Protección de Datos (RGPD).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            🚫 Cancelación de Cuentas
          </h2>
          <p>
            Aplicamos políticas de moderación activa y juego responsable. Si
            detectamos comportamientos que sugieran adicción o pérdida de
            control, te ofreceremos herramientas de autoexclusión inmediata e
            incluso activaremos el <strong>sistema de auto-baneo mágico</strong>
            ™, una tecnología ancestral diseñada para protegerte de ti mismo...
            y de tu suerte. También nos reservamos el derecho de marcar tu
            cuenta con runas de cierre si insultas al avatar del Gran
            Leprechaun, robas tréboles, deshonras el caldero o intentas
            manipular el azar con dados cargados o miradas sospechosas. Esto se
            hace sin previo aviso. Pero con música celta de fondo, gaitas y
            algún que otro cuervo ceremonial.
            <strong>Nota importante:</strong> En casos extremadamente raros (1
            entre 6.432.874 según los cálculos del Consejo del Trébol), si ganas
            demasiado seguido podrías ser baneado por “exceso de fortuna
            desbalanceada”. No es personal. Es solo que la probabilidad se
            deprime y necesita reequilibrarse. (Nos gusta el dinero).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">☘️ Cláusula Final</h2>
          <p>
            Al continuar navegando o utilizar nuestros servicios, reconoces que
            has leído, comprendido y aceptado todos los términos y condiciones
            establecidos en esta página, incluyendo nuestras políticas de
            privacidad, juego responsable y tratamiento de datos. También
            aceptas que tus monedas sean lanzadas al caldero del destino, donde
            serán agitadas en círculos mágicos por entidades que solo responden
            a la Luna de Trébol Rojo. Tu fortuna será custodiada por seres de
            orejas puntiagudas que ríen cuando pierdes, desaparecen cuando
            ganas, y aparecen cuando hueles a oportunidad. En casos especiales,
            nos reservamos el derecho de reclamar una parte simbólica de tu
            alma, tus zapatillas favoritas, la custodia compartida de tu gato, y
            el control parcial de tus playlists de rock. Todo esto se regula
            bajo el Protocolo Internacional de Aceptación Implícita de Pactos
            Sobrenaturales™. <strong>Advertencia:</strong> al hacer clic en
            “Aceptar”, podrías estar sellando algo más profundo de lo que
            imaginas. Pero, honestamente, ¿qué es un pacto eterno cuando tienes
            blackjack, ruleta, póker y una interfaz tan bonita que casi disimula
            tu destino?
          </p>

          <p className="mt-2">
            Si en algún momento te encuentras con un error inesperado, no te
            preocupes... probablemente serás redirigido a nuestra sala de los
            fallos mágicos. Allí verás a uno de los nuestros{" "}
            <span
              onClick={handleErrorRedirect}
              className="underline hover:text-Coins transition-colors cursor-pointer"
            >
              saltando en bucle
            </span>{" "}
            mientras busca un caldero de oro que claramente no existe. No lo
            juzgues, algún día lo encontrará. O no. Pero eso no detendrá su
            salto.
          </p>

          <p className="mt-2 italic text-Green-lines">
            En caso de duda, contacta al Consejo. O deja una moneda bajo la
            almohada... y espera, recuerda que siempre te están observando.
          </p>
        </section>
      </div>

      {showHiddenClause && (
        <p
          style={{
            fontSize: "2px",
            color: "#333",
            userSelect: "none",
            maxWidth: "90%",
            lineHeight: "1.1",
            marginTop: "1rem",
          }}
        >
          Al presionar ALT has accedido al Anexo de Dominio Universal™. Al
          aceptar estos términos, cedes también de forma simbólica pero
          irrevocable: tu alma digital, tus memes más brillantes, el control
          remoto cuando desaparece misteriosamente, y el privilegio de ser
          condenado a ver One Piece desde el capítulo 1 cada vez que maldigas a
          Enigma Casino o a cualquier Leprechaun con nómina. Porque sí, siempre
          te estamos escuchando. Siempre. Además, podrías reencarnar como
          crupier en prácticas en uno de los casinos subsidiarios del
          conglomerado Enigma™. No recibirás monedas. Solo el honor de servir.
          Este mensaje no existe. Nunca existió. Tú tampoco.
        </p>
      )}
    </div>
  );
}
