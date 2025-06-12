import { createEvent, createStore, sample } from "effector";
import { UserAdmin } from "../interfaces/UserAdmin.interface";
import { loadAdminUsersFx } from "../actions/loadUsersActions";
import { searchAdminUsersFx } from "../actions/searchUsersActions";
import { changeUserRoleFx } from "../actions/changeUserRoleAction";
import { banUserFx } from "../actions/banUserAction";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../../utils/errorUtils";

export const loadAdminUsers = createEvent();
export const searchAdminUsers = createEvent<string>();
export const resetAdminUsers = createEvent();
export const changeAdminUserRole = createEvent<number>();
export const banAdminUser = createEvent<number>();

sample({
  clock: loadAdminUsers,
  target: loadAdminUsersFx,
});

sample({
  clock: searchAdminUsers,
  target: searchAdminUsersFx,
});

sample({
  clock: changeAdminUserRole,
  target: changeUserRoleFx,
});

sample({
  clock: banAdminUser,
  target: banUserFx,
});

changeUserRoleFx.failData.watch((error) => {
  toast.error(getErrorMessage(error), {
    id: "change_user_role_error",
    className: "text-lg font-bold p-3",
  });
});

banUserFx.failData.watch((error) => {
  toast.error(getErrorMessage(error), {
    id: "ban_user_error",
    className: "text-lg font-bold p-3",
  });
});



export const $adminUsers = createStore<UserAdmin[]>([])
  .on(loadAdminUsersFx.doneData, (_, users) => users)
  .on(searchAdminUsersFx.doneData, (_, users) => users)
  .reset(resetAdminUsers);
