import { useUnit } from "effector-react";
import {
  $isAutoBanModalOpen,
  closeAutoBanModal,
} from "../stores/autoBan.store";
import { autoBanFx } from "../actions/autoBan.action";
import Modal from "../../../components/ui/modal/Modal";
import Button from "../../../components/ui/button/Button";

// URL oficial del Ministerio de Sanidad
const LUDOPATIA_HELP_URL =
  "https://pnsd.sanidad.gob.es/ciudadanos/informacion/otrasAdicciones/home.htm";

export default function AutoBanModal() {
  const [isOpen, close, autoBan] = useUnit([
    $isAutoBanModalOpen,
    closeAutoBanModal,
    autoBanFx,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={close} size="smallPlus" position="center">
      <div className="text-white text-center space-y-6 p-4 sm:p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          ¿Quieres banear esta cuenta?
        </h2>

        <p className="text-lg md:text-xl leading-relaxed">
          Si tienes problemas con el juego o una adicción, te recomendamos que
          busques ayuda. Puedes aceptar la auto expulsión para protegerte a ti
          mismo. Esta acción cerrará tu cuenta y no podrás acceder durante 15
          días.
        </p>

        <a
          href={LUDOPATIA_HELP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-base md:text-lg font-semibold hover:text-Principal transition-colors duration-200"
        >
          Ayuda oficial del Ministerio de Sanidad
        </a>

        <div className="flex justify-center gap-6 pt-2">
          <Button variant="shortPlus" color="red" font="bold" onClick={autoBan}>
            Aceptar
          </Button>
          <Button variant="shortPlus" color="green" font="bold" onClick={close}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
