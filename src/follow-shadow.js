import {Matrix4,Vector3} from 'three';

// The sun's orthographic shadow box follows the view instead of covering the
// whole map, so the same shadow map spends its texels near the player.
// The light direction stays exactly as the map set it. The box centre is snapped
// to whole shadow texels in light space, so edges do not shimmer while moving.
// Shadows of casters outside the box are not drawn; the box leans ahead of the
// camera to keep that boundary out of the usual view.
export const FOLLOW_SHADOW=Object.freeze({halfExtent:14,ahead:6,distance:100,depth:200});

const ORIGIN=new Vector3();
export function createFollowShadow(sun,options={}){
  const settings={...FOLLOW_SHADOW,...options};
  const direction=new Vector3(),from=new Vector3(),to=new Vector3(),focus=new Vector3();
  const basis=new Matrix4(),x=new Vector3(),y=new Vector3(),z=new Vector3();
  const api={
    enabled:true,
    // center: world point to keep shadowed (player feet); yaw: camera heading.
    update(center,yaw=null){
      if(!api.enabled||!sun.castShadow)return false;
      sun.getWorldPosition(from);sun.target.getWorldPosition(to);
      direction.subVectors(to,from);
      if(direction.lengthSq()<1e-12)return false;
      direction.normalize();
      focus.set(center.x,center.y,center.z);
      // Camera looks along -(sin yaw, cos yaw); bias the box toward that side.
      if(Number.isFinite(yaw))focus.x-=Math.sin(yaw)*settings.ahead,focus.z-=Math.cos(yaw)*settings.ahead;
      // Same basis as the shadow camera's lookAt (light -> target, camera.up).
      const camera=sun.shadow.camera;
      basis.lookAt(ORIGIN,direction,camera.up);basis.extractBasis(x,y,z);
      const texel=2*settings.halfExtent/sun.shadow.mapSize.x;
      const u=focus.dot(x),v=focus.dot(y);
      focus.addScaledVector(x,Math.round(u/texel)*texel-u).addScaledVector(y,Math.round(v/texel)*texel-v);
      to.copy(focus);from.copy(focus).addScaledVector(direction,-settings.distance);
      setWorldPosition(sun,from);setWorldPosition(sun.target,to);
      const h=settings.halfExtent;
      if(camera.left!==-h||camera.right!==h||camera.top!==h||camera.bottom!==-h||camera.near!==.1||camera.far!==settings.depth){
        Object.assign(camera,{left:-h,right:h,top:h,bottom:-h,near:.1,far:settings.depth});camera.updateProjectionMatrix();
      }
      return true;
    },
  };
  return api;
}

function setWorldPosition(object,world){
  object.position.copy(object.parent?object.parent.worldToLocal(world.clone()):world);
  object.updateMatrixWorld();
}
