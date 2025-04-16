// src/features/profile/store.ts
import { createStore } from 'effector';
import { getOtherUserProfileFx, getUserProfileFx } from './profileEffects';

export const $userProfile = createStore(null)
  .on(getUserProfileFx.doneData, (_, profile) => profile)  
  .reset(getUserProfileFx.failData); 

export const $otherUserProfile = createStore(null) 
.on(getOtherUserProfileFx.doneData, (_, profile) => profile)  
.reset(getOtherUserProfileFx.failData);
