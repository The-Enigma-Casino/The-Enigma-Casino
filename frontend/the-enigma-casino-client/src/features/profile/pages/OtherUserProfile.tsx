import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUnit } from "effector-react";
import UserInfo from "../components/UserInfo";
import UserHistory from "../components/UserHistory";
import { $userId } from "../../auth/store/authStore";
import { loadOtherUserProfile, loadOtherUserHistory } from "../store/otherProfile/otherProfileEvents";
import { $allCountries } from "../../countries/actions/countriesActions";

import { $otherUserProfile, $otherUserHistory, $otherUserHistoryPage, $otherUserHistoryTotalPages } from "../store/otherProfile/otherProfileStore";
import { countriesFx } from "../../countries/actions/countriesActions";
import { decodeId } from "../../../utils/sqidUtils";

const OtherUserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const profile = useUnit($otherUserProfile);
  const games = useUnit($otherUserHistory);
  const page = useUnit($otherUserHistoryPage);
  const totalPages = useUnit($otherUserHistoryTotalPages);
  const userIdToken = useUnit($userId);
  const countries = useUnit($allCountries);
  const navigate = useNavigate();
  const decodedId = userId ? decodeId(userId) : undefined;
  useEffect(() => {
    if (countries.length === 0) {
      countriesFx();
    }
  });
  console.log("otherprofile", profile);

  useEffect(() => {
    if (!userId || decodedId === null) return;

    if (decodedId === Number(userIdToken)) {
      navigate("/profile", { replace: true });
      return;
    }

    loadOtherUserProfile(userId);
    loadOtherUserHistory({ userId: String(decodedId), page: 1 });
  }, [userId, decodedId, userIdToken, navigate]);

  if (!profile) {
    return (
      <div className="text-white text-center mt-10">
        Cargando perfil del jugador...
      </div>
    );
  }
  return (
    <div className="bg-Background-Page">
      <UserInfo user={decodedId !== undefined ? { ...profile, id: decodedId } : profile} relations={profile.relation} />

      <div className="flex justify-center my-10">
        <h2 className="text-white text-3xl font-bold">Historial de Partidas</h2>
      </div>

      <UserHistory
        games={games}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => {
          if (!userId) return;
          loadOtherUserHistory({ userId, page: p });
        }}
      />
    </div>
  );
};

export default OtherUserProfile;
