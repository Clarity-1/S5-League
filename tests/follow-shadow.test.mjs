// Player-following sun shadow box (src/follow-shadow.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import {DirectionalLight,Scene,Vector3} from 'three';
import {createFollowShadow,FOLLOW_SHADOW} from '../src/follow-shadow.js';

function sun(){
  const scene=new Scene(),light=new DirectionalLight();light.position.set(-15,30,20);light.castShadow=true;scene.add(light);
  light.shadow.mapSize.set(4096,4096);return light;
}
const dir=light=>light.target.getWorldPosition(new Vector3()).sub(light.getWorldPosition(new Vector3())).normalize();

test('keeps the map light direction and centres a fixed box on the player',()=>{
  const light=sun(),before=dir(light),follow=createFollowShadow(light);
  assert.equal(follow.update({x:10,y:0,z:-5}),true);
  assert.ok(dir(light).distanceTo(before)<1e-12);
  const c=light.shadow.camera,h=FOLLOW_SHADOW.halfExtent;
  assert.deepEqual([c.left,c.right,c.top,c.bottom],[-h,h,h,-h]);
  // The target sits within one texel of the player (texel snapping only).
  const texel=2*h/4096;
  assert.ok(light.target.getWorldPosition(new Vector3()).distanceTo(new Vector3(10,0,-5))<=texel*Math.SQRT2+1e-9);
  assert.ok(Math.abs(light.getWorldPosition(new Vector3()).distanceTo(light.target.getWorldPosition(new Vector3()))-FOLLOW_SHADOW.distance)<1e-9);
});

test('sub-texel movement keeps the shadow box on the same texel grid',()=>{
  const light=sun(),follow=createFollowShadow(light);
  follow.update({x:3,y:0,z:3});const a=light.position.clone();
  follow.update({x:3+1e-4,y:0,z:3});
  // Only motion along the light axis remains: same texels in the ortho map.
  const moved=light.position.clone().sub(a);
  assert.ok(moved.clone().cross(dir(light)).length()<1e-9,'no shimmer for a sub-texel step');
  follow.update({x:4,y:0,z:3});
  assert.ok(light.position.distanceTo(a)>.5,'recentres on real movement');
});

test('leans ahead of the camera and can be disabled',()=>{
  const light=sun(),follow=createFollowShadow(light);
  follow.update({x:0,y:0,z:0},0);
  // yaw 0 looks toward -z: the box centre moves ahead by FOLLOW_SHADOW.ahead.
  assert.ok(Math.abs(light.target.position.z+FOLLOW_SHADOW.ahead)<.01);
  follow.enabled=false;const p=light.position.clone();
  assert.equal(follow.update({x:50,y:0,z:50}),false);
  assert.ok(light.position.equals(p));
});
