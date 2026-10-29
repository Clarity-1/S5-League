import {advanceDispersion,takeShotDispersion} from './rifle-dispersion.js';
import {emitMeleeActivation} from './melee-activations.js';
import {secondaryEntryRequested} from './held-secondary-entry.js';
import {canCarryDodgePrimary,dodgePrimaryRequest} from './dodge-primary-entry.js';
import {guardDodgeSecondaryKind,dodgeSecondaryRequest} from './dodge-secondary-entry.js';
import {deathScytheInitialAction} from './death-scythe-input.js';
import {deathScytheUppercutVelocity} from './death-scythe-uppercut.js';
import {vitalShockInitialAction} from './vital-shock-input.js';
import {counterReticleHeading} from './counter-reticle-heading.js';
import {createDemonicKnuckleHandState,beginDemonicKnuckleLight} from './demonic-knuckle-moving-state.js';
import {createDemonicKnuckleProtection,enterDemonicKnuckleProtection,leaveDemonicKnuckleProtection,advanceDemonicKnuckleProtection} from './demonic-knuckle-protection.js';
import {deathScytheFinishMotionCommand} from './death-scythe-finish-motion.js';
import {createDeathScytheStaySky,advanceDeathScytheStaySky,DEATH_SCYTHE_JUMP_ATTRIBUTE} from './death-scythe-stay-sky.js';
import {getSpyDaggerAttackProfile} from './spy-dagger-data.js';
import {resetFireball,advanceFireball} from './fireball.js';
import {createS5RuntimeSkillState,equipS5RuntimeSkill,resetS5RuntimeSkill,advanceS5RuntimeSkill,endS5RuntimeSkillDiagnostic} from './s5runtime-skill-runtime.js';
import {s5runtimeSkillDefinition} from './s5runtime-skill-data.js';
import {createAnchoringControllerBody} from './anchoring-controller-body.js';
import {runNativeJumpDiagnostic} from './native-air-control-order.js';
import {validateNativeFrameTailDiagnostic,runNativeFrameTailDiagnostic} from './native-frame-tail-diagnostic.js';
import {normalizeComparisonActorMpProfile} from './comparison-actor-mp-profile.js';
import {createS5RuntimeShieldOperation,requestS5RuntimeShieldOperation,acknowledgeS5RuntimeShieldBody,s5runtimeShieldOperationContext} from './s5runtime-skill-shield-operation.js';
import {createS5RuntimeShieldBodyPose,consumeS5RuntimeShieldBodyEntryPose} from './s5runtime-skill-shield-body.js';
import {createS5RuntimeShieldBodyTick,tickS5RuntimeShieldBody} from './s5runtime-skill-shield-body-tick.js';
import {shieldCompletionDuration,enterShieldBodyLifecycle,leaveShieldBodyLifecycle} from './s5runtime-skill-shield-body-lifecycle.js';
import {normalizeShieldBodyPresentationPolicy,normalizeShieldLowerPresentationSnapshot} from './shield-body-presentation-policy.js';
import {createS5RuntimeShieldActorProfile,readS5RuntimeShieldActorProfile,updateS5RuntimeShieldActorProfile,advanceS5RuntimeShieldActorProfileTimer} from './s5runtime-skill-shield-actor-profile.js';
import {createShieldLowerControllerPorts} from './shield-lower-controller-ports.js';
import {flyInputMotion} from './fly-input-motion.js';
import {applyNativePushCollision} from './native-push-collision.js';
// Rendering-independent simulation in scene units / seconds. Source-derived
// profile plus explicit reconstruction assumptions: see movement-profile.js.
import {Vector3} from 'three';
import {spyStabDelta} from './root-motion.js';
import {SCN_SCENE_SCALE} from './s5runtime-coordinates.js';
import {TUNING,SOURCE_MOVEMENT,locomotionTarget,groundRunTarget,WEAPON_MOVE_RATES} from './movement-profile.js';
import {createDashMotion,advanceDashMotion} from './dash-motion.js';
import {advancePlasmaDashExit} from './plasma-dash-transition.js';
import {isPlasmaLight,deferPlasmaLightEntry,requestPlasmaLightHandoff,finishPlasmaLightInputFrame} from './plasma-light-handoff.js';
import {createPlasmaLowerHistory,advancePlasmaLowerMotion} from './plasma-lower-motion.js';
import {advanceRushPhase,advanceCutPhase,RUSH_CLIP_SPEED,CUT_ACTION_MS,CUT_MOVE_RATE,CUT_JUMP_INPUT_WINDOW_MS} from './spy-dagger-timing.js';
import {canFollowMouse} from './view-orientation.js';
import {isRifleWeapon,createRifleRuntime,advanceRifleRuntime,cancelRifleRuntime,rifleOwnsPendingShots} from './rifle-runtime.js';
import {createEmptyMagazineReload} from './empty-magazine-reload.js';
import {isSupportWeapon,createSupportRuntime,advanceSupportRuntime,cancelSupportRuntime} from './support-runtime.js';
import {isThrowableWeapon,createThrowableRuntime,advanceThrowableRuntime,cancelThrowableRuntime} from './throwable-runtime.js';
import {createSmashSecondary,advanceSmashSecondary} from './smash-secondary.js';
import {rifleRangeForWorld} from './native-rifle-range.js';
import {createAirgunState,advanceAirgun,AIRGUN_RELOAD_MS} from './airgun-runtime.js';
import {createCannonadeState,advanceCannonade,cancelCannonade,CANNONADE} from './cannonade-runtime.js';
import {createRocketLauncherState,advanceRocketLauncher,cancelRocketLauncher,ROCKET_LAUNCHER} from './rocket-launcher-runtime.js';
import {chaserReloadTimeScale} from './chaser-attributes.js';
import {EllipsoidWorld,COLLISION_SETTINGS as CONTACT} from './collision.js';
import {createNativeCollisionMovement} from './native-collision-movement.js';
import {createCollisionV2TestMovement} from './collision-v2-test-movement.js';
import {ActorCollisionObject,actorMove,ACTOR_COLLISION,TYPE_ACTOR} from './actor-collision.js';
import {createNativeActorCollisionFrame} from './native-actor-collision-frame.js';
import {createNativeActorRuntimeProfile} from './native-actor-runtime-profile.js';
import {wallJumpVelocity,WALL_REBOUND_MIN_DOT} from './wall-jump.js';
import {MELEE,meleeDefinition,createMeleeAttack,advanceMeleeAttack,meleeRootDelta,meleeDropVelocity,meleeTransition} from './melee-weapons.js';
import {batMovementPolicy,batInputPolicy} from './bat-input.js';
import {sigmaBladeTransformEntry} from './sigma-blade-input.js';
import {createSigmaBladeAirAnimation,enterSigmaBladeAirAnimation} from './sigma-blade-air-animation.js';
import {sigmaBladeAirInputTarget,sigmaBladeAirLowerPose} from './sigma-blade-lower-motion.js';
import {ironBootsBoostTranslation} from './iron-boots-boost-motion.js';
export {TUNING} from './movement-profile.js';
const approach=(v,t,d)=>v<t?Math.min(t,v+d):Math.max(t,v-d);
const synchronousShieldPort=fn=>typeof fn==='function'&&!['AsyncFunction','AsyncGeneratorFunction','GeneratorFunction'].includes(fn.constructor.name);
const daggerRushContacts=getSpyDaggerAttackProfile('rush').hits;
const daggerCutContact=getSpyDaggerAttackProfile('cut').hits[0];
const wallContactView=wall=>({point:new Vector3(wall.point.x,wall.point.y,wall.point.z),normal:new Vector3(wall.normal.x,0,wall.normal.z)});

export class Controller {
  constructor(world={colliders:[]},{weapon='dagger',sex='male',skill=null}={}){this.world=world;this.weapon=weapon;this.sex=sex;this.collisionV2TestEnabled=false;this.s5runtimeSkill=createS5RuntimeSkillState({itemKey:skill});this.s5runtimeShieldActorProfile=null;this.collision=new EllipsoidWorld(world.collisionWorldForActor?.(this)??world,{x:TUNING.radius,y:TUNING.height/2,z:TUNING.radius});this.installCollisionBody();this.reset();}
  setWorld(world){this.releaseNativeActorFrame();this.world.sourceLaunchMotion?.releaseActor(this);this.world.mapObjects?.releaseActor?.(this);if(this.collisionV2TestEnabled)this.nativeCollisionMovement?.dispose?.();this.nativeCollisionMovement=null;this.nativeCollisionMovementFrame=null;this.world=world;this.collision=new EllipsoidWorld(world.collisionWorldForActor?.(this)??world,{x:TUNING.radius,y:TUNING.height/2,z:TUNING.radius});this.installCollisionBody();this.reset();if(this.collisionV2TestEnabled)this.setCollisionV2TestEnabled(true);}
  // Every map moves the player with ActorCollisionObject; radii and
  // offset are IActor's (bound width/height * 0.5, offset bound height * 0.5).
  installCollisionBody(){
    const r=TUNING.radius,h=TUNING.height/2;
    this.collisionBody=new ActorCollisionObject(this.collision,{radii:{x:r,y:h,z:r},offset:{x:0,y:h,z:0},actorBodies:()=>this.collision.actorCollisionBodies?.()??[]});
  }
  setCollisionV2TestEnabled(enabled){
    this.assertNativeActorLifecycleIdle();
    if(typeof enabled!=='boolean')throw new TypeError('Explicit V2 TEST activation required');
    if(!enabled){
      if(this.collisionV2TestEnabled){this.nativeCollisionMovement?.dispose?.();this.nativeCollisionMovement=null;this.nativeCollisionMovementFrame=null;}
      this.collisionV2TestEnabled=false;return {enabled:false};
    }
    if(this.nativeActorFrameConfiguration||this.s5runtimeAnchoringBodyState||this.s5runtimeShieldBodyState||this.nativeJumpDiagnosticContext?.enabled||this.nativeCollisionMovement&&!this.collisionV2TestEnabled)throw new Error('Another Controller body route already owns physics; disable it before V2 TEST');
    if(this.collisionV2TestEnabled&&this.nativeCollisionMovement)return {enabled:true,...this.nativeCollisionMovement.diagnostics()};
    const movement=createCollisionV2TestMovement(this),position=movement.position();
    this.nativeCollisionMovement=movement;this.nativeCollisionMovementFrame=null;this.collisionV2TestEnabled=true;
    Object.assign(this.position,position);
    return {enabled:true,...movement.diagnostics()};
  }
  configureNativeCollisionMovement(configuration=null){
    if(configuration===null){if(this.collisionV2TestEnabled)this.setCollisionV2TestEnabled(false);this.nativeCollisionMovement=null;this.nativeCollisionMovementFrame=null;return;}
    if(this.collisionV2TestEnabled)throw new Error('Disable V2 TEST before configuring another collision movement owner');
    if(this.nativeActorFrameConfiguration)throw new Error('Native actor frame already owns Controller physics');
    const movement=createNativeCollisionMovement(configuration),position=movement.position();
    if(['x','y','z'].some(axis=>position[axis]!==this.position[axis]))throw new Error('Native collision initial anchor must match the current Controller position');
    this.nativeCollisionMovement=movement;this.nativeCollisionMovementFrame=null;
  }
  configureNativeActorFrame(configuration=null){
    this.assertNativeActorLifecycleIdle();
    if(configuration===null){this.releaseNativeActorFrame();return;}
    if(configuration.dispose!==undefined&&!synchronousShieldPort(configuration.dispose))throw new TypeError('Synchronous native actor runtime disposal required');
    if(this.nativeCollisionMovement||this.s5runtimeAnchoringBodyState||this.s5runtimeShieldBodyState||this.nativeJumpDiagnosticContext?.enabled)throw new Error('Another Controller body route already owns physics');
    if(configuration.frame&&configuration.sourceFrame)throw new TypeError('Choose one native frame instance or source frame configuration');
    const frame=configuration.frame??createNativeActorCollisionFrame(configuration.sourceFrame);
    if(!['frame','snapshot','reset','prepareReset','restore'].every(name=>typeof frame?.[name]==='function')||
      !['readFrame','readPresentation','resetFrame'].every(name=>synchronousShieldPort(configuration[name])))throw new TypeError('Explicit native actor frame, source callbacks, presentation and reset provider required');
    const mapping=configuration.mapping;
    if(!mapping||typeof mapping.evidence!=='string'||!mapping.evidence.trim()||!['scale','origin'].every(name=>Array.isArray(mapping[name])&&mapping[name].length===3&&mapping[name].every(Number.isFinite))||
      mapping.scale.some(n=>n===0||Math.abs(n)!==Math.abs(mapping.scale[0])))throw new TypeError('Explicit native actor coordinate mapping required');
    const profile={...configuration,frame,mapping:{...mapping,scale:mapping.scale.slice(),origin:mapping.origin.slice()}};
    const previous=this.nativeActorFrameConfiguration;
    if(previous?.frame===frame&&previous.dispose){
      if(profile.dispose&&profile.dispose!==previous.dispose)throw new Error('Cannot replace the disposer of the same native frame owner');
      profile.dispose=previous.dispose;
    }
    const position=this.nativeActorFramePosition(profile,frame.snapshot());
    if(['x','y','z'].some(axis=>position[axis]!==this.position[axis]))throw new Error('Native actor frame anchor must match current Controller position');
    this.releaseNativeActorFrame(frame);this.nativeActorFrameConfiguration=profile;this.nativeActorFrameResult=null;
  }
  releaseNativeActorFrame(preserveFrame=null){
    this.assertNativeActorLifecycleIdle();
    const profile=this.nativeActorFrameConfiguration;
    if(profile&&profile.frame!==preserveFrame&&profile.dispose){
      this.nativeActorFrameReleasing=true;
      try{
        const result=profile.dispose();
        if(result&&typeof result.then==='function')throw new TypeError('Native actor runtime disposal must complete synchronously');
      }finally{this.nativeActorFrameReleasing=false;}
    }
    this.nativeActorFrameConfiguration=null;this.nativeActorFrameResult=null;this.nativePhysicalVelocity=null;
  }
  assertNativeActorLifecycleIdle(){
    if(this.nativeActorFrameStepping||this.nativeActorFrameResetting||this.nativeActorFrameReleasing)throw new Error('Native actor lifecycle cannot change during an active step/reset/release');
  }
  configureNativeActorRuntime(configuration=null){
    this.assertNativeActorLifecycleIdle();
    if(configuration===null){this.configureNativeActorFrame(null);return null;}
    if(configuration.worldOwner&&configuration.worldOwner!==this.world)throw new Error('Native runtime must belong to the current Controller world');
    const profile=createNativeActorRuntimeProfile({...configuration,worldOwner:this.world});
    try{this.configureNativeActorFrame(profile);}catch(error){profile.dispose();throw error;}
    return profile;
  }
  nativeActorFramePosition(profile,state){
    const anchor=state?.physics?.actor2f0;
    if(!Array.isArray(anchor)||anchor.length!==3||!anchor.every(Number.isFinite))throw new TypeError('Native actor2F0 output required');
    const position=Object.fromEntries(['x','y','z'].map((axis,i)=>[axis,anchor[i]*profile.mapping.scale[i]+profile.mapping.origin[i]]));
    if(!Object.values(position).every(Number.isFinite))throw new TypeError('Finite mapped actor frame position required');
    return position;
  }
  prepareNativeActorFramePresentation(profile,result,{dt,input,reset=false}={}){
    const view=profile.readPresentation({controller:this,result,dt,input,reset}),physics=result.state.physics;
    if(!view||typeof view.grounded!=='boolean'||typeof view.state!=='string'||!Array.isArray(view.events)||view.events.some(event=>typeof event!=='string')||
      !view.velocity||!['x','y','z'].every(axis=>Number.isFinite(view.velocity[axis])))throw new TypeError('Explicit native frame presentation state, logical ground, events and host motion vector required');
    if(view.facing!==undefined&&!Number.isFinite(view.facing))throw new TypeError('Finite native facing presentation required');
    const position=this.nativeActorFramePosition(profile,result.state);
    const physicalVelocity=Object.fromEntries(['x','y','z'].map((axis,i)=>[axis,physics.velocityF0[i]*profile.mapping.scale[i]]));
    if(!Object.values(physicalVelocity).every(Number.isFinite))throw new TypeError('Finite mapped native physical velocity required');
    return {...view,position,velocity:{...view.velocity},events:view.events.slice(),physicalVelocity};
  }
  commitNativeActorFramePresentation(view){
    Object.assign(this.position,view.position);this.velocity={...view.velocity};this.grounded=view.grounded;this.state=view.state;this.events=view.events.slice();
    this.nativePhysicalVelocity={...view.physicalVelocity};
    if(view.facing!==undefined)this.facing=view.facing;
  }
  applyNativeActorFramePresentation(profile,result,args){this.commitNativeActorFramePresentation(this.prepareNativeActorFramePresentation(profile,result,args));}
  stepNativeActorFrame(dt,input){
    this.assertNativeActorLifecycleIdle();this.nativeActorFrameStepping=true;
    try{
    const profile=this.nativeActorFrameConfiguration;
    if(this.s5runtimeAnchoringBodyState||this.s5runtimeShieldBodyState||this.nativeJumpDiagnosticContext?.enabled)throw new Error('Native actor frame cannot share another Controller body route');
    const expected=this.nativeActorFramePosition(profile,profile.frame.snapshot());
    if(['x','y','z'].some(axis=>expected[axis]!==this.position[axis]))throw new Error('Native actor frame position changed outside its source lifecycle');
    const before=profile.frame.snapshot();
    let result;
    try{result=profile.frame.frame(profile.readFrame({controller:this,dt,input}));}
    catch(error){this.nativeActorFrameResult={qualified:false,state:null,reason:error.message};throw error;}
    this.nativeActorFrameResult=result;
    if(!result.qualified)throw new Error('Native actor frame refused: '+result.reason);
    try{
      const view=this.prepareNativeActorFramePresentation(profile,result,{dt,input});
      if(JSON.stringify(profile.frame.snapshot())!==JSON.stringify(result.state))throw new Error('Native presentation changed source state outside its lifecycle');
      this.commitNativeActorFramePresentation(view);
    }
    catch(error){profile.frame.restore(before);this.nativeActorFrameResult={qualified:false,state:null,reason:'native-frame-presentation-rejected'};throw error;}
    this.time+=dt;
    return this.events;
    }finally{this.nativeActorFrameStepping=false;}
  }
  reset(){
    this.assertNativeActorLifecycleIdle();
    const resetProfile=this.nativeActorFrameConfiguration;let preparedNativeReset=null,preparedNativeView=null;
    this.nativeActorFrameResetting=!!resetProfile;
    try{
    if(resetProfile){
      const before=resetProfile.frame.snapshot();
      try{
        preparedNativeReset=resetProfile.frame.prepareReset(resetProfile.resetFrame({controller:this}));
        const resetProof=JSON.stringify(preparedNativeReset);
        preparedNativeView=this.prepareNativeActorFramePresentation(resetProfile,{qualified:true,state:preparedNativeReset},{dt:0,input:{},reset:true});
        if(JSON.stringify(preparedNativeReset)!==resetProof)throw new Error('Native reset presentation changed the prepared source state');
        if(JSON.stringify(resetProfile.frame.snapshot())!==JSON.stringify(before))throw new Error('Native reset provider changed source state before commit');
      }catch(error){resetProfile.frame.restore(before);throw error;}
    }
    this.emptyMagazineReload=createEmptyMagazineReload();
    this.endS5RuntimeAnchoringBodyState({reason:'controller-reset'});
    if(this.rifle)cancelRifleRuntime(this.weapon,this.rifle);
    if(this.support)cancelSupportRuntime(this.weapon,this.support);
    if(this.throwable)cancelThrowableRuntime(this.weapon,this.throwable);
    this.resetSerial=(this.resetSerial??0)+1;
    resetFireball(this);
    this.queueS5RuntimeSkillLifecycle(endS5RuntimeSkillDiagnostic(this.s5runtimeSkill,{nativeContext:this.s5runtimeSkillDiagnosticContext,reason:'controller-reset'}),'controller-reset');
    resetS5RuntimeSkill(this.s5runtimeSkill);
    this.s5runtimeSkillFrame=null;
    this.s5runtimeSkillDiagnosticContext=null;
    this.invalidateS5RuntimeShieldOperation();
    this.s5runtimeSkillSpRegenerationEnabled=true;
    this.nativeJumpDiagnosticContext=null;this.nativeJumpDiagnosticFrame=null;this.nativeFrameTailDiagnosticFrame=null;
    this.comparisonActorMpDiagnosticProfile=null;
    this.storedWeaponAmmo=new Map();
    this.airgun=this.weapon==='airgun'?createAirgunState():null;
    this.cannonade=this.weapon==='cannonade'?createCannonadeState():null;
    this.cannonadeStoredAmmo=4;
    this.rocketLauncher=this.weapon==='rocketlauncher'?createRocketLauncherState():null;
    this.rocketLauncherStored={ammo:1,reserve:5};
    this.rifle=createRifleRuntime(this.weapon);
    this.support=createSupportRuntime(this.weapon);
    this.throwable=createThrowableRuntime(this.weapon);
    if(this.rifle)this.rifle.range=rifleRangeForWorld(this.world);
    this.collision.edgeSupportKey=null;
    this.position={...(this.world.spawn||{x:0,y:0,z:9})};this.velocity={x:0,y:0,z:0};this.grounded=true;this.groundLocomotionVelocity=null;
    this.world.sourceLaunchMotion?.resetActor(this);
    if(this.nativeCollisionMovement)this.position=this.nativeCollisionMovement.reset({position:this.position,grounded:this.grounded});
    this.verticalState='normal';this.maxGravityVelocity=-TUNING.terminal;this.physicalHorizontal=false;
    if(!this.nativeCollisionMovement)this.position.y+=this.collisionBody.radii.y*ACTOR_COLLISION.epsilon;
    this.collisionBody.setPosition(this.position);this.collisionBody.resetInfo();
    this.nativeCollisionMovementFrame=null;
    this.energy=TUNING.maxEnergy;this.sprinting=false;this.sprintBlocked=false;this.dash=0;this.dashElapsedMs=0;this.dashPhase=null;this.dashMotion=null;this.dashJumpCancelArmed=false;
    this.ironBootsCooldowns={};
    this.demonicKnuckleHand=createDemonicKnuckleHandState();this.demonicKnuckleCooldowns={};
    this.demonicKnuckleProtection=createDemonicKnuckleProtection({clockMode:'arena-fractional-ms'});
    this.sigmaTransformed=false;this.sigmaLastTransformMs=-Infinity;
    this.sigmaAirAnimation=createSigmaBladeAirAnimation();
    this.plasmaDashExit=null;
    this.clearPlasmaLightHandoff();
    this._inputFrameId??=0;this._inputFrameOpen??=false;this._inputFrameHadStep??=false;
    this.wallJumpAirborne=false;
    this.jumpAirborne=false;this.verticalJump=false;
    this.counterGuardDash=null;this.counterGuardDodge=false;this.counterGuardDodgeWindow=null;this.daggerSwitchRush=false;this.plasmaSwitchRush=false;this.batSwitchRush=false;this.dodgeSecondaryHandoff=null;
    this.plasmaLowerHistory=createPlasmaLowerHistory();
    this.attack=null;this.airDashUsed=false; // Diagnostic history, never an eligibility gate.
    this.wall=null;this.wallAction=null;this.wallContact=null;this.wallJumpFailed=false;
    this.jumpOriginY=null;
    this.airLocomotion=false;this.jumpRecovery=null;this.normalJump=false;
    this.ledgeFall=false;
    this.katanaAirAttackCount=0;
    this.daggerAirCarry=false;
    this.katanaAirFall=false;
    this.facing=0;this.state='idle';this.time=0;this.events=[];this.jumpBuffer=0;this.coyote=.1;
    this.combo=0;this.meleeCombo=0;this.rootMotionDelta={x:0,y:0,z:0};
    if(resetProfile){
      resetProfile.frame.reset(preparedNativeReset);
      this.commitNativeActorFramePresentation(preparedNativeView);this.nativeActorFrameResult=null;
    }
    }finally{this.nativeActorFrameResetting=false;}
  }
  setInfiniteEnergy(enabled){if(enabled&&this.s5runtimeAnchoringBodyState)throw new Error('Infinite energy is incompatible with Anchoring body execution');if(enabled&&this.comparisonActorMpDiagnosticProfile)throw new Error('Infinite energy is incompatible with actor MP comparison');this.infiniteEnergy=!!enabled;if(this.infiniteEnergy)this.energy=TUNING.maxEnergy;}
  setComparisonActorMpDiagnosticProfile(value=null){
    if(value===null){this.comparisonActorMpDiagnosticProfile=null;return;}
    const profile=normalizeComparisonActorMpProfile(value);
    if(profile.sex!==this.sex||profile.weapon!==this.weapon)throw new Error('Actor MP profile must match Controller sex and weapon');
    if(this.infiniteEnergy)throw new Error('Infinite energy is incompatible with actor MP comparison');
    this.comparisonActorMpDiagnosticProfile=Object.freeze(profile);this.energy=profile.currentMp;
  }
  queueS5RuntimeSkillLifecycle(frame,reason){this.s5runtimeSkillLifecycleQueue??=[];const commands=frame.commands??{},events=frame.events??[];if(Object.keys(commands).length||events.length)this.s5runtimeSkillLifecycleQueue.push({reason,commands:{...commands},events:events.map(event=>({...event})),nativeReady:false});if(typeof commands.spRegenerationEnabled==='boolean')this.s5runtimeSkillSpRegenerationEnabled=commands.spRegenerationEnabled;}
  consumeS5RuntimeSkillLifecycleCommands(){return (this.s5runtimeSkillLifecycleQueue??=[]).splice(0);}
  equipS5RuntimeSkill(itemKey){if(itemKey!==null&&!s5runtimeSkillDefinition(itemKey))return {accepted:false,reason:'unknown-s5runtime-skill',itemKey:this.s5runtimeSkill.itemKey};this.endS5RuntimeAnchoringBodyState({reason:'equipment-changed'});const result=equipS5RuntimeSkill(this.s5runtimeSkill,itemKey,{nativeContext:this.s5runtimeSkillDiagnosticContext});if(result.accepted){this.queueS5RuntimeSkillLifecycle({commands:result.lifecycleCommands,events:result.lifecycleEvents},'equipment-changed');this.s5runtimeSkillFrame=null;this.s5runtimeSkillDiagnosticContext=null;this.invalidateS5RuntimeShieldOperation();this.s5runtimeSkillSpRegenerationEnabled=true;}return result;}
  interruptS5RuntimeSkill(){this.endS5RuntimeAnchoringBodyState({reason:'explicit-controller-interruption'});this.queueS5RuntimeSkillLifecycle(endS5RuntimeSkillDiagnostic(this.s5runtimeSkill,{nativeContext:this.s5runtimeSkillDiagnosticContext,reason:'explicit-controller-interruption'}),'explicit-controller-interruption');resetS5RuntimeSkill(this.s5runtimeSkill);this.s5runtimeSkillFrame=null;this.s5runtimeSkillDiagnosticContext=null;this.invalidateS5RuntimeShieldOperation();this.s5runtimeSkillSpRegenerationEnabled=true;}
  enterS5RuntimeAnchoringBodyState(configuration){
    if(![3010001,3010002].includes(this.s5runtimeSkill.itemKey))return {accepted:false,reason:'anchoring-equipment-required',nativeReady:false};
    if(this.s5runtimeAnchoringBodyState||this.s5runtimeShieldBodyState||this.nativeJumpDiagnosticContext?.enabled===true||this.s5runtimeSkill.active||this.s5runtimeSkillDiagnosticContext?.enabled===true)return {accepted:false,reason:'another-body-route-active',nativeReady:false};
    // Explicit S5 body ownership policy, separate from native eligibility.
    if(this.infiniteEnergy||this.weaponRuntimeBusy||this.attack||this.dash>0||this.wallAction||this.fireball)return {accepted:false,reason:'s5-body-ownership-conflict',nativeReady:false};
    const serial=(this.s5runtimeAnchoringBodyEntrySerial??0)+1,body=createAnchoringControllerBody(this,configuration,serial),previousState=this.state;
    this.s5runtimeAnchoringBodyEntrySerial=serial;this.s5runtimeAnchoringBodyState=body;this.s5runtimeAnchoringBodyFrame=null;
    const result=body.enter();
    if(!result.accepted){this.s5runtimeAnchoringBodyState=null;this.state=previousState;return result;}
    this.state='s5runtime-skill-anchoring-body';return result;
  }
  endS5RuntimeAnchoringBodyState({bodyEntrySerial,reason='explicit-controller-interruption',nativeTargetFieldOffset}={}){
    const body=this.s5runtimeAnchoringBodyState;
    if(!body||(bodyEntrySerial!==undefined&&bodyEntrySerial!==body.bodyEntrySerial))return {accepted:false,reason:'matching-anchoring-body-required',nativeReady:false};
    const destination=body.leave({reason,nativeTargetFieldOffset});
    this.s5runtimeAnchoringBodyState=null;this.s5runtimeAnchoringBodyFrame=null;this.state=destination.controllerState;
    return {accepted:true,actorStateId:destination.actorStateId,bodyEntrySerial:body.bodyEntrySerial,nativeReady:false};
  }
  returnS5RuntimeAnchoringBodyState(request){return this.endS5RuntimeAnchoringBodyState({...request,reason:'source-body-return'});}
  invalidateS5RuntimeShieldOperation(){this.s5runtimeShieldOperation??=createS5RuntimeShieldOperation();this.s5runtimeShieldOperation.pendingRequest=null;this.s5runtimeShieldOperation.bodyEntrySerial=null;if(this.s5runtimeShieldBodyState){leaveShieldBodyLifecycle(this.s5runtimeShieldBodyState.lifecycle,this.s5runtimeShieldBodyState.configuration.lifecyclePorts);this.state=this.s5runtimeShieldBodyState.savedControllerState;}this.s5runtimeShieldBodyState=null;this.s5runtimeShieldBodyFrame=null;this.s5runtimeShieldBodyCommands=[];this.s5runtimeShieldBodyPresentationPolicy=null;this.s5runtimeShieldLowerPresentationSnapshot=null;}
  setS5RuntimeShieldBodyPresentationPolicy(value=null){this.s5runtimeShieldBodyPresentationPolicy=value===null?null:normalizeShieldBodyPresentationPolicy(value);}
  setS5RuntimeShieldLowerPresentationSnapshot(value=null){this.s5runtimeShieldLowerPresentationSnapshot=value===null?null:normalizeShieldLowerPresentationSnapshot(this.s5runtimeShieldBodyState,value);}
  createS5RuntimeShieldLowerPorts(options){return createShieldLowerControllerPorts(this,options);}
  configureS5RuntimeShieldActorProfile(options=null){const profile=options===null?null:createS5RuntimeShieldActorProfile(options);this.s5runtimeShieldActorProfile=profile;return profile;}
  updateS5RuntimeShieldActorProfile(changes,writer){if(!this.s5runtimeShieldActorProfile)throw new Error('Explicit Shield actor profile required');return updateS5RuntimeShieldActorProfile(this.s5runtimeShieldActorProfile,changes,writer);}
  readS5RuntimeShieldActorContext(currentState={}){
    if(!this.s5runtimeShieldActorProfile)return {accepted:false,reason:'explicit-shield-actor-profile-required',nativeReady:false};
    const body=this.s5runtimeShieldBodyState;
    return readS5RuntimeShieldActorProfile(this.s5runtimeShieldActorProfile,{...currentState,...(body?{currentStateExists:true,actorStateId:body.actorStateId}:{}),shieldBodyIdentityConfirmed:!!body});
  }
  consumeS5RuntimeShieldBodyCommands(){return this.s5runtimeShieldBodyCommands.splice(0);}
  requestS5RuntimeShieldInput(nativeInputCode,nativeContext){const result=requestS5RuntimeShieldOperation(this.s5runtimeShieldOperation,this.s5runtimeSkill,{nativeInputCode,nativeContext,energy:this.energy});if(result.bodyReturnRequest&&this.s5runtimeShieldBodyState)result.bodyReturnRequest.bodyEntrySerial=this.s5runtimeShieldBodyState.bodyEntrySerial;return result;}
  acknowledgeS5RuntimeShieldBody(acknowledgement){return acknowledgeS5RuntimeShieldBody(this.s5runtimeShieldOperation,acknowledgement);}
  setS5RuntimeShieldOperationContext(nativeContext){this.setS5RuntimeSkillDiagnosticContext(s5runtimeShieldOperationContext(this.s5runtimeShieldOperation,nativeContext));}
  activateS5RuntimeShieldBodyComponent(nativeContext){
    const body=this.s5runtimeShieldBodyState;
    if(!body?.tick.activationAttempted||body.componentBeginConsumed)return {accepted:false,reason:'source-body-activation-request-required',nativeReady:false};
    body.componentBeginConsumed=true;
    return this.advanceS5RuntimeShieldComponent(0,{...nativeContext,componentBegin:true,componentEnd:false});
  }
  advanceS5RuntimeShieldComponent(dtMs,nativeContext){
    if(![3050001,3050002].includes(this.s5runtimeSkill.itemKey))return {accepted:false,reason:'shield-not-equipped',nativeReady:false};
    if(!Number.isInteger(dtMs)||dtMs<0||dtMs>0xffffffff)throw new TypeError('Native Shield component uint32 Tick required');
    if(dtMs>0){const token=this.resetSerial+':'+this.time;if(this.s5runtimeShieldComponentTailToken===token)throw new Error('Shield component tail already consumed for this Controller frame');this.s5runtimeShieldComponentTailToken=token;}
    const body=this.s5runtimeShieldBodyState;
    const frame=advanceS5RuntimeSkill(this.s5runtimeSkill,dtMs,{energy:this.energy,nativeContext:{...nativeContext,...(body?{currentStateExists:true,actorStateId:body.actorStateId}:{}),bodyStateConfirmed:false}});
    this.energy=frame.energy;this.s5runtimeSkillFrame=frame;
    this.queueS5RuntimeSkillLifecycle(frame,dtMs===0?'shield-current-state-command':'shield-component-tail');
    for(const event of frame.events)this.events.push(event);
    return frame;
  }
  enterS5RuntimeShieldBodyState(request,configuration){
    if(request?.requestSerial!==this.s5runtimeShieldOperation.pendingRequest?.requestSerial||request?.actorStateId!==34||request?.itemKey!==this.s5runtimeSkill.itemKey)return {accepted:false,reason:'stale-shield-body-request',nativeReady:false};
    if(this.s5runtimeShieldBodyState||this.s5runtimeAnchoringBodyState||this.nativeJumpDiagnosticContext?.enabled===true)return {accepted:false,reason:'another-body-route-active',nativeReady:false};
    const config={...configuration};
    if(config.lowerAdapter){
      const adapter=config.lowerAdapter;
      if(typeof adapter.supportsWeaponType!=='function'||!adapter.supportsWeaponType(config.weaponType)||!['enter','leave','tick','input'].every(name=>typeof adapter[name]==='function'))throw new TypeError('Matching source Shield lower adapter required');
      config.ports={...config.ports,lowerEnter:type=>adapter.enter(type),lowerTick:dtMs=>adapter.tick(dtMs)};
      config.lifecyclePorts={...config.lifecyclePorts,lowerEnter:type=>adapter.enter(type),lowerLeave:()=>adapter.leave(),provenance:{...config.lifecyclePorts?.provenance,lowerEnter:adapter.provenance.source,lowerLeave:adapter.provenance.source}};
    }
    const ports=config.ports;
    for(const name of ['physicsTick','afterCurrentStateTick'])if(!synchronousShieldPort(config[name]))throw new TypeError('Explicit synchronous Shield physics and global tail callbacks required');
    for(const name of ['baseTick','readFrameContext','activationTick','componentBegin','lowerEnter','lowerTick'])if(!synchronousShieldPort(ports?.[name]))throw new TypeError('Explicit synchronous Shield base/component/lower ports required');
    const lifecyclePorts=config.lifecyclePorts;
    for(const name of ['baseEnter','initializeBodyFields','lowerEnter','createBodyAudio','baseLeave','lowerLeave','destroyBodyAudio','restoreEquipmentModels'])if(!synchronousShieldPort(lifecyclePorts?.[name])||typeof lifecyclePorts.provenance?.[name]!=='string'||!lifecyclePorts.provenance[name].trim())throw new TypeError('Explicit synchronous Shield lifecycle ports and provenance required');
    if(!Array.isArray(config.actorPositionNative)||config.actorPositionNative.length!==3||!config.actorPositionNative.every(Number.isFinite))throw new TypeError('Explicit native actor position required for Shield body audio');
    if(!['source-port','s5-explicit-adaptation'].includes(config.provenance?.kind)||typeof config.provenance?.source!=='string'||!config.provenance.source)throw new TypeError('Explicit Shield body execution provenance required');
    const entrySerial=(this.s5runtimeShieldBodyEntrySerial??0)+1;
    const pose=createS5RuntimeShieldBodyPose({itemKey:this.s5runtimeSkill.itemKey,bodyEntrySerial:entrySerial,bodyStateConfirmed:true,componentActiveOnEntry:this.s5runtimeSkill.shield.active,nativeBeginAnimationDurationMs:config.nativeBeginAnimationDurationMs});
    const completionDuration=shieldCompletionDuration({sourceDuration:config.bodyCompletionDurationMs,activationDuration:config.bodyActivationDurationMs,animationDuration:pose.durationMs});
    const tick=createS5RuntimeShieldBodyTick({pose,componentActiveOnEntry:this.s5runtimeSkill.shield.active,weaponType:config.weaponType,bodyCompletionDurationMs:completionDuration,savedReturnStateId:config.savedReturnStateId});
    // Install a current body that step actually executes before acknowledging.
    this.s5runtimeShieldBodyEntrySerial=entrySerial;
    const lifecycle={},boundLifecyclePorts={...lifecyclePorts,
      provenance:{...lifecyclePorts.provenance,initializeBodyFields:lifecyclePorts.provenance.initializeBodyFields+'; source648D7D/648D92 reset body activation timer mirrors',playBodyEntry:'Source body pose commands, queued during actual Enter'},
      initializeBodyFields:()=>{
        const initialized=lifecyclePorts.initializeBodyFields();
        if(initialized?.then)throw new TypeError('Shield lifecycle port must return synchronously: initializeBodyFields');
        // The actual body route bypasses the facade's new-entry reset. These
        // elapsed/request fields belong to this body's activation route. The
        // native +178 entry flag is already sampled by tick.activationAttempted;
        // component drain storage is separate and must not be reset here.
        this.s5runtimeSkill.shieldBodyEntrySerial=entrySerial;
        this.s5runtimeSkill.shield.activationElapsedMs=0;
        this.s5runtimeSkill.shield.activationRequested=false;
        return initialized;
      },
      playBodyEntry:()=>{const commands=consumeS5RuntimeShieldBodyEntryPose(pose);this.s5runtimeShieldBodyCommands.push(...commands.map(command=>({...command,bodyEntrySerial:entrySerial})));this.s5runtimeShieldBodyFrame={commands,phase:pose.phase,bodyEntrySerial:entrySerial,nativeReady:false};}};
    this.s5runtimeShieldLowerPresentationSnapshot=null;
    this.s5runtimeShieldBodyState={actorStateId:34,bodyEntrySerial:entrySerial,componentBeginConsumed:this.s5runtimeSkill.shield.active,savedControllerState:this.state,tick,lifecycle,configuration:{...config,lifecyclePorts:boundLifecyclePorts,ports:{...ports},provenance:{...config.provenance}}};
    this.state='s5runtime-skill-shield-body';
    enterShieldBodyLifecycle(lifecycle,{weaponType:config.weaponType,sourceDuration:config.bodyCompletionDurationMs,activationDuration:config.bodyActivationDurationMs,animationDuration:pose.durationMs,actorPosition:config.actorPositionNative},boundLifecyclePorts);
    return {...this.acknowledgeS5RuntimeShieldBody({requestSerial:request.requestSerial,accepted:true,actorStateId:this.s5runtimeShieldBodyState.actorStateId,bodyEntrySerial:this.s5runtimeShieldBodyState.bodyEntrySerial}),nativeReady:false,callbackTruthVerified:false};
  }
  returnS5RuntimeShieldBodyState(request){
    const body=this.s5runtimeShieldBodyState;
    if(!body||request?.actorStateId!==body.tick.savedReturnStateId||request?.bodyEntrySerial!==body.bodyEntrySerial)return {accepted:false,reason:'matching-shield-body-return-required',nativeReady:false};
    leaveShieldBodyLifecycle(body.lifecycle,body.configuration.lifecyclePorts);
    this.state=body.savedControllerState;this.s5runtimeShieldBodyState=null;this.s5runtimeShieldLowerPresentationSnapshot=null;
    this.s5runtimeShieldOperation.pendingRequest=null;this.s5runtimeShieldOperation.bodyEntrySerial=null;
    return {accepted:true,actorStateId:request.actorStateId,nativeReady:false};
  }
  setS5RuntimeSkillDiagnosticContext(context=null){this.s5runtimeSkillDiagnosticContext=context?{...context}:null;}
  setNativeJumpDiagnosticContext(context=null){if(context?.enabled===true&&this.s5runtimeAnchoringBodyState)throw Error('Anchoring and Jump body routes require separate scenarios');this.nativeJumpDiagnosticContext=context?{...context}:null;this.nativeJumpDiagnosticFrame=null;this.nativeFrameTailDiagnosticFrame=null;}
  // CActor::GetMoveSpeedMax: actor speed with weapon/mode rates, before any
  // direction, landing or attack rate.
  get moveSpeedMax(){return TUNING.walk*(this.modeModifiers?.moveFactor??1)*(this.weaponMoveRate/WEAPON_MOVE_RATES.dagger);}
  get weaponMoveRate(){return this.rifle?.profile?.moveSpeedRate??this.support?.profile?.moveSpeedRate??this.throwable?.profile?.moveSpeedRate??WEAPON_MOVE_RATES[this.weapon];}
  // Explicit S5 host policy: a non-idle weapon runtime owns an action.
  // Native body eligibility and independently transferred projectiles differ.
  get weaponRuntimeBusy(){return [this.rifle,this.support,this.throwable,this.airgun,this.cannonade,this.rocketLauncher].some(runtime=>runtime&&runtime.phase!=='idle');}
  advanceWeaponWithMagazineReward(runtime,advance){
    // Optional mode-owned reward, at the actual accepted Reload entry/tick.
    // Other modes have no consumer. Never fabricate a reload from its input.
    if(this.magazineRewardConsumer?.(runtime)===true)return;
    const eventStart=this.events.length;advance();
    if(this.magazineRewardConsumer?.(runtime)===true){
      // Source Reload Enter returns before starting its animation/sound.
      for(let i=this.events.length-1;i>=eventStart;i--)if(this.events[i]==='reloadStart')this.events.splice(i,1);
    }
  }
  consumeSupportHealingRequests(){return this.support?.pendingHealingRequests.splice(0)??[];}
  consumeThrowableSpawns(){return this.throwable?.pendingSpawns.splice(0)??[];}
  advanceWeaponEffects(dt){advanceDemonicKnuckleProtection(this.demonicKnuckleProtection,dt*1000);}
  leaveAttackProtection(){if(this.attack?.weapon==='demonicknuckle'&&this.attack.kind==='heavy')leaveDemonicKnuckleProtection(this.demonicKnuckleProtection);}
  setWeapon(weapon,{heavyHeld=false}={}){
    if(this.comparisonActorMpDiagnosticProfile&&weapon!==this.weapon)throw new Error('Clear actor MP comparison profile before changing loadout');
    if(!Object.hasOwn(MELEE,weapon)&&!isRifleWeapon(weapon)&&!isSupportWeapon(weapon)&&!isThrowableWeapon(weapon)&&!['dagger','airgun','cannonade','rocketlauncher'].includes(weapon))throw Error('Unknown weapon '+weapon);
    if(weapon===this.weapon)return false;
    this.endS5RuntimeAnchoringBodyState({reason:'weapon-changed'});
    // Equipment changes cancel action state, but must not manufacture ammo.
    // Store only consumables; timers, queued shots and charge poses restart.
    const departingAmmo=this.rifle??this.support??this.throwable??this.airgun;
    if(departingAmmo)this.storedWeaponAmmo.set(this.weapon,{ammo:departingAmmo.ammo,
      ...(Object.hasOwn(departingAmmo,'reserve')?{reserve:departingAmmo.reserve}:{})});
    if(this.rifle)cancelRifleRuntime(this.weapon,this.rifle);
    if(this.support)cancelSupportRuntime(this.weapon,this.support);
    if(this.throwable)cancelThrowableRuntime(this.weapon,this.throwable);
    if(this.cannonade)this.cannonadeStoredAmmo=this.cannonade.ammo;
    if(this.rocketLauncher)this.rocketLauncherStored={ammo:this.rocketLauncher.ammo,reserve:this.rocketLauncher.reserve};
    this.leaveAttackProtection();
    this.dodgeSecondaryHandoff=heavyHeld&&this.counterGuardDodge&&this.counterGuardDodgeWindow&&this.weapon==='counter'&&!this.grounded?guardDodgeSecondaryKind(weapon):null;
    this.daggerSwitchRush=!!(this.dodgeSecondaryHandoff&&weapon==='dagger');
    this.plasmaSwitchRush=!!(this.dodgeSecondaryHandoff&&weapon==='plasma');
    this.batSwitchRush=!!(this.dodgeSecondaryHandoff&&weapon==='bat');
    this.counterGuardDodge=false;this.counterGuardDodgeWindow=null;
    this.weapon=weapon;this.attack=null;this.combo=0;this.meleeCombo=0;
    this.fireball=null;
    this.airgun=weapon==='airgun'?createAirgunState():null;
    this.cannonade=weapon==='cannonade'?createCannonadeState():null;
    if(this.cannonade)this.cannonade.ammo=this.cannonadeStoredAmmo;
    this.rocketLauncher=weapon==='rocketlauncher'?createRocketLauncherState():null;
    if(this.rocketLauncher)Object.assign(this.rocketLauncher,this.rocketLauncherStored);
    this.rifle=createRifleRuntime(weapon);
    this.support=createSupportRuntime(weapon);
    this.throwable=createThrowableRuntime(weapon);
    const returningAmmo=this.rifle??this.support??this.throwable??this.airgun;
    if(returningAmmo&&this.storedWeaponAmmo.has(weapon))Object.assign(returningAmmo,this.storedWeaponAmmo.get(weapon));
    if(this.rifle)this.rifle.range=rifleRangeForWorld(this.world);
    this.daggerAirCarry=false;
    this.katanaAirFall=false;
    this.plasmaDashExit=null;this.plasmaLowerHistory=createPlasmaLowerHistory();
    this.clearPlasmaLightHandoff();
    if(this.counterGuardDash){this.counterGuardDash=null;this.velocity.x=0;this.velocity.z=0;}
    this.rootMotionDelta={x:0,y:0,z:0};this.events=[];
    // An absent native secondary child exits Dodge without inventing a
    // new BEGIN press, notably for Semi/Cannonade zoom on the incoming gun.
    return !!this.dodgeSecondaryHandoff&&this.dodgeSecondaryHandoff!=='empty';
  }
  canCarryDodgePrimaryTo(weapon){return this.weapon==='counter'&&this.dash>0&&!this.grounded&&canCarryDodgePrimary(weapon);}
  cancelDodgeForPrimary(){
    this.dash=0;this.dashMotion=null;this.dashPhase=null;
    this.velocity.x=0;this.velocity.z=0;this.events.push('dashcancel');
  }
  recoverEnergy(dt){if(this.comparisonActorMpDiagnosticProfile||this.s5runtimeSkillSpRegenerationEnabled===false)return;const base=TUNING.maxEnergy*TUNING.energyRecoveryRate,rate=this.modeModifiers?(base+this.modeModifiers.energyAdd)*this.modeModifiers.energyFactor:base;this.energy=Math.min(TUNING.maxEnergy,this.energy+rate*dt);}
  stopSprint(){this.sprinting=false;this.sprintBlocked=true;if(!this.events.includes('sprintstop'))this.events.push('sprintstop');}
  cancelWallAction(){
    // Leaving the rebound for another action cancels its upward impulse;
    // an existing downward velocity must continue rather than being reset.
    if(this.wallAction&&!this.grounded)this.velocity.y=Math.min(0,this.velocity.y);
    this.wallAction=null;
  }
  clearPlasmaLightHandoff(){this.plasmaLightHandoff=null;}
  beginInputFrame(){
    if(this._inputFrameOpen)throw new Error('Controller input frame is already open');
    this._inputFrameId=(this._inputFrameId??0)+1;this._inputFrameOpen=true;this._inputFrameHadStep=false;
    return this._inputFrameId;
  }
  endInputFrame(){
    if(!this._inputFrameOpen)throw new Error('Controller input frame is not open');
    this.plasmaLightHandoff=finishPlasmaLightInputFrame(this.plasmaLightHandoff,this._inputFrameId,this._inputFrameHadStep);
    this._inputFrameOpen=false;
  }
  step(dt,input={}) {
    if(!(dt>0&&dt<=1/30))throw Error('Controller expects a fixed step <= 1/30 second');
    const ownInputFrame=!this._inputFrameOpen;
    if(ownInputFrame)this.beginInputFrame();
    try{return this._step(dt,input);}
    finally{if(ownInputFrame)this.endInputFrame();}
  }
  _step(dt,input={}) {
    if(!(dt>0&&dt<=1/30)) throw Error('Controller expects a fixed step <= 1/30 second');
    this._inputFrameHadStep=true;
    if(this.weapon!=='plasma')this.clearPlasmaLightHandoff();
    const plasmaLightInputBlocked=!!this.plasmaLightHandoff;
    if(plasmaLightInputBlocked&&this.plasmaLightHandoff.requestedInputFrame!==this._inputFrameId)
      this.plasmaLightHandoff.phase='normal-pending';
    this.groundLocomotionVelocity=null;
    if(this.nativeActorFrameConfiguration)return this.stepNativeActorFrame(dt,input);
    if(this.comparisonActorMpDiagnosticProfile&&this.infiniteEnergy)throw new Error('Infinite energy is incompatible with actor MP comparison');
    if(this.s5runtimeAnchoringBodyState&&!Number.isInteger(dt*1000))throw new TypeError('Explicit Anchoring integer millisecond body cadence required');
    if(this.s5runtimeAnchoringBodyState&&input.skillNativeInputCode!==undefined&&input.skillNativeInputCode!==null&&!Number.isInteger(input.skillNativeInputCode))throw new TypeError('Explicit Anchoring native input code required');
    if(this.s5runtimeAnchoringBodyState)this.s5runtimeAnchoringBodyState.preflight(dt*1000);
    if(this.s5runtimeShieldActorProfile&&!Number.isInteger(dt*1000))throw new TypeError('Explicit Shield actor integer millisecond cadence required');
    if(this.s5runtimeShieldBodyState){
      if(!Number.isInteger(dt*1000))throw new TypeError('Explicit Shield integer millisecond body cadence required');
      if(this.nativeJumpDiagnosticContext?.enabled===true)throw new Error('Shield and Jump body routes require separate scenarios');
    }
    if(this.nativeJumpDiagnosticContext?.enabled===true){
      if(!Number.isInteger(dt*1000))throw new TypeError('Explicit native integer millisecond Jump cadence required');
      if(this.s5runtimeSkillDiagnosticContext?.enabled===true)throw new Error('Jump and skill diagnostics require separate scenarios');
      // Check the entire optional tail before clocks, physics or state mutate.
      if(this.nativeJumpDiagnosticContext.tail)validateNativeFrameTailDiagnostic({...this.nativeJumpDiagnosticContext.tail,dtMs:dt*1000});
    }
    if(this.s5runtimeShieldActorProfile)advanceS5RuntimeShieldActorProfileTimer(this.s5runtimeShieldActorProfile,dt*1000);
    this.advanceWeaponEffects(dt);
    if(this.infiniteEnergy)this.energy=TUNING.maxEnergy;
    if(this.dash>0){
      // Space alone requires release of the original lateral direction,
      // including release/repress between samples. Forward/back + Space
      // instead exits into longitudinal locomotion, even with Q/D held.
      // Explicit held flags distinguish opposite keys down from neutral.
      const held=this.dashSide<0?(input.leftHeld??input.side<0):(input.rightHeld??input.side>0);
      const released=this.dashSide<0?input.leftReleased:input.rightReleased;
      if(!held||released)this.dashJumpCancelArmed=true;
      const longitudinalHeld=(input.forwardHeld??input.forward>0)||(input.backwardHeld??input.forward<0);
      if(input.jump&&!this.dashJumpCancelArmed&&!longitudinalHeld){input={...input,jump:false};this.jumpBuffer=0;}
    }
    if(this.weapon!=='plasma')this.plasmaDashExit=null;
    const dashExit=advancePlasmaDashExit(this.plasmaDashExit,input,this.grounded);
    this.plasmaDashExit=dashExit.next;
    if(dashExit.blocked){
      // Discard inputs consumed by Standby/airborne Normal. Retain the view;
      // gravity and contacts continue, and no attack or jump is buffered.
      input={facing:input.facing};this.jumpBuffer=0;
    }
    const airborneAtInput=!this.grounded;
    // Remember wall origin through later dodges/cancels until landing. Merely
    // checking wallAction loses this information when dodge replaces it.
    if(this.wallAction)this.wallJumpAirborne=true;
    if(!input.heavyHeld||input.heavyReleased||this.weapon!=='counter'||!this.counterGuardDodgeWindow){this.counterGuardDodge=false;this.counterGuardDodgeWindow=null;}
    const emptySecondaryHandoff=this.dodgeSecondaryHandoff==='empty'&&airborneAtInput;
    const secondaryHandoff=this.dodgeSecondaryHandoff!=='empty'&&airborneAtInput&&input.heavyHeld&&!input.heavyReleased?this.dodgeSecondaryHandoff:null;
    const switchRush=!!secondaryHandoff;
    this.daggerSwitchRush=false;this.plasmaSwitchRush=false;this.batSwitchRush=false;this.dodgeSecondaryHandoff=null;
    const sprintingAtInput=this.sprinting;
    this.events=[];this.sprinting=false;this.rootMotionDelta={x:0,y:0,z:0};this.time+=dt;
    if(this.s5runtimeAnchoringBodyState){
      const body=this.s5runtimeAnchoringBodyState;
      if(input.skillNativeInputCode!==undefined&&input.skillNativeInputCode!==null)body.input(input.skillNativeInputCode);
      this.s5runtimeAnchoringBodyFrame=body.tick(dt*1000,input);
      if(this.s5runtimeAnchoringBodyState===body)this.state='s5runtime-skill-anchoring-body';
      return this.events;
    }
    if(this.s5runtimeShieldBodyState){
      const body=this.s5runtimeShieldBodyState,{configuration:config}=body,dtMs=dt*1000,execution={controller:this,input};
      config.physicsTick(dtMs,execution);
      const result=tickS5RuntimeShieldBody(body.tick,dtMs,{...config.ports,
        baseTick:milliseconds=>config.ports.baseTick(milliseconds,execution),
        readFrameContext:()=>({...config.ports.readFrameContext(execution),bodyStateConfirmed:this.s5runtimeShieldBodyState===body,bodyEntrySerial:body.bodyEntrySerial,componentActive:this.s5runtimeSkill.shield.active}),
        requestBodyReturn:request=>this.returnS5RuntimeShieldBodyState({...request,bodyEntrySerial:body.bodyEntrySerial}),
      });
      const tail=config.afterCurrentStateTick(dtMs,{...execution,bodyResult:result});
      this.s5runtimeShieldBodyCommands.push(...result.commands.map(command=>({...command,bodyEntrySerial:body.bodyEntrySerial})));
      this.s5runtimeShieldBodyFrame={...result,tail,provenance:{...config.provenance},callbackTruthVerified:false,nativeReady:false};
      if(this.s5runtimeShieldBodyState===body)this.state='s5runtime-skill-shield-body';
      return this.events;
    }
    if(this.nativeJumpDiagnosticContext?.enabled===true){
      // Complete callbacks and a separate logical F0 reader are mandatory.
      // This replaces this tick's ordinary integration; never move the command proxy again.
      this.nativeJumpDiagnosticFrame=runNativeJumpDiagnostic({...this.nativeJumpDiagnosticContext,dtMs:dt*1000});
      const tail=this.nativeJumpDiagnosticContext.tail;
      this.nativeFrameTailDiagnosticFrame=tail?runNativeFrameTailDiagnostic({...tail,afterCurrentStateTick:true,dtMs:dt*1000}):null;
      this.state='native-jump-diagnostic';return this.events;
    }
    // Vertical-only Flying diagnostic. The authentic skill key is separate
    // from S5 Fireball; ordinary gameplay cannot activate this unverified gate.
    // Horizontal control, animation and release/landing physics remain open.
    const skillFrame=advanceS5RuntimeSkill(this.s5runtimeSkill,dt*1000,{
      activatePressed:!!input.skillPressed,held:!!input.skillHeld,energy:this.energy,
      fallPressed:!!input.skillFallPressed,nativeInputCode:input.skillNativeInputCode??null,
      actorDead:!!input.actorDead,interrupted:!!(this.attack||this.dash>0||this.wallAction||this.fireball),
      nativeContext:this.s5runtimeSkillDiagnosticContext??null,
    });
    this.s5runtimeSkillFrame=skillFrame;this.energy=skillFrame.energy;
    if([3050001,3050002].includes(this.s5runtimeSkill.itemKey))this.s5runtimeShieldComponentTailToken=this.resetSerial+':'+this.time;
    if(typeof skillFrame.commands.spRegenerationEnabled==='boolean')this.s5runtimeSkillSpRegenerationEnabled=skillFrame.commands.spRegenerationEnabled;
    for(const event of skillFrame.events)this.events.push(event);
    if(skillFrame.commands.releaseFlightControl&&Number.isFinite(skillFrame.commands.verticalVelocity))this.velocity.y=skillFrame.commands.verticalVelocity;
    if(skillFrame.commands.flightControl){
      const command=skillFrame.commands;
      this.velocity={x:0,y:command.verticalDisplacement/dt,z:0};
      this.jumpBuffer=0;this.moveIntent={x:0,z:0};
      this.move(dt);
      // Collision limits position; no generic native logical-velocity reset is established.
      this.velocity.y=command.verticalVelocity;
      if(input.skillMovementVector&&command.applyInputMotion!==false&&Number.isFinite(command.movementScale)){
        const context=this.s5runtimeSkillDiagnosticContext;
        if(typeof context.mirrorZ!=='boolean')throw new TypeError('Explicit native-world flight mirrorZ boundary required');
        const motion=flyInputMotion({actorVector:input.skillMovementVector,cameraDirection:input.skillCameraDirection,
          acceleration:command.nativeAcceleration,actorMoveSpeedNative:context.actorMoveSpeedNative,
          movementScale:command.movementScale,dtMs:dt*1000});
        const delta=motion.nativeDisplacement;
        const result=applyNativePushCollision(this,[delta.x,delta.y,context.mirrorZ?-delta.z:delta.z],{actorPolicy:context.actorPolicy});
        skillFrame.inputMotion={...motion,submittedWrites:result.writes,mirrorZ:context.mirrorZ};
      }
      this.state='s5runtime-skill-fly-diagnostic';return this.events;
    }
    if(advanceFireball(this,dt,input)){
      // Grounded Katon: fixed support and facing until the 90-frame clip ends.
      this.jumpBuffer=0;return this.events;
    }
    let energyRecovered=false,sprintSpent=false;
    if(!input.sprint||input.forwardPressed)this.sprintBlocked=false;
    if(input.sprint&&this.energy<=0)this.stopSprint();
    // A sprint request cannot interrupt an active walljump or remain latched
    // for landing. Ordinary directional control is still allowed after flight.
    if(this.wallAction&&input.sprint)this.stopSprint();
    // No input queue or gravity during the wall preparation. Launch is decided
    // by this same clock as the animation, not by MotionGraph's event age.
    if(this.wallAction?.phase==='prepare'){
      this.recoverEnergy(dt);energyRecovered=true;
      this.wallAction.timeMs+=dt*1000;
      this.jumpBuffer=0;
      if(this.wallAction.timeMs<=TUNING.wallPrepareMs+1e-8){this.state='wallprepare';return this.events;}
      // CBoundJumpState::Tick 0x607A3F checks SP after preparation;
      // insufficient SP enters substate 7 and plays warning.ogg.
      if(this.energy<TUNING.wallCost){
        this.wallAction={...this.wallAction,phase:'fail',timeMs:0};
        this.wallJumpFailed=true;this.events.push('wallfail');
      }else{
        if(!this.infiniteEnergy)this.energy-=TUNING.wallCost;
        this.wallAction={...this.wallAction,phase:'flight',timeMs:0};
        this.velocity={...this.wallAction.launch};
        this.jumpOriginY=this.position.y;
        this.facing=Math.atan2(-this.velocity.x,-this.velocity.z);
        this.airDashUsed=false;
        this.events.push('walllaunch');
      }
      // Inputs pressed during preparation are discarded, including on launch.
      input={};
    }
    if(this.wallAction?.phase==='flight'){
      this.wallAction.timeMs+=dt*1000;
      if(this.wallAction.timeMs>TUNING.wallFlightMs)this.wallAction={...this.wallAction,phase:'fall',timeMs:0};
    }
    if(this.dash===0){this.dashPhase=null;this.dashMotion=null;}
    // INPUT_JUMP is handled once, in the state current at input time: no
    // buffered press and no jump after support is lost (CFallState).
    this.coyote=this.grounded?1:0;this.jumpBuffer=input.jump?1:0;
    let x=input.x||0,z=input.z||0;const length=Math.hypot(x,z);if(length>1){x/=length;z/=length;}
    const moving=length>.01;
    const secondaryEntry=secondaryEntryRequested(this.weapon,input,!!this.attack);
    this.moveIntent={x,z};
    const rushLocked=this.attack?.type==='rush';
    if(this.grounded||this.weapon!=='katana')this.katanaAirFall=false;
    // CAttackStateKatanaJumpState gate reads actor+0x398, incremented once
    // on state entry. This limits aerial entries, not its three contacts.
    if(this.grounded)this.katanaAirAttackCount=0;
    if(Number.isFinite(input.facing)&&canFollowMouse(this))this.facing=input.facing;
    const airborneDodgePrimary=this.dash>0&&!this.grounded?dodgePrimaryRequest(this.weapon,input):null;
    const airborneDodgeSecondary=this.dash>0&&!this.grounded?dodgeSecondaryRequest(this.weapon,input,!!this.attack):null;
    const dodgeSecondaryKind=secondaryHandoff??airborneDodgeSecondary;
    if(emptySecondaryHandoff&&!airborneDodgePrimary)this.cancelDodgeForPrimary();
    if(airborneDodgePrimary&&(this.rifle||this.airgun||this.cannonade||this.rocketLauncher))this.cancelDodgeForPrimary();
    if(dodgeSecondaryKind&&(this.rifle||this.rocketLauncher))this.cancelDodgeForPrimary();
    input=this.emptyMagazineReload.update(this.rifle??this.airgun??this.cannonade??this.rocketLauncher,input,{unlimitedRefill:!!(this.airgun||this.cannonade),secondaryFire:this.weapon==='rocketlauncher'});
    if(this.rifle){
      advanceDispersion(this.rifle,dt);
      for(const shot of this.rifle.pendingShots)shot.delayRemaining=Math.max(0,(shot.delayRemaining||0)-dt);
      if(this.dash>0||this.wallAction){
        cancelRifleRuntime(this.weapon,this.rifle,!!input.light);
        if(this.weapon==='semirifle')this.rifle.zoom=!!input.heavyHeld;
      }
      else if(this.weapon==='smashrifle'&&(this.attack?.kind==='secondary'||(secondaryEntry&&(this.grounded||dodgeSecondaryKind==='secondary')&&!this.attack))){
        if(!this.attack){this.attack=createSmashSecondary({sex:this.sex,facing:this.facing});this.rifle.pendingShots=[];this.events.push('attack');}
        this.rifle.phase='secondary';this.rifle.held=!!input.light;
      }
      else this.advanceWeaponWithMagazineReward(this.rifle,()=>advanceRifleRuntime(this.weapon,this.rifle,this.rifle.phase==='reload'&&this.modeModifiers?dt*chaserReloadTimeScale(this.rifle.profile?.reloadMs??2000,this.modeModifiers.reloadReduction):dt,input,this.events));
      if(this.events.includes('shot')&&!rifleOwnsPendingShots(this.weapon))this.rifle.pendingShots.push({mapAttackSource:this.rifle.mapAttackSource,delayRemaining:this.weapon==='revolver'?.15:(this.rifle.shotDelay||0),dispersion:takeShotDispersion(this.rifle,this.weapon),position:{...this.position},facing:this.facing,aimTarget:this.rifle.aimTarget&&{...this.rifle.aimTarget}});
      if(rifleOwnsPendingShots(this.weapon)&&this.events.includes('shot'))for(const shot of this.rifle.pendingShots){
        if(!shot.position){shot.position={...this.position};shot.facing=this.facing;}
      }
      if(this.rifle.phase!=='idle'||this.rifle.zoom)input={...input,sprint:false};
    }
    if(this.throwable){
      if(this.dash>0||this.wallAction)cancelThrowableRuntime(this.weapon,this.throwable,!!input.light);
      else this.advanceWeaponWithMagazineReward(this.throwable,()=>advanceThrowableRuntime(this.weapon,this.throwable,dt,input,this.events));
      if(this.throwable.phase!=='idle')input={...input,sprint:false};
    }
    if(this.support){
      if(this.dash>0||this.wallAction)cancelSupportRuntime(this.weapon,this.support,!!input.light);
      else this.advanceWeaponWithMagazineReward(this.support,()=>advanceSupportRuntime(this.weapon,this.support,dt,input,this.events));
      if(this.support.phase!=='idle')input={...input,sprint:false};
    }
    if(this.airgun){
      if(this.dash>0||this.wallAction){this.airgun.phase='idle';this.airgun.held=!!input.light;}
      else this.advanceWeaponWithMagazineReward(this.airgun,()=>advanceAirgun(this.airgun,this.airgun.phase==='reload'&&this.modeModifiers?dt*chaserReloadTimeScale(AIRGUN_RELOAD_MS,this.modeModifiers.reloadReduction):dt,input,this.events,this.sex));
      if(this.airgun.phase!=='idle')input={...input,sprint:false};
    }
    if(this.cannonade){
      if(this.dash>0||this.wallAction){
        cancelCannonade(this.cannonade,!!input.light);
        if(this.dash>0){if(input.heavy)this.cannonade.zoom=!this.cannonade.zoom;this.cannonade.heldRight=!!input.heavyHeld;}
      }
      else this.advanceWeaponWithMagazineReward(this.cannonade,()=>advanceCannonade(this.cannonade,this.cannonade.phase==='reload'&&this.modeModifiers?dt*chaserReloadTimeScale(CANNONADE.reloadMs,this.modeModifiers.reloadReduction):dt,input,this.events));
      if(this.cannonade.phase!=='idle')input={...input,sprint:false};
    }
    if(this.rocketLauncher){
      if(this.dash>0||this.wallAction)cancelRocketLauncher(this.rocketLauncher,input);
      else this.advanceWeaponWithMagazineReward(this.rocketLauncher,()=>advanceRocketLauncher(this.rocketLauncher,this.rocketLauncher.phase==='reload'&&this.modeModifiers?dt*chaserReloadTimeScale(ROCKET_LAUNCHER.reloadMs,this.modeModifiers.reloadReduction):dt,input,this.events));
      if(this.rocketLauncher.phase!=='idle')input={...input,sprint:false};
    }
    if(this.attack?.weapon==='plasma'||this.attack?.profile?.allowMouseRotation||(this.weapon==='dagger'&&this.attack?.type==='rush'))this.attack.facing=this.facing;
    if(this.attack?.weapon==='counter'){
      const heading=counterReticleHeading(this.position,input,this.attack.facing);
      this.facing=heading;this.attack.facing=heading;
      // Steer the existing aerial impulse, without restarting SetDrop or
      // adding speed/distance on each mouse update.
      if(this.attack.kind==='air'&&this.attack.dropApplied&&this.attack.phase==='action'){
        const speed=Math.hypot(this.velocity.x,this.velocity.z);
        this.velocity.x=Math.sin(heading)*speed;this.velocity.z=Math.cos(heading)*speed;
      }
    }
    // Native DODGE_LEFT/RIGHT inputs 7/8 go straight to the weapon's
    // WEAK/STRONG states. Plasma and Bat retain their ground attacks even airborne.
    // Both CDodgeState phases route the click to the ground slash. After its
    // full exit, Fall/Jump route it to the aerial attack; do not keep a flag
    // that enables a ground slash for the remainder of the airborne flight.
    const plasmaDashAttack=this.weapon==='plasma'&&this.dash>0;
    // Current Katana2000018 accepts the long route in airborne Dodge; its
    // short route is refused. Keep the pre-existing grounded/secondary gates.
    const katanaDashAttack=this.weapon==='katana'&&this.dash>0&&(this.grounded||!!input.lightLong||secondaryEntry);
    const batDashAttack=this.weapon==='bat'&&this.dash>0;
    const counterDashGuard=this.weapon==='counter'&&this.dash>0&&secondaryEntry;
    const otherDodgePrimary=!!airborneDodgePrimary&&['counter','demonicknuckle','assassinclaw'].includes(this.weapon);
    // S5Runtime applies pending transitions after the old state's Tick. On the
    // final Dodge tick its Standby request supersedes the earlier click.
    const plasmaDashFinishes=!switchRush&&plasmaDashAttack&&this.dashMotion&&advanceDashMotion({...this.dashMotion},dt*1000).finished;
    if(plasmaDashFinishes&&input.jump){input={...input,jump:false};this.jumpBuffer=0;}
    if(!this.airgun&&!this.cannonade&&!this.rocketLauncher&&!this.rifle&&!this.support&&!this.throwable&&!dashExit.blocked&&!plasmaDashFinishes&&!plasmaLightInputBlocked&&!(this.weapon==='plasma'&&input.plasmaDamageInputBlocked)&&this.weapon!=='dagger'&&(this.dash===0||plasmaDashAttack||katanaDashAttack||batDashAttack||counterDashGuard||otherDodgePrimary||dodgeSecondaryKind)){
      const short=input.lightShort??input.light,long=!!input.lightLong;
      // A fresh primary event must reach Normal even while secondary9 is
      // still held. Otherwise a refused repeat (SP/cooldown/no binding)
      // swallows the click: native Iron Boots/Sigma captures exercise this.
      const meleeSecondaryEntry=secondaryEntry&&(!(short||long)||!!input.heavy);
      let kind=null,combo=0,transition=null,sigmaEntry=null;
      if(this.attack?.phase==='guard'&&(short||long))kind=long?'heavy':'light';
      else if(this.attack?.profile){
        transition=meleeTransition(this.attack,input,dt*1000);
        if(transition){if(transition.kind==='normal'){this.attack=null;}else{kind=transition.kind;combo=transition.combo;}}
      }
      else if(!this.attack){
        if(dodgeSecondaryKind)kind=this.weapon==='deathscythe'?deathScytheInitialAction({...input,heavy:true},{grounded:true,energy:this.infiniteEnergy?Infinity:this.energy})?.kind??null:dodgeSecondaryKind;
        else if(this.weapon==='assassinclaw'&&(otherDodgePrimary||input.light))kind=this.grounded||otherDodgePrimary?'light':null;
        else if(this.weapon==='deathscythe')kind=deathScytheInitialAction({...input,heavy:meleeSecondaryEntry},{grounded:this.grounded,energy:this.infiniteEnergy?Infinity:this.energy})?.kind??null;
        else if(this.weapon==='demonicknuckle')kind=meleeSecondaryEntry&&this.grounded?'heavy':short||long?(this.grounded||otherDodgePrimary?'light':'air'):null;
        else if(this.weapon==='vitalshock')kind=vitalShockInitialAction({...input,heavy:meleeSecondaryEntry},{grounded:this.grounded,energy:this.infiniteEnergy?Infinity:this.energy,switchRush})?.kind??null;
        else if(this.weapon==='sigmablade'&&(input.heavyHeld??input.heavy)&&(!(short||long)||input.heavy)&&this.grounded&&this.dash===0)kind='heavy';
        else if(switchRush||(meleeSecondaryEntry&&(this.weapon==='counter'||this.weapon==='katana'||this.weapon==='twinblade'||(this.grounded&&this.dash===0))))kind=this.weapon==='vitalshock'?'rush':this.weapon==='ironboots'?'boost':this.weapon==='counter'?'guard':this.weapon==='twinblade'?(this.grounded?'charge':'heavy'):this.weapon==='breaker'?'charge':this.weapon==='katana'?'backdash':'heavy';
        else if(short||long){kind=this.grounded||plasmaDashAttack||katanaDashAttack||batDashAttack||otherDodgePrimary?(long?(this.weapon==='counter'?'heavy':'strong'):'light'):'air';combo=this.weapon==='plasma'?this.meleeCombo:0;}
      }
      if(this.weapon==='katana'&&kind==='air'&&this.katanaAirAttackCount>=1)kind=null;
      // Bat spin CanEnter (5f3780) rejects a non-normal vertical state.
      if(this.weapon==='bat'&&['spin2','spin3','spin4','spin5'].includes(kind)&&!this.grounded)kind=null;
      if(this.weapon==='ironboots'&&kind){
        const p=kind==='light'?MELEE.ironboots.light[combo]:MELEE.ironboots[kind];
        if(this.time<(this.ironBootsCooldowns[kind]??-Infinity)||(!this.infiniteEnergy&&kind==='strong'&&this.energy<p.spCost))kind=null;
      }
      const definition=meleeDefinition(this.weapon,this.sigmaTransformed);
      if(this.weapon==='demonicknuckle'&&kind){
        const p=kind==='light'?definition.light[0]:definition[kind];
        if(this.time<(this.demonicKnuckleCooldowns[kind]??-Infinity)||(!this.infiniteEnergy&&this.energy<p.minSp))kind=null;
      }
      if(this.weapon==='vitalshock'&&kind&&!this.infiniteEnergy&&this.energy<(kind==='light'?definition.light[combo]:definition[kind])?.minSp)kind=null;
      if(this.weapon==='sigmablade'&&kind){
        if(kind==='heavy'){
          sigmaEntry=sigmaBladeTransformEntry({transformed:this.sigmaTransformed,lastTransformMs:this.sigmaLastTransformMs,nowMs:this.time*1000,sp:this.energy,infiniteEnergy:this.infiniteEnergy});
          if(!sigmaEntry)kind=null;
        }else if(!this.infiniteEnergy&&this.energy<(kind==='light'?definition.light[combo]:definition[kind])?.stateMinSp)kind=null;
      }
      if((kind==='air'&&definition?.supportsAir===false)||(kind==='heavy'&&definition?.supportsSecondary===false)||(kind==='strong'&&definition?.supportsStrong===false))kind=null;
      if(kind){
        if(this.weapon==='katana'&&kind==='air')this.katanaAirAttackCount++;
        if(this.dash>0&&(plasmaDashAttack||katanaDashAttack||batDashAttack||counterDashGuard||otherDodgePrimary||dodgeSecondaryKind)){
          // Counter guard replaces the pose, but the user's S5Runtime correction
          // retains the existing dodge clock while its lateral key is held.
          // Plasma slash still replaces the dodge with attack locomotion.
          if(counterDashGuard)this.counterGuardDash={motion:this.dashMotion,side:this.dashSide,
            facing:this.dashFacing,direction:{...this.dashDirection}};
          this.dash=0;this.dashMotion=null;this.dashPhase=null;
          this.velocity.x=0;this.velocity.z=0;
          this.events.push('dashcancel');
        }
        // Sample the current reticle at entry too, including queued strikes;
        // active Counter attacks continue tracking it above.
        // Bat's CAttackState::Enter (5e3660) snapshots the horizontal camera
        // direction. Refresh at entry even when the previous state held yaw.
        if(this.weapon==='counter')this.facing=counterReticleHeading(this.position,input,this.facing);
        else if(['twinblade','ironboots','bat','sigmablade','vitalshock','deathscythe','demonicknuckle'].includes(this.weapon)&&Number.isFinite(input.facing))this.facing=input.facing;
        this.cancelWallAction();
        const demonicLight=this.weapon==='demonicknuckle'&&kind==='light'?beginDemonicKnuckleLight(this.demonicKnuckleHand,{clockMode:'arena-fractional-ms'}):null;
        const sigmaAirAnimationIndex=this.weapon==='sigmablade'&&kind==='air'?enterSigmaBladeAirAnimation(this.sigmaAirAnimation):0;
        this.attack=createMeleeAttack(this.weapon,kind,combo,this.sex,this.facing,{transformed:!!this.sigmaTransformed,demonicLight,sigmaAirAnimationIndex});
        if(isPlasmaLight(this.attack))Object.assign(this.attack,{plasmaLightEntryInputFrame:this._inputFrameId,previousTimeMs:0,previousPhaseTimeMs:0,previousPhase:'action'});
        if(dodgeSecondaryKind&&kind==='charge'&&['twinblade','breaker'].includes(this.weapon))this.attack.dodgeSecondaryCharge=true;
        // Right's mode3 facade enters the mode2 gather before AfterDash.
        // The air Dodge route already starts at the final facade (one40ms
        // leg); grounded Normal traverses both observed source40ms legs.
        if(kind==='charge'&&['twinblade','breaker'].includes(this.weapon)){
          this.attack.secondaryChargeStage=transition?.secondaryChargeStage??(dodgeSecondaryKind?2:1);
          if(this.attack.secondaryChargeStage===2)this.attack.profile={...this.attack.profile,clip:this.weapon==='twinblade'?'SG017':'HM007',animationSpeed:1};
        }
        if(this.weapon==='demonicknuckle'){
          const p=this.attack.profile;
          if(p.cooldownMs)this.demonicKnuckleCooldowns[kind]=this.time+p.cooldownMs/1000;
          if(!this.infiniteEnergy)this.energy-=p.spCost;
          if(kind==='heavy')enterDemonicKnuckleProtection(this.demonicKnuckleProtection);
        }
        if(this.weapon==='deathscythe'&&kind==='air'){
          this.attack.scytheStaySky=createDeathScytheStaySky();
          this.attack.scythePhysicsEnabled=true;
          this.attack.scytheActorMode=this.grounded?0:this.velocity.y>0?1:2;
        }
        if(sigmaEntry){this.sigmaTransformed=sigmaEntry.transformed;this.sigmaLastTransformMs=sigmaEntry.lastTransformMs;}
        if(this.weapon==='vitalshock'&&!this.infiniteEnergy)this.energy-=this.attack.profile.spCost??0;
        if(this.weapon==='deathscythe'&&!this.infiniteEnergy)this.energy-=this.attack.profile.spCost??0;
        if(this.weapon==='ironboots'){
          const p=this.attack.profile;
          if(p.cooldownMs)this.ironBootsCooldowns[kind]=this.time+p.cooldownMs/1000;
          if(kind==='strong'&&!this.infiniteEnergy)this.energy-=p.spCost;
        }
        if(transition?.chargeMs!==undefined){this.attack.chargeMs=transition.chargeMs;this.attack.fullCharge=transition.fullCharge;}
        if(kind==='light')this.meleeCombo=(combo+1)%definition.light.length;
        this.events.push('attack');}
    }
    const daggerDodgePrimary=this.weapon==='dagger'&&!!airborneDodgePrimary&&this.dash>0;
    const cutJumpOffsetMs=Number.isFinite(this.attack?.primaryPressedAt)&&Number.isFinite(input.jumpPressedAt)?(input.jumpPressedAt-this.attack.primaryPressedAt)*1000:Infinity;
    let daggerJumpCutEntry=this.weapon==='dagger'&&this.attack?.type==='light'&&this.grounded&&!!input.jump&&cutJumpOffsetMs>=0&&cutJumpOffsetMs<=CUT_JUMP_INPUT_WINDOW_MS+1e-6;
    if(this.weapon==='dagger'&&input.light&&!input.daggerDamageInputBlocked&&!secondaryEntry&&!switchRush&&!this.attack&&(this.dash===0||daggerDodgePrimary)){
      if(daggerDodgePrimary)this.cancelDodgeForPrimary();
      // Same-tick synthetic inputs remain supported. Real edges also retain
      // their physical timestamps across the next simulation tick above.
      const initialJumpOffsetMs=Number.isFinite(input.lightPressedAt)&&Number.isFinite(input.jumpPressedAt)?(input.jumpPressedAt-input.lightPressedAt)*1000:-Infinity;
      daggerJumpCutEntry=this.grounded&&!!input.jump&&initialJumpOffsetMs<=CUT_JUMP_INPUT_WINDOW_MS+1e-6;
      this.cancelWallAction();this.combo=(this.combo+1)%2;
      this.attack={type:this.grounded||daggerDodgePrimary?'light':'air',time:0,hit:false,duration:CUT_ACTION_MS/1000,primaryPressedAt:input.lightPressedAt};
      this.events.push('attack');
    }
    if(this.weapon==='dagger'&&(secondaryEntry||switchRush)&&!this.attack&&(this.grounded||switchRush)){this.dash=0;this.dashPhase=null;this.dashMotion=null;this.wallAction=null;this.attack={type:'rush',time:0,hits:0,phase:'action',phaseTimeMs:0,duration:TUNING.rushAction+TUNING.rushRecovery,facing:this.facing};this.events.push('attack');}
    if(switchRush&&this.events.includes('attack')){this.attack.revengeDash=true;this.events.push('revengedash');}
    if(this.attack||this.dash>0||this.wallAction)this.katanaAirFall=false;
    let locked=rushLocked||this.attack?.type==='rush'||this.attack?.locked||this.katanaAirFall||batMovementPolicy(this.attack)?.immobile;
    if(locked)this.jumpBuffer=0;
    // A plain forward press only cancels the jump with an empty SP reserve.
    // Check before this tick's regeneration; a real sprint is handled below.
    if(airborneAtInput&&input.forwardPressed&&this.energy<=0&&!locked&&!this.attack&&this.dash===0){
      this.airLocomotion=true;this.normalJump=false;
      this.velocity.y=Math.min(0,this.velocity.y);
    }
    // Ground cancel jumps; airborne cancel only releases the dodge, retaining
    // its current vertical velocity. Neither leaves a lateral dash tail.
    const dashCancel=!!input.jump&&this.dash>0&&!locked;
    const airDashCancel=dashCancel&&!this.grounded;
    if(this.dash>0&&!dashCancel&&input.sprintPressed)this.events.push('dodgesprintrejected');
    if(dashCancel){
      this.counterGuardDodge=false;this.counterGuardDodgeWindow=null;
      this.dash=0;this.dashPhase=null;this.dashElapsedMs=0;this.dashMotion=null;
      this.velocity.x=0;this.velocity.z=0;
      this.events.push('dashcancel');
      if(Number.isFinite(input.facing))this.facing=input.facing;
    }
    // Being airborne is not enough to start a walljump: running or sprinting
    // off support must first enter a normal jump. An existing walljump keeps
    // its rebound path so consecutive walljumps remain possible.
    // Space consumed by a dodge cancel is not a new manual takeoff. Test
    // dashCancel as well: the cancellation above has already cleared dash.
    // CJumpState::Input: a wall jump needs SUBSTATE_JUMP_MOVE_RISE/FALL, so a
    // vertical jump (no direction at takeoff) never qualifies. No height bound.
    const wallJumpStateAllowed=!sprintingAtInput&&!dashCancel&&this.dash===0&&(this.wallAction?this.wallAction.phase==='flight':(this.jumpAirborne||this.normalJump)&&!this.verticalJump);
    // CBoundJumpState::Input: rebounds only in JUMP_RISE_A/B, once m_JumpTimeTA has
    // advanced; the fall substate after the 500 ms flight cannot rebound.
    const rebound=this.jumpBuffer>0&&!this.grounded&&this.wallAction?.phase==='flight'&&this.wallAction.timeMs>0?this.findReboundWall():null;
    // Keep the contact/direction checks for chained rebounds after the visual
    // flight phase too. Failure never falls back to a fresh wall entry.
    const facingWall=this.wallAction?rebound?.normal:(this.jumpBuffer>0&&!this.grounded?this.findFacingWall():null);
    const forwardHeld=input.forwardHeld??((input.forward??(x*Math.sin(this.facing)+z*Math.cos(this.facing)))>1e-6);
    const backwardHeld=input.backwardHeld??((input.forward??(x*Math.sin(this.facing)+z*Math.cos(this.facing)))< -1e-6);
    // Wall entry and rebounds require forward/back held on this request.
    // Lateral-only Space remains a dodge, even against a valid wall contact.
    const wallJump=(forwardHeld||backwardHeld)&&this.jumpBuffer>0&&!this.grounded&&wallJumpStateAllowed&&facingWall&&!this.attack&&!this.wallJumpFailed;
    if(airDashCancel&&!wallJump){
      this.jumpBuffer=0;this.coyote=0;this.airLocomotion=true;this.events.push('aircancel');
    }
    // plasmasword2: Space inside WEAK/STRONG drives the lower-body jump;
    // even Q/D + Space keeps the attack state and does not enter DODGE.
    const plasmaSlash=this.attack?.weapon==='plasma'&&['light','strong'].includes(this.attack.kind);
    if(plasmaSlash&&(!this.grounded||!input.jump))this.jumpBuffer=0;
    const batPolicy=batInputPolicy(this.attack);
    // Keep Bat's movement rate independent of its first-phase cancel gate.
    // An early Space edge is consumed here rather than carried into phase2.
    if(batPolicy&&(!batPolicy.canJump||!this.grounded||!input.jump))this.jumpBuffer=0;
    const batLowerJump=!!batPolicy?.canJump&&this.grounded;
    const dashRequested=(input.dodge||input.jump&&!input.jumpOnly&&!input.rapidJump)&&Math.abs(input.side||0)>0&&!forwardHeld&&!backwardHeld&&!wallJump&&!locked&&!dashCancel&&!plasmaSlash&&(!batPolicy||batPolicy.canDodge);
    if(this.jumpBuffer>0&&(!this.attack||this.attack.kind==='guard'||plasmaSlash||batLowerJump||daggerJumpCutEntry)&&!dashRequested){
      if(wallJump){
        this.wallJumpAirborne=true;
        this.jumpAirborne=true;
        this.normalJump=false;this.jumpRecovery=null;
        if(this.dash>0)this.events.push('dashcancel');
        this.dash=0;this.dashPhase=null;this.dashElapsedMs=0;this.dashMotion=null;
        this.wallAction={phase:'prepare',timeMs:dt*1000,normal:facingWall,launch:wallJumpVelocity(rebound?.incomingFacing??this.facing,facingWall)};
        this.wall=null;
        this.airLocomotion=false;
        this.facing=Math.atan2(-facingWall.x,-facingWall.z);
        this.velocity={x:0,y:0,z:0};
        this.jumpBuffer=0;this.coyote=0;this.state='wallprepare';this.events.push('walljump');if(sprintingAtInput)this.stopSprint();
        if(!energyRecovered)this.recoverEnergy(dt);
        return this.events;
      }
      else if((this.coyote>0||(dashCancel&&!airDashCancel))&&this.dash===0){
        this.velocity.y=TUNING.jump;this.grounded=false;this.coyote=0;this.jumpBuffer=0;
        this.jumpOriginY=this.position.y;
        this.sprintBlocked=true;this.airLocomotion=false;this.events.push('jump');
        this.normalJump=true;this.jumpRecovery=null;
        this.jumpAirborne=true;
        // CJumpState m_bVerticalJump: no goal direction at takeoff.
        this.verticalJump=!moving;
        if(plasmaSlash){
          const lower=this.plasmaLowerHistory[this.attack.kind];lower.mode='air';lower.landingMs=0;
          this.attack.lowerJump={startMs:this.attack.timeMs};
        }
        if(batLowerJump)this.attack.lowerJump={startMs:this.attack.timeMs};
      }
    }
    if(dashRequested)this.jumpBuffer=0;
    if(dashRequested&&this.dash===0&&this.energy>=TUNING.dashCost){
      this.counterGuardDodge=!!(this.weapon==='counter'&&this.attack?.kind==='guard'&&input.heavyHeld&&!input.heavyReleased);
      // The handoff window follows the original dodge clock, independently
      // of Q/D release cancelling the guard's lateral motion.
      this.counterGuardDodgeWindow=this.counterGuardDodge?createDashMotion():null;
      if(!this.infiniteEnergy)this.energy-=TUNING.dashCost;this.dash=TUNING.dashDuration;this.dashElapsedMs=0;
      this.dashMotion=createDashMotion();this.dashJumpCancelArmed=false;
      // A dodge replaces the previous jump and its walljump permission.
      // Only a later actual manual jump can grant fresh wall entry again.
      this.jumpAirborne=false;this.normalJump=false;this.jumpRecovery=null;
      // S5Runtime dagger capture 20260924-234804, 48.679 s: walljump -> dodge
      // resets vertical velocity, including a fall. Gravity resumes this tick.
      // Keep ordinary air dashes and unmeasured weapon transitions unchanged.
      if(this.weapon==='dagger'&&!this.grounded&&['flight','fall'].includes(this.wallAction?.phase))this.velocity.y=0;
      this.cancelWallAction();
      this.airLocomotion=false;
      // Counter capture 19:28:23 (12.601, 14.091, 14.991, 15.980 s):
      // grounded guard -> dodge starts with native jump velocity +2700,
      // including the guard release phase. Airborne entries keep their arc.
      if(this.weapon==='counter'&&this.attack?.kind==='guard'&&this.grounded){
        this.velocity.y=TUNING.jump;this.grounded=false;this.coyote=0;
        this.jumpOriginY=this.position.y;this.sprintBlocked=true;
      }
      if(!this.grounded)this.airDashUsed=true;
      const side=Math.sign(input.side);
      this.dashSide=side;
      this.dashFacing=Number.isFinite(input.facing)?input.facing:this.facing;
      const direction={x:-Math.cos(this.dashFacing)*side,z:Math.sin(this.dashFacing)*side};
      this.dashDirection=direction;this.attack=null;this.events.push(this.grounded?'dash':'airdash');
    }
    // A new action replaces the completed aerial cut's movement mode.
    if(this.grounded||this.attack||this.wallAction||this.dash>0)this.daggerAirCarry=false;
    const cutAtTick=this.attack&&!this.attack.profile&&this.attack.type!=='rush'?this.attack:null;
    const cutActionAtTick=!!cutAtTick&&cutAtTick.phase!=='recovery';
    const plasmaLowerMotion=advancePlasmaLowerMotion(this.attack,this.plasmaLowerHistory,dt*1000,this.grounded);
    let sigmaRecoveryEntry=false,sigmaRecoveryTranslation;
    if(this.attack?.weapon==='smashrifle'&&this.attack.kind==='secondary'){
      const attack=this.attack,elapsed=dt*1000+attack.fractionalMs,delta=Math.floor(elapsed+1e-8);attack.fractionalMs=Math.max(0,elapsed-delta);
      if(advanceSmashSecondary(attack,delta,this.events)){this.attack=null;this.rifle.phase='idle';this.rifle.timeMs=0;}
      else this.rifle.timeMs=attack.timeMs;
    }
    else if(this.attack?.profile){
      const completed=this.attack;
      const phaseAtTick=completed.phase;
      if(completed.scytheUppercut)completed.scytheUppercutGrounded=this.grounded;
      if(completed.weapon==='sigmablade'&&completed.kind==='air'&&phaseAtTick==='action'){
        // Native lower Tick precedes the strict action timeout. Recovery
        // exits that child without replacing its selected animation.
        completed.sigmaAirLowerPose=sigmaBladeAirLowerPose(completed.profile,x,z,this.facing,this.modeModifiers?.moveFactor??1);
      }
      if(!deferPlasmaLightEntry(completed,this._inputFrameId)&&advanceMeleeAttack(completed,dt*1000,input,this.events)){
        this.leaveAttackProtection();
        // User-observed Katana terminal fall: ending the animation's recovery
        // timer must not restore keyboard travel before physical landing.
        this.katanaAirFall=completed.weapon==='katana'&&completed.kind==='air'&&completed.delayDropApplied&&!this.grounded;
        if(isPlasmaLight(completed))this.plasmaLightHandoff=requestPlasmaLightHandoff(this._inputFrameId);
        this.attack=null;
      }
      // UpperCut's type0x200 condition transfers the local attacker to its
      // own state at the heavy contact. The old hit snapshots remain queued;
      // this is not another damaging attack or a second sound activation.
      if(this.attack===completed&&completed.weapon==='deathscythe'&&completed.kind==='heavy'&&completed.hits>0){
        this.attack=createMeleeAttack('deathscythe','uppercut',0,this.sex,this.facing);
        this.velocity=deathScytheUppercutVelocity();this.grounded=false;this.normalJump=false;this.coyote=0;this.jumpRecovery=null;
        this.events.push('scytheuppercut');
      }
      const scytheFinishMotion=deathScytheFinishMotionCommand(completed.scytheSpecialSample?.transition,{remoteActor:false});
      if(scytheFinishMotion?.resetVelocity)this.velocity={...scytheFinishMotion.resetVelocity};
      if(completed.profile.resetVelocityOnRecovery&&phaseAtTick!=='recovery'&&completed.phase==='recovery'){
        // Native CAttackState phase 1 (0x5E56B1–0x5E56EE) clears actor
        // velocity XYZ once. Iron Boots Sliding phase1 also clears actor+F0
        // at0x5B2030; its recovery MoveBox remains a separate movement.
        // Katana release CAttackStateEx phase1 clears the same actor+F0
        // protected velocity at0x5EB54A.
        // Drop mode/terminal stay active; gravity resumes
        // below. Keeping X/Z here extended Counter's aerial lunge by 600 ms.
        this.velocity={x:0,y:0,z:0};
        sigmaRecoveryEntry=completed.weapon==='sigmablade'&&completed.kind==='air';
      }
    }
    else if(this.attack){
      const a=this.attack;a.previousTimeMs=a.timeMs||0;a.timeMs=a.previousTimeMs+dt*1000;a.time=a.timeMs/1000;
      if(a.type==='rush') {while(a.hits<daggerRushContacts.length&&a.timeMs>=daggerRushContacts[a.hits]){const index=a.hits++;emitMeleeActivation(this.events,a,index,daggerRushContacts[index]);}}
      else if(a.timeMs>=daggerCutContact&&!a.hit){a.hit=true;emitMeleeActivation(this.events,a,0,daggerCutContact);}
      if(a.type==='rush'?advanceRushPhase(a,dt*1000,moving):advanceCutPhase(a,dt*1000)){
        this.attack=null;
        if(a.type==='rush')locked=false;
        // Completed dagger float returns to the falling pose, not air walking.
        // Movement remains available; a subsequent attack still has priority.
        else if(!this.grounded){
          this.airLocomotion=false;
          this.daggerAirCarry=a.type==='air';
        }
      }
      if(cutActionAtTick&&a.phase==='recovery'){
        // S5Runtime 0x5DEAF0–0x5DEB39 writes a zero vector to actor+0xF0 on
        // recovery entry. Locomotion is separate; gravity resumes immediately.
        this.velocity={x:0,y:0,z:0};
      }
    }
    // Recovery belongs to CJumpState, not to a later dodge, attack or wall jump.
    if(this.dash>0||(this.attack&&this.attack.kind!=='guard')||this.wallAction){this.normalJump=false;this.jumpRecovery=null;}
    if(this.jumpRecovery&&!this.grounded)this.jumpRecovery=null;
    const landing=!!this.jumpRecovery;
    // CAttackMovingState's recovery ticks its timer without locomotion.
    // Evaluate again after advancing the attack so its entry tick stops too.
    if(batMovementPolicy(this.attack)?.immobile)locked=true;
    const rush=this.attack?.type==='rush'||this.attack?.locked;
    const carry=this.counterGuardDash;
    if(carry){
      const held=carry.side<0?(input.leftHeld??input.side<0):(input.rightHeld??input.side>0);
      const released=carry.side<0?input.leftReleased:input.rightReleased;
      if(!held||released||input.jump||this.dash>0||this.wallAction||this.weapon!=='counter'||(this.attack&&this.attack.kind!=='guard')){
        this.counterGuardDash=null;this.velocity.x=0;this.velocity.z=0;
      }
    }
    let dashEnded=false,naturalDashExit=false,dashTravel=false,scytheVerticalSeconds=null;
    if(this.dash>0){
      dashTravel=true;
      // S5Runtime 0x6122B0 calls 0x613B10 on each active tick: use the local
      // camera's horizontal direction, then retain it throughout recovery.
      // Sample BEFORE advancing the timer, including the last active tick.
      if(this.dashMotion.phase==='evade'){
        if(Number.isFinite(input.facing))this.dashFacing=input.facing;
        this.facing=this.dashFacing;
        this.dashDirection={x:-Math.cos(this.dashFacing)*this.dashSide,z:Math.sin(this.dashFacing)*this.dashSide};
      }
      const sample=advanceDashMotion(this.dashMotion,dt*1000),speed=sample.speed;
      this.dashElapsedMs=this.dashMotion.elapsedMs;
      this.dash=sample.remainingMs/1000;dashEnded=sample.finished;naturalDashExit=sample.finished;
      this.dashPhase=this.dashMotion.phase;
      this.velocity.x=this.dashDirection.x*speed;this.velocity.z=this.dashDirection.z*speed;
      this.velocity.y-=TUNING.gravity*sample.gravitySeconds;
      if(dashEnded)this.dashMotion=null;
    }
    else if(this.counterGuardDash){
      dashTravel=true;
      const tail=this.counterGuardDash;
      if(tail.motion.phase==='evade'){
        if(Number.isFinite(input.facing))tail.facing=input.facing;
        tail.direction={x:-Math.cos(tail.facing)*tail.side,z:Math.sin(tail.facing)*tail.side};
      }
      const sample=advanceDashMotion(tail.motion,dt*1000);
      this.velocity.x=tail.direction.x*sample.speed;this.velocity.z=tail.direction.z*sample.speed;
      this.velocity.y-=TUNING.gravity*sample.gravitySeconds;
      dashEnded=sample.finished;if(sample.finished)this.counterGuardDash=null;
    }
    else if(this.attack?.scytheStaySky){
      // Native StaySky checks the old timer and skips physical integration
      // outside ascent. Frozen speed is retained; MoveBox is a separate path.
      const a=this.attack;
      if(this.grounded)a.scytheActorMode=0;
      else if(a.scytheActorMode===1&&this.velocity.y<0)a.scytheActorMode=2;
      const sample=advanceDeathScytheStaySky(a.scytheStaySky,dt*1000,{weaponType:42,attackAttributeIds:[DEATH_SCYTHE_JUMP_ATTRIBUTE],actorMode:a.scytheActorMode});
      if(sample.physicsEnabled!==null)a.scythePhysicsEnabled=sample.physicsEnabled;
      scytheVerticalSeconds=a.scythePhysicsEnabled?dt:0;
      this.rootMotionDelta=a.moveStopped?{x:0,y:0,z:0}:meleeRootDelta(a);
      this.velocity.x=this.rootMotionDelta.x/dt;this.velocity.z=this.rootMotionDelta.z/dt;
      if(a.scythePhysicsEnabled)this.velocity.y-=TUNING.gravity*dt;
    }
    else if(this.attack?.profile?.suspendVerticalUntilDrop&&!this.attack.dropApplied){
      // Native physics is suspended before SetDrop; horizontal MoveBox remains.
      this.rootMotionDelta=this.attack.moveStopped?{x:0,y:0,z:0}:meleeRootDelta(this.attack);
      this.velocity.x=this.rootMotionDelta.x/dt;this.velocity.z=this.rootMotionDelta.z/dt;this.velocity.y=0;
    }
    else if(this.attack?.profile?.dropVector&&!this.attack.dropApplied&&!(this.attack.weapon==='breaker'&&this.attack.kind==='heavy')){
      // CAttackState disables actor physics through 0x97DF40(false) until
      // the strict SetDrop timer expires. The drop below supplies new velocity.
      this.velocity={x:0,y:0,z:0};
    }
    else if(this.katanaAirFall){
      this.velocity.x=0;this.velocity.z=0;this.velocity.y-=TUNING.gravity*dt;
    }
    else if(this.attack?.dropApplied){
      // Keep the physical drop impulse; MoveBox must not zero it next tick.
      this.velocity.y-=TUNING.gravity*dt;
    }
    else if(rush){
      // MoveBox and visible SN001 use the same source-backed fitted cursor.
      this.rootMotionDelta=this.attack.moveStopped?{x:0,y:0,z:0}:this.attack.profile?meleeRootDelta(this.attack):spyStabDelta(this.attack.previousTimeMs*RUSH_CLIP_SPEED,this.attack.timeMs*RUSH_CLIP_SPEED,this.attack.facing,undefined,this.sex);
      this.velocity.x=this.rootMotionDelta.x/dt;this.velocity.z=this.rootMotionDelta.z/dt;this.velocity.y-=TUNING.gravity*dt;
    }
    else if(locked){this.velocity.x=0;this.velocity.z=0;this.velocity.y-=TUNING.gravity*dt;}
    else {
      const forward=x*Math.sin(this.facing)+z*Math.cos(this.facing),side=-x*Math.cos(this.facing)+z*Math.sin(this.facing);
      // Dodge cancellation grants no single-press sprint. INPUT_FASTRUN42
      // consumes forward double taps independently of the actor state.
      // A successful fresh double-forward tap during a normal jump also arms
      // the input's airborne auto-sprint latch. Otherwise releasing tap 2
      // erases classic sprint's tap history and tap 3 falls back to walking.
      const jumpAutoSprint=airborneAtInput&&this.normalJump&&this.jumpAirborne&&!this.wallJumpAirborne&&input.forwardPressed&&input.sprintPressed;
      const sprint=!!input.sprint&&!landing&&!this.sprintBlocked&&moving&&!this.wallAction&&!this.attack&&!cutAtTick&&this.energy>0&&forward>0&&Math.abs(side)<1e-6;
      if(sprint&&jumpAutoSprint)this.events.push('doublesprint');
      this.sprinting=sprint;
      if(sprint){
        this.daggerAirCarry=false;
        // Sprint replaces the jump, including dodge-triggered double sprint.
        // Releasing it in midair must not restore the old walljump eligibility.
        this.jumpAirborne=false;
      }
      // S5Runtime CFastRunState::EnterState, 0x616B3F–0x616CBF:
      // clear upward physical velocity on entry; keep an existing fall.
      // Do this once, not every sprint tick, so gravity continues afterwards.
      if(sprint&&!sprintingAtInput){
        if(!this.infiniteEnergy)this.energy=Math.max(0,this.energy-TUNING.sprintEntryCost);
        this.events.push('sprint');
        this.velocity.y=Math.min(0,this.velocity.y);
        if(airborneAtInput){this.airLocomotion=true;this.normalJump=false;}
      }
      const daggerCut=!!cutAtTick;
      // Ground dagger cuts retain ordinary walking, including the recovery
      // tick, per the user's correction. Keep the aerial contributions intact.
      const groundDaggerCut=daggerCut&&this.grounded;
      // CSwordAtkState's ground lower-body Tick (0x62B710) directly adds
      // input * actor speed * attack rate * one angular sector rate * dt.
      // The aerial lower Tick (0x629379) instead uses jump_move_rate with
      // no directional penalties. Neither branch adds acceleration.
      // Use the retained native lower substate, not just actor.grounded. Strong
      // can still use its walk formula in the air before its animation delay;
      // the air lower state also survives landing until its own timer expires.
      const plasmaWalk=!!plasmaLowerMotion&&this.attack?.weapon==='plasma'&&!this.attack.locked;
      const plasmaWalkFormula=plasmaWalk&&plasmaLowerMotion==='walk';
      // Sigma's Spy command selects the ground lower child even in air.
      // It contributes attack movement speed with directional penalties,
      // after the upper state's ordinary-speed translation (5dd7eb).
      // This is the aerial attack state's movement, also after landing:
      // its native phase0 tick has no actor+114/grounded eligibility check.
      const directAirInputMove=!!this.attack?.profile?.directAirInputMove&&this.attack.previousPhase==='action';
      const speed=(sprint?TUNING.sprint:TUNING.walk)*(this.modeModifiers?.moveFactor??1)*(this.weaponMoveRate/WEAPON_MOVE_RATES.dagger)*(landing?SOURCE_MOVEMENT.landMoveRate:daggerCut?(groundDaggerCut?1:CUT_MOVE_RATE):this.attack?(this.attack.profile?.moveRate??CUT_MOVE_RATE):this.weapon==='semirifle'&&this.rifle?.phase==='fire'?.9:1);
      const acceleration=this.grounded?TUNING.acceleration:TUNING.airAcceleration;
      // CJumpState uses a scalar jump/landing rate, without CRunState's
      // directional penalties (live 0x6255BA, 0x625B9B, 0x62615A).
      const jumpMovement=!sprint&&!this.attack&&(landing||(this.normalJump&&!this.grounded));
      const jumpRate=landing?1:SOURCE_MOVEMENT.jumpMoveRate; // landing is already in speed
      // The attack's direct move is followed by its lower-body air tick
      // (0x5DD7ED -> 0x629379): a second .5 * jump_move_rate contribution.
      const cutRate=cutActionAtTick||cutAtTick?.type==='air'?(this.grounded?1:1+SOURCE_MOVEMENT.jumpMoveRate):0;
      const target=directAirInputMove?sigmaBladeAirInputTarget(x,z,this.facing,speed,this.attack.profile.moveRate,this.modeModifiers?.moveFactor??1):groundDaggerCut||plasmaWalkFormula?groundRunTarget(x,z,this.facing,speed):plasmaWalk?{x:x*speed*SOURCE_MOVEMENT.jumpMoveRate,z:z*speed*SOURCE_MOVEMENT.jumpMoveRate}:daggerCut?{x:x*speed*cutRate,z:z*speed*cutRate}:jumpMovement?{x:x*speed*jumpRate,z:z*speed*jumpRate}:
        (this.grounded&&!this.attack&&!landing&&!sprint?groundRunTarget:locomotionTarget)(x,z,this.facing,speed);
      if(dashCancel){
        this.velocity.x=0;this.velocity.z=0;
      }else if(landing){
        // CJumpState phases 5/6: direction * actor speed * land_move_rate.
        this.velocity.x=target.x;this.velocity.z=target.z;
      }else if(directAirInputMove){
        // Spy phase 1 writes zero to actor+F0 (5DEAF0..5DEB39).
        // Its final phase-0 direct position update still occurs. Carry that
        // translation through collision without restoring physical velocity.
        if(sigmaRecoveryEntry)sigmaRecoveryTranslation=target;
        else {this.velocity.x=target.x;this.velocity.z=target.z;}
      }else if(this.normalJump&&!this.grounded){
        // CJumpState 0x6255BA / 0x625B9B: current direction * actor speed
        // * jump_move_rate * dt. No horizontal acceleration/deceleration tail.
        this.velocity.x=target.x;this.velocity.z=target.z;
      }else if(daggerCut){
        // Aerial recovery retains the action's movement rate, but still obeys
        // current input: releasing a direction stops that movement immediately.
        this.velocity.x=target.x;this.velocity.z=target.z;
      }else if(plasmaWalk){
        this.velocity.x=target.x;this.velocity.z=target.z;
      }else if(['flight','fall'].includes(this.wallAction?.phase)&&!this.airLocomotion){
        // Capture 23:01:43: 2343.75 native units/s persists through the entire
        // fall, including after input release and the animation's flight phase.
        // Mouse rotation remains free but must not bend or brake that impulse.
      }else if(sprint){
        // Sprint is genuinely straight, including the frame after a strafe
        // or a mouse turn: no leftover lateral velocity at sprint speed.
        // CFastRunState::Tick applies actor speed * sprint rate * dt directly.
        this.velocity.x=Math.sin(this.facing)*speed;this.velocity.z=Math.cos(this.facing)*speed;
      }else if(sprintingAtInput){
        // Releasing sprint immediately removes its horizontal speed, also
        // in midair. Any remaining direction uses the ordinary move speed.
        this.velocity.x=target.x;this.velocity.z=target.z;
      }else if(this.daggerAirCarry){
        // Retain aerial-cut speed, not a ballistic impulse: movement during
        // the fall follows held directions and stops on release, without drift.
        const airCutSpeed=speed*CUT_MOVE_RATE*(1+SOURCE_MOVEMENT.jumpMoveRate);
        this.velocity.x=x*airCutSpeed;this.velocity.z=z*airCutSpeed;
      }else if(this.grounded&&!this.attack&&!this.wallAction){
        // CRunState::Tick 0x6352A8–0x6353A5 applies direction * speed * dt.
        // Ground locomotion adds no acceleration or braking tail of its own.
        this.velocity.x=target.x;this.velocity.z=target.z;
      }else if(!this.attack){
        // CFallState::FixedUpdate: goalDir * GetMoveSpeedMax() * dt,
        // with no directional rate and no acceleration (ledge falls, air
        // cancels, dodge/sprint exits and failed wall jumps all fall here).
        this.velocity.x=x*speed;this.velocity.z=z*speed;
      }else{
        this.velocity.x=approach(this.velocity.x,target.x,acceleration*dt);this.velocity.z=approach(this.velocity.z,target.z,acceleration*dt);
      }
      this.velocity.y-=TUNING.gravity*dt;
      if(sprint){sprintSpent=true;if(!this.infiniteEnergy)this.energy=Math.max(0,this.energy-TUNING.sprintDrain*dt);if(this.energy<=0)this.stopSprint();}
    }
    if(!sprintSpent&&!energyRecovered)this.recoverEnergy(dt);
    const drop=this.attack?.profile?.dropVector;
    if(drop&&!this.attack.dropApplied&&this.attack.timeMs>this.attack.profile.dropMs){
      this.velocity=meleeDropVelocity(this.attack,this.facing);
      this.attack.dropApplied=true;
    }
    if(this.attack?.profile?.delayDropVector&&!this.attack.delayDropApplied&&this.attack.phase==='recovery'&&this.attack.phaseTimeMs>this.attack.profile.delayDropMs){
      this.attack.delayDropApplied=true;
      this.velocity=meleeDropVelocity(this.attack,this.facing);
    }
    // SetDrop writes its vertical speed to the actor terminal-speed property
    // (0x97DFA0), read by integrator slot +0xB0 (0x97F9A0).
    const dropTerminal=this.attack?.dropApplied&&!(this.attack.profile.dropTerminalInRecovery===false&&this.attack.phase==='recovery');
    const terminal=dropTerminal?meleeDropVelocity(this.attack,this.facing).y:this.katanaAirFall?meleeDropVelocity({profile:MELEE.katana.air,delayDropApplied:true},this.facing).y:-TUNING.terminal;
    this.velocity.y=Math.max(terminal,this.velocity.y);
    // IActor::GetMaxGravityVelocity, read again by the grounded probe.
    this.maxGravityVelocity=terminal;
    const wasGrounded=this.grounded;
    // Station 2 train capture: after the 500 ms flight phase, native movement
    // adds input-driven travel without changing the stored rebound impulse.
    // Keep it out of velocity so holding a key cannot accumulate acceleration.
    const wallControl=this.wallAction?.phase==='fall'&&!this.grounded&&!this.airLocomotion&&!this.attack&&this.dash===0;
    // CBoundJumpState launch velocity is the actor m_vVelocity (UpdateGravity).
    this.physicalHorizontal=['flight','fall'].includes(this.wallAction?.phase)&&!this.airLocomotion;
    // Current constant_info.xml explicitly maps GameTempo28 to jump_move_rate.
    // FREE=1 preserves the measured profile; retain the native factor itself.
    const wallControlSpeed=TUNING.walk*this.weaponMoveRate/WEAPON_MOVE_RATES.dagger*SOURCE_MOVEMENT.jumpMoveRate;
    const ironBoostTranslation=ironBootsBoostTranslation(this.attack,{moveFactor:this.modeModifiers?.moveFactor??1});
    let extraTravel=ironBoostTranslation??sigmaRecoveryTranslation??(wallControl?{x:x*wallControlSpeed,z:z*wallControlSpeed}:undefined);
    let verticalTravelSeconds=scytheVerticalSeconds??dt;
    // A source jump station owns a separate F0 channel. Add its horizontal
    // displacement after input locomotion; never overwrite it with the next
    // frame's walk target or apply ordinary gravity a second time vertically.
    // Only opted-in maps supply this port. Source buffers and other maps keep
    // the existing movement route. Collision scheduling remains an S5 adapter.
    const sourceLaunch=this.world.sourceLaunchMotion?.beforeMove(this,dt);
    if(sourceLaunch?.ownsVerticalMotion){
      this.velocity.y=sourceLaunch.velocity.y;
      extraTravel={x:(extraTravel?.x??0)+(dt>0?sourceLaunch.displacement.x/dt:0),z:(extraTravel?.z??0)+(dt>0?sourceLaunch.displacement.z/dt:0)};
      verticalTravelSeconds=sourceLaunch.velocity.y===0?0:sourceLaunch.displacement.y/sourceLaunch.velocity.y;
      if(sourceLaunch.launches.length){this.grounded=false;this.events.push('source-jump-pad');}
    }
    // CRunState selects its animation from actor input before actor70 submits
    // movement (634D22..6353A5); a wall must not turn that input into idle.
    // Retain the actual requested vector/rate, without feeding it back into
    // collision or the airborne/attack presentation channels.
    if(this.grounded&&moving&&!this.attack&&!this.wallAction&&this.dash===0&&!this.jumpRecovery&&!sourceLaunch?.ownsVerticalMotion)
      this.groundLocomotionVelocity={x:this.velocity.x,z:this.velocity.z};
    this.move(dt,extraTravel,dashTravel?CONTACT.dodgeFreeTravelMargin:0,verticalTravelSeconds);
    if(sourceLaunch)this.world.sourceLaunchMotion.afterMove(this,{position:this.position,groundContact:this.grounded});
    if(this.grounded){this.daggerAirCarry=false;this.katanaAirFall=false;}
    // Walking/running off support is controlled movement, not a ballistic
    // horizontal impulse. Subsequent input release must stop it immediately.
    if(wasGrounded&&!this.grounded&&!this.normalJump&&!this.attack&&!this.wallAction&&this.dash===0)this.ledgeFall=true;
    if(this.grounded||this.normalJump||this.attack||this.wallAction||this.dash>0)this.ledgeFall=false;
    if(this.counterGuardDodgeWindow){
      const expired=advanceDashMotion(this.counterGuardDodgeWindow,dt*1000).finished;
      if(expired||this.grounded||this.wallAction||(this.attack&&this.attack.kind!=='guard')){
        this.counterGuardDodge=false;this.counterGuardDodgeWindow=null;
      }
    }
    // Native mode 2 becomes grounded mode 0 at support contact (0x527525).
    // The ground integrator uses zero X/Z, not the old drop vector. Keeping
    // that impulse through attack recovery caused the long Counter slide.
    if(this.grounded&&this.attack?.dropApplied){this.velocity.x=0;this.velocity.z=0;}
    if(dashEnded){this.velocity.x=0;this.velocity.z=0;}
    if(naturalDashExit&&this.weapon==='plasma')this.plasmaDashExit='standby';
    // Native landing movement precedes the strict timer comparison.
    if(landing&&this.jumpRecovery){
      this.jumpRecovery.elapsedMs+=dt*1000;
      if(this.jumpRecovery.elapsedMs>SOURCE_MOVEMENT.landDelayMs){this.jumpRecovery=null;this.events.push('landend');}
    }
    if(this.grounded){this.wallJumpAirborne=false;this.jumpAirborne=false;this.jumpOriginY=null;this.wallJumpFailed=false;this.airDashUsed=false;this.wallAction=null;this.airLocomotion=false;if(!wasGrounded){
      this.events.push('land');
      if(this.normalJump){this.jumpRecovery={elapsedMs:0};this.normalJump=false;}
    }}
    if(this.position.y<(this.world.deathY??-15)){this.reset();this.events.push('respawn');}
    if(sprintingAtInput&&!this.sprinting)this.stopSprint();
    // Confirm physical airborne sprint after collision/landing resolution.
    // Input retains reactivation until land, regardless of release duration.
    if(this.sprinting&&!this.grounded&&(!sprintingAtInput||wasGrounded))this.events.push('airsprintarmed');
    this.state=this.dash>0?(this.grounded?'dash':'airdash'):this.attack?this.attack.type:this.wallAction?(this.wallAction.phase==='fail'?'wallfail':'walljump'):!this.grounded?(this.velocity.y>0?'jump':'fall'):this.jumpRecovery?'landing':moving?(this.sprinting&&this.energy>0?'sprint':'run'):'idle';
    return this.events;
  }
  // CJumpState::Input: the last found collision, then actorDir.Dot(-n) > 0.2.
  findFacingWall(){
    this.wallContact=null;
    const wall=this.wallCollisionContact();if(!wall)return null;
    const forward={x:Math.sin(this.facing),z:Math.cos(this.facing)},normal=wall.normal;
    if(!(-(forward.x*normal.x+forward.z*normal.z)>WALL_REBOUND_MIN_DOT))return null;
    this.wallContact=wallContactView(wall);
    return normal;
  }
  // CBoundJumpState::Input: same contact rule with ABS(dot) > 0.2. The wall-jump
  // m_vVelocity stays unclipped, so velocity is the incoming travel.
  findReboundWall(){
    const wall=this.wallCollisionContact();if(!wall)return null;
    const normal=wall.normal,facingDot=Math.sin(this.facing)*normal.x+Math.cos(this.facing)*normal.z;
    if(!(Math.abs(facingDot)>WALL_REBOUND_MIN_DOT))return null;
    this.wallContact=wallContactView(wall);
    const incoming=this.velocity,length=Math.hypot(incoming.x,incoming.z);
    // Rebound launch follows the pre-collision trajectory, not mouse yaw.
    return {normal,incomingFacing:length>1e-8?Math.atan2(incoming.x,incoming.z):this.facing};
  }
  move(dt,extraHorizontal={x:0,z:0},freeTravelMargin=0,verticalSeconds=dt) {
    if(this.nativeCollisionMovement)return this.moveWithNativeCollisions(dt,extraHorizontal,verticalSeconds);
    return this.moveBody(dt,extraHorizontal,verticalSeconds);
  }
  // CActor::FixedUpdate: CActor::UpdateGravity, then the current state's
  // horizontal CActor::Move. Wall-jump X/Z belongs to the actor's m_vVelocity
  // and moves inside UpdateGravity; every other S5 X/Z is a state Move.
  // The native "free travel" epsilon is part of CollideWith, so the dodge
  // freeTravelMargin argument is not applied a second time here.
  moveBody(dt,extraHorizontal,verticalSeconds){
    const body=this.collisionBody,p=this.position,v=this.velocity;
    // Positions written outside movement are CActor::MoveForce placements.
    // S5 spawns/teleports are floor-projected, unlike native spawn markers: a
    // grounded placement gets the gap the solver itself rests at (radius.y * eps),
    // otherwise a tangent start counts as embedded and skips the face test.
    if(p.x!==body.position.x||p.y!==body.position.y||p.z!==body.position.z)
      body.setPosition(this.grounded?{x:p.x,y:p.y+body.radii.y*ACTOR_COLLISION.epsilon,z:p.z}:p);
    if(!this.grounded&&this.verticalState==='normal')this.verticalState=v.y>0?'rise':'fall';
    const physical=this.physicalHorizontal;
    body.landing=false;
    const oldY=body.position.y;
    if(this.verticalState==='normal'){
      actorMove(body,{x:0,y:this.maxGravityVelocity*dt,z:0});
      if(!body.landing&&body.position.y-oldY<0){
        this.verticalState='fall';
        v.y=this.maxGravityVelocity*.1;
        this.events.push('levitate');
      }
    }else{
      actorMove(body,{x:physical?v.x*dt:0,y:v.y*verticalSeconds,z:physical?v.z*dt:0});
      if(this.verticalState==='rise'){if(v.y<0||body.position.y-oldY<0)this.verticalState='fall';}
      else if(body.landing)this.verticalState='normal';
    }
    actorMove(body,{x:((physical?0:v.x)+extraHorizontal.x)*dt,y:0,z:((physical?0:v.z)+extraHorizontal.z)*dt});
    this.grounded=this.verticalState==='normal';
    if(this.grounded)v.y=0;
    Object.assign(p,body.getPosition());
    this.updateWallCollisionContact();
  }
  // Last found collision of the latest Update, as read by CJumpState::Input
  // and CBoundJumpState::Input (type, 150-unit height window, |n.y| < 0.5).
  wallCollisionContact(){
    const body=this.collisionBody,type=body.foundCollisionType();
    if(type===0||(type&TYPE_ACTOR))return null;
    const center=body.position.y+body.offset.y,contact=body.foundCollisionPosition();
    if(!(150*SCN_SCENE_SCALE>Math.abs(center-contact.y)))return null;
    const n=body.foundCollisionNormal();
    if(!(.5>Math.abs(n.y)))return null;
    const length=Math.hypot(n.x,n.z);if(length===0)return null;
    return {normal:{x:n.x/length,z:n.z/length},point:contact};
  }
  updateWallCollisionContact(){
    const wall=this.wallCollisionContact();
    this.wall=wall?wall.normal:null;
  }
  moveWithNativeCollisions(dt,extraHorizontal,verticalSeconds,movement=this.nativeCollisionMovement){
    const p=this.position,v=this.velocity;
    const frame=movement.move({position:p,deltaSeconds:dt,grounded:this.grounded,
      horizontal:{x:(v.x+extraHorizontal.x)*dt,y:0,z:(v.z+extraHorizontal.z)*dt},
      vertical:{x:0,y:v.y*verticalSeconds,z:0}});
    this.nativeCollisionMovementFrame=frame;
    if(!frame.qualified)throw new Error('Native collision movement refused: '+frame.reason);
    // The full source operation owns contact response, support, correction
    // and last-safe restoration. Do not run the old step/snap/edge solver on
    // its result, or charge a second S5/dodge free-travel margin.
    this.grounded=frame.grounded;
    this.resolveMovementWalls(frame.contacts.filter(contact=>contact.channel==='horizontal'),CONTACT.groundNormalY);
    if(this.grounded)v.y=0;
    Object.assign(p,frame.position);
  }
  resolveMovementWalls(contacts,walkableY){
    const v=this.velocity;this.wall=null;
    // A source1000 player contact is not a static wall-jump probe. Its own
    // response already resolves travel; keep physical walls/body roles apart.
    const walls=contacts.filter(c=>!c.actorBody&&c.nativeContact?.activeTableCategory!==0x1000&&Math.abs(c.normal.y)<walkableY);
    if(this.wallAction?.phase==='flight'&&walls.length){
      const contact=walls.find(c=>v.x*c.normal.x+v.z*c.normal.z<0);
      if(contact){
        this.wallAction.reboundNormal={x:contact.normal.x,z:contact.normal.z};
        this.wallAction.reboundIncoming={x:v.x,z:v.z};
      }
    }
    for(let pass=0;pass<=walls.length;pass++)for(const {normal:n} of walls){
      const length=Math.hypot(n.x,n.z),nx=n.x/length,nz=n.z/length,into=v.x*nx+v.z*nz;
      if(into<0){v.x-=into*nx;v.z-=into*nz;}
      this.wall={x:nx,z:nz};
    }
  }
}
