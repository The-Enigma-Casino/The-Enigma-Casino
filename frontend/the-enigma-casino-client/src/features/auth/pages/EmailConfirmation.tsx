import { useNavigate, useParams } from "react-router-dom";
import ConfirmationComponent from "../components/layouts/ConfirmationComponent";
import { useEffect } from "react";

function EmailConfirmation() {

  const { token } = useParams();
   const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/error", { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;
  return (
    <ConfirmationComponent token={token} />
  );
}

export default EmailConfirmation;
