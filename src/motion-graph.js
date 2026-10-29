// Source clips with a presentation-space directional mapping.
import {TUNING,SOURCE_MOVEMENT} from './movement-profile.js';
import {FIREBALL} from './fireball.js';
import {rushClipSample,cutClipSample} from './spy-dagger-timing.js';
import {dashClipSample} from './dash-motion.js';
import {RUN_CLIPS,ATTACK_LEGS} from './direction-clips.js';
import {MELEE,meleeDefinition,meleeClipSample,meleeLowerSample,weaponRunClip,weaponRunLowerClip} from './melee-weapons.js';
import {IDLE_CLIPS} from './mixamo-locomotion.js';
import {rifleRuntimePose} from './rifle-runtime.js';
import {supportRuntimePose} from './support-runtime.js';
import {throwableRuntimePose} from './throwable-runtime.js';
import {smashSecondaryPose} from './smash-secondary.js';
import {AIRGUN,airgunPose} from './airgun-runtime.js';
import {cannonadePose} from './cannonade-runtime.js';
import {rocketLauncherPose} from './rocket-launcher-runtime.js';
import {PLASMA_LOCOMOTION_BLEND_SECONDS} from './plasma-locomotion-data.js';
import {shieldBodyPresentationPose} from './shield-body-presentation-policy.js';
import {wallJumpPose} from './wall-jump-pose.js';
import {smoothWalkName} from './walk-smoothing.js';
import {BLENDER_WALK_ENABLED,BLENDER_WALK_CLIP,BLENDER_WALK_STYLE,BLENDER_BOLD_STYLE,blenderBoldClip} from './blender-walk-experiment.js';
export {RUN_CLIPS,ATTACK_LEGS} from './direction-clips.js';
// S5Runtime CFastRunState 0x617949–0x617BAA, local normal sprint: CAnimParam
// playback multiplies the Lua rate 1 by native constant 0.5 (0x14C908C).
export const SPRINT_ANIMATION_SPEED=.5;
// ActorState_FastRun: SetAnim("00068", 0, 200, ...): 200 blend ticks.
export const SPRINT_BLEND_SECONDS=200/4800;
// Native parameter read + control-flow evidence, 2026-09-26:
// docs/s5runtime-landing-animation-evidence.json. No extra recovery clip.
export const LANDING_ROLL_SPEED=.8;
export const DAGGER_IDLE_BLEND_SECONDS=1000/4800;
export function localDirection(x,z,facing){
  const forward=x*Math.sin(facing)+z*Math.cos(facing);
  const right=-x*Math.cos(facing)+z*Math.sin(facing);
  const sector=(Math.round(Math.atan2(right,forward)/(Math.PI/4))+8)%8;
  return ['front','rightFront','right','rightBack','back','leftBack','left','leftFront'][sector];
}

export class MotionGraph {
  constructor(){this.sprintStyle='classic';this.runStyle='classic';this.idleStyle='classic';this.reset();}
  sprintPose(base){
    if(this.sprintStyle==='meshy')return {...base,clip:'MESHY_RUN_FAST',speed:1};
    if(this.sprintStyle==='ninja')return {...base,clip:'MIXAMO_NINJA_RUN',speed:1};
    if(this.sprintStyle==='athletic')return {...base,clip:'MIXAMO_ATHLETIC_RUN',speed:1.2};
    return this.sprintStyle==='anime'?{...base,clip:'R0024',speed:1}:{...base,clip:'00068',speed:SPRINT_ANIMATION_SPEED};
  }
  reset(){this.phase='idle';this.age=0;this.serial=(this.serial||0)+1;this.attackSerial=(this.attackSerial||0)+1;this.takeoffMoving=null;this.jumpDirection=null;this.landingMoving=null;this.landingFinished=false;}
  events(events){
    for(const event of events){
      if(event==='land'){this.landingMoving=null;this.landingBackward=false;this.landingFinished=false;}
      if(event==='landend'&&this.phase==='land')this.landingFinished=true;
      if(event==='respawn')this.reset();
      if(event==='attack'){this.attackSerial++;this.phase='attack';this.age=0;}
      if(['jump','walljump','walllaunch','wallfail','land','dash','airdash','aircancel'].includes(event)){this.phase=event;this.age=0;this.serial++;this.takeoffMoving=null;this.jumpDirection=null;}
    }
  }
  sample(c,dt){
    this.age+=dt;
    if(c.s5runtimeAnchoringBodyState)return c.s5runtimeAnchoringBodyState.samplePresentation(dt);
    const shieldPose=shieldBodyPresentationPose(c.s5runtimeShieldBodyState,c.s5runtimeShieldBodyPresentationPolicy,c.s5runtimeShieldLowerPresentationSnapshot);
    if(shieldPose)return shieldPose;
    const locomotion=c.grounded&&!c.attack&&!c.wallAction&&c.dash===0&&['run','sprint'].includes(c.state)?c.groundLocomotionVelocity??c.velocity:c.velocity;
    const speed=Math.hypot(locomotion.x,locomotion.z),moving=speed>.25;
    const direction=localDirection(locomotion.x,locomotion.z,c.facing);
    const runClip=(c.airgun?AIRGUN.run[direction]:weaponRunClip(c.weapon,direction,c.sigmaTransformed))||RUN_CLIPS[direction];
    const base={loop:true,speed:1,fade:['deathscythe','demonicknuckle'].includes(c.weapon)?1000/4800:.1,restartKey:0,...(c.weapon==='sigmablade'?{transformed:!!c.sigmaTransformed}:{})};
    const one=(clip,key=0,fade=.06)=>({...base,clip,loop:false,restartKey:key,fade});
    if(c.fireball){
      this.phase='idle';
      return {...one(FIREBALL.clip,c.fireball.serial,0),time:c.fireball.time};
    }
    // Cancelling is definitive: do not resume a stale landing after the new
    // action ends, even if its event was consumed before this render frame.
    if(this.phase==='land'&&(c.attack||c.dash>0||c.wallAction||!c.grounded||c.sprinting||c.state==='sprint'))this.phase='idle';
    if(c.dash>0){
      // Only the original lateral clips are needed: left/right + jump is dodge.
      const sample=dashClipSample(c.dashSide,c.dashElapsedMs??this.age*1000,c.sex);
      return {...one(sample.clip,this.serial,.035),speed:1,time:sample.time};
    }
    if(c.attack){
      if(c.attack.weapon==='smashrifle'&&c.attack.kind==='secondary'){
        const pose={...one('DD022',this.attackSerial),...smashSecondaryPose(c.attack,direction,moving)};
        if(pose.lower)pose.lowerSpeed=moving?speed/TUNING.animationWalk:1;
        return pose;
      }
      if(c.attack.profile){
        const sample=meleeClipSample(c.attack);
        const pose={...one(sample.clip,this.attackSerial,.05),...sample};
        Object.assign(pose,meleeLowerSample(c.attack,direction,moving,c));
        return pose;
      }
      if(c.attack.type==='rush'){const sample=rushClipSample(c.attack,c.sex);return {...one(sample.clip,this.attackSerial,.05),time:sample.time};}
      // The aerial cut overlays the torso while the walking legs keep cycling.
      // Use the same lower clip/channel as locomotion so a click cannot reset it.
      const cut=cutClipSample(c.attack,c.combo,c.sex);
      if(c.attack.type==='air'){
        const intent=c.moveIntent||c.velocity,intending=Math.hypot(intent.x,intent.z)>.01;
        const airDirection=intending?localDirection(intent.x,intent.z,c.facing):direction;
        return {...one(cut.clip,this.attackSerial,.05),time:cut.time,
          // Stationary aerial click uses the same lower pose as a ground
          // click. Falling resumes after the attack, not during its gesture.
          lower:intending?RUN_CLIPS[airDirection]:'A0024',
          lowerSpeed:intending?Math.max(.3,(moving?speed:TUNING.walk)/TUNING.animationWalk):1};
      }
      return {...one(cut.clip,this.attackSerial,.05),time:cut.time,lower:moving?ATTACK_LEGS[direction]:'A0024',lowerSpeed:moving?speed/TUNING.animationWalk:1};
    }
    if(c.throwable&&!c.wallAction&&!c.sprinting&&(c.grounded||c.throwable.phase!=='idle')){
      const pose=throwableRuntimePose(c.weapon,c.throwable,direction,moving,c.sex,{airborne:!c.grounded});
      if(pose.lower&&pose.lowerSpeed===undefined)pose.lowerSpeed=moving?speed/TUNING.animationWalk*(pose.lowerRateScale??1):1;
      return pose;
    }
    if(c.support&&!c.wallAction&&!c.sprinting&&(c.grounded||c.support.phase!=='idle')){
      const pose=supportRuntimePose(c.weapon,c.support,direction,moving,c.sex);
      if(pose.lower)pose.lowerSpeed=moving?speed/TUNING.animationWalk*(pose.lowerRateScale??1):1;
      return pose;
    }
    if(c.rifle&&!c.wallAction&&!c.sprinting&&(c.grounded||c.rifle.phase!=='idle')){
      const pose=rifleRuntimePose(c.weapon,c.rifle,direction,moving,c.sex);if(pose.lower&&pose.lowerSpeed===undefined)pose.lowerSpeed=moving?speed/TUNING.animationWalk*(pose.lowerRateScale??1):1;return pose;
    }
    if(c.cannonade&&!c.wallAction&&!c.sprinting&&(c.grounded||c.cannonade.phase!=='idle')){
      const pose=cannonadePose(c.cannonade,direction,moving);
      if(pose.lower)pose.lowerSpeed=speed/TUNING.animationWalk*(pose.lowerRateScale??1);
      return pose;
    }
    if(c.rocketLauncher&&!c.wallAction&&!c.sprinting&&(c.grounded||c.rocketLauncher.phase!=='idle')){
      const pose=rocketLauncherPose(c.rocketLauncher,direction,moving);
      if(pose.lower)pose.lowerSpeed=speed/TUNING.animationWalk*(pose.lowerRateScale??1);
      return pose;
    }
    if(c.airgun&&!c.wallAction){
      const pose=airgunPose(c.airgun,direction,moving,c.sex);if(pose){if(pose.lower&&c.airgun.phase==='reload')pose.lowerSpeed=speed/TUNING.animationWalk;return pose;}
      if(c.grounded&&!c.sprinting)return moving?{...base,clip:runClip,lower:AIRGUN.runLower[direction],lowerSpeed:speed/TUNING.animationWalk}:
        {...base,clip:AIRGUN.idle};
    }
    if(c.wallAction&&!c.airLocomotion){
      return {...base,...wallJumpPose(c.wallAction,this.serial)};
    }
    if(!c.grounded){
      if(c.sprinting)return this.sprintPose({...base,fade:SPRINT_BLEND_SECONDS});
      const intent=c.moveIntent||c.velocity,intending=Math.hypot(intent.x,intent.z)>.01;
      if(c.airLocomotion&&(moving||intending)){
        const airDirection=intending?localDirection(intent.x,intent.z,c.facing):direction;
        // Dagger's captured air-walk and air-cut share SN lower clocks.
        // RunState's E legs describe grounded running, not this aerial state.
          const lower=c.weapon==='dagger'?null:weaponRunLowerClip(c.weapon,airDirection,c.sigmaTransformed);
        return {...base,clip:weaponRunClip(c.weapon,airDirection)||RUN_CLIPS[airDirection],...(lower?{lower}:{}),speed:Math.max(.3,speed/TUNING.animationWalk),fade:.04};
      }
      if(this.phase==='jump'){
        const intent=c.moveIntent||c.velocity;
        if(this.takeoffMoving===null)this.takeoffMoving=Math.hypot(intent.x,intent.z)>.01;
        if(Math.hypot(intent.x,intent.z)>.01)this.jumpDirection=localDirection(intent.x,intent.z,c.facing);
        // The moving jump contains a full aerial turn. Do not cut it in half
        // just because the velocity changes sign at the apex (~375 ms).
        if(this.age<.7){
          const airClip=this.jumpDirection?`AIR_${this.takeoffMoving?'RISE':'STAND'}_${this.jumpDirection}`:'00001';
          // Changing air direction must not restart the jump clip at frame 0.
          return {...one(airClip,this.serial,.06),time:this.age,direction:this.jumpDirection};
        }
      }
      if(c.velocity.y>0)return one('00001',this.serial,.06);
      return {...base,clip:moving?`AIR_FALL_${direction}`:'00002'};
    }
    if(this.phase==='land'){
      // 00000 is the moving landing/roll (2400 SCN ticks); 00003 is
      // the standing landing (1840 ticks). Keep the variant chosen on contact:
      // releasing movement must not replace a half-played roll with standing.
      if(this.landingMoving===null){
        this.landingMoving=moving;
        this.landingBackward=moving&&['back','leftBack','rightBack'].includes(direction);
      }
      // Backward jumps land directly into recovery, without a forward roll.
      const roll=this.landingMoving&&!this.landingBackward;
      const elapsedMs=c.jumpRecovery?.elapsedMs??this.age*1000;
      // The controller's landing timer owns exit, not the file duration.
      // The age fallback covers inspected/static actors and non-jump landings.
      if(!this.landingFinished&&elapsedMs<=SOURCE_MOVEMENT.landDelayMs){
        const playbackSpeed=LANDING_ROLL_SPEED;
        return {...one(roll?'00000':'00003',this.serial,
          roll?100/4800:200/4800),speed:playbackSpeed,time:elapsedMs/1000*playbackSpeed,
          nextFadePadding:roll?0:500/4800};
      }
      this.phase='idle';
    }
    if(!moving){
      const idle=Object.hasOwn(IDLE_CLIPS,this.idleStyle)?IDLE_CLIPS[this.idleStyle]:null;
      const clip=meleeDefinition(c.weapon,c.sigmaTransformed,c.sex)?.idle||'SN002';
      return idle?{...base,clip:idle,fade:Math.max(.18,base.fade)}:{...base,clip,fade:clip==='SN002'?DAGGER_IDLE_BLEND_SECONDS:['plasma','counter'].includes(c.weapon)?PLASMA_LOCOMOTION_BLEND_SECONDS:c.weapon==='breaker'?300/4800:base.fade};
    }
    if(c.state==='sprint')return this.sprintPose({...base,fade:SPRINT_BLEND_SECONDS});
    if(BLENDER_WALK_ENABLED&&this.runStyle===BLENDER_BOLD_STYLE&&c.weapon==='dagger')return {
      ...base,clip:blenderBoldClip(direction),lower:blenderBoldClip(direction),
      fade:1000/4800,speed:Math.max(.3,speed/TUNING.animationWalk),
    };
    if(BLENDER_WALK_ENABLED&&this.runStyle===BLENDER_WALK_STYLE&&c.weapon==='dagger'&&direction==='front')return {
      ...base,clip:BLENDER_WALK_CLIP,lower:BLENDER_WALK_CLIP,
      fade:1000/4800,speed:Math.max(.3,speed/TUNING.animationWalk),
    };
    if(this.runStyle==='meshy'&&direction==='front')return {...base,clip:'MESHY_RUN_FAST',speed:Math.max(.3,speed/TUNING.animationWalk)};
    // Forward/backward only: diagonal and lateral motion keep the validated
    // directional clips until matching Mixamo strafes have been authored.
    if(this.runStyle==='athletic'&&(direction==='front'||direction==='back'))return {
      ...base,clip:direction==='front'?'MIXAMO_ATHLETIC_RUN':'MIXAMO_ATHLETIC_BACK',speed:Math.max(.3,speed/TUNING.animationWalk),
    };
    const lower=weaponRunLowerClip(c.weapon,direction,c.sigmaTransformed);
    if(this.runStyle==='smooth'&&c.weapon==='dagger')return {
      ...base,clip:smoothWalkName(runClip),lower:smoothWalkName(lower),
      fade:1000/4800,speed:Math.max(.3,speed/TUNING.animationWalk),
    };
    // CRunState::SetAnimation: GetMoveSpeedMax() / actor_default_animation_move_speed
    // for every direction; the side/back speed rates do not slow the cycle.
    return {...base,clip:runClip,...(lower?{lower,fade:1000/4800}:{}),speed:Math.max(.3,(c.moveSpeedMax??speed)/TUNING.animationWalk)};
  }
}
