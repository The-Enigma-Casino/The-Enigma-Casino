import { FriendsModal } from "../modal/FriendsModal";


const FriendPage: React.FC = () => {
  return(
    <>
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <FriendsModal />
    </div>
    </>
  )
}

export default FriendPage;