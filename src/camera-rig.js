import {Vector3} from 'three';
import {EllipsoidWorld} from './collision.js';
import {ActorCollisionObject} from './actor-collision.js';
import {SCN_SCENE_SCALE} from './s5runtime-coordinates.js';

const U=SCN_SCENE_SCALE;
// CFPSCamera(66, 350, 50, 500, 0, 500) from CCameraManager::InitGamePlaySetting:
// height offset 350, center side offset 50, zoom 500 (min 0, max 500).
export const CAMERA_FRAMING=Object.freeze({shoulder:50*U,aimHeight:350*U,distance:500*U});
export const FOLLOW_CAMERA=Object.freeze({
  radius:20*U,            // camera collision sphere SetEllipsoidRadius(20, 20, 20)
  actorHalfHeight:160*U,  // GetOrigBoundHeight() * 0.5
  ceilingDrop:5*U,        // m_vTargetPos.y -= 5 after a hit while rising
  minDist:0,
  initialPitch:20*Math.PI/180, // m_fRotAxisX(20)
  pitchLimit:89*Math.PI/180,   // LIMIT_ANGLE
});
export const clampCameraPitch=pitch=>Math.max(-FOLLOW_CAMERA.pitchLimit,Math.min(FOLLOW_CAMERA.pitchLimit,pitch));

// The camera sphere uses _TYPE_CAMERA_COLLISION geometry. S5 maps have no
// separate camera collision layer, so it sweeps the actor's static triangles.
const cameraWorlds=new WeakMap();
function cameraWorld(source){
  let world=cameraWorlds.get(source);
  if(!world){const r=FOLLOW_CAMERA.radius;world=new EllipsoidWorld(source,{x:r,y:r,z:r});cameraWorlds.set(source,world);}
  return world;
}

// Follow camera: CFPSCamera::Update (zoom recovery, side offset) and EndUpdate (target,
// side and boom sweeps with a non-sliding sphere). The view direction comes
// straight from yaw/pitch, with no follow lag (CalcPos is not used).
export class ThirdPersonCamera {
  constructor(){this.zoom=null;this.sideOffset=0;this.body=null;this.source=null;this.boom=new Vector3();}
  reset(){this.zoom=null;this.sideOffset=0;}
  bodyFor(source){
    if(this.source!==source){
      const r=FOLLOW_CAMERA.radius;
      this.body=new ActorCollisionObject(cameraWorld(source),{radii:{x:r,y:r,z:r},offset:{x:0,y:0,z:0},slide:false});
      this.source=source;
    }
    return this.body;
  }
  update(camera,player,yaw,pitch,distance,obstacles=[],{dt=0,collisionWorld=null}={}){
    const baseZoom=distance,minDist=FOLLOW_CAMERA.minDist,ms=Math.max(0,dt)*1000;
    if(this.zoom===null)this.zoom=baseZoom;
    // m_fTimeDelta = min(1, uiTimeDelta * 0.01); zoom eases back toward base.
    this.zoom+=Math.min(1,ms*.01)*(baseZoom-this.zoom);
    // Side offset moves one native unit per millisecond toward its goal.
    const goal=CAMERA_FRAMING.shoulder,step=ms*U;
    this.sideOffset=this.sideOffset<goal?Math.min(goal,this.sideOffset+step):Math.max(goal,this.sideOffset-step);
    const boom=this.boom.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
    const right={x:Math.cos(yaw),z:-Math.sin(yaw)};
    let position;
    if(!collisionWorld){
      position={x:player.x+right.x*this.sideOffset+boom.x*this.zoom,y:player.y+CAMERA_FRAMING.aimHeight+boom.y*this.zoom,z:player.z+right.z*this.sideOffset+boom.z*this.zoom};
    }else{
      const body=this.bodyFor(collisionWorld),half=FOLLOW_CAMERA.actorHalfHeight;
      body.resetInfo();
      body.setPosition({x:player.x,y:player.y+half,z:player.z});
      body.update({x:player.x,y:player.y+CAMERA_FRAMING.aimHeight,z:player.z});
      const target=body.getPosition();
      if(body.info.type!==0)target.y-=FOLLOW_CAMERA.ceilingDrop;
      body.setPosition(target);
      body.update({x:target.x+right.x*this.sideOffset,y:target.y,z:target.z+right.z*this.sideOffset});
      // The minDist (0) boom move is a no-op Update, so the side move's hit
      // decides: any hit there snaps the zoom to minDist.
      if(body.info.type===0){
        if(this.zoom!==minDist&&baseZoom>minDist){
          const previous=body.getPosition(),length=this.zoom-minDist;
          body.update({x:previous.x+boom.x*length,y:previous.y+boom.y*length,z:previous.z+boom.z*length});
          if(body.info.type!==0){
            const current=body.getPosition(),travelled=Math.hypot(current.x-previous.x,current.y-previous.y,current.z-previous.z)+minDist;
            if(travelled<this.zoom)this.zoom=travelled;
          }
        }
      }else this.zoom=minDist;
      position=body.getPosition();
    }
    camera.position.set(position.x,position.y,position.z);
    camera.rotation.set(-pitch,yaw,0,'YXZ');
  }
  // No extra near-plane correction after shake or interpolation.
  constrain(){}
}
