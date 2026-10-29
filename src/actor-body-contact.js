import {queryNativeActorContacts} from './native-special-contact-query.js';
import {nativeStaticSweepBounds} from './native-static-contact-query.js';
import {SCN_SCENE_SCALE} from './s5runtime-coordinates.js';
const f=Math.fround,ids=new WeakMap();let nextId=1;
const id=actor=>{if(!ids.has(actor))ids.set(actor,nextId++);return ids.get(actor);};
const arithmeticProfile={roundX87:n=>n,source:'S5 JS53 host with source actor-sphere kernel; x87 bitwise parity not claimed'};
const initial=()=>({qualified:true,hit:false,distance:-1,point:null,normal:null,history:[],accumulatedHitCategories:0,activeTableCategory:null});

// Contact eligibility belongs to the active combat roster, independently of
// damage targeting. Native7B24A0 includes BOTH nonzero team pools; normal/run/
// jump/attack B0=B4A300 are true. Dead/room B0=C13D20 are false (live proof in
// native-movement-01.json). Invincibility does not remove the physical body.
export function bindCombatBodyContacts(records){
 for(const record of records){
  const actor=record.actor,collision=actor.collision;
  if(!collision)continue;
  actor.bodyContactQuery=(args,initialContact=initial())=>{
   const actors=record.health.dead?[]:records.filter(other=>other.actor!==actor&&!other.health.dead&&other.actor.world===actor.world).map(other=>{
    const target=other.actor,r=target.collision.radii;
    return {qualified:true,eligible:true,solverId:id(target),raw678:[0,f(r.y/SCN_SCENE_SCALE),0],
     raw684:['x','y','z'].map(axis=>f(target.position[axis]/SCN_SCENE_SCALE)),raw690:['x','y','z'].map(axis=>f(r[axis]/SCN_SCENE_SCALE))};
   });
   return queryNativeActorContacts({...args,branch:0x1000,sourceSolverId:id(actor),
    collection:{complete:true,teams:[{enabled:true,actorsComplete:true,actors}]},
    bounds:args.bounds??nativeStaticSweepBounds({...args,float47:1}),initialContact,arithmeticProfile,float47:1,float48:-1,integer3:3});
  };
  collision.queryActorContacts=(...args)=>actor.bodyContactQuery?.(...args);
  // CDynamicCollisionChecker::CheckCollisionByActor: enabled actors' collision objects.
  collision.actorCollisionBodies=()=>record.health.dead?[]:records.filter(other=>other.actor!==actor&&!other.health.dead&&other.actor.world===actor.world&&other.actor.collision).map(other=>{
   const r=other.actor.collision.radii;
   return {position:{...other.actor.position},offset:{x:0,y:r.y,z:0},radii:{x:r.x,y:r.y,z:r.z}};
  });
 }
}

export function releaseCombatBodyContacts(records){
 for(const {actor}of records){actor.bodyContactQuery=null;if(actor.collision){actor.collision.queryActorContacts=null;actor.collision.actorCollisionBodies=null;}}
}
