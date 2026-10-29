// Regression coverage for the actor physics fixes (src/actor-collision.js
// and Controller.moveBody). Expected values follow:
// CActor::UpdateGravity, CActor::Move, CCollisionObject::CollideWith/Update,
// CFallState/CRunState/CJumpState FixedUpdate and GameTempo FREE values.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Controller,TUNING} from '../src/controller.js';
import {EllipsoidWorld} from '../src/collision.js';
import {ActorCollisionObject,actorMove,sweepTriangle,getLowestRoot,checkPointInTriangle,ACTOR_COLLISION} from '../src/actor-collision.js';

const dt=.016,U=.006,EPS=ACTOR_COLLISION.epsilon;
const RADIUS_X=100,RADIUS_Y=160,REST=RADIUS_Y*EPS; // native units
const box=(x,y,z,w,h,d)=>({minX:x-w/2,maxX:x+w/2,minY:y-h/2,maxY:y+h/2,minZ:z-d/2,maxZ:z+d/2});
const floor=box(0,-.35,0,46,.7,48);
const native=n=>n/U;
const near=(actual,expected,tolerance,message)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${message}: ${actual} vs ${expected}`);
function simulate(world,input,ticks){
  const c=new Controller({deathY:-50,...world}),rows=[];
  for(let i=0;i<ticks;i++){c.step(dt,input(i,c));rows.push({p:{...c.position},v:{...c.velocity},grounded:c.grounded,events:c.events.slice()});}
  return {c,rows};
}
const planar=(a,b)=>native(Math.hypot(b.p.x-a.p.x,b.p.z-a.p.z));

test('GetLowestRoot only accepts roots strictly inside (0, max)',()=>{
  assert.equal(getLowestRoot(1,-3,2,5),1);
  assert.equal(getLowestRoot(1,-3,2,1),null);
  assert.equal(getLowestRoot(1,1,-2,5),1);
  assert.equal(getLowestRoot(1,0,1,5),null);
});

test('CheckPointInTriangle uses the sign-bit test on barycentric terms',()=>{
  const a={x:0,y:0,z:0},e10={x:1,y:0,z:0},e20={x:0,y:0,z:1};
  assert.equal(checkPointInTriangle({x:.25,y:0,z:.25},a,e10,e20),true);
  assert.equal(checkPointInTriangle({x:2,y:0,z:2},a,e10,e20),false);
  assert.equal(checkPointInTriangle({x:.25,y:0,z:-1e-12},a,e10,e20),false);
  // On the e10 edge both terms are +0: accepted.
  assert.equal(checkPointInTriangle({x:.5,y:0,z:0},a,e10,e20),true);
});

test('an embedded sphere skips the face test and only meets edges or vertices',()=>{
  const v0={x:-5,y:0,z:-5},v1={x:-5,y:0,z:5},v2={x:5,y:0,z:5};
  const vel={x:0,y:-1,z:0},lenSq=1;
  const outside=sweepTriangle({x:-3,y:1.5,z:2},vel,lenSq,v0,v1,v2);
  near(outside.t,.5,1e-12,'face contact time');
  assert.equal(sweepTriangle({x:-3,y:.9,z:2},vel,lenSq,v0,v1,v2),null);
});

test('idle actor rests radius.y * epsilon above the floor and stays grounded',()=>{
  const {rows}=simulate({colliders:[floor],spawn:{x:0,y:0,z:0}},()=>({facing:0}),60);
  for(const row of rows){assert.ok(row.grounded);near(native(row.p.y),REST,1e-9,'rest height');}
});

test('ground run speed loses the native free-travel epsilon each tick, with CRunState rates',()=>{
  const forward=simulate({colliders:[floor],spawn:{x:0,y:0,z:0}},()=>({facing:0,x:0,z:1}),20).rows;
  near(planar(forward[10],forward[11])*1,TUNING.walk/U*dt-RADIUS_X*EPS,1e-6,'forward step');
  const back=simulate({colliders:[floor],spawn:{x:0,y:0,z:0}},()=>({facing:Math.PI,x:0,z:1}),20).rows;
  near(planar(back[10],back[11]),TUNING.walk/U*.9*dt-RADIUS_X*EPS,1e-6,'back step');
});

test('jump apex follows UpdateGravity with the epsilon-trimmed rising moves',()=>{
  const {rows}=simulate({colliders:[floor],spawn:{x:0,y:0,z:0}},i=>({facing:0,jump:i===0}),80);
  let expected=REST;
  for(let v=TUNING.jump/U-7500*dt;v>0;v-=7500*dt){const step=v*dt;if(step>RADIUS_Y*EPS)expected+=step-RADIUS_Y*EPS;}
  near(Math.max(...rows.map(r=>native(r.p.y))),expected,1e-6,'apex');
  assert.ok(rows.at(-1).grounded);
  near(native(rows.at(-1).p.y),REST,1e-6,'landing rest');
});

test('walking off a ledge: terminal probe, then FALL at 0.1 * max gravity velocity',()=>{
  const {rows}=simulate({colliders:[floor,box(0,1.5,0,4,3,4)],spawn:{x:0,y:3,z:0}},()=>({facing:0,x:0,z:1}),60);
  const leave=rows.findIndex(r=>!r.grounded);
  assert.ok(leave>0);
  assert.ok(rows[leave].events.includes('levitate'));
  near(native(rows[leave].v.y),-750,1e-9,'fall entry velocity');
  // The terminal probe may slide around the rim, so it drops at most terminal*dt.
  const drop=native(rows[leave-1].p.y-rows[leave].p.y);
  assert.ok(drop>0&&drop<=7500*dt+1e-9,'probe drop '+drop);
  near(native(rows[leave+1].v.y),-750-7500*dt,1e-9,'next velocity');
  assert.ok(rows.at(-1).grounded);
});

test('the grounded probe keeps support across drops shorter than terminal * dt',()=>{
  const {rows}=simulate({colliders:[floor,box(0,.125,3,4,.25,2.8)],spawn:{x:0,y:0,z:0}},()=>({facing:0,x:0,z:1}),60);
  assert.ok(rows.every(r=>r.grounded));
  assert.ok(rows.at(-1).p.z>4.4);
});

test('CFallState air control has no back or side rate',()=>{
  const fall=facing=>{
    const {rows}=simulate({colliders:[floor,box(0,1.5,0,4,3,4)],spawn:{x:0,y:3,z:0}},()=>({facing,x:0,z:1}),60);
    const leave=rows.findIndex(r=>!r.grounded);return planar(rows[leave+2],rows[leave+3]);
  };
  near(fall(Math.PI),fall(0),1e-6,'backward vs forward fall speed');
  near(fall(0),TUNING.walk/U*dt-RADIUS_X*EPS,1e-6,'fall step');
});

test('a fall from height does not tunnel through a 0.2 m slab',()=>{
  const {rows}=simulate({colliders:[floor,box(0,3.6,0,6,.2,6)],spawn:{x:0,y:40,z:0}},()=>({facing:0}),200);
  assert.ok(rows.at(-1).grounded);
  near(native(rows.at(-1).p.y),native(3.7)+REST,1e-6,'slab rest');
});

test('wall jump needs the last found collision, not a probe ahead of the actor',()=>{
  const run=startZ=>{
    const {rows}=simulate({colliders:[floor,box(0,4,3,20,8,.5)],spawn:{x:0,y:0,z:startZ}},
      i=>({facing:0,x:0,z:1,forward:1,forwardHeld:true,jump:i===0||i===12}),40);
    return rows.some(r=>r.events.includes('walljump'));
  };
  assert.equal(run(1.5),true);
  assert.equal(run(.3),false);
});

test('a jump press is handled on its own tick: no landing buffer',()=>{
  const first=simulate({colliders:[floor],spawn:{x:0,y:0,z:0}},i=>({facing:0,jump:i===0}),80).rows;
  const land=first.findIndex((r,i)=>i>0&&r.grounded);
  assert.ok(land>3);
  // Pressed three ticks (48 ms) before touchdown, while still airborne.
  const {rows}=simulate({colliders:[floor],spawn:{x:0,y:0,z:0}},i=>({facing:0,jump:i===0||i===land-3}),land+20);
  assert.equal(rows.filter(r=>r.events.includes('jump')).length,1);
});

test('no jump after support is lost (CFallState has no ground jump)',()=>{
  const walk=simulate({colliders:[floor,box(0,1.5,0,4,3,4)],spawn:{x:0,y:3,z:0}},()=>({facing:0,x:0,z:1}),60).rows;
  const leave=walk.findIndex(r=>!r.grounded);
  const {rows}=simulate({colliders:[floor,box(0,1.5,0,4,3,4)],spawn:{x:0,y:3,z:0}},i=>({facing:0,x:0,z:1,jump:i===leave+1}),leave+4);
  assert.equal(rows.some(r=>r.events.includes('jump')),false);
});

test('CheckCollisionByActor stops the mover at the summed radii minus epsilon',()=>{
  const world=new EllipsoidWorld({colliders:[floor]},{x:.6,y:.96,z:.6});
  const other={position:{x:0,y:REST*U,z:2},offset:{x:0,y:.96,z:0},radii:{x:.6,y:.96,z:.6}};
  const body=new ActorCollisionObject(world,{radii:{x:.6,y:.96,z:.6},offset:{x:0,y:.96,z:0},actorBodies:()=>[other]});
  body.setPosition({x:0,y:REST*U,z:0});
  for(let i=0;i<60;i++){body.landing=false;actorMove(body,{x:0,y:-7500*U*dt,z:0});actorMove(body,{x:0,y:0,z:1320*U*dt});}
  assert.ok(body.position.z<2-1.2&&body.position.z>2-1.2-.6*EPS*2,`z ${body.position.z}`);
});

// Corridor: wall jump off the +z wall, fly into the -z wall (reached in flight).
function corridor(jumpTick,{towardFrom=Infinity}={}){
  const {rows}=simulate({colliders:[floor,box(0,4,3,20,8,.5),box(0,4,-3,20,8,.5)],spawn:{x:0,y:0,z:1.5}},(i,c)=>{
    const toward=i>=towardFrom;
    return {facing:c.facing,x:0,z:toward?-1:1,forward:toward?-1:1,forwardHeld:!toward,backwardHeld:toward,jump:i===0||i===12||i===jumpTick};
  },80);
  return rows.filter(r=>r.events.includes('walljump')).length;
}

test('CBoundJumpState rebounds only during the rising flight',()=>{
  assert.equal(corridor(45),2,'press during the 500 ms flight rebounds');
  assert.equal(corridor(60,{towardFrom:50}),1,'press during the fall, still touching the wall, does not');
});

test('a vertical jump (no direction at takeoff) cannot wall jump',()=>{
  const {rows}=simulate({colliders:[floor,box(0,4,3,20,8,.5)],spawn:{x:0,y:0,z:2}},i=>({facing:0,x:0,z:i===0?0:1,forward:i===0?0:1,forwardHeld:i>0,jump:i===0||i===8}),40);
  assert.equal(rows.some(r=>r.events.includes('walljump')),false);
});

test('after a dodge ends airborne (CFallState), no wall jump until landing',()=>{
  const world={colliders:[floor,box(0,15,1,20,30,.5),box(0,29.75,-1,4,.5,2.4)],spawn:{x:0,y:30,z:-1.5}};
  let touched=false;
  const {rows}=simulate(world,(i,c)=>{
    if(i>=50&&!c.grounded){touched||=!!c.wallCollisionContact();return {facing:0,x:0,z:1,forward:1,forwardHeld:true,jump:i%3===0};}
    if(i===0)return {facing:0,x:0,z:1,forward:1,forwardHeld:true,jump:true};
    if(i===3)return {facing:0,x:-1,z:0,side:1,rightHeld:true,dodge:true};
    return {facing:0,x:0,z:0};
  },140);
  assert.ok(rows.some(r=>r.events.includes('airdash')),'air dodge happened');
  assert.ok(touched,'falling against the wall');
  assert.equal(rows.some(r=>r.events.includes('walljump')),false);
});
