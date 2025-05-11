import OtherUserProfile from "./pages/OtherUserProfile";
import UserProfile from "./pages/UserProfile";
import ProfileLayout from "./ProfileLayout";
import { AuthGuard } from "../../guards/AuthGuard";

const routeProfile = [
  {
    path: "/profile",
    element: (
      <AuthGuard>
        <ProfileLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <UserProfile />,
      },
      {
        path: ":userId",
        element: <OtherUserProfile />,
      },
    ],
  },
];

export default routeProfile;
