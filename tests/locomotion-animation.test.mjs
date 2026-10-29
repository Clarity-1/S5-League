// Locomotion animation selection: RunState_SpyDagger and the
// damage-state walk legs (data-game script Lua), CRunState::SetAnimation and
// ActorState_FastRun.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Controller,TUNING} from '../src/controller.js';
import {MotionGraph,RUN_CLIPS,ATTACK_LEGS,SPRINT_ANIMATION_SPEED,SPRINT_BLEND_SECONDS} from '../src/motion-graph.js';
import {SPY_DAGGER_LOCOMOTION} from '../src/spy-dagger-data.js';

const dt=.016,box=(x,y,z,w,h,d)=>({minX:x-w/2,maxX:x+w/2,minY:y-h/2,maxY:y+h/2,minZ:z-d/2,maxZ:z+d/2});
const world=()=>({colliders:[box(0,-.35,0,46,.7,48)],spawn:{x:0,y:0,z:0},deathY:-50});

test('Spy Dagger run clips follow RunState_SpyDagger per direction',()=>{
  assert.deepEqual({...SPY_DAGGER_LOCOMOTION.run},{front:'SN004',leftFront:'SN005',left:'SN006',leftBack:'SN010',rightFront:'SN007',right:'SN008',rightBack:'SN011',back:'SN009'});
  assert.deepEqual({...SPY_DAGGER_LOCOMOTION.runLower},{front:'E0019',leftFront:'E0020',left:'E0021',leftBack:'E0025',rightFront:'E0022',right:'E0023',rightBack:'E0026',back:'E0024'});
});

test('generic run clips and attack legs keep native diagonals',()=>{
  assert.equal(RUN_CLIPS.leftFront,'SN005');assert.equal(RUN_CLIPS.rightBack,'SN011');
  assert.deepEqual([ATTACK_LEGS.leftFront,ATTACK_LEGS.rightFront,ATTACK_LEGS.leftBack,ATTACK_LEGS.rightBack],['G0019','G0021','G0024','G0025']);
});

function pose(input,ticks=10){
  const c=new Controller(world(),{weapon:'dagger'}),graph=new MotionGraph();let sample;
  for(let i=0;i<ticks;i++){c.step(dt,input(i));sample=graph.sample(c,dt);}
  return {c,sample};
}

test('run playback is GetMoveSpeedMax / 915 in every direction',()=>{
  const expected=TUNING.walk/TUNING.animationWalk;
  for(const [facing,x,z,clip] of [[0,0,1,'SN004'],[0,-1,0,'SN008'],[Math.PI,0,1,'SN009'],[0,-Math.SQRT1_2,Math.SQRT1_2,'SN007']]){
    const {sample}=pose(()=>({facing,x,z}));
    assert.equal(sample.clip,clip);
    assert.ok(Math.abs(sample.speed-expected)<1e-12,`${clip} speed ${sample.speed}`);
  }
});

test('sprint plays 00068 at 0.5 with a 200-tick blend',()=>{
  const {c,sample}=pose(i=>({facing:0,x:0,z:1,forward:1,forwardHeld:true,sprint:i>=2,forwardPressed:i===1||i===2,sprintPressed:i===2}),8);
  assert.equal(c.state,'sprint');
  assert.equal(sample.clip,'00068');
  assert.equal(sample.speed,SPRINT_ANIMATION_SPEED);
  assert.equal(sample.fade,SPRINT_BLEND_SECONDS);
});

test('Blender bold walk bundles still match one native source pair per direction',async()=>{
  const {readFile}=await import('node:fs/promises');
  const {SPY_DAGGER_DIRECTIONS}=await import('../src/spy-dagger-data.js');
  for(const sex of ['male','female']){
    const bundle=JSON.parse(await readFile(new URL(`../public/assets/animations/blender-walk-experiment/bold-${sex}.json`,import.meta.url),'utf8'));
    const resolved=bundle.clips.map(data=>SPY_DAGGER_DIRECTIONS.find(d=>data.source?.upper===SPY_DAGGER_LOCOMOTION.run[d]+':upper'&&data.source?.lower===SPY_DAGGER_LOCOMOTION.runLower[d]+':lower'));
    assert.ok(resolved.every(Boolean),sex+': unmatched source pair');
    assert.equal(new Set(resolved).size,8,sex+': duplicate direction');
  }
});