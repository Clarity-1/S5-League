import {BASE_FOV} from './input.js';
import {CANNONADE_ZOOM} from './cannonade-runtime.js';
import {normalFov} from './camera-fov.js';

// Native766237/766622..766672: float32 tick amount, response and lerp.
// The live bootstrap supplies a float64 millisecond delta at76620D rather
// than the PE's integer conversion (native-zoom/live-camera-code-v1.json).
// Both-sex polling v1/v2 observes initial target15 for the first angle update,
// then45, response1.5; exit restores90 with1.75 (768140/7681E0).
// The external hook causing the15->45 target change is not decoded. This is
// the observed reference profile, not a universal clamp for other weapons.
export const CANNONADE_CAMERA=Object.freeze({initialTarget:CANNONADE_ZOOM.catalogueFov,
 target:CANNONADE_ZOOM.fov,rest:BASE_FOV,enterResponse:1.5,exitResponse:1.75,
 tickScale:Math.fround(.01),evidence:'work/cannonade-recovery/native-zoom-transition-v2.json'});
const f=Math.fround;
export function nativeCameraAngleStep(angle,target,tickAmount,response){
 const amount=Math.min(1,f(f(tickAmount)*f(response)));
 return f(f(angle)+f(f(f(target)-f(angle))*amount));
}
export function createCannonadeCameraState(){return {zoomed:false,firstTick:false,returning:false};}
export function advanceCannonadeCamera(camera,state,tickAmount,zoomed){
 if(zoomed!==state.zoomed){state.zoomed=zoomed;state.firstTick=zoomed;state.returning=!zoomed;}
 if(!zoomed&&!state.returning)return false;
 if(!Number.isFinite(tickAmount)||tickAmount<=0)return true;
 // Zoom-out returns to the FOV setting (CANNONADE_CAMERA.rest is its default).
 const rest=normalFov(),target=zoomed?(state.firstTick?CANNONADE_CAMERA.initialTarget:CANNONADE_CAMERA.target):rest;
 const response=zoomed?CANNONADE_CAMERA.enterResponse:CANNONADE_CAMERA.exitResponse;
 const previous=camera.fov,next=nativeCameraAngleStep(previous,target,Math.min(1,tickAmount),response);
 if(next!==camera.fov){camera.fov=next;camera.updateProjectionMatrix();}
 state.firstTick=false;
 // Float32 lerp can settle a few ULPs below90 at high render rates. End its
 // ownership at that fixed point so ordinary sprint camera control can resume.
 if(!zoomed&&(next===rest||next===previous))state.returning=false;
 return true;
}
export function updateCannonadeFov(camera,state,dt,zoomed){
 const tick=Number.isFinite(dt)&&dt>0?Math.min(1,f(f(dt*1000)*CANNONADE_CAMERA.tickScale)):0;
 return advanceCannonadeCamera(camera,state,tick,zoomed);
}
