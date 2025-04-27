import { createEvent, createStore, sample } from "effector";
import { UserAdmin } from "../interfaces/UserAdmin.interface";
import { loadAdminUsersFx } from "../actions/loadUsersActions";
import { searchAdminUsersFx } from "../actions/searchUsersActions";
import { changeUserRoleFx } from "../actions/changeUserRoleAction";

export const loadAdminUsers = createEvent();
export const searchAdminUsers = createEvent<string>();
export const resetAdminUsers = createEvent();
export const changeAdminUserRole = createEvent<number>();

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

export const $adminUsers = createStore<UserAdmin[]>([])
  .on(loadAdminUsersFx.doneData, (_, users) => users)
  .on(searchAdminUsersFx.doneData, (_, users) => users)
  .reset(resetAdminUsers);
