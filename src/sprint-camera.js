import {BASE_FOV} from './input.js';
import {normalFov,sprintFov} from './camera-fov.js';

// CFastRunState::ms_runFov = 80 (SetZoomFOV on sprint entry).
// S5Runtime capture-20260923-191147-828660 showed 90 -> 110 -> 90 instead.
// Native camera 0x766237/0x766242: tick milliseconds * .01, clamped to 1.
// 0x766622-0x766672 then lerps the angle using this value * camera[0x15c].
// Captured camera[0x15c] is .5 both during sprint and on exit.
export const SPRINT_CAMERA=Object.freeze({rest:BASE_FOV,sprint:80,timeScale:10,response:.5});

export function updateSprintFov(camera,dt,sprinting){
  if(!Number.isFinite(dt)||dt<=0)return;
  // Constants above are the native defaults; targets follow the FOV setting.
  const target=sprinting?sprintFov():normalFov();
  const amount=Math.min(1,dt*SPRINT_CAMERA.timeScale)*SPRINT_CAMERA.response;
  const next=camera.fov+(target-camera.fov)*amount;
  if(next!==camera.fov){camera.fov=next;camera.updateProjectionMatrix();}
}
