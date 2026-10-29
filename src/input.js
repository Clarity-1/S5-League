// Physical KeyW is Z on AZERTY and W on QWERTY. Browser auto-repeat never
// counts as a second tap. Releasing forward stops every sprint immediately.
// INPUT_FASTRUN (42), live input object +0x20; 0x4EB833 uses an inclusive limit.
export const SPRINT_DOUBLE_TAP_SECONDS=.5;
// Ground-only reactivation window. An armed airborne sprint lasts until land.
export const AUTO_SPRINT_REPRESS_SECONDS=.05;
// S5Runtime 0x864350/0x8643CC: short release and one-shot held input use 200 ms.
export const MELEE_HOLD_SECONDS=.2;
export class MovementInput {
  constructor(){this.held=new Set();this.pending={};this.lastForwardTap=-Infinity;this.sprinting=false;this.autoSprinting=false;this.airSprintArmed=false;this.autoSprintUntil=-Infinity;this.sampledForwardHeld=false;this.lightHeld=false;this.heavyHeld=false;}
  keyDown(code,time,repeat=false){
    if(repeat||this.held.has(code))return;
    this.held.add(code);
    if(code==='KeyW'||code==='ArrowUp'){
      this.pending.forwardPressed=true;
      if(!this.autoSprinting)this.autoSprinting=this.airSprintArmed||time<=this.autoSprintUntil+1e-9;
      this.autoSprintUntil=-Infinity;
      this.sprinting=time-this.lastForwardTap<=SPRINT_DOUBLE_TAP_SECONDS;
      if(this.sprinting)this.pending.sprintPressed=true;
      // 0x4EB833: an accepted second edge latches the request without moving
      // the first-edge clock. Only a new unmatched edge replaces that clock.
      if(!this.sprinting)this.lastForwardTap=time;
    }
    if(code==='Space'){this.pending.jump=true;this.pending.jumpPressedAt=time;}
    if((code==='AltLeft'||code==='AltRight')&&this.held.has('KeyW'))this.rapidJumpPulses=2;
  }
  keyUp(code,time=performance.now()/1000){
    const wasHeld=this.held.delete(code);
    if(wasHeld&&(code==='KeyW'||code==='ArrowUp')&&!this.held.has('KeyW')&&!this.held.has('ArrowUp')){
      if(this.sprinting||this.autoSprinting){this.pending.sprintReleased=true;this.lastForwardTap=-Infinity;}
      if(this.autoSprinting)this.autoSprintUntil=time+AUTO_SPRINT_REPRESS_SECONDS;
      this.sprinting=false;this.autoSprinting=false;
    }
    // Preserve release edges even if a key is pressed again before sampling.
    if((code==='KeyA'||code==='ArrowLeft')&&!this.held.has('KeyA')&&!this.held.has('ArrowLeft'))this.pending.leftReleased=true;
    if((code==='KeyD'||code==='ArrowRight')&&!this.held.has('KeyD')&&!this.held.has('ArrowRight'))this.pending.rightReleased=true;
  }
  consumeEvents(events){
    // Native dodge consumes an ineligible fast-run request; holding forward
    // must not queue it until the dodge finishes (20261022 native witness).
    if(events.includes('dodgesprintrejected')){
      this.sprinting=false;this.autoSprinting=false;this.autoSprintUntil=-Infinity;
    }
    // Airborne reactivation belongs to the whole flight, not a release timer.
    // Landing must also clear the old 50 ms fallback and classic tap history.
    if(events.includes('respawn')||(events.includes('land')&&this.airSprintArmed)){
      // Landing revokes one-press reactivation, not an already held sprint.
      const keepHeldSprint=!events.includes('respawn')&&(this.sprinting||this.autoSprinting)&&(this.held.has('KeyW')||this.held.has('ArrowUp'));
      this.airSprintArmed=false;this.sprinting=keepHeldSprint;this.autoSprinting=false;
      this.autoSprintUntil=-Infinity;this.lastForwardTap=-Infinity;
    }
    // Only an actual takeoff cancels the sprint latch. Space also means dodge,
    // wall jump or air cancel, so do not clear it indiscriminately on keydown.
    if(events.includes('jump')||events.includes('sprintstop')){
      // Native INPUT_FASTRUN42 retains the first forward edge across a dodge
      // cancel (capture 20261022: Z before cancel, second Z 450 ms later).
      // Clearing an active sprint still revokes its latch as before.
      const deferDodgePress=events.includes('dashcancel')&&this.sampledSprintPressed&&!events.includes('sprint');
      const keepDodgeTap=events.includes('dashcancel')&&(!this.sprinting&&!this.autoSprinting||deferDodgePress);
      this.sprinting=!!deferDodgePress;this.autoSprinting=false;
      if(!keepDodgeTap)this.lastForwardTap=-Infinity;
      // S5Runtime enters Jump before consuming a simultaneous fast-run edge. Keep
      // that fresh request for the next simulation step, not a timer shortcut.
      if(deferDodgePress){this.pending.forwardPressed=true;this.pending.sprintPressed=true;}
      // Stop the current movement without erasing airborne reactivation.
      // Other interruptions still clear the separate ground-only window.
      if(events.includes('jump')||this.sampledForwardHeld)this.autoSprintUntil=-Infinity;
    }
    // Confirmed auto-sprint entry: dodge cancel OR a normal-jump double tap.
    if(events.includes('doublesprint')&&!events.includes('sprintstop')&&!events.includes('land')&&!events.includes('respawn')&&(this.held.has('KeyW')||this.held.has('ArrowUp')))this.autoSprinting=true;
    if(events.includes('airsprintarmed')&&!events.includes('land')&&!events.includes('respawn')){
      this.airSprintArmed=true;
      if(this.held.has('KeyW')||this.held.has('ArrowUp'))this.autoSprinting=true;
    }
    this.sampledSprintPressed=false;
  }
  clear(){this.held.clear();this.pending={};this.rapidJumpPulses=0;this.sprinting=false;this.autoSprinting=false;this.airSprintArmed=false;this.autoSprintUntil=-Infinity;this.sampledForwardHeld=false;this.sampledSprintPressed=false;this.lightHeld=false;this.heavyHeld=false;this.lightStarted=null;this.lightLongSent=false;this.lastForwardTap=-Infinity;}
  cancelAttacks({preserveHeavy=false,preserveLight=false}={}){
    // A qualified equipment handoff retains the same physical gesture and
    // classification clock, never an outgoing one-shot or a replacement click.
    this.pending={};
    if(!preserveLight){this.lightHeld=false;this.lightStarted=null;this.lightLongSent=false;}
    if(!preserveHeavy)this.heavyHeld=false;
  }
  attack(button,time=performance.now()/1000){if(button===0&&!this.lightHeld){this.pending.light=true;this.pending.lightPressed=true;this.pending.lightPressedAt=time;this.lightHeld=true;this.lightStarted=time;this.lightLongSent=false;}if(button===2){this.pending.heavy=true;this.heavyHeld=true;}}
  releaseAttack(button,time=performance.now()/1000){
    if(button===0&&this.lightHeld){
      this.pending.lightReleased=true;
      if(!this.lightLongSent)this.pending[time-this.lightStarted<=MELEE_HOLD_SECONDS+1e-9?'lightShort':'lightLong']=true;
      this.lightHeld=false;this.lightStarted=null;
    }
    if(button===2){if(this.heavyHeld)this.pending.heavyReleased=true;this.heavyHeld=false;}
  }
  sample(facing,time=performance.now()/1000){
    if(this.lightHeld&&!this.lightLongSent&&time-this.lightStarted>=MELEE_HOLD_SECONDS-1e-9){this.pending.lightLong=true;this.lightLongSent=true;}
    if(!this.autoSprinting&&time>this.autoSprintUntil+1e-9)this.autoSprintUntil=-Infinity;
    const forward=Number(this.held.has('KeyW')||this.held.has('ArrowUp'))-Number(this.held.has('KeyS')||this.held.has('ArrowDown'));
    const side=Number(this.held.has('KeyD')||this.held.has('ArrowRight'))-Number(this.held.has('KeyA')||this.held.has('ArrowLeft'));
    const forwardHeld=this.held.has('KeyW')||this.held.has('ArrowUp');
    this.sampledForwardHeld=forwardHeld;
    const backwardHeld=this.held.has('KeyS')||this.held.has('ArrowDown');
    const leftHeld=this.held.has('KeyA')||this.held.has('ArrowLeft'),rightHeld=this.held.has('KeyD')||this.held.has('ArrowRight');
    const value={backwardHeld,x:Math.sin(facing)*forward-Math.cos(facing)*side,z:Math.cos(facing)*forward+Math.sin(facing)*side,forward,forwardHeld,side,sprint:(this.sprinting||this.autoSprinting)&&forward>0&&side===0,facing,light:this.lightHeld,lightShort:false,lightLong:false,heavyHeld:this.heavyHeld,...this.pending};
    this.sampledSprintPressed=!!value.sprintPressed;
    // Two ordinary Space edges on successive simulation steps; no held wall request.
    if(!this.held.has('KeyW'))this.rapidJumpPulses=0;
    if(this.rapidJumpPulses>0){value.jump=true;value.rapidJump=true;this.rapidJumpPulses--;}
    value.leftHeld=leftHeld;value.rightHeld=rightHeld;
    this.pending={};return value;
  }
}
// CFPSCamera::GetDestNormalFov: 66 for the center camera (side offset
// 50, CAMERA_FRAMING.shoulder), 60 for the side camera. D3DX FovLH takes a
// VERTICAL angle, like Three.js. (An S5Runtime capture showed 90 instead.)
export const BASE_FOV=66;
// DEFAULT_NEAR_DIST = 30 native units.
export const CAMERA_NEAR=30*.006;

