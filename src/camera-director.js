import * as THREE from 'three';

export const CAMERA_MODES=Object.freeze({
 normal:'Normal',
 cinema:'Cinematic',
 free:'Free camera',
 'free-cinema':'Cinematic free camera',
});

export const normalizeCameraMode=value=>Object.hasOwn(CAMERA_MODES,value)?value:'normal';
export const isFreeCameraMode=mode=>normalizeCameraMode(mode).startsWith('free');
export const isCinematicCameraMode=mode=>normalizeCameraMode(mode).includes('cinema');

const damp=(rate,dt)=>1-Math.exp(-rate*Math.max(0,dt));

export class CameraDirector{
 constructor(followRig){
  this.followRig=followRig;this.mode='normal';this.held=new Set();this.freePosition=new THREE.Vector3();this.freeVelocity=new THREE.Vector3();this.freeReady=false;
  this.forward=new THREE.Vector3();this.right=new THREE.Vector3();this.move=new THREE.Vector3();this.desiredQuaternion=new THREE.Quaternion();
 }
 setMode(mode){
  const next=normalizeCameraMode(mode),wasFree=isFreeCameraMode(this.mode);this.mode=next;this.held.clear();this.freeVelocity.set(0,0,0);
  if(isFreeCameraMode(next)!==wasFree)this.freeReady=false;
  return this.mode;
 }
 get free(){return isFreeCameraMode(this.mode);}
 get cinematic(){return isCinematicCameraMode(this.mode);}
 keyDown(code){this.held.add(code);}
 keyUp(code){this.held.delete(code);}
 clear(){this.held.clear();this.freeVelocity.set(0,0,0);}
 update(camera,{player,yaw,pitch,distance,obstacles=[],collisionWorld=null,dt=0}){
  if(this.free)return this.updateFree(camera,{yaw,pitch,dt});
  const oldPosition=camera.position.clone(),oldQuaternion=camera.quaternion.clone();
  this.followRig.update(camera,player,yaw,pitch,distance,obstacles,{dt,collisionWorld});
  if(this.cinematic){
   const desiredPosition=camera.position.clone(),desiredQuaternion=camera.quaternion.clone();
   camera.position.copy(oldPosition).lerp(desiredPosition,damp(4,dt));
   camera.quaternion.copy(oldQuaternion).slerp(desiredQuaternion,damp(5,dt));
   this.constrain(camera,{player,obstacles});
  }
 }
 constrain(camera,{player,obstacles=[]}){
  if(!this.free)this.followRig.constrain?.(camera,player,obstacles);
 }
 updateFree(camera,{yaw,pitch,dt}){
  if(!this.freeReady){this.freePosition.copy(camera.position);this.freeReady=true;}
  this.forward.set(-Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
  this.right.set(Math.cos(yaw),0,-Math.sin(yaw));
  const forward=Number(this.held.has('KeyW')||this.held.has('ArrowUp'))-Number(this.held.has('KeyS')||this.held.has('ArrowDown'));
  const side=Number(this.held.has('KeyD')||this.held.has('ArrowRight'))-Number(this.held.has('KeyA')||this.held.has('ArrowLeft'));
  const vertical=Number(this.held.has('Space')||this.held.has('KeyE'))-Number(this.held.has('ControlLeft')||this.held.has('ControlRight')||this.held.has('KeyQ'));
  this.move.copy(this.forward).multiplyScalar(forward).addScaledVector(this.right,side);this.move.y+=vertical;
  if(this.move.lengthSq()>1)this.move.normalize();
  const speed=this.held.has('ShiftLeft')||this.held.has('ShiftRight')?12:5;
  this.move.multiplyScalar(speed);
  if(this.cinematic)this.freeVelocity.lerp(this.move,damp(this.move.lengthSq()?3.5:5,dt));else this.freeVelocity.copy(this.move);
  this.freePosition.addScaledVector(this.freeVelocity,Math.max(0,dt));
  camera.position.copy(this.freePosition);
  this.desiredQuaternion.setFromEuler(new THREE.Euler(-pitch,yaw,0,'YXZ'));
  if(this.cinematic)camera.quaternion.slerp(this.desiredQuaternion,damp(4,dt));else camera.quaternion.copy(this.desiredQuaternion);
 }
}
