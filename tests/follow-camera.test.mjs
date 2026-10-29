// Follow camera (src/camera-rig.js): zoom/side easing and the target, side and boom sweeps.
import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera} from 'three';
import {ThirdPersonCamera,CAMERA_FRAMING,FOLLOW_CAMERA,clampCameraPitch} from '../src/camera-rig.js';
import {normalFov,sprintFov,setNormalFov,normalizeFov,FOV_RANGE} from '../src/camera-fov.js';

const box=(x,y,z,w,h,d)=>({minX:x-w/2,maxX:x+w/2,minY:y-h/2,maxY:y+h/2,minZ:z-d/2,maxZ:z+d/2});
const floor=box(0,-.35,0,46,.7,48);
const near=(a,b,t,m)=>assert.ok(Math.abs(a-b)<=t,`${m}: ${a} vs ${b}`);
const player={x:0,y:0,z:0};

function settle(world,{yaw=0,pitch=0,frames=60,dt=.016}={}){
  const rig=new ThirdPersonCamera(),camera=new PerspectiveCamera();
  for(let i=0;i<frames;i++)rig.update(camera,player,yaw,pitch,CAMERA_FRAMING.distance,[],{dt,collisionWorld:world});
  return {rig,camera};
}

test('open space: target 350 up, side 50 right, boom 500 back',()=>{
  const {rig,camera}=settle({colliders:[floor]});
  near(rig.sideOffset,CAMERA_FRAMING.shoulder,1e-12,'side offset');
  near(rig.zoom,CAMERA_FRAMING.distance,1e-9,'zoom');
  // The free sweep trims epsilon * radius along each move, as for actors.
  near(camera.position.x,CAMERA_FRAMING.shoulder,.01,'x');
  near(camera.position.y,CAMERA_FRAMING.aimHeight,.01,'y');
  near(camera.position.z,CAMERA_FRAMING.distance,.01,'z');
});

test('a wall behind shortens the zoom at once, then it eases back',()=>{
  const wall=box(0,2,1.5,10,4,.2);
  const world={colliders:[floor,wall]};
  const {rig,camera}=settle(world);
  assert.ok(camera.position.z<1.4-FOLLOW_CAMERA.radius+.01,`z ${camera.position.z}`);
  const blocked=rig.zoom;assert.ok(blocked<1.5);
  // Remove the wall: one 16 ms frame recovers 16% of the gap.
  world.colliders=[floor];
  rig.update(camera,player,0,0,CAMERA_FRAMING.distance,[],{dt:.016,collisionWorld:world});
  near(rig.zoom,blocked+.16*(CAMERA_FRAMING.distance-blocked),1e-9,'zoom recovery');
});

test('the side offset ramps one native unit per millisecond',()=>{
  const rig=new ThirdPersonCamera(),camera=new PerspectiveCamera();
  rig.update(camera,player,0,0,CAMERA_FRAMING.distance,[],{dt:.016,collisionWorld:{colliders:[floor]}});
  near(rig.sideOffset,16*.006,1e-12,'after 16 ms');
});

test('pitch is limited to 89 degrees and starts at 20',()=>{
  near(clampCameraPitch(3),89*Math.PI/180,1e-12,'upper');
  near(clampCameraPitch(-3),-89*Math.PI/180,1e-12,'lower');
  near(FOLLOW_CAMERA.initialPitch,20*Math.PI/180,1e-12,'initial');
});

test('FOV setting is clamped and sprint keeps the native +14',()=>{
  assert.equal(FOV_RANGE.default,66);
  assert.equal(normalizeFov(200),FOV_RANGE.max);
  assert.equal(normalizeFov('x'),66);
  setNormalFov(90);
  assert.equal(normalFov(),90);assert.equal(sprintFov(),104);
  setNormalFov(66);assert.equal(sprintFov(),80);
});
