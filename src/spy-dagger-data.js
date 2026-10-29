// Classic item 2000006, current archive CRC/SHA and exact Lua bodies:
// work/melee-batch/dagger/source-contract.json (2026-10-03).
// Declarations are not a claim of measured native damage or visual fidelity.
import {cutClipSample,rushClipSample} from './spy-dagger-timing.js';

export const SPY_DAGGER_ITEM = Object.freeze({key:2000006,nativeType:24,power:12.2,range:250,moveSpeedRate:1.2,attackMoveSpeedRate:1.2});
export const SPY_DAGGER_DIRECTIONS = Object.freeze(['front','rightFront','right','rightBack','back','leftBack','left','leftFront']);
// CRunState: m_eSubState indexes the Lua anim list directly, and LEFT
// means cross(actorDir, moveDir).y < 0, i.e. the actor's own left. The
// earlier S5 diagonal swap (S5Runtime comparison) is dropped.
export const SPY_DAGGER_DIRECTIONAL_MAPPING = Object.freeze({front:'FRONT',rightFront:'RIGHT_FRONT',right:'RIGHT',rightBack:'RIGHT_BACK',back:'BACK',leftBack:'LEFT_BACK',left:'LEFT',leftFront:'LEFT_FRONT'});
const directionalMapping = source => Object.freeze(Object.fromEntries(SPY_DAGGER_DIRECTIONS.map(d=>[d,source[SPY_DAGGER_DIRECTIONAL_MAPPING[d]]])));
export const SPY_DAGGER_SOURCE_RUN = Object.freeze({
  upper:Object.freeze({FRONT:'SN004',LEFT_FRONT:'SN005',LEFT:'SN006',RIGHT_FRONT:'SN007',RIGHT:'SN008',BACK:'SN009',LEFT_BACK:'SN010',RIGHT_BACK:'SN011'}),
  lower:Object.freeze({FRONT:'E0019',LEFT_FRONT:'E0020',LEFT:'E0021',RIGHT_FRONT:'E0022',RIGHT:'E0023',BACK:'E0024',LEFT_BACK:'E0025',RIGHT_BACK:'E0026'}),
});
export const SPY_DAGGER_SOURCE_CUT_LOWER = Object.freeze({FRONT:'DD005',LEFT_FRONT:'DD006',LEFT:'DD007',RIGHT_FRONT:'DD008',RIGHT:'DD009',BACK:'DD010',LEFT_BACK:'DD011',RIGHT_BACK:'DD012'});
export const SPY_DAGGER_LOCOMOTION = Object.freeze({
  idle:'SN002',run:directionalMapping(SPY_DAGGER_SOURCE_RUN.upper),runLower:directionalMapping(SPY_DAGGER_SOURCE_RUN.lower),
  loop:true,speed:1,reset:false,blendTicks:1000,fade:1000/4800,
  normalSource:'NormalState_SpyDagger',runSource:'RunState_SpyDagger',
});
export const SPY_DAGGER_CUT_LOWER = directionalMapping(SPY_DAGGER_SOURCE_CUT_LOWER);
export const SPY_DAGGER_EFFECTS = Object.freeze({
  cut:{source:'UseWeapon1State_SpyDagger',voice:{male:'Sound/voice_man_attack_2.ogg',female:'Sound/voice_girl_attack_2.ogg'},
    trail:{name:'GhostTrail_SpyDagger_01',beginMs:50,endMs:300,sceneIndex:0,shape:'Line01',texture:'image/gi.dds',blendType:0},sequence:null},
  rush:{source:'UseWeapon2State_SpyDagger',voice:{male:'Sound/voice_man_attack_3.ogg',female:'Sound/voice_girl_attack_3.ogg'},
    trail:null,sequence:{path:'Effects/shortknife01.seq',beginMs:0,endMs:5000}},
  impact:{sequence:'effects/weapon_mindshock_body.seq',cutSound:'sound/spydagger_cut_hit.ogg',rushSound:'sound/spydagger_poke_hit.ogg'},
  attack:{sequence:'effects/blank_1sec.seq',cutSound:'sound/spydagger_cut.ogg',rushSound:'sound/spydagger_poke.ogg'},
});
export const SPY_DAGGER_LIMITATIONS = Object.freeze([
  'Catalog power/range preset; effective equipment overrides and mitigation are not reconstructed.',
  'Lua passes AddtionalPower (misspelled); its global/binding behavior is unresolved. No extra power is silently added.',
  'No AlwaysCritical or DependOn declared; generic native critical/back-hit rules remain unverified.',
  'Cut MAKEFAN parameters feed the common static boolean port; native body calibration, contact point and filters remain unverified.',
  'SwordJumpAtkState_SpyDagger declares SN003/SN000 but classic weapon_lua has no left_jump binding. Existing aerial cut is retained separately.',
  'Rush sequence shortknife01 and native impact sequence require resource closure and observation in the main game.',
]);

// Native units only: the common melee engine owns the single .006 world conversion.
export function getSpyDaggerAttackProfile(kind,{channel='melee',range=SPY_DAGGER_ITEM.range,power=SPY_DAGGER_ITEM.power}={}){
  if(!['melee','unlimited'].includes(channel))throw Error('Unknown Spy Dagger balance channel: '+channel);
  if(!Number.isFinite(range)||range<=0||!Number.isFinite(power)||power<0)throw Error('Invalid Spy Dagger ability');
  if(!['cut','light','air','rush','heavy'].includes(kind))throw Error('Unknown Spy Dagger action: '+kind);
  const rush=kind==='rush'||kind==='heavy';
  const factors=rush?(channel==='melee'?[1.958,.516,2.216]:[1.80328,.45082,2.25410]):[channel==='melee'?.979:.90164];
  const times=rush?[180,360,540]:[260];
  const contacts=times.map((atMs,index)=>({
    index,atMs,attribute:rush?'ATTACKATTRIB_SPYDAGGER_ATTACK1':'ATTACKATTRIB_SPYDAGGER_ATTACK2',powerFactor:factors[index],baseDamage:power*factors[index],
    additionalPowerExpression:'AddtionalPower',initAttack2:[1,1,false],alwaysCritical:false,dependsOn:null,
    successCondition:rush&&index<2?'CONDITION_ACTOR':null,playSound:rush&&index!==1?false:null,
    shape:rush?{type:'box',anchor:[0,180,100],direction:[0,0,-1],dimensions:[range*.5,250,range*(index===2?2.25:1.85)]}:
      {type:'fan',anchor:[0,140,-50],direction:[0,-1],parameters:[range*.8,range*.2,range*1.3,120]},
    cameraShake:!rush||index===2?{enable:[true,true,0],factor1:[200,50,rush?40:5],factor2:[0,20,2000,3000],whenSuccess:true}:null,
  }));
  return {weapon:'dagger',kind:rush?'rush':'cut',channel,power,range,
    source:rush?'SpyDaggerStab':'SpyDaggerCut',actionMs:rush?1000:550,recoveryMs:rush?1500:0,minimumMs:0,
    clip:rush?'SN001':'SN013',alternateClip:rush?'SN001':'SN014',recoveryClip:rush?'SN012':null,
    hits:times,contacts,moveRate:rush?null:.5,multiplier:rush&&channel==='unlimited'?2*1.09:2,
    useMoveBox:rush,onlyVStateNormal:rush,stealthCancel:true,moveStopWhenDamage:rush,
    // Strict phase transitions + fitted clip cursor already live in spy-dagger-timing.js.
    timingAdapter:'spy-dagger-timing',moveCancelMs:rush?1451:null,
    reaction:{direction:'DIR_FRONT',part:'PART_MIDDLE',power:'POWER_STRONG',counterAttack:true,guardCrush:false,damageData:[200,true,true]},
    effects:rush?SPY_DAGGER_EFFECTS.rush:SPY_DAGGER_EFFECTS.cut};
}

export function spyDaggerLocomotionPose(direction='front',moving=false){
  const data=SPY_DAGGER_LOCOMOTION;
  if(!Object.hasOwn(data.run,direction))throw Error('Unknown Spy Dagger direction: '+direction);
  return {clip:moving?data.run[direction]:data.idle,...(moving?{lower:data.runLower[direction]}:{}),loop:true,speed:1,fade:data.fade,restartKey:0};
}
// Attack clocks remain independent of locomotion and vary by sex (SN012).
// The runtime may preserve its existing validated air-leg policy at the caller.
export function spyDaggerAttackPose(attack,{combo=0,sex='male',direction='front',moving=false}={}){
  if(!Object.hasOwn(SPY_DAGGER_CUT_LOWER,direction))throw Error('Unknown Spy Dagger direction: '+direction);
  const rush=attack.type==='rush'||attack.kind==='rush'||attack.kind==='heavy';
  const sample=rush?rushClipSample(attack,sex):cutClipSample(attack,combo,sex);
  return {...sample,loop:false,speed:1,fade:50/4800,...(!rush?{lower:moving?SPY_DAGGER_CUT_LOWER[direction]:'A0024',lowerSpeed:1}:{}),
    nextFadePadding:rush&&attack.phase==='recovery'?100/4800:0};
}
