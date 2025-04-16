import OtherUserProfile from "./pages/OtherUserProfile";
import UserProfile from "./pages/UserProfile";
import ProfileLayout from "./ProfileLayout";


const routeProfile = [
  {
    path: "/profile",
    element: <ProfileLayout />, 
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

