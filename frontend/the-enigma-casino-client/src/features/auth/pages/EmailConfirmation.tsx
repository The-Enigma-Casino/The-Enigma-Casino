import { useParams } from "react-router-dom";
import ConfirmationComponent from "../components/layouts/ConfirmationComponent";

function EmailConfirmation() {

  const { token } = useParams();

  if (!token) {
    return <p>Error: No se proporcionó un token.</p>;
  }

  return (
    <ConfirmationComponent token={token} />
  );
}

export default EmailConfirmation;