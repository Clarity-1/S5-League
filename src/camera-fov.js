import {BASE_FOV} from './input.js';

// Player-selected normal vertical FOV (Settings). CFPSCamera uses 66 for
// the center camera; sprint (CFastRunState::ms_runFov 80) keeps the native +14
// over the normal angle, so a wider setting does not shrink the sprint zoom.
export const FOV_RANGE=Object.freeze({min:50,max:100,step:1,default:BASE_FOV});
const SPRINT_FOV_OFFSET=80-BASE_FOV;
export const normalizeFov=value=>{
  const n=Number(value);
  return Number.isFinite(n)?Math.max(FOV_RANGE.min,Math.min(FOV_RANGE.max,Math.round(n))):FOV_RANGE.default;
};
let normal=FOV_RANGE.default;
export const normalFov=()=>normal;
export const sprintFov=()=>normal+SPRINT_FOV_OFFSET;
export function setNormalFov(value){normal=normalizeFov(value);return normal;}
