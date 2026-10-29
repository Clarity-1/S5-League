import {conquestPlayableInput} from './conquest-playable-input.js';
import {readNativeBooleanDistanceAcceleration} from './native-collision-bool-wasm.js';
import {createConquestMonsterHealthBars} from './conquest-monster-health-bars.js';
import {loadRevolverEffects,loadGunParticleEffects} from './revolver-effects.js';
import {runActorBodyContactQa} from './actor-body-contact-qa.js';
import {createWeaponRenderWarmup} from './weapon-render-warmup.js';
import {loadHeavyMachineGunEffects} from './heavy-machine-gun-effects.js';
import {loadCombatEffects,COMBAT_EFFECT_WEAPONS,attackEffectCue,playAttackEffects} from './combat-effects.js';
import {loadKatanaScreenEffects} from './katana-screen-effects.js';
import {loadSmashRifleEffects} from './smash-rifle-effects.js';
import {loadHandgunEffects} from './handgun-effects.js';
import {loadAssaultRifleEffects} from './assault-rifle-effects.js';
import {loadBurstShotgunEffects} from './burst-shotgun-effects.js';
import {isRifleWeapon} from './rifle-runtime.js';
import {rifleAimPoint} from './rifle-contact.js';
import {updateRifleEffectActors} from './rifle-effect-actors.js';
import {syncHeavyMachineGunAudio} from './heavy-machine-gun-audio.js';
import {loadAirgunEffects} from './airgun-effects.js';
import {loadCannonadeEffects} from './cannonade-effects.js';
import {createCannonadeCameraState,updateCannonadeFov} from './cannonade-camera.js';
import {createS5CannonadePushObservation} from './s5-cannonade-push-observation.js';
import {loadRocketLauncherEffects} from './rocket-launcher-effects.js';
import {TrainingCombat} from './training-combat.js';
import {resolveMapMeleeHits} from './map-melee-hits.js';
import {installCollisionV2TestControls} from './collision-v2-test-controls.js';
import {inMeleeRange} from './combat-state.js';
import {prepareConquestEncounter} from './conquest-encounter.js';
import {createConquestEncounterHud} from './conquest-encounter-hud.js';
import {stopAttackMovement,blockedMeleeContact,playSurfaceImpact} from './melee-contact.js';
import * as THREE from 'three';import './style.css';
import './hud.css';
import {WeaponPoseTransition} from './weapon-pose-transition.js';
import {createArena} from './arena.js';
import {loadAvatar} from './avatar.js';
import {equipmentPreloadPlan,CHARACTER_PRELOAD_PLAN} from './startup-equipment-preload.js';
import {installEquipmentSourcePrefetch} from './equipment-source-prefetch.js';
import {createWeaponResourceCache} from './weapon-resource-cache.js';
import {createWeaponEffectCache} from './weapon-effect-cache.js';
import {createResourceCache} from './resource-cache.js';
import {weaponThumbnail} from './weapon-inventory.js';
import {Controller,TUNING} from './controller.js';
import {MotionGraph} from './motion-graph.js';
import {SPRINT_STYLES,sprintStyle} from './anime-sprint.js';
import {installLocomotionSettings} from './locomotion-settings.js';
import {RUN_STYLES,runStyle,IDLE_STYLES,idleStyle,MIXAMO_CLIP_LABELS} from './mixamo-locomotion.js';
import {BASE_FOV,CAMERA_NEAR} from './input.js';
import {BoundMovementInput,createGameInputBindings,GAME_INPUT_COMMANDS,gameInputReservations,gameInputHint} from './game-input-bindings.js';
import {GamepadInput} from './gamepad-input.js';
import {usesTouchControls} from './touch-input.js';
import {installTouchControls} from './touch-controls.js';
import './touch-controls.css';
import {installGamepadSettings,readGamepadSettings,navigateGamepadMenu,activateGamepadMenu} from './gamepad-settings.js';
import './gamepad-settings.css';
import {createOptionsTransaction} from './options-transaction.js';
import {createAudioOptionsPort} from './audio-options-port.js';
import {createInputOptionsPort} from './input-options-port.js';
import {createMouseSettings} from './mouse-settings.js';
import {createMouseOptionsPort} from './mouse-options-port.js';
import {createJukeboxAudioBridge} from './jukebox-audio-bridge.js';
import {createJukeboxSettings} from './jukebox-settings.js';
import {createJukeboxOptionsPort} from './jukebox-options-port.js';
import {createS5MouseLook,createMouseLookDelta} from './mouse-look-adapter.js';
import {installOptionsTransactionActions} from './options-actions.js';
import {installOptionsPanelLifecycle} from './options-panel-lifecycle.js';
import {installNativeOptionsView} from './options-native-view.js';
import './options-native-view.css';
import './options-menu-theme.css';
import './options-actions.css';
import {installInputSettings} from './input-settings-view.js';
import './input-settings.css';
import {VITAL_SHOCK_ARENA_CONTROLS} from './vital-shock-input.js';
import {runVisualScenario} from './visual-scenarios.js';
import {WeaponTrail} from './weapon-trail.js';
import {createWeaponEffectSettings,selectedWeaponEffect} from './weapon-effect-styles.js';
import {installWeaponAuraControls} from './weapon-aura-controls.js';
import {runWeaponEffectQa} from './weapon-effect-qa.js';
import './inventory-weapon-effects.css';
import {loadTwinBladeActorTrails} from './twin-blade-actor-trails.js';
import {IronBootsTrails} from './iron-boots-trails.js';
import {loadDemonicKnuckleTrails} from './demonic-knuckle-trails.js';
import {loadBatTrails} from './bat-trails.js';
import {loadDeathScytheTrails} from './death-scythe-trails.js';
import {loadBreakerTrails} from './breaker-trails.js';
import {loadSigmaBladeTrails} from './sigma-blade-trails.js';
import {loadKatanaTrails} from './katana-trails.js';
import {loadAssassinClawTrails} from './assassin-claw-trails.js';
import {createOpponentTrailCache} from './opponent-trail-cache.js';
import {TRAINING_OPPONENT_WEAPONS,trainingOpponentWeapon} from './training-opponent-weapons.js';
import {meleeActivations,claimMeleeActivation} from './melee-activations.js';
import {SimulationClock,SIM_STEP_MS} from './simulation-clock.js';
import {PoseBuffer} from './pose-buffer.js';
import {presentationFacing,setAvatarFacing} from './view-orientation.js';
import {ThirdPersonCamera,CAMERA_FRAMING,FOLLOW_CAMERA,clampCameraPitch} from './camera-rig.js';
import {setNormalFov} from './camera-fov.js';
import {createFollowShadow} from './follow-shadow.js';
import {updateSprintFov} from './sprint-camera.js';
import {WallContactEffect} from './wall-contact-effect.js';
import {DashEffect} from './dash-effect.js';
import {loadSprintEffect} from './sprint-effect.js';
import {GameAudio,impactSoundKey} from './game-audio.js';
import {createOpponentAudioCache} from './opponent-audio-cache.js';
import {createGameAudioSettings} from './game-audio-settings.js';
import {createGameBgm} from './game-bgm.js';
import {createGameBgmSession} from './game-bgm-session.js';
import {createGameShield} from './game-shield.js';
import {createGameShieldInput} from './game-shield-input.js';
import {installGameEscapeMenu} from './game-escape-menu.js';
import {createGameSessionControl} from './game-session-control.js';
import './game-escape-menu.css';
import {loadGameShieldPresentation} from './game-shield-presentation.js';
import {readAsset} from './scene-assets.js';
import {installAudioSettings} from './audio-settings.js';
import './audio-settings.css';
import {createImportedMap,MAPS} from './imported-map.js';
import {createStation2Modular} from './station2-modular.js';
import {createStation2Touchdown,laserBoxes} from './station2-touchdown.js';
import {installS5TouchdownRespawnDiagnostic} from './s5-touchdown-respawn-diagnostic.js';
import {createCombatMatch} from './combat-match.js';
import './touchdown.css';
import './native-ui.css';
import './chaser-hud.css';
import './chaser-hud-polish.css';
import './chaser-generated-assets.css';
import {createCircle2Atlas} from './circle2-atlas.js';
import {createStationPresentation} from './station2-visuals.js';
import {loadBlenderSlice,applyBlenderSlice} from './station2-blender.js';
import {loadBlenderEnvironment,applyBlenderAtmosphere} from './station2-atmosphere.js';
import {loadImportedEffects} from './imported-effects.js';
import {readLoadout,WEAPON_CHOICES} from './loadout.js';
import {createS5WeaponLoadout,readS5WeaponLoadout} from './s5-weapon-loadout.js';
import './s5-weapon-loadout-view.css';
import {WEAPON_SLOTS,canSwitchWeapon} from './weapon-slots.js';
import {createOutlinePresentation,installOutlineSettings} from './ink-outline.js';
import {CameraDirector} from './camera-director.js';
import {installPresentationSettings,readPresentationSettings} from './presentation-settings.js';
import {readRenderQuality,renderPixelRatio,applyShadowBudget} from './render-quality.js';
import {auditTextureRoots,installGraphicsDiagnostics} from './graphics-diagnostics.js';
import {loadValidatedAssetJson} from './persistent-asset-json.js';
import {installMenuLayout} from './menu-layout.js';
import {installS5EntryShell} from './s5-entry-shell.js';
import './s5-lobby-view.css';
import './s5-entry-shell.css';
import {installS5SessionNavigation} from './s5-session-navigation.js';
import './s5-session-navigation.css';
import './waiting-room.css';
import {createWaitingRoomLifecycle} from './waiting-room-lifecycle.js';
import {createWaitingRoomView} from './waiting-room-view.js';
import {createWaitingRoomResults,roomResultPlayers} from './waiting-room-results.js';
import {createConquestLocalResults,createConquestLocalResultsView} from './conquest-local-results.js';
import {createRoomResultArtwork} from './room-result-artwork.js';
import './s4-team-mode-ui.css';
import './s4-secondary-mode-ui.css';
import './captain-hud.css';
import './battle-royal-hud.css';
import './s4-ingame-hud.css';
import './s4-opponent-health-ui.css';
import './s4-ingame-layout.css';
import './s4-ingame-notices.css';
import './s5-minimal-hud.css';
import './siege-hud.css';
import './s5-custom-hud.css';
import './s5-match-roster.css';
import {installMinimalHud} from './s5-minimal-hud.js';
import {installS4EquipmentUi} from './s4-equipment-ui.js';
import {installS4IngameNotices} from './s4-ingame-notices.js';
import {loadS4TeamModeEffects} from './s4-team-mode-effects.js';
import {loadCaptainNativeEffects} from './s4-captain-native-effects.js';
import {installPracticeFrameProbe} from './s5-practice-frame-probe.js';
import {createS5PracticeFrustumLoader} from './s5-practice-frustum-loader.js';
import {installPracticeFrustumView} from './s5-practice-frustum-view.js';
import {createGameInterfaceAudio} from './game-interface-audio.js';
import {installInterfaceButtonAudio} from './interface-audio-events.js';
import {identifyGameInterfaceButton} from './interface-audio-button-data.js';
import {renderInventoryPreviews} from './inventory-avatar-preview.js';
import {captureS5WeaponPreviewPose} from './s5-weapon-preview-model.js';
import {createS5WeaponPreviewRenderer} from './s5-weapon-preview-renderer.js';
import {updateS5RuntimeCrosshair} from './s5runtime-crosshair.js';
import {MapSession,buildMapEntry,captureMapSurface} from './map-session.js';
import {loadAliceHouseWorld} from './alice-house-world.js';
import {loadNativeArtistMap} from './native-artist-map.js';
import {loadIronHeartWorld,applyIronHeartTeamSpawn} from './ironheart-world.js';
import {ALICE_HOUSE_MAP,competitiveMapAllowed,aliceHouseMapAllowed,applyAliceHouseSessionSpawn} from './alice-house-session-map.js';
import {ChaserCombat} from './chaser-combat.js';
import {BattleRoyalCombat} from './battle-royal-combat.js';
import {CaptainCombat} from './captain-combat.js';
import {createCaptainMatch} from './captain-match.js';
import {SiegeCombat} from './siege-combat.js';
import {createPracticeWorld} from './practice-world.js';
import {createPracticeSession} from './practice-session.js';
import {loadConquestExplorationWorld} from './conquest-session-map.js';
import {practiceSourceOption,createPracticeOptionControl} from './practice-session-options.js';
import {resolveMatchOption,createMatchOptionControl} from './match-options.js';
import {createSiegeMatch} from './siege-match.js';
import {loadChaserPresentation,chaserCameraDistance,chaserSpectatorTarget} from './chaser-presentation.js';
import {loadChaserHudEffects} from './chaser-hud-effects.js';
import {createPagePresentationLifetime} from './page-presentation-lifetime.js';
const presentationLifetime=createPagePresentationLifetime(window);
THREE.Cache.enabled=true;
const $=id=>document.getElementById(id),canvas=$('game');
const s4EquipmentUi=installS4EquipmentUi($('weapon'));
const minimalHud=installMinimalHud({document});
const s4IngameNotices=installS4IngameNotices({document,window});
let s4TeamModeEffects=null;
window.addEventListener('pagehide',event=>{if(!event.persisted)s4EquipmentUi.dispose();});
window.addEventListener('pagehide',event=>{if(!event.persisted)minimalHud.dispose();});
const reportLoading=(id,detail='',progress={})=>document.dispatchEvent(new CustomEvent('s5:loading-phase',{detail:{id,detail,...progress}}));
function startupPhase(id,label,total){
 const startedAt=performance.now();let completed=0,failed=false;
 const emit=(detail,state='running')=>{
  const measurement={label,completed,total,phaseState:state,elapsedMs:performance.now()-startedAt};
  reportLoading(id,detail,measurement);
  document.dispatchEvent(new CustomEvent('s5:startup-measure',{detail:{id,detail,...measurement}}));
 };
 emit('');
 return {done(detail){if(failed)return;completed++;emit(detail,completed===total?'complete':'running');},async run(detail,task){try{const value=await task();this.done(detail);return value;}catch(error){if(!failed){failed=true;emit(detail,'error');}throw error;}}};
}
reportLoading('initializing','Preparing the scene');
const keyboardLayout=new Map();
// S5 initial current record projects the native default1000 into the native widget range100.
// Browser radians/count remain the existing S5 calibration; no native camera-unit claim.
const mouseSettings=createMouseSettings({initial:{sensitivity:100,inverse:false},initialPolicy:'s5-native-widget-clamped-default'});
const mouseLook=createS5MouseLook({settings:mouseSettings,baselineSensitivity:100,yawPerCount:.0023,pitchPerCount:.002,policy:'s5-pointer-lock-relative'});
let bindingStorage;
try{bindingStorage=localStorage;}catch(error){bindingStorage={getItem(){throw error;},setItem(){throw error;}};}
const legacyWeaponShortcuts=new URLSearchParams(location.search).has('qa');
const inputReservations=gameInputReservations({legacyWeaponShortcuts});
const inputBindings=createGameInputBindings({storage:bindingStorage,layoutMap:keyboardLayout,legacyWeaponShortcuts});
let inputCapture=false,inputSettings=null,optionsTransaction=null,optionsPanelLifecycle=null,optionsActions=null;
for(const container of [$('welcome'),$('lab')]){
 const link=document.createElement('a');link.href='/animation-workshop.html';link.textContent='Create animations ↗';
 link.style.cssText='display:block;margin:12px 0;font-weight:700';container.append(link);
}
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
const touchMode=usesTouchControls();
let renderQuality=readRenderQuality(touchMode?'performance':'balanced'),shadowsEnabled=readPresentationSettings().shadows;
renderer.setPixelRatio(renderPixelRatio(renderQuality,innerWidth,innerHeight,devicePixelRatio));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x75caff);scene.fog=new THREE.Fog(0x9ad4f7,50,140);
const camera=new THREE.PerspectiveCamera(BASE_FOV,innerWidth/innerHeight,CAMERA_NEAR,200);
const cannonadeCamera=createCannonadeCameraState();
scene.add(new THREE.HemisphereLight(0xe5f5ff,0x7183a2,1.35));
const sun=new THREE.DirectionalLight(0xfff0d4,2.1);sun.position.set(-15,30,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-28,right:28,top:30,bottom:-28,near:1,far:90});sun.shadow.normalBias=.025;scene.add(sun);
const followShadow=createFollowShadow(sun);
const qaParams=new URLSearchParams(location.search),qaScenario=qaParams.get('qa');
let effectStorage=null;try{effectStorage=localStorage;}catch{}
const weaponEffectSettings=createWeaponEffectSettings({storage:effectStorage,overrides:qaParams.get('vfx')??''});
// A fresh session starts with Meshy Male; explicit URL/settings choices win.
if(!qaParams.has('character'))qaParams.set('character','meshy');
const inputObservations=qaParams.has('inputDebug')?{edges:[],ticks:[],step:0}:null;
const cannonadePushObservation=inputObservations?createS5CannonadePushObservation():null;
let inputReadout=null;
if(qaParams.get('scene')===ALICE_HOUSE_MAP&&!qaParams.has('mode'))qaParams.set('mode','chaser');
if(['azit','bio-lab','blade-city'].includes(qaParams.get('scene'))&&!qaParams.has('mode'))qaParams.set('mode','training');
if(qaParams.get('scene')==='ironheart'&&!qaParams.has('mode'))qaParams.set('mode','siege');
if(qaParams.get('scene')==='conquest-46')qaParams.set('mode','conquest');
if(qaParams.get('mode')==='conquest')qaParams.set('scene','conquest-46');
if(['practice-52','practice-54'].includes(qaParams.get('scene'))&&qaParams.get('mode')!=='training')qaParams.set('mode','practice');
if(qaParams.get('mode')==='practice'&&!['practice-52','practice-54'].includes(qaParams.get('scene')))qaParams.set('scene','practice-52');
if(qaParams.get('mode')==='touchdown'&&!['station2','station2-modular'].includes(qaParams.get('scene')))qaParams.set('scene','station2-modular');
if(!aliceHouseMapAllowed(qaParams.get('scene'),qaParams.get('mode')))qaParams.set('scene','arena');
if(['chaser','battleroyal','captain','siege'].includes(qaParams.get('mode'))&&!competitiveMapAllowed(qaParams.get('scene'),qaParams.get('mode')))qaParams.set('scene','arena');
if(location.pathname.replace(/\/$/,'')==='/circle2'&&!qaParams.has('scene'))qaParams.set('scene','circle2');
if(qaParams.get('scene')==='circle2'){
 document.title='S5 League · Circle 2 — Azure Atrium';
 const link=document.createElement('a');link.href='/circle2-preview.html';link.textContent='Circle 2 · overview ↗';$('welcome').append(link);
}
if(qaParams.get('scene')==='station2-modular'){
 document.title='S5 League · Station 2 — Modular 3D anime';document.querySelector('#appearance-select option[value="s5runtime"]').textContent='Classic outfit';
}
const loadout=readLoadout(qaParams);
// Urbain is the new male base-skin preview; switching body returns to Classic.
if(qaParams.get('character')==='urban'&&loadout.sex!=='male')qaParams.set('character','s5runtime');
let initialWeaponLoadout,weaponLoadoutError='',weaponLoadoutSlots=null,slotInventory=null,practiceFrustumView=null;
try{initialWeaponLoadout=readS5WeaponLoadout(qaParams,loadout);}
catch(error){weaponLoadoutError=error.message;initialWeaponLoadout={slots:[loadout.weapon,null,null],skins:[loadout.weaponSkin,null,null],activeSlot:0};}
loadout.weapon=initialWeaponLoadout.slots[initialWeaponLoadout.activeSlot];loadout.weaponSkin=initialWeaponLoadout.skins[initialWeaponLoadout.activeSlot];
let s4ActiveWeaponSlot=initialWeaponLoadout.activeSlot;
let chosenWeapon=WEAPON_CHOICES[loadout.weapon];
function preparedWeaponSkin(weapon){const slot=initialWeaponLoadout.slots.indexOf(weapon);return slot<0?'classic':initialWeaponLoadout.skins[slot];}
$('weapon-select').add(new Option('Air Gun · experimental','airgun'));
$('weapon-select').add(new Option('Cannonade · experimental','cannonade'));
$('weapon-select').add(new Option('Rocket Launcher · experimental','rocketlauncher'));
$('weapon-picker').insertAdjacentHTML('beforeend','<div data-weapon="rocketlauncher"><span>K</span><b>Rocket Launcher</b></div>');
$('weapon-picker').insertAdjacentHTML('beforeend','<div data-weapon="cannonade"><span>J</span><b>Cannonade</b></div>');
$('weapon-picker').insertAdjacentHTML('beforeend','<div data-weapon="airgun"><span>5</span><b>Air Gun</b></div>');
$('weapon-select').add(new Option('Smash Rifle · experimental','smashrifle'));
$('weapon-picker').insertAdjacentHTML('beforeend','<div data-weapon="smashrifle"><span>6</span><b>Smash Rifle</b></div>');
$('weapon-select').add(new Option('Revolver · experimental','revolver'));
$('weapon-picker').insertAdjacentHTML('beforeend','<div data-weapon="revolver"><span>7</span><b>Revolver</b></div>');
$('weapon-select').add(new Option('Semi Rifle · experimental','semirifle'));
 $('weapon-select').add(new Option('Submachine Gun · experimental','submachinegun'));
 $('weapon-picker').insertAdjacentHTML('beforeend','<div data-weapon="submachinegun"><span>U</span><b>Submachine Gun</b></div>');
$('weapon-picker').insertAdjacentHTML('beforeend','<div data-weapon="semirifle"><span>8</span><b>Semi Rifle</b></div>');
for(const [id,name,key]of [['handgun','Hand Gun','H'],['assaultrifle','Assault Rifle','O'],['burstshotgun','Burst Shotgun','P']]){
 $('weapon-select').add(new Option(name+' · experimental',id));
 $('weapon-picker').insertAdjacentHTML('beforeend',`<div data-weapon="${id}"><span>${key}</span><b>${name} · experimental</b></div>`);
}
$('weapon-select').add(new Option('Katana · experimental — incomplete import','katana'));
$('weapon-select').add(new Option('Twin Blade · experimental','twinblade'));
$('weapon-select').add(new Option('Heavy Machine Gun · experimental','heavymachinegun'));
$('weapon-picker').insertAdjacentHTML('beforeend','<div data-weapon="heavymachinegun"><b>Heavy Machine Gun · experimental</b></div>');
for(const [id,name] of [['demonicknuckle','Demonic Knuckle'],['deathscythe','Death Scythe'],['vitalshock','Vital Shock'],['sigmablade','Sigma Blade'],['ironboots','Iron Boots'],['bat','Bat / Storm Bat'],['assassinclaw','Assassin Claw (formerly Vital Shock)']]){
  $('weapon-select').add(new Option(name+' · experimental',id));
  $('weapon-picker').insertAdjacentHTML('beforeend',`<div data-weapon="${id}"><b>${name} · experimental</b></div>`);
}
$('weapon-picker').insertAdjacentHTML('beforeend','<div data-weapon="twinblade"><span>0</span><b>Twin Blade · experimental</b></div>');
$('weapon-picker').insertAdjacentHTML('beforeend','<div data-weapon="katana"><span>9</span><b>Katana · experimental</b></div>');
$('play').disabled=true;
$('scene-select').value=qaParams.get('scene')||'arena';
$('appearance-select').value=qaParams.get('character')||'s5runtime';
$('appearance-select').querySelector('option[value="urban"]').disabled=loadout.sex!=='male';
$('appearance-select').querySelector('option[value="meshy"]').disabled=false;
$('outfit-select').disabled=qaParams.get('character')!=='s5runtime';
for(const [value,label] of Object.entries(chosenWeapon.skins))$('weapon-skin-select').add(new Option(label,value));
for(const [id,key] of [['sex-select','sex'],['outfit-select','outfit'],['weapon-select','weapon'],['weapon-skin-select','weaponSkin']])$(id).value=loadout[key];
for(const [id,key] of [['appearance-select','character'],['sex-select','sex'],['outfit-select','outfit']])$(id).onchange=e=>{if(weaponLoadoutSlots?.snapshot().pending)return;let url=new URL(location.href);url.searchParams.set(key,e.target.value);if(key==='outfit')url.searchParams.set('inventory','outfits');if(key==='sex'&&e.target.value==='female'&&url.searchParams.get('character')==='urban')url.searchParams.set('character','s5runtime');url.searchParams.delete('qa');location.href=url;};
$('weapon-skin-select').onchange=e=>{
 const skin=e.target.value,current=weaponLoadoutSlots?.snapshot();
 if(current)void weaponLoadoutSlots.assign(current.activeSlot,current.slots[current.activeSlot],skin);
 // Keep selectors on the confirmed appearance until the runtime acknowledges it.
 $('weapon-skin-select').value=loadout.weaponSkin;
};
$('scene-select').onchange=e=>switchSession({map:e.target.value});
$('weapon-select').onchange=e=>{if(weaponLoadoutSlots){const weapon=e.target.value,current=weaponLoadoutSlots.snapshot(),assigned=current.slots.indexOf(weapon);if(assigned>=0)selectWeaponSlot(assigned);else weaponLoadoutSlots.assign(current.activeSlot,weapon,weaponBundles.get(weapon)?.skin??'classic');$('weapon-select').value=loadout.weapon;}else switchWeapon(e.target.value);};
function writeWeaponHud(){
$('weapon-name').textContent=chosenWeapon.name.toUpperCase();
document.querySelector('#weapon>span').textContent={counter:'01',dagger:'02',plasma:'03',breaker:'04',airgun:'05',cannonade:'J',rocketlauncher:'K',smashrifle:'06',revolver:'07',semirifle:'08',submachinegun:'U',handgun:'H',assaultrifle:'O',burstshotgun:'P',katana:'09',twinblade:'00',bat:'B',assassinclaw:'C'}[loadout.weapon]??'—';
$('weapon-description').textContent=chosenWeapon.skins[loadout.weaponSkin]+(isRifleWeapon(loadout.weapon)?' · Firearm · experimental':loadout.weapon==='breaker'?' · Training integration':' · Melee');
if(loadout.weapon==='twinblade'){
 $('weapon-description').textContent='Classic · experimental — provisional combo and charge';
 $('weapon-controls').textContent='Left: combo · airborne: aerial strike · hold and release right: charged attack · 0: select';return;
}
if(loadout.weapon==='ironboots'){
 document.querySelector('#weapon>span').textContent='I';
 $('weapon-description').textContent='Classic · experimental';$('weapon-controls').textContent='Left: combo · hold left: rising kick · airborne: aerial strike · right: boost';return;
}
if(loadout.weapon==='demonicknuckle'){
 document.querySelector('#weapon>span').textContent='K';
 $('weapon-description').textContent='Demon’s Fist · experimental';$('weapon-controls').textContent='Left: alternating punches · left while airborne: aerial attack · right on ground: heavy attack (40 SP)';return;
}
if(loadout.weapon==='deathscythe'){
 document.querySelector('#weapon>span').textContent='D';
 $('weapon-description').textContent='EXO · experimental';$('weapon-controls').textContent='Left: combo · hold left: special attack · right: uppercut · airborne: aerial strike';return;
}
if(loadout.weapon==='vitalshock'){
 document.querySelector('#weapon>span').textContent='V';
 $('weapon-description').textContent='Black Cat · experimental — provisional combo';$('weapon-controls').textContent=VITAL_SHOCK_ARENA_CONTROLS;return;
}
if(loadout.weapon==='sigmablade'){
 document.querySelector('#weapon>span').textContent='S';
 $('weapon-description').textContent='Classic · experimental';$('weapon-controls').textContent='Left: attacks · right: transform · airborne: aerial strike';return;
}
if(loadout.weapon==='bat'||loadout.weapon==='assassinclaw'){
 $('weapon-description').textContent='Classic · experimental';
 $('weapon-controls').textContent=loadout.weapon==='bat'?'Left: strike · right: spin · airborne: aerial attack':'Left: multi-hit attack';return;
}
if(loadout.weapon==='katana'){
 $('weapon-description').textContent='Classic · experimental — incomplete import';
 $('weapon-controls').textContent='Left: combo · hold left: heavy attack · airborne: aerial attack · hold right: recoil/charge · release right: launch (experimental) · 9: select';return;
}
if(['handgun','assaultrifle','burstshotgun'].includes(loadout.weapon)){
 const automatic=loadout.weapon==='assaultrifle',key={handgun:'H',assaultrifle:'O',burstshotgun:'P'}[loadout.weapon];
 $('weapon-controls').textContent=(automatic?'Hold left: automatic fire':loadout.weapon==='burstshotgun'?'Left click: burst':'Left click: fire')+' · R: mobile reload · '+key+': select';return;
}
if(loadout.weapon==='semirifle'){
 $('weapon-controls').textContent='Hold left: automatic fire \u00b7 Hold right: zoom \u00b7 R: reload \u00b7 1-8: switch';return;
}
if(loadout.weapon==='submachinegun'){
 $('weapon-controls').textContent='Hold left: automatic fire · R: mobile reload · U: select';return;
}
if(loadout.weapon==='heavymachinegun'){
 $('weapon-controls').textContent='Hold left: prepare and fire · R: reload';return;
}
if(loadout.weapon==='revolver'){
 $('weapon-controls').textContent='Left click: fire · R: reload · 1–7: switch';return;
}
if(loadout.weapon==='smashrifle'){
 $('weapon-controls').textContent='Hold left: automatic fire · right click: melee attack · R: reload · 1–6: switch';return;
}
if(loadout.weapon==='rocketlauncher'){
 $('weapon-description').textContent='Classic · experimental';
 $('weapon-controls').textContent='Hold and release left: rocket · hold right for 2.5 s then release: triple shot · R: reload · K: select';return;
}
if(loadout.weapon==='cannonade'){
 $('weapon-description').textContent='Classic · experimental — reference comparison in progress';
 $('weapon-controls').textContent='Hold left: charge · release: fire · right click: toggle zoom · R: mobile reload · J: select';return;
}
if(loadout.weapon==='airgun'){
 $('weapon-description').textContent='Classic · experimental';
 $('weapon-controls').textContent='Hold left: charge · release: fire · R: reload · 1–5: switch weapon';
 return;
}
$('weapon-controls').textContent=loadout.weapon==='breaker'?'Left: strike · airborne: aerial strike · hold and release right: charged attack (S5 adaptation)':loadout.weapon==='counter'?'Tap left: combo · hold left: heavy attack · hold right: guard':loadout.weapon==='plasma'?'Tap left: strike · hold left: heavy attack · right click: rush':'Hold left: strikes · right click: rush';
}
function updateWeaponHud(){
 writeWeaponHud();
 if(weaponLoadoutSlots){document.querySelector('#weapon>span').textContent=inputBindings.get('weapon'+(weaponLoadoutSlots.snapshot().activeSlot+1)).bindingLabel;$('weapon-controls').textContent=$('weapon-controls').textContent.replace(/\s*·\s*(?:\d(?:[–-]\d+)?|[A-Z]):\s*(?:select|switch(?: weapon)?)/g,'')+' · '+[1,2,3].map(slot=>inputBindings.get('weapon'+slot).bindingLabel).join(' / ')+': weapon slots';}
 $('weapon-controls').textContent=$('weapon-controls').textContent.replace(/\bR\s*:\s*(mobile )?reload\b/g,(_,mobile)=>`${inputBindings.get('reload').bindingLabel}: ${mobile??''}reload`);
}
updateWeaponHud();
const mapSession=new MapSession(key=>buildMapEntry(async stage=>{
 const map=key==='conquest-46'?await loadConquestExplorationWorld(stage):key==='ironheart'?await loadIronHeartWorld(stage):key===ALICE_HOUSE_MAP?await loadAliceHouseWorld(stage):['azit','bio-lab','blade-city'].includes(key)?await loadNativeArtistMap(stage,key):['practice-52','practice-54'].includes(key)?await createPracticeWorld(stage,{mapId:Number(key.slice(9)),allowPartial:true,spawnNode:'trg_spawnpoint1'}):key==='circle2'?await createCircle2Atlas(stage):key==='circle2-classic'?await createImportedMap(stage,'circle2'):key==='station2-modular'?await createStation2Modular(stage):MAPS[key]?await createImportedMap(stage,key):createArena(stage);
 if(key==='station2-modular'){const [slice,environment]=await Promise.all([loadBlenderSlice(),loadBlenderEnvironment()]);applyBlenderSlice(map,slice);applyBlenderAtmosphere(stage,map,environment);}
 return map;
}));
let world,graphicsPresentation;
const baseLighting=captureLighting();
const mapStartup=startupPhase('map','Preparing map',1);
try{world=(await mapStartup.run('Map prepared',()=>mapSession.activate(qaParams.get('scene')||'arena',scene))).world;}
catch(error){$('load-status').textContent='Map failed: '+error.message;throw error;}
activatePresentation(qaParams.get('scene')||'arena');
installOutlineSettings({get settings(){return graphicsPresentation.outline.settings;},configure(...args){graphicsPresentation.outline.configure(...args);}});
function captureLighting(){
 return {tone:renderer.toneMapping,exposure:renderer.toneMappingExposure,lights:scene.children.filter(o=>o.isLight).map(light=>({light,color:light.color.clone(),ground:light.groundColor?.clone(),intensity:light.intensity,position:light.position.clone()})),sun:{target:sun.target.position.clone(),radius:sun.shadow.radius,bias:sun.shadow.bias,normalBias:sun.shadow.normalBias,size:sun.shadow.mapSize.clone(),camera:sun.shadow.camera.clone()}};
}
function restoreLighting(value){
 renderer.toneMapping=value.tone;renderer.toneMappingExposure=value.exposure;
 for(const record of value.lights){record.light.color.copy(record.color);if(record.ground)record.light.groundColor.copy(record.ground);record.light.intensity=record.intensity;record.light.position.copy(record.position);}
 sun.target.position.copy(value.sun.target);sun.shadow.radius=value.sun.radius;sun.shadow.bias=value.sun.bias;sun.shadow.normalBias=value.sun.normalBias;
 if(!sun.shadow.mapSize.equals(value.sun.size)){sun.shadow.map?.dispose();sun.shadow.map=null;}sun.shadow.mapSize.copy(value.sun.size);sun.shadow.camera.copy(value.sun.camera);renderer.shadowMap.needsUpdate=true;
}
function activatePresentation(key){
 const entry=mapSession.current;
 if(!entry.presentation){
  restoreLighting(baseLighting);const before=new Set(scene.children);
  entry.presentation=key==='station2-modular'?createStationPresentation(renderer,scene,camera,world,sun):createOutlinePresentation(renderer,scene,camera,world);
  for(const object of [...scene.children])if(!before.has(object)&&object!==sun.target)entry.root.attach(object);
  world.applyPresentation?.({renderer,scene,sun});
  entry.lighting=captureLighting();entry.surface=captureMapSurface(scene);
 }else world.resumePresentation?.();
 restoreLighting(entry.lighting);graphicsPresentation=entry.presentation;
 // Station 2 bakes its scenery shadow for one fixed sun box; others follow the view.
 followShadow.enabled=key!=='station2-modular';
 applyShadowBudget(renderer,sun,renderQuality,shadowsEnabled);graphicsPresentation.setQuality?.(renderQuality);
 graphicsPresentation.resize(innerWidth,innerHeight);camera.far=world.cameraFar||200;camera.updateProjectionMatrix();
}
const cameraDirector=new CameraDirector(new ThirdPersonCamera());
const weaponBundles=new Map();let selectedDashStyle='temporal',weaponSwordTexture=null,weaponBreakerTexture=null,weaponPreparation=null;
const weaponRenderWarmup=createWeaponRenderWarmup();
function prepareWeaponRendering(bundle){bundle.avatar.preparePoseSampling?.();return weaponRenderWarmup.prepare({renderer,scene,camera,presentation:graphicsPresentation,bundle,activeAvatar:avatar,hiddenRoots:[avatar?.group,avatar?.helper,weaponTrail?.mesh,dashEffect?.group],position:sun.target.position});}
function avatarOptions(weapon,skin){return {appearance:qaParams.get('character')||'s5runtime',...loadout,weapon,weaponSkin:skin,shieldAnimations:true,...(qaParams.has('qa')&&qaParams.get('weaponFit')==='default'?{weaponFit:{}}:{})};}
function releaseWeaponBundle(bundle){combatEffects?.releaseArtAvatar(bundle.avatar);bundle.audio?.stop();bundle.audio?.gain?.disconnect();if(bundle.audio){bundle.audio.connected=false;bundle.audio.buffers?.clear();}bundle.trail?.dispose();bundle.dash?.dispose();bundle.avatar?.dispose();}
async function createWeaponBundle(weapon,skin){
 const candidate=await loadAvatar(avatarOptions(weapon,skin));
 const bundle={avatar:candidate,skin,audio:new GameAudio(weapon,loadout.sex),trail:null,dash:null,pose:null};
 try{
  const mesh=candidate.meshes.find(m=>m.userData.weapon&&!m.userData.source.endsWith('_l.scn')&&(weapon!=='katana'||m.name==='katana_body'));
  if(mesh&&!isRifleWeapon(weapon)&&!['rocketlauncher','cannonade','airgun'].includes(weapon))bundle.trail=weapon==='assassinclaw'?await loadAssassinClawTrails(candidate):weapon==='katana'?await loadKatanaTrails(candidate):weapon==='sigmablade'?await loadSigmaBladeTrails(candidate):weapon==='bat'?await loadBatTrails(candidate):weapon==='demonicknuckle'?await loadDemonicKnuckleTrails(candidate):weapon==='deathscythe'?await loadDeathScytheTrails(candidate):weapon==='breaker'?await loadBreakerTrails(candidate):weapon==='ironboots'?new IronBootsTrails(candidate,{texture:weaponSwordTexture}):weapon==='twinblade'?await loadTwinBladeActorTrails(candidate):new WeaponTrail(mesh,{texture:weapon==='breaker'?weaponBreakerTexture:weapon==='dagger'?trailTexture:weaponSwordTexture,weapon});
  bundle.dash=new DashEffect(candidate.group,{style:selectedDashStyle});bundle.pose=new PoseBuffer([candidate.group,candidate.rig,...candidate.bones.values()]);
  bundle.audio.setVolume(audioSettings.get('sfx').linearGain);
  if(audio.context){bundle.audio.context=audio.context;await bundle.audio.unlock();}
  // Compile this new character only. Map/session preparation is independent.
  await ensureWeaponEffects(weapon);
  const art=combatEffects?.prepareArtAvatar(candidate,controller,weaponEffectSettings);if(art)await art.warmup(renderer,camera,scene);
  await renderer.compileAsync(candidate.group,camera,scene);
  await bundle.trail?.warmup?.(renderer,camera,scene);
  prepareWeaponRendering(bundle);
  return bundle;
 }catch(error){releaseWeaponBundle(bundle);throw error;}
}
const weaponResourceCache=createWeaponResourceCache({load:createWeaponBundle,release:releaseWeaponBundle,scope:{appearance:qaParams.get('character')||'s5runtime',sex:loadout.sex,outfit:loadout.outfit}});
function publishWeaponResources(){document.querySelector('[data-panel="inventory"]').dataset.weaponResources=JSON.stringify(weaponResourceCache.report());}
async function ensureWeaponBundle(weapon,skin){try{return await weaponResourceCache.get(weapon,skin);}finally{publishWeaponResources();}}
let equipmentSourcePrefetch=null;
window.addEventListener('pagehide',event=>{if(!event.persisted){weaponResourceCache.dispose();weaponBundles.clear();}});
const weaponPreviewPoses=new Map(),weaponPreviewBundles=new Map();let weaponPreviewRenderer=null,weaponPreviewView=null;
// Catalog cards need a small image, never an entire character rig. Keep the
// existing static thumbnails until that equipment has an evaluated 3D capture.
const inventoryThumbnail=createResourceCache(async weapon=>{
 const path=weaponThumbnail(weapon);if(!path)return null;
 const response=await fetch(path);if(!response.ok)throw Error('Weapon thumbnail unavailable');
 const blob=await response.blob();return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});
});
function disposeInventoryWeaponPreviews(){
 weaponPreviewView?.dispose();weaponPreviewView=null;weaponPreviewRenderer?.dispose();weaponPreviewRenderer=null;
 for(const pose of weaponPreviewPoses.values())pose.dispose();weaponPreviewPoses.clear();weaponPreviewBundles.clear();
}
function refreshInventoryWeaponPreview(weapon,bundle){
 if(!weaponPreviewRenderer||weaponPreviewBundles.get(weapon)===bundle)return;
 try{
  const pose=captureS5WeaponPreviewPose(bundle.avatar.group);weaponPreviewPoses.get(weapon)?.dispose();weaponPreviewPoses.set(weapon,pose);weaponPreviewBundles.set(weapon,bundle);
  weaponPreviewRenderer.invalidate(weapon);weaponPreviewView?.invalidate?.(weapon);
  document.querySelector('[data-panel="inventory"]').dataset.weaponPreviewSources=JSON.stringify({sex:loadout.sex,captures:[...weaponPreviewBundles].map(([id,value])=>({weapon:id,skin:value.skin,counts:weaponPreviewPoses.get(id)?.counts})),errors:[]});
 }catch(error){console.warn('Weapon preview unavailable: '+weapon,error);}
}
function prepareInventoryWeaponPreviews(inventory){
 disposeInventoryWeaponPreviews();
 const panel=document.querySelector('[data-panel="inventory"]'),captures=[],errors=[];
 for(const [weapon,bundle]of weaponBundles){
  try{const pose=captureS5WeaponPreviewPose(bundle.avatar.group);weaponPreviewPoses.set(weapon,pose);weaponPreviewBundles.set(weapon,bundle);captures.push({weapon,skin:bundle.skin,counts:pose.counts});}
  catch(error){errors.push({weapon,error:error.message});console.warn('Weapon preview unavailable: '+weapon,error);}
 }
 weaponPreviewRenderer=createS5WeaponPreviewRenderer({readSource:weapon=>weaponPreviewPoses.get(weapon),document});
 const publish=()=>{panel.dataset.weaponPreviewRenderer=JSON.stringify(weaponPreviewRenderer?.report()??{disposed:true});};
 panel.dataset.weaponPreviewSources=JSON.stringify({sex:loadout.sex,captures,errors});publish();
 weaponPreviewView=inventory.installWeaponPreviews({getPreview:weapon=>{const result=weaponPreviewPoses.has(weapon)?weaponPreviewRenderer.getPreview(weapon):inventoryThumbnail(weapon).catch(()=>null);publish();return result.then(value=>{publish();return value;});}});
}
window.addEventListener('pagehide',event=>{if(!event.persisted)disposeInventoryWeaponPreviews();});
const requestedMode=['conquest','practice','deathmatch','chaser','battleroyal','captain','siege','training','touchdown'].includes(qaParams.get('mode'))?qaParams.get('mode'):qaParams.get('scene')==='station2-modular'?'touchdown':'training';
let gameMode=requestedMode==='touchdown'&&!['station2','station2-modular'].includes(qaParams.get('scene'))?'training':requestedMode;
applyAliceHouseSessionSpawn(world,gameMode);
if(world.nativeMapId===151)applyIronHeartTeamSpawn(world,gameMode,qaParams.get('team')==='beta'?'beta':'alpha');
const controller=new Controller(world,loadout);
if(Number.isFinite(world.previewFacing))controller.facing=world.previewFacing;
installCollisionV2TestControls(controller);
const presentationSettings=installPresentationSettings({
 // Apply at once (no easing), unless a sprint or weapon zoom currently owns the angle.
 onFov:value=>{const fov=setNormalFov(value);if(!controller.sprinting&&!controller.cannonade?.zoom&&!controller.rifle?.zoom){camera.fov=fov;camera.updateProjectionMatrix();}},
 onRenderQuality:value=>{
  renderQuality=value;renderer.setPixelRatio(renderPixelRatio(value,innerWidth,innerHeight,devicePixelRatio));renderer.setSize(innerWidth,innerHeight);
  applyShadowBudget(renderer,sun,value,shadowsEnabled);graphicsPresentation.setQuality?.(value);graphicsPresentation.resize(innerWidth,innerHeight);
 },
 onShadows:enabled=>{
  shadowsEnabled=enabled;applyShadowBudget(renderer,sun,renderQuality,enabled);
  // Three tracks the number of shadow-casting lights in its program cache.
  // Do not invalidate every material in all thirty preloaded weapon bundles.
 },
 onInfiniteSp:enabled=>controller.setInfiniteEnergy(enabled),
 onCameraMode:mode=>{cameraDirector.setMode(mode);document.body.classList.toggle('camera-mode',mode!=='normal');},
 onWeaponPicker:visible=>document.body.classList.toggle('hide-weapon-picker',!visible),
 onDashStyle:style=>{selectedDashStyle=style;for(const bundle of weaponResourceCache.values())bundle.dash.configure(style);},
});
if(world.name){document.querySelector('.eyebrow').textContent=world.name+' / TRAINING';}
const motionGraph=new MotionGraph();
let locomotionSettings=null;
{
 let saved='classic';try{saved=localStorage.getItem('air-dagger-sprint-style')||saved;}catch{}
 motionGraph.sprintStyle=sprintStyle(qaParams.get('sprintStyle')||saved);
 const label=document.createElement('label');label.textContent='Sprint animation · F3';
 const select=document.createElement('select');select.id='sprint-style';select.setAttribute('aria-label','Sprint animation');
 for(const [value,text] of Object.entries(SPRINT_STYLES))select.add(new Option(text,value));
 select.value=motionGraph.sprintStyle;select.onchange=()=>setSprintStyle(select.value);
 label.append(select);document.querySelector('.setup').append(label);
}
function setSprintStyle(value){
 const style=sprintStyle(value);motionGraph.sprintStyle=style;$('sprint-style').value=style;
 locomotionSettings?.sync();
 try{localStorage.setItem('air-dagger-sprint-style',style);}catch{}
 const url=new URL(location.href);url.searchParams.delete('gait');url.searchParams.set('sprintStyle',style);history.replaceState(null,'',url);
}
{
 let saved='classic';try{saved=localStorage.getItem('air-dagger-run-style')||saved;}catch{}
 motionGraph.runStyle=runStyle(qaParams.get('runStyle')||saved);
 const label=document.createElement('label');label.textContent='Ground movement';
 const select=document.createElement('select');select.id='run-style';select.setAttribute('aria-label','Ground movement');
 for(const [value,text] of Object.entries(RUN_STYLES))select.add(new Option(text,value));
 select.value=motionGraph.runStyle;
 select.onchange=()=>{
  const style=runStyle(select.value);motionGraph.runStyle=style;
  try{localStorage.setItem('air-dagger-run-style',style);}catch{}
  const url=new URL(location.href);url.searchParams.set('runStyle',style);history.replaceState(null,'',url);
 };
 label.append(select);document.querySelector('.setup').append(label);
}
{
 let saved='classic';try{saved=localStorage.getItem('air-dagger-idle-style')||saved;}catch{}
 motionGraph.idleStyle=idleStyle(qaParams.get('idleStyle')||saved);
 const label=document.createElement('label');label.textContent='Idle animation';
 const select=document.createElement('select');select.id='idle-style';select.setAttribute('aria-label','Idle animation');
 for(const [value,text] of Object.entries(IDLE_STYLES))select.add(new Option(text,value));
 select.value=motionGraph.idleStyle;
 select.onchange=()=>{
  const style=idleStyle(select.value);motionGraph.idleStyle=style;
  try{localStorage.setItem('air-dagger-idle-style',style);}catch{}
  const url=new URL(location.href);url.searchParams.set('idleStyle',style);history.replaceState(null,'',url);
 };
 label.append(select);document.querySelector('.setup').append(label);
}

locomotionSettings=installLocomotionSettings($('graphics-settings'));
const auraSettingsControls=installWeaponAuraControls($('graphics-settings'),{document,settings:weaponEffectSettings});
window.addEventListener('pagehide',event=>{if(!event.persisted)auraSettingsControls.dispose();});

 let avatar=null,weaponTrail=null,dashEffect=null,sprintEffect=null,poseBuffer=null,active=false,lab=false,yaw=Number.isFinite(world.previewFacing)?world.previewFacing-Math.PI:['station2','station2-modular'].includes(qaParams.get('scene'))?Math.PI:0,pitch=FOLLOW_CAMERA.initialPitch,last=performance.now(),animOverride=chosenWeapon.idle,animationSpeed=1;
const simulationClock=new SimulationClock();
const controls=new BoundMovementInput(inputBindings,{onEdge:event=>{if(inputObservations){inputObservations.edges.push(event);if(inputObservations.edges.length>64)inputObservations.edges.shift();}if(event.edge==='press'&&/^weapon[123]$/.test(event.command)&&hasPlayerControl())selectWeaponSlot(Number(event.command.at(-1))-1);}});
const roomLifecycle=createWaitingRoomLifecycle();
let waitingRoom=null,roomStartRequest=false,roomMatchReset=null,roomResults=null,entryPlayDestination='waiting-room';
const shieldInput=createGameShieldInput(inputBindings);
let shield=null,shieldPresentation=null,skillReadout=null,skillCapabilities={unequipReady:false},skillEquipment={revision:0,status:'equipped',confirmedItemKey:null,requestedItemKey:null};
let shieldPreparation=null,shieldResourcesDisposed=false;
function bindGameShieldQueries(){
 if(!shieldPresentation)return;
 controller.sourceShieldQuery={getCandidates:()=>shieldPresentation?.getQueryCandidates()??[],requesterSlot1c4:false,policy:'source-compatible-local-owner-false'};
 if(combat?.enemy)combat.enemy.sourceShieldQuery={getCandidates:()=>shieldPresentation?.getQueryCandidates()??[],requesterSlot1c4:true,policy:'s5-local-opponent-query-polarity-v1; native writer binding unverified'};
}
function ensureGameShield(){
 if(shieldResourcesDisposed)return Promise.reject(Error('Skill resources disposed'));
 if(shield)return Promise.resolve(shield);
 if(!shieldPreparation)shieldPreparation=Promise.resolve().then(()=>loadGameShieldPresentation({scene,getAudioContext:()=>audio.context,getSfxGain:()=>audioSettings.get('sfx').linearGain})).then(presentation=>{
  if(shieldResourcesDisposed){presentation.dispose();throw Error('Skill resources disposed');}
  let host;
  try{host=createGameShield({controller,getAvatar:()=>avatar,presentation,onNotification:reason=>toast('Shield : '+reason),actorLocked:()=>!!combat?.playerState.locked||!!touchdown?.health.dead});}
  catch(error){presentation.dispose();throw error;}
  shieldPresentation=presentation;shield=host;bindGameShieldQueries();return host;
 }).finally(()=>{shieldPreparation=null;});
 return shieldPreparation;
}
function disposeGameSkill(){
 if(shieldResourcesDisposed)return;
 shieldResourcesDisposed=true;
 shield?.dispose();shield=null;shieldPresentation=null;
}
window.addEventListener('pagehide',event=>{if(!event.persisted)disposeGameSkill();});
function skillEquipmentChanged(status,requestedItemKey){skillEquipment={revision:skillEquipment.revision+1,status,confirmedItemKey:controller.s5runtimeSkill.itemKey,requestedItemKey};document.dispatchEvent(new CustomEvent('s5:skill-equipment-changed',{detail:skillEquipment}));}
function equipGameSkill(itemKey){
 if(shieldResourcesDisposed)return {accepted:false,reason:'disposed'};
 if(sessionBusy||inputCapture){$('skill-select').value=controller.s5runtimeSkill.itemKey===null?'':String(controller.s5runtimeSkill.itemKey);skillEquipmentChanged('rejected',itemKey);return;}
 if(![null,3050001,3050002].includes(itemKey)){skillEquipmentChanged('rejected',itemKey);return {accepted:false,reason:'unsupported-game-skill'};}
 skillEquipmentChanged('pending',itemKey);const revision=skillEquipment.revision;
 const commit=()=>{
  if(skillEquipment.revision!==revision)return {accepted:false,reason:'superseded'};
  if(sessionBusy||inputCapture){$('skill-select').value=controller.s5runtimeSkill.itemKey===null?'':String(controller.s5runtimeSkill.itemKey);skillEquipmentChanged('rejected',itemKey);return {accepted:false,reason:'session-unavailable'};}
  const result=shield?shield.equip(itemKey):{accepted:itemKey===null,reason:'skill-not-prepared'};
  $('skill-select').value=controller.s5runtimeSkill.itemKey===null?'':String(controller.s5runtimeSkill.itemKey);
  skillEquipmentChanged(result.accepted?'equipped':'rejected',itemKey);shieldInput.clear('equipment-changed');
  if(result.accepted){const url=new URL(location.href);if(itemKey===null)url.searchParams.delete('skill');else url.searchParams.set('skill',String(itemKey));history.replaceState(null,'',url);}
  if(!result.accepted)toast('Skill unavailable: '+result.reason);
  return result;
 };
 if(shield||itemKey===null)return commit();
 return ensureGameShield().then(commit).catch(error=>{
  if(skillEquipment.revision!==revision||shieldResourcesDisposed)return {accepted:false,reason:'superseded'};
  $('skill-select').value=controller.s5runtimeSkill.itemKey===null?'':String(controller.s5runtimeSkill.itemKey);skillEquipmentChanged('rejected',itemKey);
  toast('Skill unavailable: '+error.message);return {accepted:false,reason:'resource-load-failed'};
 });
}
const enemyWeaponBundles=new Map();
const opponentTrails=createOpponentTrailCache({
 appliesTo:enemy=>['sigmablade','katana','breaker','twinblade','bat','deathscythe','demonicknuckle','ironboots','assassinclaw'].includes(enemy.weapon),
 load:enemy=>enemy.weapon==='assassinclaw'?loadAssassinClawTrails(enemy):enemy.weapon==='katana'?loadKatanaTrails(enemy):enemy.weapon==='breaker'?loadBreakerTrails(enemy):enemy.weapon==='twinblade'?loadTwinBladeActorTrails(enemy):enemy.weapon==='bat'?loadBatTrails(enemy):enemy.weapon==='deathscythe'?loadDeathScytheTrails(enemy):enemy.weapon==='demonicknuckle'?loadDemonicKnuckleTrails(enemy):enemy.weapon==='ironboots'?new IronBootsTrails(enemy,{texture:weaponSwordTexture}):loadSigmaBladeTrails(enemy),
 prepare:async(enemy,trail)=>{await renderer.compileAsync(enemy.group,camera,scene);await trail.warmup(renderer,camera,scene);},
});
window.addEventListener('pagehide',event=>{if(!event.persisted)opponentTrails.dispose();});
async function enemyWeaponAvatar(weapon){
 if(!TRAINING_OPPONENT_WEAPONS.includes(weapon))throw Error('Opponent weapon unavailable');
 if(!enemyWeaponBundles.has(weapon))enemyWeaponBundles.set(weapon,loadAvatar({appearance:qaParams.get('character')||'s5runtime',...loadout,weapon,weaponSkin:'classic'}));
 try{const [opponent]=await Promise.all([enemyWeaponBundles.get(weapon),ensureWeaponEffects(weapon),opponentAudio.prepare(weapon,loadout.sex)]);await opponentTrails.prepare(opponent);return opponent;}catch(error){enemyWeaponBundles.delete(weapon);throw error;}
}
async function switchOpponent(weapon){
 if(!sessionReady||sessionBusy||gameMode!=='training'||!combat)return;
 sessionBusy=true;sessionControls(true);
 try{const behavior=combat.mode,opponent=await enemyWeaponAvatar(weapon);detachMatch({preserveGameMenu:escapeMenu.opened});enemyAvatars[0]=opponent;qaParams.set('enemyWeapon',weapon);await attachMatch();combat.setMode(behavior);$('enemy-mode').value=behavior;resetSessionPose();animateAvatar(0);poseBuffer.reset();const url=new URL(location.href);url.searchParams.set('enemyWeapon',weapon);history.replaceState(null,'',url);}
 catch(error){toast('Opponent unavailable: '+error.message);console.error(error);}
 finally{sessionBusy=false;sessionControls();$('enemy-weapon-select').value=qaParams.get('enemyWeapon')||'counter';}
}
let wallEffect=new WallContactEffect(),impactEffect=null;scene.add(wallEffect.group);
let audio=new GameAudio(loadout.weapon,loadout.sex),trailTexture=null,pendingWeapon=null,weaponTransition=null;
const opponentAudio=createOpponentAudioCache({createAudio:(weapon,sex)=>new GameAudio(weapon,sex),getCurrentAudio:()=>audio,getWeaponAudio:(weapon,sex)=>{const cached=weaponBundles.get(weapon)?.audio;return cached?.sex===sex?cached:null;},getGain:()=>audioSettings.get('sfx').linearGain});
const audioSettings=createGameAudioSettings({getCurrentAudio:()=>audio,getWeaponBundles:()=>weaponResourceCache,getAdditionalAudio:()=>opponentAudio.values(),initial:{sfx:Number($('audio-volume').value)}});
window.addEventListener('pagehide',event=>{if(!event.persisted)opponentAudio.dispose();});
const interfaceAudio=createGameInterfaceAudio({getAudio:()=>audio,audioSettings});
const bgmEvents=inputObservations?[]:null;
let bgmStatus=null,bgmSurfaceKey=null;
const bgmSession=createGameBgmSession({getContext:()=>audio.context,audioSettings,createPlayer(options){
 const player=createGameBgm({...options,resolveUrl:track=>'/assets/s5runtime/'+track.path});
 player.subscribe(value=>{
  if(bgmEvents){bgmEvents.push(value);if(bgmEvents.length>64)bgmEvents.shift();}
  if(bgmStatus)bgmStatus.textContent=value.status==='playing'?'Music playing':value.status==='paused'?'Music paused':value.status==='loading'?'Loading music…':value.status==='error'?'Music could not be loaded.':value.reason==='no-native-map-identity'||value.routeKey?.startsWith('map:')?'Music unavailable on this map.':'Music will start on supported maps.';
 });
 return player;
},onError:error=>console.error('Music playback failed',error)});
// Preview reuses the existing game context and the one BGM player; no weapon decode is required.
const jukeboxBridge=createJukeboxAudioBridge({session:bgmSession,unlockContext:()=>audio.unlockContext()});
const jukeboxSettings=createJukeboxSettings(jukeboxBridge);
window.addEventListener('pagehide',event=>{if(!event.persisted){jukeboxSettings.dispose();jukeboxBridge.dispose();}});
function syncBgmSurface(){
 const surface=document.hidden?'menu':lab?'lab':active&&$('welcome').hidden?'game':'menu',map=qaParams.get('scene')||'arena',key=surface+':'+map;
 if(key!==bgmSurfaceKey){bgmSurfaceKey=key;void bgmSession.setSurface(surface,map);}
}
const transitionDiagnostics=qaParams.has('transitionDebug')?[]:null;
if(transitionDiagnostics)window.__weaponTransitionDiagnostics=transitionDiagnostics;
let combat=null,combatEffects=null,airgunEffects=null,cannonadeEffects=null,rocketLauncherEffects=null,rifleEffects=null,revolverEffects=null,semiRifleEffects=null,submachineGunEffects=null,katanaScreenEffects=null;
window.addEventListener('pagehide',event=>{if(!event.persisted)katanaScreenEffects?.dispose();});
const importedRifleEffects=[];
const weaponEffectCache=createWeaponEffectCache({loaders:{
 ...Object.fromEntries(COMBAT_EFFECT_WEAPONS.map(weapon=>[weapon,()=>combatEffects.prepareWeapon(weapon)])),
 katana:async()=>{
  const worldEffects=await combatEffects.prepareWeapon('katana');
  const screenEffects=await loadKatanaScreenEffects();katanaScreenEffects=screenEffects;
  return {async warmup(renderer,camera){await worldEffects.warmup(renderer,camera);await screenEffects.warmup(renderer);}};
 },
 airgun:()=>loadAirgunEffects(scene),cannonade:()=>loadCannonadeEffects(scene),rocketlauncher:()=>loadRocketLauncherEffects(scene),
 smashrifle:()=>loadSmashRifleEffects(scene),revolver:()=>loadRevolverEffects(scene),
 semirifle:()=>loadGunParticleEffects(scene,{weapon:'semirifle',muzzle:'Smg_02_Fire_Dummy',root:'/assets/s5runtime/effects/semi-rifle'}),
 submachinegun:()=>loadGunParticleEffects(scene,{weapon:'submachinegun',muzzle:'Gun_L_Fire_Dummy',muzzles:['Gun_L_Fire_Dummy','Gun_R_Fire_Dummy'],root:'/assets/s5runtime/effects/submachine-gun'}),
 handgun:()=>loadHandgunEffects(scene),assaultrifle:()=>loadAssaultRifleEffects(scene),
 burstshotgun:()=>loadBurstShotgunEffects(scene,{onSound:descriptor=>weaponBundles.get('burstshotgun')?.audio.playBurstBlast(descriptor)}),
 heavymachinegun:()=>loadHeavyMachineGunEffects(scene),
},warmup:effect=>effect.warmup(renderer,camera),onReady(weapon,effect){
 if(COMBAT_EFFECT_WEAPONS.includes(weapon))return;
 switch(weapon){
  case 'airgun':airgunEffects=effect;break;case 'cannonade':cannonadeEffects=effect;break;case 'rocketlauncher':rocketLauncherEffects=effect;break;
  case 'smashrifle':rifleEffects=effect;break;case 'revolver':revolverEffects=effect;break;case 'semirifle':semiRifleEffects=effect;break;case 'submachinegun':submachineGunEffects=effect;break;
  default:importedRifleEffects.push(effect);
 }
}});
function ensureWeaponEffects(weapon){return weaponEffectCache.ensure(weapon);}
let touchdown=null,match=null,conquestContactQA=null,conquestEncounter=null,conquestEncounterHud=null,conquestResultAdapter=null,conquestMonsterHealthBars=null;
function disposeConquestEncounter(){conquestMonsterHealthBars?.dispose();conquestMonsterHealthBars=null;conquestResultAdapter?.dispose();conquestResultAdapter=null;conquestEncounter?.dispose();conquestEncounter=null;conquestEncounterHud?.dispose();conquestEncounterHud=null;}
async function ensureConquestEncounter(){
 if(world.nativeMapId!==46||qaScenario)return;
 if(conquestEncounter)return;
 $('load-status').textContent='Preparing Conquest defence…';
 conquestEncounter=await prepareConquestEncounter({scene,world,controller,getAvatar:()=>avatar,audio,camera,renderer,loadout:weaponLoadoutSlots,sex:loadout.sex});
 conquestEncounterHud=createConquestEncounterHud();
 conquestMonsterHealthBars=createConquestMonsterHealthBars({scene,actors:conquestEncounter.session.bridge.actors});
 conquestResultAdapter=createConquestLocalResults({encounter:conquestEncounter});
 // Direct local entry still belongs to the same room lifecycle. Ordinary
 // entry is already starting/playing and keeps its existing room token.
 if(roomLifecycle.snapshot().phase==='outside'){roomLifecycle.enter();roomLifecycle.started(roomLifecycle.beginStart().token);}
}
window.addEventListener('pagehide',disposeConquestEncounter);
Object.defineProperty(window,'s5Conquest',{configurable:true,get:()=>conquestEncounter?.snapshot()??null});
if(qaParams.get('conquestDebug')==='1')Object.defineProperty(window,'s5ConquestEncounter',{configurable:true,get:()=>conquestEncounter});
let matchTeam=qaParams.get('team')==='beta'?'beta':'alpha';
const initialPracticeOption=practiceSourceOption(qaParams.get('practiceScore')??254);
let sessionReady=false,sessionBusy=false,combatTexture=null,chaserPresentation=null,chaserHudEffects=null;const enemyAvatars=[];
$('scene-select').disabled=true;
for(const [value,label] of [['conquest-46','Conquest · Cube Defence — 8 waves'],['ironheart','Iron Heart · Classic'],['practice-52','Practice52 · Station — partial'],['practice-54','Practice54 · Station1 — partial']])$('scene-select').add(new Option(label,value));
$('scene-select').value=qaParams.get('scene')||'arena';
{
 const modeLabel=document.createElement('label');modeLabel.textContent='Game mode';const modeSelect=document.createElement('select');modeSelect.id='game-mode';
 for(const [value,text] of [['conquest','Conquest · Cube Defence · 8 waves'],['touchdown','Touchdown · Station 2'],['deathmatch','Deathmatch · local match'],['chaser','Chaser · local match'],['battleroyal','Battle Royal · experimental local'],['captain','Captain · experimental local'],['siege','Siege · experimental local'],['practice','Practice · partial-map diagnostic'],['training','Free training']])modeSelect.add(new Option(text,value));
 modeSelect.value=gameMode;modeSelect.disabled=true;modeSelect.onchange=()=>switchSession({mode:modeSelect.value,...(gameMode==='conquest'&&modeSelect.value!=='conquest'?{map:'arena'}:{})});modeLabel.append(modeSelect);document.querySelector('.setup').append(modeLabel);
 const teamLabel=document.createElement('label');teamLabel.textContent='Your team';const teamSelect=document.createElement('select');teamSelect.id='team-select';for(const [value,text] of [['alpha','Alpha · blue'],['beta','Beta · coral']])teamSelect.add(new Option(text,value));teamSelect.value=matchTeam;teamSelect.disabled=true;teamSelect.onchange=()=>switchSession({team:teamSelect.value});teamLabel.append(teamSelect);document.querySelector('.setup').append(teamLabel);
}
const practiceOptionControl=createPracticeOptionControl({document,value:initialPracticeOption.scoreOption,onChange:practiceScore=>switchSession({practiceScore})});document.querySelector('.setup').append(practiceOptionControl.root);
const matchOptionControl=createMatchOptionControl({document,onChange:matchOption=>switchSession({matchOption})});document.querySelector('.setup').append(matchOptionControl.root);
{
 const label=document.createElement('label');label.textContent='Skill · experimental';const select=document.createElement('select');select.id='skill-select';select.disabled=true;
 for(const [key,name]of [['','None'],['3050001','Shield · experimental'],['3050002',"Powers’ Shield · experimental"]])select.add(new Option(name,key));
 select.onchange=()=>equipGameSkill(select.value===''?null:Number(select.value));label.append(select);document.querySelector('.setup').append(label);
 const note=document.createElement('small');note.textContent='Shield: toggle with the skill key. Ranged weapon interactions are experimental.';label.append(note);
 const hud=document.createElement('div');hud.id='skill-status';hud.setAttribute('role','status');hud.hidden=true;hud.style.cssText='position:fixed;right:24px;top:76px;padding:9px 14px;background:#102b3de8;color:#ddfaff;border:1px solid #65dce6;font:600 13px sans-serif;pointer-events:none';document.body.append(hud);
 if(inputObservations){skillReadout=document.createElement('output');skillReadout.id='skill-observation';skillReadout.hidden=true;document.body.append(skillReadout);}
 const opponentLabel=document.createElement('label');opponentLabel.textContent='Opponent weapon · training';const opponent=document.createElement('select');opponent.id='enemy-weapon-select';opponent.disabled=true;
 for(const id of TRAINING_OPPONENT_WEAPONS)opponent.add(new Option(WEAPON_CHOICES[id].name+(WEAPON_CHOICES[id].experimental?' · experimental':''),id));opponent.value=trainingOpponentWeapon(qaParams.get('enemyWeapon'));opponent.onchange=()=>switchOpponent(opponent.value);opponentLabel.append(opponent);document.querySelector('.setup').append(opponentLabel);
}
const menuLayout=installMenuLayout();
function retryEntryPlay({snapshot,operationKind}={}){
 if(!['play','room-return'].includes(operationKind)||snapshot?.route!=='error'||!snapshot.ready||snapshot.busy)return {accepted:false,reason:'retry-unavailable'};
 if(operationKind==='room-return')return returnToWaitingRoom();
 if($('play').disabled)return {accepted:false,reason:'retry-unavailable'};
 const restored=entryShell.flow.go('lobby');if(!restored.accepted)return restored;
 if(entryPlayDestination==='match'&&waitingRoom?.visible)return startWaitingRoomMatch();
 $('play').click();return {accepted:true};
}
async function startWaitingRoomMatch(){
 const request=roomLifecycle.beginStart();if(!request.accepted)return request;
 roomStartRequest=true;
 try{
  await $('play').onclick();
  if(active&&!waitingRoom.visible&&entryShell.flow.snapshot().route==='playing'){roomLifecycle.started(request.token);return {accepted:true};}
  roomLifecycle.startFailed(request.token);waitingRoom.show();waitingRoom.setMenuOpen(!$('welcome').hidden);
  return {accepted:false,reason:'Match startup did not complete.'};
 }catch(error){roomLifecycle.startFailed(request.token);waitingRoom.show();waitingRoom.setMenuOpen(!$('welcome').hidden);throw error;}
 finally{roomStartRequest=false;}
}
// Lobby screen to return to when Settings closes.
const SETTINGS_RETURN_ROUTES=['ready-lobby','equipment','preparation','room','motion'];
let settingsReturnRoute='ready-lobby';
const entryShell=installS5EntryShell({host:$('welcome'),menuLayout,onPlay:()=>$('play').click(),
 onSound:phase=>{void interfaceAudio.notify({kind:'s5-lobby-presentation',phase});},
 getLobbyContext:()=>({rosterKind:gameMode==='battleroyal'&&world.nativeMapId!==46?'individual':'teams',mode:world.nativeMapId===46?'Conquest · 8 waves':gameMode,sceneKey:$('scene-select').value,map:$('scene-select').selectedOptions[0]?.textContent||world.name||'Map',nativeMapId:world.nativeMapId??null,rules:($('practice-option').closest('label').hidden?$('match-option'):$('practice-option')).selectedOptions[0]?.textContent||'Default rules',team:$('team-select').selectedOptions[0]?.textContent||'—',controlLabels:[1,2,3].map(slot=>inputBindings.get('weapon'+slot).bindingLabel)}),
 getLoadingContext:()=>({mode:gameMode,sceneKey:$('scene-select').value,nativeMapId:world.nativeMapId??null,mapLabel:$('scene-select').selectedOptions[0]?.textContent||world.name||'Map',destination:entryPlayDestination}),
 onRetry:retryEntryPlay,
 beforeNavigate({from,to}){
  inputSettings?.cancel();
  if(to==='settings'&&SETTINGS_RETURN_ROUTES.includes(from))settingsReturnRoute=from;
  if(from==='equipment'&&to!=='equipment')cancelPendingWeapon('inventory-closed');
  if(from==='settings'&&to!=='settings'&&optionsTransaction?.snapshot().phase==='open')return optionsTransaction.cancel('s5-route-change');
  return {accepted:true};
 },beforePlay:()=>optionsPanelLifecycle?.leaveForPlay()??{accepted:true}});
const escapeMenu=installGameEscapeMenu({onResume:resumeGameSession,onLeave:leaveGameSession,leaveLabel:'Return to room',
 onSettings:()=>openIngameSettings(),weaponEffects:{settings:weaponEffectSettings,
 read(){const slots=weaponLoadoutSlots?.snapshot().slots??[];return {weapon:controller.weapon,busy:sessionBusy,weapons:[...new Set([controller.weapon,...slots.filter(Boolean)])].map(value=>({value,label:WEAPON_CHOICES[value].name}))};},
},training:{
 read(){if(gameMode!=='training'||!combat)return null;return {weapon:combat.enemy.weapon,behavior:combat.mode,busy:sessionBusy,
  weapons:[...$('enemy-weapon-select').options].map(option=>({value:option.value,label:option.textContent})),
  behaviors:[...$('enemy-mode').options].map(option=>({value:option.value,label:option.textContent}))};},
 change(kind,value){if(kind==='weapon')return switchOpponent(value);$('enemy-mode').value=value;combat.setMode(value);},
}});
let effectSelectionSignature=JSON.stringify(weaponEffectSettings.snapshot().selections);
weaponEffectSettings.subscribe(snapshot=>{const signature=JSON.stringify(snapshot.selections);if(signature!==effectSelectionSignature){combatEffects?.clearForAvatar(avatar);weaponTrail?.clear();}effectSelectionSignature=signature;});
let escapeUnlockPending=false;
function closeGameMenu(){escapeUnlockPending=false;escapeMenu.close({restoreFocus:false});document.body.classList.remove('game-menu-open');}
// In-game Settings: reveal the lobby's own Settings section over the paused
// match (the entry flow refuses navigation while playing). Its options
// lifecycle opens the transaction when the panel becomes visible; any close
// (Close, Confirm, Escape) restores the lobby state and the game menu.
let ingameSettings=null;
function openIngameSettings(){
 if(ingameSettings||!escapeMenu.opened||sessionBusy)return {accepted:false,reason:'settings-unavailable'};
 const welcome=$('welcome'),lobby=entryShell.lobby;
 ingameSettings={hidden:welcome.hidden,inert:welcome.getAttribute('inert'),aria:welcome.getAttribute('aria-hidden'),section:lobby.element.dataset.section,
  panels:[...document.querySelectorAll('.menu-shell [data-panel]')].map(panel=>[panel,panel.hidden])};
 escapeMenu.close({restoreFocus:false});document.body.classList.remove('game-menu-open');document.body.classList.add('ingame-settings');
 lobby.show('settings');
 for(const [panel] of ingameSettings.panels)panel.hidden=panel.dataset.panel!=='settings';
 welcome.hidden=false;welcome.removeAttribute('inert');welcome.setAttribute('aria-hidden','false');
 optionsPanelLifecycle?.sync();
 welcome.querySelector('[data-panel="settings"] button:not([disabled]),[data-panel="settings"] [role=tab]')?.focus();
 return {accepted:true};
}
function closeIngameSettings(){
 const state=ingameSettings;if(!state)return {accepted:false,reason:'settings-closed'};
 ingameSettings=null;
 if(optionsTransaction?.snapshot().phase==='open'){inputSettings?.cancel();optionsTransaction.cancel('s5-ingame-settings');}
 const welcome=$('welcome');
 welcome.hidden=state.hidden;if(state.inert===null)welcome.removeAttribute('inert');else welcome.setAttribute('inert',state.inert);
 if(state.aria===null)welcome.removeAttribute('aria-hidden');else welcome.setAttribute('aria-hidden',state.aria);
 for(const [panel,hidden] of state.panels)panel.hidden=hidden;
 entryShell.lobby.show(state.section);document.body.classList.remove('ingame-settings');
 optionsPanelLifecycle?.sync();
 escapeMenu.open();document.body.classList.add('game-menu-open');
 return {accepted:true};
}
function stopWeaponAudio(){const cached=typeof weaponResourceCache==='undefined'?[]:weaponResourceCache.values?.()??[];for(const player of new Set([audio,...Array.from(weaponBundles.values(),bundle=>bundle.audio),...Array.from(cached,bundle=>bundle.audio),...opponentAudio.values()]))player?.stop?.();}
function openGameMenu({fromPointerUnlock=false}={}){
 if(!sessionReady||sessionBusy||!active||lab||!$('welcome').hidden||(world.nativeMapId===46&&conquestResultAdapter?.finished)||(touchdown||match)?.state.phase==='result')return {accepted:false,reason:'session-unavailable'};
 if(escapeMenu.opened){if(!fromPointerUnlock)escapeUnlockPending=false;return {accepted:true};}
 escapeUnlockPending=fromPointerUnlock;
 cancelPendingWeapon('game-menu');controls.clear();shieldInput.clear('game-menu');cameraDirector.clear();(touchdown||match)?.ui?.setRoster?.(false);
 escapeMenu.open();document.body.classList.add('game-menu-open');fallbackControl=false;
 pointerCapture.invalidate('game-menu');
 return {accepted:true};
}
function resumeGameSession({gamepad:fromGamepad=false}={}){
 if(!escapeMenu.opened||!sessionReady||sessionBusy||!active||lab||!$('welcome').hidden)return {accepted:false,reason:'session-unavailable'};
 closeGameMenu();controls.clear();shieldInput.clear('resume');cameraDirector.clear();
 // Reveal the current phase, including a result reached while the menu was open.
 // A resume never resets the session or repeats asynchronous Play preparation.
 if(fromGamepad)gamepad.requestControl();
 if((touchdown||match)?.state.phase!=='result')captureMouse();else canvas.focus();
 syncSessionNavigation();return {accepted:true};
}
async function leaveGameSession(){
 if(!escapeMenu.opened)return {accepted:false,reason:'menu-closed'};
 if(roomLifecycle.snapshot().joined)return returnToWaitingRoom();
 const result=returnSessionToLobby();if(!result.accepted)return result;
 // Local room exit prepares a fresh match using cached resources. The native
 // room-exit destination is still unverified; result navigation keeps its
 // separate, state-preserving Back to lobby action.
 const switched=await switchSession();
 return {accepted:switched?.accepted===true,reason:switched?.accepted===true?'left-local-room':'room-exit-failed'};
}
function syncEntryShell(){entryShell.lobby.setPlayLabel(waitingRoom?.visible?'Return to room':active?((world.nativeMapId===46&&conquestResultAdapter?.finished)||(touchdown||match)?.state.phase==='result'?'View results':'Resume'):'Enter room');entryShell.sync({ready:sessionReady,busy:sessionBusy,capturing:inputCapture,playing:active&&($('welcome').hidden||document.body.classList.contains('ingame-settings'))&&!lab,status:$('load-status').textContent});slotInventory?.sync();practiceFrustumView?.sync();}
const sessionNavigation=installS5SessionNavigation({onReturnToLobby:()=>roomLifecycle.snapshot().joined?returnToWaitingRoom():returnSessionToLobby()});
let restoreSessionReplay=null;
function returnSessionToLobby(){
 if(sessionBusy||!sessionReady||lab)return {accepted:false,reason:'session-unavailable'};
 cancelPendingWeapon('session-paused');
 $('welcome').hidden=false;closeGameMenu();pointerCapture.invalidate('lobby');
 fallbackControl=false;controls.clear();shieldInput.clear('lobby');cameraDirector.clear();(touchdown||match)?.ui?.setRoster?.(false);match?.stopAudio?.();stopWeaponAudio();
 const result=entryShell.flow.returnToLobby();
 if(document.pointerLockElement===canvas)document.exitPointerLock();
 syncEntryShell();return result;
}
function bindSessionReplay(session){
 restoreSessionReplay?.();restoreSessionReplay=null;
 if(typeof session?.reset!=='function')return;
 const reset=session.reset;
 roomMatchReset=()=>reset.call(session);
 function restart(...args){
  if(roomLifecycle.snapshot().joined&&session.state.phase==='result')return {accepted:false,reason:'automatic-room-return'};
  const recapture=session.state.phase==='result'&&active&&$('welcome').hidden&&!lab&&!sessionBusy;
  const result=reset.apply(session,args);
  if(recapture)captureMouse();
  return result;
 }
 session.reset=restart;
 restoreSessionReplay=()=>{if(session.reset===restart)session.reset=reset;};
}
function waitingRoomContext(){
 const team=matchTeam||'alpha',other=team==='alpha'?'beta':'alpha';
 const opponents=combat?.bots??(combat?.enemy?[{id:'bot',avatar:combat.avatar}]:[]);
 const modeLabel=world.nativeMapId===46?'Conquest · 8 waves':$('game-mode').selectedOptions[0]?.textContent||gameMode,mapLabel=$('scene-select').selectedOptions[0]?.textContent||world.name||'Map';
 return {appearance:qaParams.get('character')||'s5runtime',sex:loadout.sex,outfit:loadout.outfit||'01',description:`${modeLabel} · ${mapLabel}`,
  nativeMapId:world.nativeMapId??null,sceneKey:$('scene-select').value,mapLabel,modeLabel,rosterKind:gameMode==='battleroyal'&&world.nativeMapId!==46?'individual':'teams',optionLabel:$(gameMode==='practice'?'practice-option':'match-option')?.selectedOptions[0]?.textContent||'',
  participants:[{id:'local',name:'You',team},...opponents.map((bot,i)=>({id:bot.id||`bot${i||''}`,name:combat?.bots?`Bot ${i+1}`:'Rival',team:other,sex:bot.avatar?.sex||loadout.sex}))]};
}
function showWaitingRoomMenu(route='room'){
 if(!waitingRoom?.visible)return;
 waitingRoom.setMenuOpen(true);$('welcome').hidden=false;entryShell.flow.returnToLobby();entryShell.flow.go(route);syncEntryShell();
}
function getWaitingRoom(){
 if(waitingRoom)return waitingRoom;
 waitingRoom=createWaitingRoomView({renderer,canvas,bindings:inputBindings,mouseLook,gamepad,
  initialDesign:(()=>{try{return localStorage.getItem('s5.waiting-room.decor')||'native';}catch{return 'native';}})(),
  onDesignChange(key){try{localStorage.setItem('s5.waiting-room.decor',key);}catch{}},
  async loadWorld(stage,designKey='native'){
   if(designKey!=='native'){
    const {loadAuthoredWaitingRoom}=await import('./waiting-room-designs.js');
    return loadAuthoredWaitingRoom(stage,designKey,{renderer});
   }
   const {loadStandbyRoomWorld}=await import('./standby-room-world.js');
   const room=await loadStandbyRoomWorld(stage,{observedSpawnPoint:[2110.56884765625,28115.3203125,190.44129943847656],observedSpawnEvidence:{file:'work/waiting-room-20261017/native/actor-position-channel.json',sha256:'1c8b6f9a45371695657b91bb6ba25b4d55068fe9073a19fd0ac7628536593129',channel:'actor+0x74'}});
   // Native joined-room observation: protected actor+74, same X/Z as source
   // alpha_standby_pos01, OBB center exactly160 source units above it.
   // This is an observed local placement, not a certified generic spawn selector.
   room.runtimeSpawnPolicy='observed-native-actor-position74-20261017';
   room.observedAlphaSpawn={...room.spawn};
   return room;
  },onMenu:showWaitingRoomMenu,
  onStart:startWaitingRoomMatch,onLeave(){waitingRoom.hide();roomLifecycle.leave();active=false;returnSessionToLobby();syncEntryShell();}});
 return waitingRoom;
}
async function returnToWaitingRoom(){
 if(!roomLifecycle.snapshot().joined)return returnSessionToLobby();
 if(sessionBusy||!sessionReady||lab)return {accepted:false,reason:'session-unavailable'};
 const session=touchdown||match;
 if(roomLifecycle.snapshot().phase==='playing'&&session?.state.phase==='result')roomLifecycle.results({winner:session.state.winner,scores:{...session.state.scores}});
 const request=entryShell.flow.beginLoading({kind:'room-return',status:'Returning to the waiting room…'});if(!request.accepted)return request;
 const returning=roomLifecycle.beginReturn();if(!returning.accepted){entryShell.flow.completeLoading(request.token);return returning;}
 sessionBusy=true;entryPlayDestination='room-return';
 cancelPendingWeapon('waiting-room');closeGameMenu();active=false;pointerCapture.invalidate('waiting-room');
 fallbackControl=false;controls.clear();shieldInput.clear('waiting-room');cameraDirector.clear();stopWeaponAudio();match?.stopAudio?.();
 roomResults?.hide();$('welcome').hidden=false;syncEntryShell();
 try{
  if(world.nativeMapId===46)disposeConquestEncounter();
  const entered=await getWaitingRoom().enter(waitingRoomContext());if(entered===false)throw Error('Waiting room unavailable');
  const completed=entryShell.flow.completeLoading(request.token,{status:'Waiting room ready'});
  if(!completed.accepted){waitingRoom?.hide();return completed;}
  roomLifecycle.returnToRoom();entryPlayDestination='waiting-room';
  $('load-status').textContent='Waiting room ready';bgmSurfaceKey=null;syncBgmSurface();
  $('welcome').hidden=true;canvas.focus({preventScroll:true});syncSessionNavigation();return {accepted:true};
 }catch(error){
  waitingRoom?.hide();
  const failed=entryShell.flow.fail('Could not return to the waiting room. Please retry.',{token:request.token,recoverable:true});
  if(failed.accepted)$('load-status').textContent='Could not return to the waiting room. Please retry.';
  return {accepted:false,reason:'waiting-room-return-failed'};
 }finally{sessionBusy=false;syncEntryShell();}
}
function syncSessionNavigation(){
 const phase=world.nativeMapId===46&&conquestResultAdapter?.finished?'result':(touchdown||match)?.state.phase,visible=active&&$('welcome').hidden&&!lab&&!escapeMenu.opened;
 sessionNavigation.sync({phase,visible:visible&&!roomLifecycle.snapshot().joined,busy:sessionBusy||inputCapture});
 if(active&&$('welcome').hidden&&!lab&&phase==='result'){
  fallbackControl=false;controls.clear();shieldInput.clear('result');cameraDirector.clear();
  pointerCapture.invalidate('result');
 }
}
function syncRoomResults(){
 const session=touchdown||match,state=session?.state,conquest=world.nativeMapId===46?conquestResultAdapter?.result:null;
 if(!roomLifecycle.snapshot().joined||!active||lab||(!conquest&&state?.phase!=='result')){roomResults?.hide();return;}
 closeGameMenu();
 if(roomLifecycle.snapshot().phase==='playing'){
  const individual=['chaser','battleroyal'].includes(gameMode),won=state?.winner===(individual?'local':matchTeam);
  roomLifecycle.results(conquest??{mode:gameMode,outcome:state.winner===null?'DRAW':won?'VICTORY':'DEFEAT',score:!individual&&state.scores?`ALPHA ${state.scores.alpha} — ${state.scores.beta} BETA`:'',players:roomResultPlayers(state,{localTeam:matchTeam,hasOpponent:!!combat})});
 }
 const kind=conquest?'conquest':'standard';if(roomResults&&roomResults.resultKind!==kind){roomResults.dispose();roomResults=null;}
 roomResults??=conquest?createConquestLocalResultsView({artwork:createRoomResultArtwork()}):createWaitingRoomResults({artwork:createRoomResultArtwork()});roomResults.resultKind=kind;const room=roomLifecycle.snapshot();
 roomResults.update(room.lastResult,room.resultsRemaining??0);
 if(!sessionBusy&&sessionReady&&roomLifecycle.resultsElapsed())returnToWaitingRoom().catch(error=>console.error('Waiting room return failed',error));
}
const entryObserver=new MutationObserver(syncEntryShell);
entryObserver.observe($('play'),{attributes:true,attributeFilter:['disabled']});
entryObserver.observe($('load-status'),{childList:true,characterData:true,subtree:true});
entryObserver.observe($('welcome'),{attributes:true,attributeFilter:['hidden']});
syncEntryShell();
window.addEventListener('pagehide',event=>{if(!event.persisted){entryObserver.disconnect();active=false;fallbackControl=false;waitingRoom?.dispose();roomResults?.dispose();stopWeaponAudio();restoreSessionReplay?.();sessionNavigation.dispose();closeGameMenu();escapeMenu.dispose();pointerCapture.dispose();entryShell.dispose();}});
// Confirm slot changes against the same runtime switch used by live play.
function canEditWeaponLoadout(reason,proposal){
 if(!sessionReady||sessionBusy||inputCapture||lab||!avatar)return false;
 if(reason!=='select'&&$('welcome').hidden)return false;
 const weapon=proposal?.slots[proposal.activeSlot];
 return !weapon||weapon===loadout.weapon||$('welcome').hidden||(!active&&waitingRoom?.visible&&waitingRoom.menuOpen&&roomLifecycle.snapshot().inRoom)||canSwitchWeapon(controller);
}
function applyWeaponLoadout(proposal,{signal}={}){
 for(let slot=0;slot<3;slot++){const weapon=proposal.slots[slot],option=[...$('weapon-select').options].find(option=>option.value===weapon);if(weapon&&(!option||option.disabled||!Object.hasOwn(WEAPON_CHOICES[weapon]?.skins??{},proposal.skins[slot])))return {accepted:false,reason:'weapon-unavailable',message:'This weapon appearance is unavailable.'};}
 const cached=proposal.slots.map((weapon,slot)=>weapon?weaponResourceCache.peek(weapon,proposal.skins[slot]):null);
 if(cached.every((bundle,slot)=>!proposal.slots[slot]||bundle))return applyPreparedWeaponLoadout(proposal,cached,{signal});
 return new Promise(resolve=>{
  let cancelled=false;
  const finish=result=>{if(weaponPreparation===request)weaponPreparation=null;signal?.removeEventListener('abort',abort);resolve(result);};
  const request={cancel(reason){cancelled=true;finish({accepted:false,reason});}},abort=()=>request.cancel('aborted');
  weaponPreparation=request;signal?.addEventListener('abort',abort,{once:true});
  if(signal?.aborted){abort();return;}
  Promise.all(proposal.slots.map((weapon,slot)=>cached[slot]??(weapon?ensureWeaponBundle(weapon,proposal.skins[slot]):null))).then(
   prepared=>{if(!cancelled)finish(applyPreparedWeaponLoadout(proposal,prepared,{signal}));},
   error=>{if(!cancelled)finish({accepted:false,reason:'weapon-load-failed',message:'Equipment could not load: '+error.message});},
  ).catch(error=>{if(!cancelled)finish({accepted:false,reason:'switch-failed',message:error.message});});
 });
}
function applyPreparedWeaponLoadout(proposal,prepared,{signal}={}){
 // Disposal or cancellation may happen while shared resource requests finish.
 // Cache their result, but never commit an obsolete request into the scene.
 if(signal?.aborted)return {accepted:false,reason:'aborted'};
 for(let slot=0;slot<3;slot++)if(prepared[slot]&&slot!==proposal.activeSlot){weaponBundles.set(proposal.slots[slot],prepared[slot]);refreshInventoryWeaponPreview(proposal.slots[slot],prepared[slot]);}
 const weapon=proposal.slots[proposal.activeSlot];
 const next=prepared[proposal.activeSlot];
 if(weapon===loadout.weapon&&next.avatar===avatar)return {accepted:true};
 return new Promise(resolve=>{
  let settled=false;
  const finish=result=>{if(settled)return;settled=true;document.removeEventListener('s5:equipment-changed',observe);signal?.removeEventListener('abort',abort);resolve(result);};
  const abort=()=>{if(pendingWeapon===weapon){pendingWeapon=null;showWeaponPicker();}finish({accepted:false,reason:'aborted'});};
  const observe=event=>{const detail=event.detail;if(detail?.requestedWeapon!==weapon||detail.status==='pending')return;if(detail.status==='equipped'&&loadout.weapon===weapon)finish({accepted:true});else if(detail.status==='rejected'){if(pendingWeapon===weapon)pendingWeapon=null;finish({accepted:false,reason:detail.reason||'switch-rejected',message:'The weapon change was refused.'});}};
  document.addEventListener('s5:equipment-changed',observe);signal?.addEventListener('abort',abort,{once:true});
  // Preparing the next match in the room must not inherit a concluded actor's
  // death/phase lock or a frozen outgoing attack. Live switches keep their gates.
  const prepareInRoom=!active&&waitingRoom?.visible&&waitingRoom.menuOpen&&roomLifecycle.snapshot().inRoom&&!$('welcome').hidden;
  try{switchWeapon(weapon,{prepareInRoom,bundle:next});}catch(error){if(pendingWeapon===weapon)pendingWeapon=null;finish({accepted:false,reason:'switch-failed',message:error.message});}
 });
}
function selectWeaponSlot(slot){return weaponLoadoutSlots?.select(slot)??Promise.resolve({accepted:false,reason:'loadout-unavailable'});}
slotInventory=document.querySelector('[data-panel="inventory"]').inventory;
slotInventory.installWeaponEffects(weaponEffectSettings);
let publishedLoadoutRevision=-1;
function syncWeaponLoadout(snapshot){
 if(!weaponLoadoutSlots)return;
 s4ActiveWeaponSlot=snapshot.activeSlot;
 // Keep pending/edit guards current without repainting the covered options.
 sessionControls(snapshot.pending,{menus:!$('welcome').hidden});slotInventory.sync();updateWeaponHud();
 showWeaponPicker({reveal:!$('weapon-picker').hidden});
 if(snapshot.revision!==publishedLoadoutRevision){publishedLoadoutRevision=snapshot.revision;history.replaceState(null,'',weaponLoadoutSlots.toUrl(location.href));}
 document.dispatchEvent(new CustomEvent('s5:weapon-loadout-changed',{detail:snapshot}));
}
weaponLoadoutSlots=createS5WeaponLoadout({initial:initialWeaponLoadout,apply:applyWeaponLoadout,canEdit:canEditWeaponLoadout,onChange:syncWeaponLoadout});
slotInventory.installWeaponLoadout({readLoadout:()=>weaponLoadoutSlots.snapshot(),onAssign:(slot,weapon,skin)=>weaponLoadoutSlots.assign(slot,weapon,skin??weaponBundles.get(weapon)?.skin??'classic'),onActivate:selectWeaponSlot,onRemove:slot=>weaponLoadoutSlots.remove(slot),busy:()=>sessionBusy||inputCapture||!sessionReady,canEdit:reason=>weaponLoadoutSlots.canEdit(reason),canRemove:slot=>weaponLoadoutSlots.canRemove(slot),canAssign:weapon=>Object.hasOwn(WEAPON_CHOICES,weapon)&&![...$('weapon-select').options].find(option=>option.value===weapon)?.disabled,weaponLabel:weapon=>WEAPON_CHOICES[weapon]?.name??weapon});
window.addEventListener('pagehide',event=>{if(!event.persisted)weaponLoadoutSlots.dispose();});
// Only declared source buttons share the existing audio context. Gameplay and
// outcome events are not inferred from the generic mouse phase cue.
let interfaceAudioDiagnosticSerial=0;
const interfaceButtonAudio=installInterfaceButtonAudio({root:document.body,audio:interfaceAudio,identify:identifyGameInterfaceButton,onResult:qaParams.has('uiAudioDebug')?result=>{
 const state=interfaceAudio.snapshot(),player=state.player;
 document.body.dataset.interfaceAudio=JSON.stringify({serial:++interfaceAudioDiagnosticSerial,status:result.status,reason:result.reason??null,path:player?.path??null,contextState:state.contextState,activeSources:player?.activeSources??0,pendingLoads:player?.pendingLoads??0,audioGain:player?.audioGain??null});
}:undefined});
window.addEventListener('blur',()=>{interfaceButtonAudio.cancel();interfaceAudio.stop('s5-window-blur');});
window.addEventListener('pagehide',event=>{
 interfaceButtonAudio.cancel();interfaceAudio.stop('s5-page-hide');
 if(!event.persisted){interfaceButtonAudio.dispose();interfaceAudio.dispose();}
});
{
 const slot=document.querySelector('.menu-settings-slot');
 const audioOptions=createAudioOptionsPort({audioSettings});
 const inputOptions=createInputOptionsPort({activeBindings:inputBindings,externalBindings:inputReservations,
  formatCodeLabel:code=>keyboardLayout.get(code)?.trim()?.toLocaleUpperCase()});
 const mouseOptions=createMouseOptionsPort({settings:mouseSettings});
 const jukeboxOptions=createJukeboxOptionsPort({settings:jukeboxSettings});
 optionsTransaction=createOptionsTransaction({ports:[audioOptions.port,inputOptions.port,mouseOptions.port,jukeboxOptions.port],onClose(event){
  inputSettings?.cancel();
  if(ingameSettings){closeIngameSettings();return;}
  // Explicit Confirm/Close returns to the screen Settings was opened from
  // ('loadout' was the legacy Prepare match panel); route departures keep theirs.
  if(!event.reason?.startsWith('s5-'))menuLayout.show(settingsReturnRoute);
 }});
 inputOptions.attach(optionsTransaction);mouseOptions.attach(optionsTransaction);jukeboxOptions.attach(optionsTransaction);
 const nativeHost=document.createElement('div');nativeHost.id='input-settings';slot.append(nativeHost);
 inputSettings=installNativeOptionsView(nativeHost,{transaction:optionsTransaction,
  audioSettings:audioOptions.createView(optionsTransaction),bindings:inputOptions.viewBindings,mouseOptions:mouseOptions.view,jukeboxOptions:jukeboxOptions.view,
  volumeControl:$('audio-volume'),graphicsContent:$('graphics-settings'),activeIds:GAME_INPUT_COMMANDS,canAct:()=>!sessionBusy,
  onCaptureChange(capturing){
   inputCapture=capturing;controls.clear();shieldInput.clear('binding-capture');cameraDirector.clear();
   $('play').disabled=capturing||sessionBusy||!sessionReady;$('skill-select').disabled=capturing||sessionBusy||!sessionReady;
  }});
 // Replaces the earlier installers; never mount both onto the authoritative volume slider.
 optionsActions=inputSettings;
 bgmStatus=document.createElement('p');bgmStatus.id='bgm-status';bgmStatus.setAttribute('role','status');bgmStatus.textContent='Music will start on supported maps.';nativeHost.append(bgmStatus);
 const hint=document.createElement('p');hint.id='input-controls-hint';nativeHost.append(hint);
 if(inputObservations){inputReadout=document.createElement('output');inputReadout.id='input-binding-observation';inputReadout.hidden=true;nativeHost.append(inputReadout);}
 const refresh=()=>{hint.textContent=gameInputHint(inputBindings);updateWeaponHud();inputSettings.sync();};
 inputBindings.subscribe(refresh);refresh();
 optionsPanelLifecycle=installOptionsPanelLifecycle({panel:document.querySelector('[data-panel="settings"]'),menuLayout,transaction:optionsTransaction,
  observeRoot:$('welcome'),beforeClose:()=>inputSettings.cancel(),returnRoute:()=>settingsReturnRoute,onBlocked(){menuLayout.show(settingsReturnRoute);toast('Settings unavailable.');}});
 document.querySelector('.menu-tabs').addEventListener('click',event=>{
  if(!event.target.closest('[data-tab]'))return;
  if(event.target.closest('[data-tab]').dataset.tab!=='settings')inputSettings.cancel();
  optionsPanelLifecycle.sync();
 });
 navigator.keyboard?.getLayoutMap?.().then(map=>{for(const [code,label]of map)keyboardLayout.set(code,label);refresh();}).catch(()=>{});
}
function sessionControls(busy=false,{menus=true}={}){
 practiceOptionControl.sync({mode:gameMode,busy:busy||sessionBusy,ready:sessionReady,capturing:inputCapture,value:qaParams.get('practiceScore')??254});
 matchOptionControl.sync({mode:gameMode,busy:busy||sessionBusy,ready:sessionReady,capturing:inputCapture,value:qaParams.get('matchOption')});
 const status=$('load-status');status.dataset.mapInstance=mapSession.current.root.uuid;status.dataset.avatarInstance=avatar?.group.uuid||'';status.dataset.mapsCached=String(mapSession.entries.size);
 $('play').disabled=busy||sessionBusy||inputCapture||!sessionReady;$('game-mode').disabled=busy||!sessionReady;
 $('scene-select').disabled=busy||!sessionReady;
 $('team-select').disabled=busy||!sessionReady||['conquest','training','chaser','battleroyal','practice'].includes(gameMode);
 $('skill-select').disabled=busy||inputCapture||!sessionReady;
 $('enemy-weapon-select').disabled=busy||!sessionReady||gameMode!=='training'||!combat;
 for(const option of $('scene-select').options)option.disabled=gameMode==='conquest'?option.value!=='conquest-46':gameMode!=='training'&&(option.value==='conquest-46'||(gameMode==='touchdown'&&!['station2','station2-modular'].includes(option.value))||(gameMode==='practice'?!['practice-52','practice-54'].includes(option.value):['practice-52','practice-54'].includes(option.value))||!aliceHouseMapAllowed(option.value,gameMode)||['chaser','battleroyal','captain','siege'].includes(gameMode)&&!competitiveMapAllowed(option.value,gameMode));
 if(menus)optionsActions?.sync();
}
function resetSessionPose(){
 katanaScreenEffects?.clear();
 world.resetAzitSessionTriggers?.();
 world.resetBioLabSessionTriggers?.('session-reset');
 shield?.interrupt('session-reset');shieldInput.clear('session-reset');
 motionGraph.reset();controls.clear();poseBuffer?.reset();weaponTrail?.clear();dashEffect?.clear();sprintEffect?.clear();wallEffect.clear();simulationClock.clear();weaponTransition=null;
 if(['battleroyal','captain','siege','practice'].includes(gameMode))for(const effect of [rocketLauncherEffects,cannonadeEffects,airgunEffects,rifleEffects,revolverEffects,semiRifleEffects,submachineGunEffects,...importedRifleEffects])effect?.clear?.();
}
async function prepareEnemies(count,withChaserPresentation=false,firstWeapon='counter'){
 if(enemyAvatars[0]?.weapon!==firstWeapon)enemyAvatars[0]=await enemyWeaponAvatar(firstWeapon);
 while(enemyAvatars.length<count){
  const enemy=await loadAvatar({appearance:qaParams.get('character')||'s5runtime',...loadout,weapon:'counter',weaponSkin:'classic'});
  await renderer.compileAsync(enemy.group,camera,scene);enemyAvatars.push(enemy);
 }
 await Promise.all(enemyAvatars.slice(0,count).map(enemy=>Promise.all([opponentAudio.prepare(enemy.weapon,enemy.sex),opponentTrails.prepare(enemy)])));
 if(withChaserPresentation&&!chaserPresentation)chaserPresentation=await loadChaserPresentation(scene);
 if(withChaserPresentation&&!chaserHudEffects)chaserHudEffects=await loadChaserHudEffects();
}
function detachMatch({preserveGameMenu=false}={}){
 katanaScreenEffects?.clear();
 disposeConquestEncounter();
 conquestContactQA?.dispose();conquestContactQA=null;
 if(!preserveGameMenu)closeGameMenu();pointerCapture.invalidate('session-detached');
 world.setAzitSessionContext?.(null);world.setSourceLaunchContext?.(null);
 world.setBioLabSessionContext?.(null);
 restoreSessionReplay?.();restoreSessionReplay=null;sessionNavigation.sync({visible:false});
 chaserPresentation?.hide();graphicsPresentation.setChaser(false);
 chaserHudEffects?.hide();
 touchdown?.dispose();match?.dispose();touchdown=null;match=null;s4TeamModeEffects=null;
 if(combat){for(const enemy of new Set([combat.avatar,...(combat.bots??[]).map(bot=>bot.avatar)].filter(Boolean)))graphicsPresentation.outline.removeCharacter(enemy.group);combat.dispose();combat=null;}
 $('enemy-mode')?.closest('label')?.remove();
}
async function preparePracticeSession(targetWorld,scoreOption=qaParams.get('practiceScore')??254){
 const frustum=qaParams.get('frustumDebug')==='1'?await createS5PracticeFrustumLoader():null;
 return createPracticeSession({scene,world:targetWorld,player:controller,mapId:targetWorld.nativeMapId,getAvatar:()=>avatar,getAudio:()=>audio,getCamera:()=>camera,motionGraph,presentationOwner:'host',prepareOnly:true,getSfxGain:()=>audioSettings.get('sfx').linearGain,
  ...(frustum?{staticFrustumDiagnostic:frustum.staticFrustumDiagnostic,effectsLoadJson:frustum.loadJson}:{}),
  diagnostic:{allowPartial:true,spawnNode:'trg_spawnpoint1',scoreOption:practiceSourceOption(scoreOption).scoreOption,randomSample:()=>Math.floor(Math.random()*32768),meleePolicy:{range:2.6,originHeight:1,halfAngle:Math.PI/3}},
  // A joined room survives Practice just as it survives the other modes.
  // Switching to training here would strand its lifecycle in "playing".
  exitOwner:'host',onReset:resetSessionPose,onExit:()=>roomLifecycle.snapshot().joined?returnToWaitingRoom():switchSession({mode:'training',map:'arena'})});
}
async function prepareS4ModeEffects(mode,team){
 if(mode==='captain')return loadCaptainNativeEffects();
 if(mode==='touchdown'||mode==='deathmatch')return loadS4TeamModeEffects({mode,team});
 return null;
}
async function attachMatch(preparedPractice=null,preparedModeEffects=undefined){
 world.setMapObjectAudioSettings?.({getGain:()=>audioSettings.get('sfx').linearGain,getAudioContext:()=>audio.context});
 const matchRules=resolveMatchOption(gameMode,qaParams.get('matchOption'))?.rules??{};
 if(gameMode==='practice'){
  match=preparedPractice??await preparePracticeSession(world);match.activate();bindSessionReplay(match);
  document.querySelector('.eyebrow').textContent=`PRACTICE ${world.nativeMapId} / DIAGNOSTIC · PARTIAL MAP`;
  return;
 }
 const modeEffects=preparedModeEffects===undefined?await prepareS4ModeEffects(gameMode,matchTeam):preparedModeEffects;
 const needsCombat=['touchdown','deathmatch','chaser','battleroyal','captain','siege'].includes(gameMode)||(qaParams.get('scene')||'arena')==='arena';
 if(world.target)world.target.visible=true;
 if(needsCombat){
  const opponentCount=['chaser','battleroyal','captain','siege'].includes(gameMode)?2:1;
  const addedEffectPools=combatEffects.reserveForParticipants(1+Math.min(opponentCount,enemyAvatars.length));
  if(addedEffectPools.length)await combatEffects.warmup(renderer,camera,addedEffectPools);
  const options={scene,world,gameMode,player:controller,getAvatar:()=>avatar,getAudio:(weapon,sex=loadout.sex)=>{if(weapon==null)return audio;const cached=weaponBundles.get(weapon)?.audio;return cached?.weapon===weapon&&cached.sex===sex?cached:opponentAudio.get(weapon,sex);},effects:combatEffects,texture:combatTexture,getPreparedTrail:enemy=>opponentTrails.get(enemy)};
  combat=gameMode==='siege'?new SiegeCombat({...options,enemies:enemyAvatars.slice(0,2)}):gameMode==='captain'?new CaptainCombat({...options,enemies:enemyAvatars.slice(0,2)}):gameMode==='battleroyal'?new BattleRoyalCombat({...options,enemies:enemyAvatars.slice(0,2)}):gameMode==='chaser'?new ChaserCombat({...options,enemies:enemyAvatars.slice(0,2)}):new TrainingCombat({...options,enemy:enemyAvatars[0]});
  for(const enemy of enemyAvatars.slice(0,['chaser','battleroyal','captain','siege'].includes(gameMode)?2:1))graphicsPresentation.outline.addCharacter(enemy.group);
 }
 if(gameMode==='touchdown'){
  touchdown=createStation2Touchdown({world,scene,controller,team:matchTeam,getAvatar:()=>avatar,onReset:resetSessionPose,rules:matchRules});touchdown.attachCombat(combat);
 }else if(gameMode==='captain')match=createCaptainMatch({combat,team:matchTeam,onReset:resetSessionPose,rules:matchRules});
 else if(gameMode==='siege')match=createSiegeMatch({combat,scene,team:matchTeam,points:world.siegePoints??null,getAudio:()=>audio,getSfxGain:()=>audioSettings.get('sfx').linearGain,onReset:()=>{if(world.nativeMapId===151&&Number.isFinite(world.previewFacing))controller.facing=world.previewFacing;resetSessionPose();},rules:matchRules});
 else if(['deathmatch','chaser','battleroyal'].includes(gameMode))match=createCombatMatch({mode:gameMode,team:matchTeam,combat,scene,onReset:()=>{resetSessionPose();if(gameMode==='chaser'&&world.spawnForRole){yaw=controller.facing-Math.PI;cameraDirector.clear();}},showMarker:gameMode==='battleroyal',nativeEffects:gameMode==='chaser'?chaserHudEffects:null,rules:matchRules});
 else if(combat){
  const label=document.createElement('label');label.textContent='Opponent';const select=document.createElement('select');select.id='enemy-mode';select.setAttribute('aria-label','Opponent behavior');
  for(const [value,text] of [['retaliate','Retaliate'],['passive','Passive'],['attack','Attack'],['guard','Counter guard']])select.add(new Option(text,value));
  select.onchange=()=>combat.setMode(select.value);label.append(select);document.querySelector('.setup').append(label);
 }
 bindSessionReplay(touchdown||match);
 if(modeEffects){
  (touchdown||match).ui.setNativeEffects(modeEffects);
  if(gameMode==='touchdown'||gameMode==='deathmatch')s4TeamModeEffects=modeEffects;
 }
 for(const bot of combat?.bots??[])bot.view.healthPlateRelation=()=>s4HealthPlateRelation(match?.state,bot.id);
 if(combat&&!combat.bots)combat.healthPlateRelation=()=>s4HealthPlateRelation((touchdown||match)?.state,'bot');
 document.querySelector('.eyebrow').textContent=`${world.name||'S5 LEAGUE'} / ${gameMode.toUpperCase()}`;
 world.setAzitSessionContext?.({mode:gameMode,localActor:controller,combat,match,getAvatar:()=>avatar,
  readSimulationEnabled:()=>hasSessionSimulation(),
  respawnTraining:actor=>{actor.reset();resetSessionPose();},
 });
 world.setBioLabSessionContext?.({mode:gameMode,localActor:controller,combat,match,getAvatar:()=>avatar,
  readSimulationEnabled:()=>hasSessionSimulation(),
 });
 bindGameShieldQueries();
}
async function switchSession({map=qaParams.get('scene')||'arena',mode=gameMode,team=matchTeam,practiceScore=qaParams.get('practiceScore')??254,matchOption=mode===gameMode?qaParams.get('matchOption'):null}={}){
 if(!sessionReady||sessionBusy)return {accepted:false,reason:'session-unavailable'};
 if(mode==='conquest')map='conquest-46';
 else if(map==='conquest-46'){if(mode==='training')mode='conquest';else map='arena';}
 if(mode==='practice'&&!['practice-52','practice-54'].includes(map))map='practice-52';
 if(mode!=='practice'&&mode!=='training'&&['practice-52','practice-54'].includes(map))map='arena';
 if(mode==='touchdown'&&!['station2','station2-modular'].includes(map))map='station2-modular';
 if(!aliceHouseMapAllowed(map,mode))map='arena';
 if(['chaser','battleroyal','captain','siege'].includes(mode)&&!competitiveMapAllowed(map,mode))map='arena';
 sessionBusy=true;sessionControls(true);
 let preparedPractice=null,preparedModeEffects=null;
 pointerCapture.invalidate('session-change');
 const previous={map:qaParams.get('scene')||'arena',mode:gameMode,team:matchTeam,matchOption:qaParams.get('matchOption')};
 try{
  const selectedMatchOption=resolveMatchOption(mode,matchOption);
  const reused=mapSession.entries.has(map);$('load-status').textContent=reused?'Reusing the cached map…':'Loading map…';
  // Load before detaching the current match so a failed map remains playable.
  const nextMap=await mapSession.get(map);if(mode==='practice'){preparedPractice=await preparePracticeSession(nextMap.world,practiceScore);await preparedPractice.warm(renderer,camera);nextMap.warmed=true;}else if(map!=='conquest-46')await prepareEnemies(['chaser','battleroyal','captain','siege'].includes(mode)?2:1,mode==='chaser',mode==='training'?trainingOpponentWeapon(qaParams.get('enemyWeapon')):'counter');
  if(['touchdown','deathmatch','captain'].includes(mode))preparedModeEffects=await prepareS4ModeEffects(mode,team);
  active=false;lab=false;$('lab').hidden=true;$('welcome').hidden=false;document.exitPointerLock();stopWeaponAudio();controls.clear();
  detachMatch();world=(await mapSession.activate(map,scene)).world;activatePresentation(map);
  applyAliceHouseSessionSpawn(world,mode);if(world.nativeMapId===151)applyIronHeartTeamSpawn(world,mode,team);controller.setWorld(world);gameMode=mode;matchTeam=team;qaParams.set('scene',map);qaParams.set('mode',mode);if(mode==='practice')qaParams.set('practiceScore',String(practiceScore));
  if(selectedMatchOption)qaParams.set('matchOption',selectedMatchOption.id);else qaParams.delete('matchOption');
  graphicsPresentation.outline.setAvatar(avatar.group);await attachMatch(preparedPractice,preparedModeEffects);preparedPractice=null;preparedModeEffects=null;resetSessionPose();animateAvatar(0);poseBuffer.reset();
  if(Number.isFinite(world.previewFacing))controller.facing=world.previewFacing;
yaw=gameMode==='chaser'&&world.spawnForRole?controller.facing-Math.PI:Number.isFinite(world.previewFacing)?world.previewFacing-Math.PI:['station2','station2-modular'].includes(map)?Math.PI:0;cameraDirector.clear();updateCamera(0);
  if(!mapSession.current.warmed){await world.warmMapObjects?.(renderer,camera,scene);await renderer.compileAsync(scene,camera);mapSession.current.warmed=true;}
  for(const bundle of weaponBundles.values())prepareWeaponRendering(bundle);
  const url=new URL(location.href);url.searchParams.set('scene',map);url.searchParams.set('mode',mode);url.searchParams.set('team',team);if(mode==='practice')url.searchParams.set('practiceScore',String(practiceScore));url.searchParams.delete('qa');
  if(selectedMatchOption)url.searchParams.set('matchOption',selectedMatchOption.id);else url.searchParams.delete('matchOption');history.replaceState(null,'',url);
  $('load-status').textContent=reused?'Ready · cached map · loadout preserved':'Ready · new map · loadout preserved';$('play').innerHTML='PLAY <span>↗</span>';
  document.title=`S5 League · ${world.name||'Movement arena'}`;
  return {accepted:true,reason:'session-prepared'};
 }catch(error){
  preparedPractice?.dispose();
  preparedModeEffects?.dispose();
  if(!combat&&!touchdown&&!match){world=(await mapSession.activate(previous.map,scene)).world;activatePresentation(previous.map);applyAliceHouseSessionSpawn(world,previous.mode);if(world.nativeMapId===151)applyIronHeartTeamSpawn(world,previous.mode,previous.team);controller.setWorld(world);gameMode=previous.mode;matchTeam=previous.team;qaParams.set('scene',previous.map);if(previous.matchOption===null)qaParams.delete('matchOption');else qaParams.set('matchOption',previous.matchOption);await attachMatch();resetSessionPose();}
  $('load-status').textContent='Switch failed: '+error.message;console.error(error);
  return {accepted:false,reason:'session-switch-failed'};
 }finally{
  $('scene-select').value=qaParams.get('scene')||'arena';$('game-mode').value=gameMode;$('team-select').value=matchTeam;sessionBusy=false;sessionControls();
 }
}
function showWeaponPicker({reveal=true}={}){
  const picker=$('weapon-picker');
  if(weaponLoadoutSlots){
    const equipped=weaponLoadoutSlots.snapshot(),labels=[0,1,2].map(slot=>inputBindings.get('weapon'+(slot+1)).bindingLabel),signature=JSON.stringify([equipped.slots,equipped.skins,labels]);
    // Active/pending state changes do not replace the three cards or restart
    // their image loads. Prepare the same nodes while the lobby is covered.
    if(picker.dataset.loadoutSignature!==signature){
     picker.replaceChildren();
     for(let slot=0;slot<3;slot++){const weapon=equipped.slots[slot],card=document.createElement('div'),key=document.createElement('span'),name=document.createElement('b');card.dataset.weapon=weapon??'';key.textContent=labels[slot];name.textContent=weapon?WEAPON_CHOICES[weapon].name:'Empty';card.append(key,name);picker.append(card);}
     s4EquipmentUi.syncSlots(picker,equipped);picker.dataset.loadoutSignature=signature;
    }
  }
  if(!reveal)return;picker.hidden=false;
  for(const card of picker.querySelectorAll('[data-weapon]')){
    card.classList.toggle('selected',card.dataset.weapon===loadout.weapon);
    card.classList.toggle('pending',card.dataset.weapon===pendingWeapon&&pendingWeapon!==loadout.weapon);
  }
  clearTimeout(showWeaponPicker.timer);
  if(!pendingWeapon)showWeaponPicker.timer=setTimeout(()=>picker.hidden=true,1200);
}
function cancelPendingWeapon(reason){weaponPreparation?.cancel(reason);if(pendingWeapon){const weapon=pendingWeapon;pendingWeapon=null;pendingWeaponBundle=null;equipmentChanged('rejected',weapon,reason);}}
function equipmentChanged(status,requestedWeapon,reason=''){
  $('weapon-select').value=loadout.weapon;
  if(status==='equipped'){const bundle=weaponBundles.get(requestedWeapon);if(bundle)refreshInventoryWeaponPreview(requestedWeapon,bundle);}
  document.dispatchEvent(new CustomEvent('s5:equipment-changed',{detail:{status,requestedWeapon,pendingWeapon,loadout:{...loadout},reason}}));
}
let pendingWeaponBundle=null;
function switchWeapon(weapon,{apply=false,prepareInRoom=false,bundle=weaponBundles.get(weapon)}={}){
  if(!avatar||!bundle||(!prepareInRoom&&(combat?.playerState.locked||touchdown?.locked||match?.locked))){if(pendingWeapon===weapon)pendingWeapon=null;equipmentChanged('rejected',weapon,'unavailable-or-locked');return false;}
  pendingWeaponBundle=bundle;pendingWeapon=weapon===loadout.weapon&&bundle.avatar===avatar?null:weapon;showWeaponPicker();
  if(!pendingWeapon){equipmentChanged('equipped',weapon);return true;}
  // Consume this tick's guard/jump/dodge inputs with the outgoing weapon first.
  // Otherwise a fast slot key erases the queued dodge before it can start.
  if(hasPlayerControl()&&!apply){equipmentChanged('pending',weapon,'next-simulation-tick');return false;}
  if(!prepareInRoom&&!canSwitchWeapon(controller)){equipmentChanged('pending',weapon,'outgoing-action');return false;}
  try{
    const next=bundle;
    if(shield&&controller.s5runtimeSkill.itemKey!==null){
      const validation=shield.validateLoadout({avatar:next.avatar,weapon});
      if(!validation.accepted){pendingWeapon=null;showWeaponPicker();equipmentChanged('rejected',weapon,validation.reason);toast('Missing skill animations: '+validation.missing.join(', '));return false;}
    }
    const playback=avatar.playbackTimes();
    const outgoing=avatar.capturePose(),source=weaponTransition?weaponTransition.captureSource(outgoing):outgoing;
    pendingWeapon=null;

    shield?.interrupt('weapon-switch');shieldInput.clear('weapon-switch');next.audio.setVolume(audioSettings.get('sfx').linearGain);
    // Inventory mouse-up may have unlocked audio before the first Play.
    // Carry that context to the newly selected cache entry immediately.
    if(audio.context&&!next.audio.context)next.audio.context=audio.context;
    audio.stop({preserveOneShots:true,localActor:controller});weaponTrail?.clear();dashEffect?.clear();combatEffects?.clearForAvatar(avatar);katanaScreenEffects?.clear();avatar.wallPose.clear();
    avatar.group.removeFromParent();avatar.helper.removeFromParent();weaponTrail?.mesh.removeFromParent();dashEffect?.group.removeFromParent();
    avatar=next.avatar;audio=next.audio;weaponTrail=next.trail;dashEffect=next.dash;poseBuffer=next.pose;
    weaponBundles.set(weapon,next);pendingWeaponBundle=null;
    graphicsPresentation.outline.setAvatar(avatar.group);
    scene.add(avatar.group,avatar.helper,dashEffect.group);if(weaponTrail)scene.add(weaponTrail.mesh);
    loadout.weapon=weapon;loadout.weaponSkin=next.skin;chosenWeapon=WEAPON_CHOICES[weapon];
    // Native per-weapon comparisons20261016 also cover right released before
    // Space. Retain the same physical primary gesture only for eligible
    // destinations, without restarting its clock or replaying consumed edges.
    const carryLight=!!(controls.lightHeld&&controller.canCarryDodgePrimaryTo(weapon));
    const carryHeavy=controller.setWeapon(weapon,{heavyHeld:controls.heavyHeld});
    controls.cancelAttacks({preserveHeavy:carryHeavy,preserveLight:carryLight});
    avatar.wallPose.clear();avatar.helper.visible=$('skeleton').checked;
    animOverride=chosenWeapon.idle;$('clip-select').value=animOverride;
    avatar.prepareSwitch();animateAvatar(0);avatar.inheritPlayback(playback);poseBuffer.reset();
    weaponTransition=new WeaponPoseTransition(source,{keys:avatar.poseKeys()});
    $('weapon-select').value=weapon;$('weapon-skin-select').replaceChildren();
    for(const [value,label] of Object.entries(chosenWeapon.skins))$('weapon-skin-select').add(new Option(label,value));
    $('weapon-skin-select').value=loadout.weaponSkin;updateWeaponHud();
    if(!weaponLoadoutSlots||!weaponLoadoutSlots.snapshot().pending){const url=new URL(location.href);url.searchParams.set('weapon',weapon);url.searchParams.set('weaponSkin',loadout.weaponSkin);history.replaceState(null,'',url);}
    $('load-status').textContent='Ready · '+chosenWeapon.name;showWeaponPicker();equipmentChanged('equipped',weapon);return true;
  }catch(error){equipmentChanged('rejected',weapon,'switch-failed');toast('Switch failed: '+error.message);console.error(error);return false;}
}
let fallbackControl=false,practiceFrameProbe=null;
const performanceDebug=qaParams.get('performanceDebug')==='1';
if(qaParams.get('graphicsDebug')==='1')installGraphicsDiagnostics({document,read:()=>({quality:renderQuality,startupReadyMs:Number(document.documentElement.dataset.startupReadyMs)||null,assetCache:loadValidatedAssetJson.report(),viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio,renderRatio:renderer.getPixelRatio()},drawingBuffer:renderer.getDrawingBufferSize(new THREE.Vector2()).toArray(),shadows:{enabled:renderer.shadowMap.enabled,size:sun.shadow.mapSize.toArray()},outline:{mode:graphicsPresentation.outline.settings.mode,size:[graphicsPresentation.outline.pass.renderTargetMaskBuffer.width,graphicsPresentation.outline.pass.renderTargetMaskBuffer.height]},memory:{...renderer.info.memory},textures:auditTextureRoots([scene,...[...weaponResourceCache.values()].map(bundle=>bundle.avatar.group)])})});
if(qaParams.get('frustumDebug')==='1'){
 practiceFrustumView=installPracticeFrustumView({document,getEffects:()=>gameMode==='practice'?match?.effects:null,isActive:()=>sessionReady&&!sessionBusy&&gameMode==='practice'&&!!match,onError:error=>toast(error.message)});
 const locations=document.createElement('button');locations.id='practice-frustum-locations';locations.type='button';locations.textContent='Read Practice target locations';locations.style.cssText='position:fixed;right:16px;top:96px;z-index:61;min-height:44px;padding:8px;background:#123646;color:#eaffff;border:1px solid #70c6d0;font:12px system-ui';
 const locationOutput=document.createElement('output');locationOutput.id='practice-frustum-location-state';locationOutput.setAttribute('aria-label','Practice target locations');locationOutput.style.cssText='position:fixed;right:16px;top:144px;z-index:61;max-width:300px;padding:6px 9px;background:#092632ee;color:#eaffff;font:11px system-ui;pointer-events:none';
 locations.onclick=event=>{event.stopPropagation();if(gameMode!=='practice'||!match)return;const actors=match.adapter.activeTargets.map(target=>{const box=target.model.bounds(),center=box.getCenter(new THREE.Vector3()),screen=center.clone().project(camera);return {id:target.id,generation:target.generation,position:target.model.group.position.toArray(),bounds:{min:box.min.toArray(),max:box.max.toArray()},screen:{x:(screen.x+1)*innerWidth/2,y:(1-screen.y)*innerHeight/2,z:screen.z}};});locationOutput.dataset.observation=JSON.stringify({camera:{position:camera.position.toArray(),quaternion:camera.quaternion.toArray()},actors});locationOutput.textContent=actors.map(a=>`${a.id}: screen ${Math.round(a.screen.x)},${Math.round(a.screen.y)}; depth ${a.screen.z.toFixed(3)}`).join(' · ');};
 locations.addEventListener('pointerdown',event=>event.stopPropagation());document.body.append(locations,locationOutput);
 window.addEventListener('pagehide',()=>{practiceFrustumView?.dispose();locations.remove();locationOutput.remove();},{once:true});
}
function capturePracticePerformance(){
 if(!performanceDebug||!(gameMode==='practice'&&match||gameMode==='conquest'&&conquestEncounter)||!hasControl()){toast('Enter Practice or Conquest before starting the CPU capture.');return;}
 if(practiceFrameProbe&&!practiceFrameProbe.report().stopped){practiceFrameProbe.stop('manual');return;}
 practiceFrameProbe?.readout.remove();
 practiceFrameProbe=installPracticeFrameProbe({host:{get match(){return gameMode==='conquest'?conquestEncounter:match;},get mode(){return gameMode;},get world(){return world;},renderer,readAcceleration:()=>gameMode==='conquest'?readNativeBooleanDistanceAcceleration():null},document,isActive:()=>hasControl()&&['practice','conquest'].includes(gameMode),externalStepHooks:gameMode==='conquest'});
}
if(performanceDebug){
 const capture=document.createElement('button');capture.id='practice-perf-capture';capture.type='button';capture.textContent='Capture CPU · F9';capture.title='After five seconds of stable play, capture twenty seconds of actual frame CPU. GPU duration is not measured.';capture.style.cssText='position:fixed;right:16px;top:12px;z-index:61;padding:7px 10px;background:#123646;color:#eaffff;border:1px solid #70c6d0;font:12px system-ui';capture.onclick=capturePracticePerformance;document.body.append(capture);
 window.addEventListener('pagehide',event=>{if(!event.persisted)practiceFrameProbe?.stop('page-hidden');});
}
let gamepadStorage=null;try{gamepadStorage=localStorage;}catch{}
let gamepadSkillCode=null;
const gamepad=new GamepadInput({controls,settings:readGamepadSettings(gamepadStorage),onAction:handleGamepadAction,onStatus:state=>{gamepadSettings.sync(state);document.documentElement.dataset.gamepad=state.status;}});
const gamepadSettings=installGamepadSettings($('graphics-settings'),gamepad,{storage:gamepadStorage});
let touchSkillCode=null;
const touchControls=installTouchControls({enabled:touchMode,onLook:(deltaYaw,deltaPitch)=>{if(hasPlayerControl()){yaw+=deltaYaw;pitch=clampCameraPitch(pitch+deltaPitch);}},onAction:(action,pressed)=>{
 if(action==='primary'||action==='secondary'){gamepad.attack(action==='primary'?0:2,pressed,performance.now()/1000,'touch');return;}
 if(action==='skill'&&!pressed){if(touchSkillCode)shieldInput.up(touchSkillCode,performance.now(),'touch');touchSkillCode=null;return;}
 if(action==='scoreboard'){(touchdown||match)?.ui?.setRoster?.(pressed&&hasPlayerControl());return;}
 if(!pressed)return;
 if(action==='pause'){openGameMenu();return;}
 if(!hasPlayerControl())return;
 if(action==='skill'&&shield){touchSkillCode=inputBindings.get('skill').code;shieldInput.down(touchSkillCode,performance.now(),false,'touch');}
 if(/^weapon[123]$/.test(action))selectWeaponSlot(Number(action.at(-1))-1);
}});
function handleGamepadAction(action,value){
 if(action==='skill'&&!value){if(gamepadSkillCode)shieldInput.up(gamepadSkillCode,performance.now(),'gamepad');gamepadSkillCode=null;return;}
 if(action==='scoreboard'){(touchdown||match)?.ui?.setRoster?.(!!value&&hasPlayerControl());return;}
 if(action==='disconnected'){if(active&&!escapeMenu.opened&&$('welcome').hidden)openGameMenu();toast('Controller disconnected');return;}
 if(action==='pause'){if(waitingRoom?.visible&&!waitingRoom.menuOpen)waitingRoom.gamepadMenu();else openGameMenu();return;}
 if(action==='roomStart'){gamepad.requestControl();waitingRoom?.gamepadStart();return;}
 const menuRoot=escapeMenu.opened?escapeMenu.root:$('welcome');
 if(action==='navigate'){navigateGamepadMenu(menuRoot,value);return;}
 if(action==='confirm'){gamepad.requestControl();activateGamepadMenu(menuRoot,{preferred:$('play')});return;}
 if(action==='back'){
  if(escapeMenu.opened){if(!escapeMenu.back())resumeGameSession({gamepad:true});}
  else if(waitingRoom?.visible&&waitingRoom.menuOpen&&!$('play').disabled){gamepad.requestControl();$('play').click();}
  else document.querySelector('[data-interface-lobby-button="back"]')?.click();
  return;
 }
 if(!hasPlayerControl())return;
 if(action==='skill'&&shield){gamepadSkillCode=inputBindings.get('skill').code;shieldInput.down(gamepadSkillCode,performance.now(),false,'gamepad');}
 if(action==='weapon')selectWeaponSlot(value);
 if(action==='cycleWeapon'){
  const state=weaponLoadoutSlots?.snapshot();if(!state||state.pending)return;
  for(let n=1;n<=3;n++){const slot=(state.activeSlot+value*n+3)%3;if(state.slots[slot]){selectWeaponSlot(slot);break;}}
 }
}
window.addEventListener('pagehide',event=>{if(!event.persisted){touchControls.dispose();gamepad.dispose();gamepadSettings.dispose();}});
const hasControl=()=>!document.hidden&&!inputCapture&&!sessionBusy&&active&&!lab&&!escapeMenu.opened&&$('welcome').hidden&&(world.nativeMapId!==46||!conquestResultAdapter?.finished)&&(touchMode||document.pointerLockElement===canvas||fallbackControl||gamepad.active);
const hasSessionSimulation=()=>!inputCapture&&!sessionBusy&&sessionReady&&active&&!lab&&$('welcome').hidden&&(world.nativeMapId!==46||!conquestResultAdapter?.finished)&&(hasControl()||escapeMenu.opened);
const hasPlayerControl=()=>hasControl()&&!cameraDirector.free&&!touchdown?.locked&&!match?.locked;
const controlOwner=()=>combat||touchdown||match||world;
const pointerCapture=createGameSessionControl({document,canvas,getOwner:controlOwner,
 isCurrent:owner=>owner===controlOwner()&&sessionReady&&!sessionBusy&&active&&!lab&&!inputCapture&&!escapeMenu.opened&&$('welcome').hidden&&(world.nativeMapId!==46||!conquestResultAdapter?.finished)&&(touchdown||match)?.state.phase!=='result',
 onCaptured:(_owner,options)=>{fallbackControl=false;document.documentElement.dataset.pointerInput=options?.unadjustedMovement?'raw-requested':'standard';},
 onFallback:()=>{fallbackControl=true;toast(cameraDirector.free?'Free camera: WASD + Space/Ctrl':'Camera: hold the middle mouse button to rotate');},
});
const touchdownRespawnDiagnostic=qaParams.get('respawnDebug')==='1'?installS5TouchdownRespawnDiagnostic({document,
 read:()=>({ready:sessionReady&&!sessionBusy,active:hasControl(),mode:gameMode,sex:loadout.sex,dead:touchdown?.health.dead??false,hp:touchdown?.health.hp??null,resetSerial:controller.resetSerial,position:{...controller.position},phase:touchdown?.state.phase??null,playerControl:hasPlayerControl(),scores:touchdown?{...touchdown.state.scores}:null,ball:touchdown?.state.ball??null,owner:touchdown?.state.owner?{...touchdown.state.owner}:null}),
 placeInEnemyLaser:()=>{
  const side=touchdown.team==='alpha'?'beta':'alpha',module=world.modules.get(side+'-lasers'),box=laserBoxes(module)[0];
  if(!box)throw Error('Enemy laser volume unavailable');
  const point=module.group.localToWorld(box.getCenter(new THREE.Vector3())),before={...controller.position};
  controller.position={x:point.x,y:point.y-.9,z:point.z};controller.velocity={x:0,y:0,z:0};controller.grounded=false;controls.clear();combat.setMode('passive');combat.enemyInput=()=>({});
  return {kind:'arranged-real-laser-placement',opponentInputNeutral:true,side,serialBefore:controller.resetSerial,before,placed:{...controller.position}};
 },focus:()=>canvas.focus(),
}):null;
window.addEventListener('pagehide',event=>{if(!event.persisted)touchdownRespawnDiagnostic?.dispose();});
function captureMouse(){
  if(touchMode)return Promise.resolve({accepted:true,mode:'touch'});
  if(gamepad.requested||gamepad.active)return Promise.resolve({accepted:true,mode:'gamepad'});
  return pointerCapture.capture();
}
function updateWallEffect(dt){
  const trigger=controller.events.includes('walljump');
  if(trigger||(controller.wallAction?.phase==='prepare'&&wallEffect.group.visible)){
    const contact=avatar?.wallPose.effectContact(controller.wallContact)??controller.wallContact;
    if(trigger)wallEffect.trigger(contact);else wallEffect.setContact(contact);
  }
  wallEffect.update(dt);impactEffect?.update(dt);
}
const desiredFacing=()=>yaw+Math.PI;
function toast(message){$('toast').textContent=message;$('toast').style.opacity=1;s4IngameNotices.place();clearTimeout(toast.timer);toast.timer=setTimeout(()=>{$('toast').style.opacity=0;s4IngameNotices.suspend();},1400);}
function setLab(value){
  lab=value;closeGameMenu();pointerCapture.invalidate('animation-lab');
  controller.fireball=null;controls.cancelAttacks();
  if(value&&controller.attack){
    // Preview is a new presentation state, not a suspended gameplay attack.
    // Keep position, health, SP and equipment; cancel only the outgoing action.
    if(combat)combat.cancel(controller);
    else{
      controller.leaveAttackProtection?.();controller.clearPlasmaLightHandoff?.();
      controller.attack=null;controller.dash=0;controller.dashMotion=null;controller.counterGuardDash=null;controller.wallAction=null;controller.plasmaDashExit=null;controller.sprinting=false;
      combatEffects?.clearForAvatar(avatar);
    }
    controller.combo=0;controller.meleeCombo=0;
    katanaScreenEffects?.clear();motionGraph.reset();avatar?.prepareSwitch();
  }
  weaponTransition=null;poseBuffer?.render(1);lab=value;simulationClock.clear();weaponTrail?.clear();wallEffect.clear();dashEffect?.clear();sprintEffect?.clear();impactEffect?.clear();stopWeaponAudio();
  avatar?.wallPose.clear();
  if(!value&&avatar){animateAvatar(0);poseBuffer.reset();}
  $('lab').hidden=!value;
  if(value){document.exitPointerLock();$('welcome').hidden=true;}else if(active)captureMouse();else $('welcome').hidden=false;
}
$('play').disabled=true;
$('refresh-build').onclick=()=>location.reload();
if(qaParams.get('character')==='anime'){$('character-preview').href='/';$('character-preview').textContent='Return to the classic character';}
$('play').onclick=async()=>{
  if(!avatar||$('play').disabled||inputCapture||sessionBusy||!sessionReady||lab)return;
  // Explicit modes QA may retain the real joined-room route so its fixtures
  // can verify the rendered fifteen-second result/automatic-return cycle.
  const bypassWaitingRoom=qaScenario&&!(qaScenario==='modes'&&qaParams.get('qaEntry')==='room');
  if(!bypassWaitingRoom&&!roomStartRequest&&waitingRoom?.visible){
    const previousDestination=entryPlayDestination;entryPlayDestination='waiting-room';
    const request=entryShell.flow.startPlay();if(!request.accepted){entryPlayDestination=previousDestination;return request;}
    const room=waitingRoom,requestedSession={world,match,touchdown,combat};
    const currentRequest=()=>waitingRoom===room&&!sessionBusy&&sessionReady&&!lab&&!inputCapture&&world===requestedSession.world&&match===requestedSession.match&&touchdown===requestedSession.touchdown&&combat===requestedSession.combat&&entryShell.flow.snapshot().operation?.token===request.token;
    $('play').disabled=true;room.setMenuOpen(true);$('load-status').textContent='Returning to the waiting room…';
    try{
      const entered=await room.enter({...waitingRoomContext(),resetPosition:false});
      if(!currentRequest()){entryShell.flow.cancelPlay(request.token);return {accepted:false,reason:'room-refresh-superseded'};}
      if(entered===false)throw Error('Waiting room refresh did not complete. Please retry.');
      entryShell.flow.cancelPlay(request.token,'Waiting room ready');
      room.setMenuOpen(false);$('welcome').hidden=true;canvas.focus({preventScroll:true});$('load-status').textContent='Waiting room ready';return {accepted:true};
    }catch(error){
      if(!currentRequest()){entryShell.flow.cancelPlay(request.token);return {accepted:false,reason:'room-refresh-superseded'};}
      room.setMenuOpen(true);$('welcome').hidden=false;$('load-status').textContent='Could not return to the waiting room. Please retry.';
      entryShell.flow.fail(error,{token:request.token,recoverable:true});return {accepted:false,reason:'room-refresh-failed'};
    }finally{$('play').disabled=sessionBusy||inputCapture||!sessionReady||entryShell.flow.snapshot().operation?.kind==='play';syncEntryShell();}
  }
  // S5 local Play is separate from native Ready/Start; hide Settings before async sound unlock.
  const wasEntryHidden=$('welcome').hidden,previousDestination=entryPlayDestination;
  entryPlayDestination=roomStartRequest||active||bypassWaitingRoom?'match':'waiting-room';
  if(roomStartRequest)$('welcome').hidden=false;
  const entryRequest=entryShell.flow.startPlay();if(!entryRequest.accepted){$('welcome').hidden=wasEntryHidden;entryPlayDestination=previousDestination;return;}
  if(roomStartRequest&&waitingRoom?.visible)waitingRoom.setMenuOpen(true);
  const requestedSession={world,match,touchdown,combat,active};
  const currentRequest=()=>!sessionBusy&&sessionReady&&!lab&&!inputCapture&&world===requestedSession.world&&match===requestedSession.match&&touchdown===requestedSession.touchdown&&combat===requestedSession.combat&&entryShell.flow.snapshot().operation?.token===entryRequest.token;
$('play').disabled=true;$('load-status').textContent='Preparing weapon audio…';
  try{
    audio.context??=new AudioContext();
    await Promise.all([...Array.from(new Set([...weaponBundles.values(),...weaponResourceCache.values()]),bundle=>{bundle.audio.context=audio.context;return bundle.audio.unlock();}),opponentAudio.unlock(audio.context)]);
    await match?.enableAudio?.();
    await bgmSession.unlock();
    if(!currentRequest()){entryShell.flow.cancelPlay(entryRequest.token,'Session changed. Press Play when ready.');return;}
    if(!bypassWaitingRoom&&!roomStartRequest&&!active){
      await getWaitingRoom().enter(waitingRoomContext());
      if(!currentRequest()){waitingRoom.hide();entryShell.flow.cancelPlay(entryRequest.token);return;}
      roomLifecycle.enter();active=false;$('welcome').hidden=true;$('load-status').textContent='Waiting room ready';bgmSurfaceKey=null;syncBgmSurface();entryShell.flow.cancelPlay(entryRequest.token,'Waiting room ready');syncEntryShell();return;
    }
    if(roomStartRequest){roomMatchReset?.();waitingRoom.hide();}
    await ensureConquestEncounter();
    if(!currentRequest()){disposeConquestEncounter();entryShell.flow.cancelPlay(entryRequest.token,'Session changed. Press Play when ready.');return;}
    active=true;controller.facing=desiredFacing();$('welcome').hidden=true;captureMouse();
    entryShell.flow.enterPlaying(entryRequest.token);
    bgmSurfaceKey=null;syncBgmSurface();
    $('load-status').textContent=gameMode==='practice'?'Practice diagnostic · partial map · reference scoring and conclusion unverified':'Weapons ready';
  }catch(error){if(!currentRequest()){entryShell.flow.cancelPlay(entryRequest.token,'Session changed. Press Play when ready.');return;}active=requestedSession.active;$('welcome').hidden=false;$('load-status').textContent='Entry failed: '+error.message;entryShell.flow.fail(error,{token:entryRequest.token,recoverable:true});}
  finally{$('play').disabled=sessionBusy||inputCapture||!sessionReady||entryShell.flow.snapshot().operation?.kind==='play';}
};
$('lab-close').onclick=()=>setLab(false);
$('clip-select').onchange=e=>{animOverride=e.target.value;avatar.play(animOverride,{restart:true});};
$('anim-speed').oninput=e=>animationSpeed=Number(e.target.value);
$('skeleton').onchange=e=>avatar.helper.visible=e.target.checked;
$('view-angle').oninput=e=>yaw=Number(e.target.value)*Math.PI/180;
document.addEventListener('pointerlockchange',()=>{controls.clear();cameraDirector.clear();if(!document.pointerLockElement){stopWeaponAudio();}if(!touchMode&&!document.pointerLockElement&&!lab&&active&&$('welcome').hidden&&!escapeMenu.opened&&(touchdown||match)?.state.phase!=='result')openGameMenu({fromPointerUnlock:true});});
const mouseLookDelta=createMouseLookDelta();
document.addEventListener('mousemove',e=>{
 const relative=document.pointerLockElement===canvas,counts=mouseLookDelta.map(e,{active:hasControl()&&(relative||!!(e.buttons&4)),relative});
 if(!counts)return;const delta=mouseLook.map({...counts,scale:cameraDirector.cinematic?.38:1});
 if(delta.accepted){yaw+=delta.deltaYaw;pitch=clampCameraPitch(pitch+delta.deltaPitch);}
});
window.addEventListener('blur',()=>mouseLookDelta.clear());
window.addEventListener('keydown',e=>{
  if(e.defaultPrevented||inputCapture)return;
  // A joined-room menu returns through the same guarded, state-preserving
  // action as its Return to room button. It never starts the prepared match.
  if(e.code==='Escape'&&!active&&!lab&&!$('welcome').hidden&&waitingRoom?.visible&&waitingRoom.menuOpen&&roomLifecycle.snapshot().inRoom){
    e.preventDefault();if(!e.repeat&&sessionReady&&!sessionBusy&&!$('play').disabled)$('play').click();return;
  }
  if(ingameSettings){if(e.code==='Escape'&&!e.defaultPrevented&&!inputCapture){e.preventDefault();if(!e.repeat)closeIngameSettings();}return;}
  if(escapeMenu.opened){if(e.code==='Escape'){e.preventDefault();if(!e.repeat&&!escapeUnlockPending&&!escapeMenu.back())resumeGameSession();}return;}
  if(e.target.closest?.('input,select,textarea,[contenteditable="true"]'))return;
  if(e.code==='F9'&&performanceDebug){e.preventDefault();if(!e.repeat)capturePracticePerformance();return;}
  if(e.code==='F3'){e.preventDefault();if(!e.repeat){const styles=Object.keys(SPRINT_STYLES);setSprintStyle(styles[(styles.indexOf(motionGraph.sprintStyle)+1)%styles.length]);toast('SPRINT : '+SPRINT_STYLES[motionGraph.sprintStyle]);}return;}
  if(e.code==='F4'){e.preventDefault();if(!e.repeat){presentationSettings.setInfiniteSp(!controller.infiniteEnergy);toast(controller.infiniteEnergy?'INFINITE ENERGY: ON':'INFINITE ENERGY: OFF');}return;}
  if(e.code==='F2'){e.preventDefault();if(!e.repeat&&avatar&&(lab||sessionReady&&!sessionBusy&&!entryShell.flow.snapshot().busy))setLab(!lab);return;}
  if(e.code==='Escape'&&lab){setLab(false);return;}
  if(e.code==='Escape'&&active&&!lab&&$('welcome').hidden){e.preventDefault();if(!e.repeat){if((touchdown||match)?.state.phase==='result'){if(!roomLifecycle.snapshot().joined)returnSessionToLobby();}else openGameMenu();}return;}
  // Focused controls own Enter activation; the replay shortcut belongs to the game.
  if(e.code==='Enter'&&e.target.closest?.('button,a[href],[role="button"],summary'))return;
  if(e.code==='Enter'&&active&&!lab&&!sessionBusy&&$('welcome').hidden&&(touchdown||match)?.state.phase==='result'){if(!roomLifecycle.snapshot().joined)(touchdown||match).reset();e.preventDefault();return;}
  if(!hasControl())return;
  if(e.code==='Tab'&&(touchdown||match)){e.preventDefault();(touchdown||match).ui.setRoster(true);return;}
  if(touchdown?.locked||match?.locked){const current=touchdown||match;if(e.code==='Enter'&&current.state.phase==='result'){current.reset();e.preventDefault();}return;}
  if(cameraDirector.free){cameraDirector.keyDown(e.code);if(['Space','ControlLeft','ControlRight','KeyQ','KeyE','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();return;}
  if(shield&&shieldInput.down(e.code,performance.now(),e.repeat)){e.preventDefault();return;}
  const weaponSlotCommand=inputBindings.commandsFor(e.code).find(id=>/^weapon[123]$/.test(id));
  if(weaponSlotCommand){e.preventDefault();controls.keyDown(e.code,performance.now()/1000,e.repeat);return;}
  if(qaScenario&&WEAPON_SLOTS[e.code]&&!/^Digit[123]$/.test(e.code)){e.preventDefault();if(!e.repeat&&!weaponLoadoutSlots?.snapshot().pending)switchWeapon(WEAPON_SLOTS[e.code]);return;}
  const inputCommand=controls.commandFor(e.code);
  const rangedWeapon=!!(controller.airgun||controller.cannonade||controller.rocketLauncher||controller.rifle);
  if(inputCommand==='reload'&&rangedWeapon){e.preventDefault();controls.keyDown(e.code,performance.now()/1000,e.repeat);return;}
  if(inputCommand&&inputCommand!=='reload'){e.preventDefault();controls.keyDown(e.code,performance.now()/1000,e.repeat);return;}
  if(e.code==='KeyR'&&!rangedWeapon&&touchdown){e.preventDefault();if(!e.repeat)touchdown.manualRespawn();return;}
  if(e.code==='KeyR'&&!rangedWeapon&&match){e.preventDefault();if(!e.repeat)match.manualRespawn();return;}
  controls.keyDown(e.code,performance.now()/1000,e.repeat);if(['Space','AltLeft','AltRight','Tab','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();
  if(!e.repeat&&e.code==='KeyR'&&!rangedWeapon){
    shield?.interrupt('manual-reset');shieldInput.clear('manual-reset');
    weaponTransition=null;pendingWeapon=null;controller.reset();motionGraph.reset();combat?.reset();controls.clear();weaponTrail?.clear();wallEffect.clear();dashEffect?.clear();sprintEffect?.clear();simulationClock.clear();
    stopWeaponAudio();impactEffect?.clear();
    avatar?.wallPose.clear();
    touchdown?.manualRespawn();
    animateAvatar(0);poseBuffer?.reset();
  }
});
window.addEventListener('keyup',e=>{if(e.code==='Escape')escapeUnlockPending=false;if(escapeMenu.opened)return;shieldInput.up(e.code,performance.now());if(e.code==='Tab')(touchdown||match)?.ui?.setRoster?.(false);cameraDirector.free?cameraDirector.keyUp(e.code):controls.keyUp(e.code);});window.addEventListener('blur',()=>{shieldInput.clear('blur');inputSettings.cancel();controls.clear();cameraDirector.clear();(touchdown||match)?.ui?.setRoster?.(false);match?.stopAudio?.();stopWeaponAudio();fallbackControl=false;if(active&&!lab&&$('welcome').hidden)openGameMenu();pointerCapture.invalidate('window-blur');});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault();if(e.defaultPrevented&&e.button!==1||inputCapture)return;if(hasPlayerControl()){if(shield&&shieldInput.down(`MouseButton${e.button}`,performance.now()))return;controls.keyDown(`MouseButton${e.button}`,performance.now()/1000);gamepad.attack(e.button,true);}});
window.addEventListener('mouseup',e=>{gamepad.attack(e.button,false);if(escapeMenu.opened)return;shieldInput.up(`MouseButton${e.button}`,performance.now());if(!cameraDirector.free)controls.keyUp(`MouseButton${e.button}`);});
canvas.addEventListener('wheel',e=>{if(!e.defaultPrevented&&hasPlayerControl()&&e.deltaY!==0&&controls.pulse(e.deltaY<0?'WheelUp':'WheelDown'))e.preventDefault();},{passive:false});
const labels={idle:'READY',run:'RUN',sprint:'SPRINT',jump:'JUMP',fall:'AIRBORNE',dash:'DASH',airdash:'AIR DASH',wallprepare:'WALL CONTACT',walljump:'WALL JUMP',wallfail:'LOW ENERGY',light:'STRIKE',air:'AERIAL STRIKE',rush:'ATTACK',guard:'GUARD'};
function animateAvatar(dt){
  if(!avatar)return;
  avatar.group.userData.weaponFlameEnabled=!lab&&!touchdown?.health.dead&&!conquestEncounter?.health.dead&&!combat?.playerState.dead;
  if(lab||touchdown?.health.dead||conquestEncounter?.health.dead)combatEffects?.clearArtAvatar?.(avatar);
  syncHeavyMachineGunAudio({audio,opponentAudio,controller,combat,disabledLocal:!!(lab||touchdown?.health.dead||combat?.playerState.locked)});
  if(lab){rocketLauncherEffects?.clear();cannonadeEffects?.clear();airgunEffects?.clear();rifleEffects?.clear();revolverEffects?.clear();semiRifleEffects?.clear();submachineGunEffects?.clear();for(const effects of importedRifleEffects)effects.clear();avatar.play(animOverride,{speed:animationSpeed});avatar.update(dt);return;}
  if(touchdown?.health.dead){const p=controller.position;avatar.group.position.set(p.x,p.y,p.z);setAvatarFacing(avatar.group,controller.facing);const animation=touchdown.health.animation();avatar.play(animation.clip,{loop:false,speed:animation.speed});avatar.update(dt);cannonadeEffects?.advanceAcceptedPushes(dt,controller);weaponTrail?.clear();dashEffect?.clear();sprintEffect?.clear();return;}
  if(conquestEncounter?.health.dead){const p=controller.position;avatar.group.position.set(p.x,p.y,p.z);setAvatarFacing(avatar.group,controller.facing);avatar.play('00030',{loop:false,speed:1.3});avatar.update(dt);weaponTrail?.clear();dashEffect?.clear();sprintEffect?.clear();return;}
  if(combat?.playerState.locked){combat.pose(avatar,controller,combat.playerState,combat.pause>0?0:dt,motionGraph);combat.resolveRifleShots(avatar);rocketLauncherEffects?.update(dt,controller,avatar,{disabled:true});cannonadeEffects?.update(dt,controller,avatar,{disabled:true});airgunEffects?.update(dt,controller,avatar,true);for(const effects of [rifleEffects,revolverEffects,semiRifleEffects,submachineGunEffects,...importedRifleEffects])updateRifleEffectActors(effects,dt,controller,avatar,combat,true);weaponTrail?.clear();dashEffect?.clear();sprintEffect?.clear();return;}
  const p=controller.position;avatar.group.position.set(p.x,p.y,p.z);setAvatarFacing(avatar.group,presentationFacing(controller,controller.facing,false));
  avatar.motion(motionGraph.sample(controller,dt));avatar.update(dt);
  if(shieldPresentation){avatar.group.updateWorldMatrix(true,true);const quaternion=avatar.group.getWorldQuaternion(new THREE.Quaternion()),forward=new THREE.Vector3(0,0,-1).applyQuaternion(quaternion);shieldPresentation.update({actorPositionNative:[controller.position.x,controller.position.y,controller.position.z].map(v=>v/.006),actorForwardNative:forward.toArray(),actorQuaternion:quaternion.toArray(),dtSeconds:dt,mirrorZ:false,ownerSlot1c4:controller.s5runtimeShieldActorProfile?.protected1aa??false});}
  avatar.wallPose.update(dt,controller);
  combat?.resolveRifleShots(avatar);
  match?.resolveRifleShots?.(avatar);
  if(!conquestResultAdapter?.finished)conquestEncounter?.resolveRifleShots(avatar);
  updateCannonade(dt);updateRocketLauncher(dt);
  airgunEffects?.update(dt,controller,avatar);
  for(const effects of [rifleEffects,revolverEffects,semiRifleEffects,submachineGunEffects,...importedRifleEffects])updateRifleEffectActors(effects,dt,controller,avatar,combat);
  if(combatEffects){if(!combat)combatEffects.update(dt);playAttackEffects(combatEffects,controller.attack,controller.position,avatar,controller.facing,{collision:controller.collision});}
  weaponTrail?.update(dt,controller.attack,{cancel:controller.dash>0||!!selectedWeaponEffect(avatar,controller.attack,{replacementOnly:true})});
  combatEffects?.sampleAvatar(avatar,{emitPending:true});
  dashEffect?.update(dt,controller);sprintEffect?.update(dt,controller,avatar);
}
let hitFlash=0,nextHudUpdate=0;
function updateRocketLauncher(dt){
 const enemies=combat?.playerTargets?.()||(combat&&!combat.enemyState.dead?[combat.enemy]:[]),targets=match?.projectileTargets?.()??(combat?[controller,...enemies]:[]);
 rocketLauncherEffects?.update(dt,controller,avatar,{targets,audio,onHit:(contact,item)=>{
  if(match?.receiveProjectileContact)return match.receiveProjectileContact(contact,item,{weapon:'rocketlauncher'});
  if(!combat)return false;
  const self=contact.target===controller,record=self?null:combat.actorRecord?.(contact.target),health=self?combat.playerState:record?.health??combat.enemyState,targetAvatar=self?avatar:record?.avatar??combat.avatar;
  const accepted=combat.receive(contact.target,health,targetAvatar,controller,{weapon:'rocketlauncher',kind:item.mode,damage:contact.damage});combat.pause=0;return !!accepted;
 }});
}
function updateCannonade(dt){
 const targets=match?.projectileTargets?.()??(combat?.playerTargets?.()||(combat&&!combat.enemyState.dead?[combat.enemy]:[]));
 cannonadeEffects?.update(dt,controller,avatar,{targets,audio,onHit:(contact,item)=>{
  if(match?.receiveProjectileContact)return match.receiveProjectileContact(contact,item,{weapon:'cannonade'});
  if(!combat)return false;
  const record=combat.actorRecord?.(contact.target),health=record?.health??combat.enemyState,targetAvatar=record?.avatar??combat.avatar;
  const accepted=combat.receive(contact.target,health,targetAvatar,controller,{weapon:'cannonade',kind:item.max?'shotMax':'shot',damage:contact.damage});
  combat.pause=0;return !!accepted;
 }});
}
function hudText(id,value){const el=$(id),text=String(value);if(el.textContent!==text)el.textContent=text;}
function s4HealthPlateRelation(state,id){
 if(state?.mode==='chaser'&&state.chaser)return state.chaser==='local'||state.chaser===id?'enemy':'ally';
 if(state?.mode==='captain'||state?.mode==='siege'||state?.mode==='deathmatch'){const local=state.players.get('local'),other=state.players.get(id);return local?.team&&other?.team&&local.team===other.team?'ally':'enemy';}
 return 'enemy';
}
function hudFill(id,ratio){const el=$(id),value=String(Math.max(0,Math.min(1,Number.isFinite(ratio)?ratio:0)));if(el.style.getPropertyValue('--s4-fill')!==value)el.style.setProperty('--s4-fill',value);}
function updateCamera(dt){
  if(touchdown?.state.phase==='goal'&&!touchdown.celebrating&&!cameraDirector.free){
    const target=world.fumbi.position,t=touchdown.state.rules.goalPause-touchdown.state.pause,side=Math.sign(target.z)||1;
    // Stay on the field-facing side of the net rather than orbiting through
    // the custom base wall. The ball remains above the lower goal banner.
    const desired=new THREE.Vector3(target.x+Math.sin(t*.35)*2,target.y+1.4,target.z-side*6);
    camera.position.lerp(desired,1-Math.exp(-4*Math.max(dt,.016)));camera.lookAt(target);camera.fov=50;camera.updateProjectionMatrix();return;
  }
  if(qaScenario==='rifle-contact'&&qaParams.get('qaView')==='trajectory'){
    camera.position.set(8,3,2.5);camera.fov=50;camera.updateProjectionMatrix();camera.lookAt(0,1.2,2.5);return;
  }
  if(['cannonade-contact','rocket-contact'].includes(qaScenario)&&qaParams.get('qaView')==='trajectory'){
    camera.position.set(12,4,2.8);camera.fov=60;camera.updateProjectionMatrix();camera.lookAt(0,1.2,2.8);return;
  }
  // Explicit QA view only: repeatable close profile without changing the
  // user's persisted camera/cinema settings.
  if(qaScenario==='melee-contact'&&qaParams.get('qaView')==='rush-origin'){
    // Keep the scenario's start (0,0,0) and the moving actor in the same
    // frame. A camera following only the actor hides detached rush effects.
    const p=controller.position,mid=new THREE.Vector3(p.x*.5,p.y*.5+1.6,p.z*.5);
    const distance=Math.max(8,Math.hypot(p.x,p.z)*1.2);
    camera.position.set(mid.x+distance,mid.y+.8,mid.z+.3);
    camera.fov=45;camera.updateProjectionMatrix();camera.lookAt(mid);return;
  }
  if(qaScenario&&qaParams.get('qaView')==='front'){
    const p=controller.position;camera.position.set(p.x+.25,p.y+1.35,p.z-4.3);
    camera.fov=35;camera.updateProjectionMatrix();camera.lookAt(p.x,p.y+1.12,p.z);return;
  }
  if(qaScenario==='body-contact'&&combat){
    const p=combat.enemy.position;camera.position.set(p.x+6,p.y+3.4,p.z+5);camera.fov=45;camera.updateProjectionMatrix();camera.lookAt(p.x,p.y+1.8,p.z);return;
  }
  if(qaScenario&&['profile','profile-wide'].includes(qaParams.get('qaView'))){
    const wide=qaParams.get('qaView')==='profile-wide';
    const p=qaScenario==='opponent-melee-trail'&&combat?combat.enemy.position:controller.position;camera.position.set(p.x+(wide?8:4),p.y+(wide?2.4:1.4),p.z+.3);
    camera.fov=wide?45:35;camera.updateProjectionMatrix();camera.lookAt(p.x,p.y+(wide?1.6:.9),p.z);return;
  }
  if(!qaScenario||qaScenario==='rifle-zoom'||qaScenario.startsWith('cannonade-zoom')){
    if(qaScenario?.startsWith('cannonade-zoom')){/* Camera advanced and frozen by the same deterministic QA steps below. */}
    else if((hasPlayerControl()||qaScenario==='rifle-zoom')&&controller.rifle?.zoom){Object.assign(cannonadeCamera,createCannonadeCameraState());camera.fov=25;camera.updateProjectionMatrix();}
    else if(!updateCannonadeFov(camera,cannonadeCamera,dt,!!controller.cannonade?.zoom&&hasPlayerControl()))updateSprintFov(camera,dt,hasPlayerControl()&&controller.sprinting);
  }
  const spectated=chaserSpectatorTarget(match?.state,match?.health?.dead,combat);
  const p=spectated||avatar?.group.position||controller.position;
  const distance=qaScenario&&qaParams.has('close')?2.8:lab?3.7:chaserCameraDistance(match?.state,match?.health?.dead,$('welcome').hidden)||CAMERA_FRAMING.distance;
  cameraDirector.update(camera,{player:p,yaw,pitch,distance,obstacles:world.meshes,collisionWorld:controller.collision.world,dt});
  if(!cameraDirector.cinematic&&!cameraDirector.free&&combat?.shake>0){
    const a=combat.shake*.12;camera.position.x+=Math.sin(performance.now()*.11)*a;camera.position.y+=Math.cos(performance.now()*.09)*a;
    cameraDirector.constrain(camera,{player:p,obstacles:world.meshes});
  }
}
let fpsStart=null,fpsFrames=0,initialPresentationReady=false;
document.addEventListener('visibilitychange',()=>{fpsStart=null;fpsFrames=0;hudText('fps-value','—');});
function frame(now){
  if(presentationLifetime.ended)return;
  // Preparation performs its own shader warmups. Keep the hidden main scene
  // idle until that work and the optional QA installation actually finish.
  if(!initialPresentationReady){last=now;requestAnimationFrame(frame);return;}
  touchControls.sync({visible:!document.hidden&&!sessionBusy&&!inputCapture&&active&&!lab&&!escapeMenu.opened&&$('welcome').hidden,canPlay:hasPlayerControl()});
  const gamepadContext=inputCapture||sessionBusy||lab?'inactive':escapeMenu.opened||!$('welcome').hidden?'menu':waitingRoom?.visible&&!waitingRoom.menuOpen?'room':active&&!cameraDirector.free&&!touchdown?.locked&&!match?.locked?'game':'inactive';
  gamepad.poll((now-last)/1000,{context:gamepadContext,time:now/1000});
  if(gamepadContext==='game'){yaw+=gamepad.look.deltaYaw;pitch=clampCameraPitch(pitch+gamepad.look.deltaPitch);}
  if(waitingRoom?.visible){
    const roomDt=Math.min((now-last)/1000,.25);last=now;document.body.classList.remove('in-game');
    waitingRoom.frame(roomDt);
    if(inputReadout){inputReadout.dataset.waitingRoom=JSON.stringify(waitingRoom.snapshot());inputReadout.dataset.roomLifecycle=JSON.stringify(roomLifecycle.snapshot());}
    if(waitingRoom.menuOpen&&avatar){avatar.play(chosenWeapon.idle,{loop:true});avatar.update(roomDt);renderInventoryPreviews(avatar.group);}
    requestAnimationFrame(frame);return;
  }
  if(qaParams.get('graphicsDebug')==='1'&&!practiceFrameProbe&&active&&$('welcome').hidden&&(match||touchdown||combat||conquestEncounter)){
   practiceFrameProbe=installPracticeFrameProbe({host:{get match(){return match||touchdown||combat||conquestEncounter;},get mode(){return gameMode;},get world(){return world;},renderer,readAcceleration:()=>gameMode==='conquest'?readNativeBooleanDistanceAcceleration():null},document,isActive:()=>active&&$('welcome').hidden,durationMs:10000,externalStepHooks:!!conquestEncounter});
  }
  practiceFrameProbe?.beginFrame();
  syncBgmSurface();
  if(!hasPlayerControl())shieldInput.clear('controls-unavailable');
  if(controller.rifle)hudText('weapon-description',controller.rifle.ammo+'/'+(controller.rifle.capacity||40)+' · Reserve '+(Number.isFinite(controller.rifle.reserve)?controller.rifle.reserve:'∞')+' · '+({idle:'Ready',fire:'Fire',reload:'Reload',secondary:'Melee'}[controller.rifle.phase]));
  if(controller.airgun){
    const state=controller.airgun,labels={idle:'Ready',charge:'Charge',fire:'Fire',reload:'Reload'};
    hudText('weapon-description',`${state.ammo}/3 · ${labels[state.phase]}${state.phase==='charge'?' '+Math.min(100,Math.round(state.chargeMs/10))+' %':''}`);
  }
  if(controller.rocketLauncher){const s=controller.rocketLauncher;hudText('weapon-description',`${s.ammo}/1 · reserve ${s.reserve} · experimental · ${{idle:'Ready',preload:'Preparing',charge:'Charge',fire:'Fire',reload:'Reload'}[s.phase]}`);}
  if(controller.cannonade){
    const s=controller.cannonade,labels={idle:'Ready',charge:'Charge',fire:'Fire',reload:'Reload'};
    hudText('weapon-description',`${s.ammo}/4 · experimental · ${labels[s.phase]}${s.phase==='charge'?' '+Math.round(s.chargeMs/20)+' %':''}${s.zoom?' · Zoom':''}`);
  }
  s4EquipmentUi.update({weapon:loadout.weapon,skin:loadout.weaponSkin,controller,experimental:!!chosenWeapon.experimental,keyLabel:inputBindings.get('weapon'+(s4ActiveWeaponSlot+1)).bindingLabel});
  // Measure real render intervals, independently of the capped simulation delta.
  if(!document.hidden){
    if(fpsStart===null)fpsStart=now;
    else{
      fpsFrames++;
      if(now-fpsStart>=500){hudText('fps-value',Math.round(fpsFrames*1000/(now-fpsStart)));fpsStart=now;fpsFrames=0;}
    }
  }
  const dt=Math.min((now-last)/1000,.25);last=now;
  world.update?.(dt);
  practiceFrameProbe?.mark('world');
  document.body.classList.toggle('in-game',$('welcome').hidden&&!lab);
  if((!qaScenario||qaScenario==='counter-revenge-live')&&hasSessionSimulation()){
    const inputFrameControllers=[...new Set([controller,combat?.enemy,...(combat?.bots??[]).map(bot=>bot.actor)].filter(actor=>typeof actor?.beginInputFrame==='function'))];
    for(const actor of inputFrameControllers)actor.beginInputFrame();
    let alpha;
    try{alpha=simulationClock.advance(dt*1000,step=>{
      poseBuffer.beginTick();
      let input=!hasControl()||cameraDirector.free||conquestEncounter?.health.dead?{facing:controller.facing}:gamepad.merge(controls.sample(desiredFacing()),desiredFacing());
      if(touchMode&&hasPlayerControl()&&!conquestEncounter?.health.dead)input=touchControls.input.merge(input,desiredFacing());
      if(hasControl()&&(controller.weapon==='counter'||controller.rifle||controller.cannonade||controller.rocketLauncher)&&!cameraDirector.free){
        updateCamera(0);
        const aimTarget=match?.rifleAimPoint?.(camera)??rifleAimPoint(camera,world.mapWeaponQuery??controller.collision,combat?.playerTargets?.()||combat?.enemy,controller.rifle?.range);
        const socket=[...avatar.bones].find(([key])=>key.endsWith(controller.rocketLauncher?'Minegun_Wea_Dummy':controller.cannonade?'AreaRailgun_Fire_Dummy':controller.rifle?.muzzle||'Dual_Fire_Dummy'))?.[1];
        avatar.group.updateWorldMatrix(true,true);
        const origin=socket?.getWorldPosition(new THREE.Vector3())||new THREE.Vector3(controller.position.x,controller.position.y+1.35,controller.position.z);
        input.aimTarget=aimTarget;
        if(controller.rocketLauncher)input.rocketLaunchFrame={direction:camera.getWorldDirection(new THREE.Vector3()).toArray(),up:new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1).toArray()};
        input.aimPitch=Math.atan2(aimTarget.y-origin.y,Math.hypot(aimTarget.x-origin.x,aimTarget.z-origin.z));
      }
      if(qaScenario==='counter-revenge-live'){input.facing=0;input.aimTarget={x:combat.enemy.position.x,y:1,z:combat.enemy.position.z};}
      if(shield){for(const edge of shieldInput.sample())shield.queueInput(edge.nativeInputCode);shield.beforeTick(input);}
      if(!touchdown&&!match&&!combat)world.advanceMapObjects?.(step);
      if(conquestEncounter)input=conquestPlayableInput(controller.weapon,input);
      const events=touchdown?touchdown.step(step,input):match?match.step(step,input):combat?combat.tick(step,input):controller.step(step,input);
      events.push(...(world.advanceAzitSessionTriggers?.()??[]));
      events.push(...(world.advanceBioLabSessionTriggers?.(step)??[]));
      // Free Azit exploration has no combat owner to forward authored melee
      // contacts. Reuse that exact source-qualified port once per fixed step.
      if(!touchdown&&!match&&!combat&&[15,19].includes(world.nativeMapId)&&world.mapObjects)resolveMapMeleeHits(world,controller,events);
      if(!conquestResultAdapter?.finished)conquestEncounter?.captureStepShots();
      shield?.afterTick();
      if(conquestEncounter&&practiceFrameProbe?.stepOwner===conquestEncounter)practiceFrameProbe.step(conquestEncounter,step);
      else conquestEncounter?.step(step);
      if(inputObservations){
       inputObservations.step++;
       if(input.forward||input.side||input.jump||input.reload||!controller.grounded||events.includes('jump')||events.includes('land')||events.includes('reload')){
        inputObservations.ticks.push({step:inputObservations.step,input:{forward:input.forward,side:input.side,jump:!!input.jump,reload:!!input.reload,sprint:!!input.sprint},position:{...controller.position},velocity:{...controller.velocity},grounded:controller.grounded,state:controller.state,ammo:controller.rifle?.ammo,phase:controller.rifle?.phase,events:[...events]});
        if(inputObservations.ticks.length>128)inputObservations.ticks.shift();
       }
      }
      controls.consumeEvents(events);
      gamepad.consumeEvents(events);
      touchControls.input.consumeEvents(events);
      audio.events(events,controller.attack,controller);
      motionGraph.events(events);
      if(!combat&&combatEffects)playSurfaceImpact(controller,events,combatEffects,audio);
      if(!combat&&gameMode!=='practice'&&world.target)for(const {attack,index} of meleeActivations(events,controller.attack)){
        if(!claimMeleeActivation(attack,index,world.target))continue;
        const contact={...attack,hits:index+1,contactIndex:index},source={...controller,attack:contact},t=world.target.position;
        if(inMeleeRange(source,world.target,2.5)&&!blockedMeleeContact(controller,world.target)){
          hitFlash=.2;stopAttackMovement(controller,attack);const sound=impactSoundKey(contact);if(sound)audio.play(sound);
          impactEffect?.trigger({point:{x:t.x,y:t.y+1,z:t.z},normal:{x:-Math.sin(controller.facing),y:0,z:-Math.cos(controller.facing)}});
        }
      }
      if(events.includes('respawn')||events.includes('tdDeath')||events.includes('touchdown')){if(touchdown){if(events.includes('touchdown')&&touchdown.celebrating)controls.cancelAttacks();else controls.clear();}}
      animateAvatar(step);updateWallEffect(step);poseBuffer.endTick();
      if(pendingWeapon&&canSwitchWeapon(controller))switchWeapon(pendingWeapon,{apply:true,bundle:pendingWeaponBundle??weaponBundles.get(pendingWeapon)});
      cannonadePushObservation?.sample({controller,shots:cannonadeEffects?.shots,combat,dt:step});
      if(events.includes('respawn')){weaponTransition=null;poseBuffer.reset();weaponTrail?.clear();wallEffect.clear();dashEffect?.clear();sprintEffect?.clear();}
    });}finally{for(const actor of inputFrameControllers)actor.endInputFrame();}
    poseBuffer.render(alpha);
  }else if(!qaScenario&&avatar&&!active&&!lab){
    const alpha=simulationClock.advance(dt*1000,step=>{poseBuffer.beginTick();animateAvatar(step);poseBuffer.endTick();});
    poseBuffer.render(alpha);
  }else{
    simulationClock.clear();
    if(lab&&avatar){animateAvatar(dt);poseBuffer.reset();}
    else if(avatar)poseBuffer.render(1);
  }
  practiceFrameProbe?.mark('simulation');
  // Presentation-only yaw, restored by PoseBuffer before the next simulation
  // tick. The same mouse angle drives the camera orbit on this render frame.
  if(avatar&&!lab&&!qaScenario&&!combat?.playerState.locked&&!touchdown?.locked)setAvatarFacing(avatar.group,presentationFacing(controller,desiredFacing(),hasPlayerControl()));
  if(weaponTransition&&!lab&&avatar){
    const hand=avatar.bones.get('Bip01 R Hand'),before=transitionDiagnostics&&hand?.quaternion.clone();
    const done=weaponTransition.render(avatar.bones,dt,avatar.poseKeys());
    if(transitionDiagnostics){transitionDiagnostics.push({dt,elapsed:weaponTransition.elapsed,changed:weaponTransition.changed.size,done,handAngle:before?.angleTo(hand.quaternion)});if(transitionDiagnostics.length>100)transitionDiagnostics.shift();}
    if(done){if(transitionDiagnostics)console.debug('weapon-transition',JSON.stringify(transitionDiagnostics));weaponTransition=null;}
  }
  updateCamera(dt);
  katanaScreenEffects?.update(controller.attack,{localOwner:true,visible:!lab&&$('welcome').hidden&&!escapeMenu.opened&&!roomResults?.opened});
  updateS5RuntimeCrosshair({weapon:loadout.weapon,zoom:controller.cannonade?.zoom??controller.rifle?.zoom??false,visible:!lab&&$('welcome').hidden});
  touchdown?.render(hasSessionSimulation()?dt:0,{visible:!lab&&$('welcome').hidden});
  touchdownRespawnDiagnostic?.refresh();
  match?.render(hasSessionSimulation()||qaScenario==='modes'?dt:0,{visible:!lab&&$('welcome').hidden});
  s4TeamModeEffects?.step(hasSessionSimulation()||qaScenario==='modes'?dt:0);
  const conquestSnapshot=conquestResultAdapter?.observe()??null;
  conquestMonsterHealthBars?.update({visible:document.body.classList.contains('in-game')&&!lab&&!conquestResultAdapter?.finished});
  // Hide on the terminal frame itself, ahead of the50ms HUD refresh.
  if(conquestResultAdapter?.finished)conquestEncounterHud?.update({...conquestSnapshot,visible:false});
  syncSessionNavigation();
  syncRoomResults();
  graphicsPresentation.setChaser(chaserPresentation?.render(hasSessionSimulation()||qaScenario==='modes'?dt:0,{match,combat,avatar,camera,visible:!lab&&$('welcome').hidden})||false,
   combat?.bots?.filter(b=>!b.health.dead).map(b=>b.avatar.group)||[],chaserPresentation?.excluded||[chaserPresentation?.anchor].filter(Boolean));
  if(qaScenario==='modes'&&gameMode==='chaser'&&chaserPresentation)$('qa-readout').dataset.chaserEntity=JSON.stringify({clip:chaserPresentation.entity.animation.clip,finished:chaserPresentation.entity.animation.finished,visible:chaserPresentation.anchor.visible,round:match?.state.round,chaser:match?.state.chaser,phase:match?.state.phase,presence:chaserPresentation.snapshot().presence});
  hitFlash=Math.max(0,hitFlash-dt);if(world.target)world.target.rotation.z=hitFlash>0?Math.sin(hitFlash*55)*.12:0;
  if(now>=nextHudUpdate){
    nextHudUpdate=now+50;
    if(lab||qaScenario){
  $('movement').textContent=lab?'ANIMATION / '+animOverride:controller.attack?.revengeDash?'REVENGE DASH':controller.sprinting&&!controller.grounded?'AIR SPRINT':labels[controller.state];
  $('position-readout').textContent=`X ${controller.position.x.toFixed(2)} · Y ${controller.position.y.toFixed(2)} · Z ${controller.position.z.toFixed(2)}`;
  $('speed').textContent=Math.hypot(controller.velocity.x,controller.velocity.z).toFixed(1)+' u/s';$('clip').textContent=avatar?.clip||'…';
    }
  $('hud').classList.toggle('low-sp',controller.energy<TUNING.dashCost);
  hudText('sp-max','/ '+TUNING.maxEnergy);
  if(combat){const max=combat.playerState.maxHp||100;hudText('hp-value',Math.ceil(combat.playerState.hp));$('hp-fill').style.transform=`scaleX(${combat.playerState.hp/max})`;hudFill('hp-fill',combat.playerState.hp/max);document.querySelector('#hud .health small').textContent=String(max);}
  if(touchdown){hudText('hp-value',touchdown.health.hp);$('hp-fill').style.transform=`scaleX(${touchdown.health.hp/100})`;hudFill('hp-fill',touchdown.health.hp/100);document.querySelector('#hud .health small').textContent='100';}
  if(conquestContactQA){hudText('hp-value',Math.ceil(conquestContactQA.health.hp));hudFill('hp-fill',conquestContactQA.health.hp/100);document.querySelector('#hud .health small').textContent='100';}
  if(conquestEncounter){hudText('hp-value',Math.ceil(conquestEncounter.health.hp));hudFill('hp-fill',conquestEncounter.health.hp/100);document.querySelector('#hud .health small').textContent='100';conquestEncounterHud?.update({...conquestSnapshot,visible:document.body.classList.contains('in-game')&&!lab&&!conquestResultAdapter?.finished});}
  if(!combat&&!touchdown&&!conquestContactQA&&!conquestEncounter){hudText('hp-value','—');hudFill('hp-fill',0);document.querySelector('#hud .health small').textContent='';}
  const width=Math.max(0,Math.min(100,controller.energy/TUNING.maxEnergy*100)).toFixed(2)+'%';if($('energy').style.width!==width)$('energy').style.width=width;hudFill('energy',controller.energy/TUNING.maxEnergy);hudText('energy-label',controller.infiniteEnergy?'∞':Math.round(controller.energy));
  }
  if(qaScenario==='counter-revenge-live'&&combat)$('qa-readout').dataset.combat=JSON.stringify({ticks:simulationClock.ticks,playerHp:combat.playerState.hp,playerLocked:combat.playerState.locked,enemyStun:combat.enemyState.stun,enemyAge:combat.enemyState.age,attackKind:controller.attack?.kind});
  if(inputReadout&&cannonadePushObservation)inputReadout.dataset.cannonadePush=JSON.stringify(cannonadePushObservation.snapshot());
  if(inputReadout)inputReadout.dataset.rifleEffects=JSON.stringify({localAvatar:avatar?.group.uuid,enemyAvatar:combat?.avatar?.group.uuid,enemyWeapon:combat?.enemy?.weapon,enemyPending:combat?.enemy?.rifle?.pendingShots.length??0,effects:[revolverEffects,semiRifleEffects,submachineGunEffects,...importedRifleEffects].filter(effect=>effect?.updateActors&&effect.snapshot).map(effect=>effect.snapshot())});
  if(inputReadout)inputReadout.dataset.captainEffects=JSON.stringify(gameMode==='captain'?match?.worldEffects?.snapshot()??null:null);
  if(inputReadout)inputReadout.dataset.opponentAudio=JSON.stringify(Array.from(opponentAudio.values(),player=>({weapon:player.weapon,sex:player.sex,sharedContext:!!player.context&&player.context===audio.context,contextState:player.context?.state,volume:player.volume,gain:player.gain?.gain.value,decodedBuffers:player.buffers.size,missingFiles:[...player.missingFiles],activeKeys:Array.from(player.sources,source=>player.sourceKeys.get(source)),shot:player.files.shot,light:player.files.light})));
  minimalHud.update({controller,world,health:combat?.playerState??(touchdown?{hp:touchdown.health.hp,maxHp:100}:conquestEncounter?.health??conquestContactQA?.health),maxSp:TUNING.maxEnergy,visible:document.body.classList.contains('in-game')&&!lab,skillState:shield?.snapshot()});
  if(inputReadout)inputReadout.dataset.observation=JSON.stringify({bindings:inputBindings.snapshot(),capturing:inputCapture,options:optionsTransaction?.snapshot()??null,mouse:{current:mouseSettings.get(),look:mouseLook.snapshot()},playerControl:hasPlayerControl(),sex:loadout.sex,weapon:controller.weapon,position:{...controller.position},state:controller.state,ammo:controller.rifle?.ammo,phase:controller.rifle?.phase,edges:inputObservations.edges,ticks:inputObservations.ticks,step:inputObservations.step,audio:{sfx:audioSettings.get('sfx'),bgm:audioSettings.get('bgm'),music:bgmSession.snapshot(),musicEvents:bgmEvents,interface:interfaceAudio.snapshot(),bundles:Array.from(weaponBundles,([weapon,bundle])=>({weapon,volume:bundle.audio.volume,gain:bundle.audio.gain?.gain.value,contextState:bundle.audio.context?.state,connected:bundle.audio.connected===true,decodedBuffers:bundle.audio.buffers.size,activeSources:bundle.audio.sources.size}))}});
  if(shield){const state=shield.snapshot();$('skill-status').hidden=state.itemKey===null||!$('welcome').hidden||lab;hudText('skill-status',`SHIELD · ${inputBindings.get('skill').bindingLabel} · ${state.active?'ACTIVE':state.bodyEntrySerial?'ACTIVATION':'INACTIVE'}`);if(skillReadout){const incoming=combat?.enemy.rifle?.lastShot?.contact;skillReadout.dataset.observation=JSON.stringify({sex:loadout.sex,weapon:controller.weapon,host:state,equipment:skillEquipment,presentation:shieldPresentation.snapshot(),candidateCount:shieldPresentation.getQueryCandidates().length,playerHp:combat?.playerState.hp,position:{...controller.position},upperLower:avatar?.playbackTimes(),clip:avatar?.clip,incoming:incoming?{hit:incoming.hit,blockedByShield:incoming.blockedByShield,point:incoming.point,sourceQuery:incoming.shieldQuery?.sourceQuery,shieldReports:incoming.shieldQuery?.shieldReports}:null});}}
  if(qaScenario)$('qa-readout').textContent=`QA ${qaScenario} | ${controller.state} | ${avatar?.clip||'loading'} | ${SIM_STEP_MS} ms | dash ${controller.dashPhase??'-'} ${controller.dashElapsedMs} ms | wall ${controller.wallAction?.phase??'-'} ${controller.wallAction?.timeMs??0} ms | FOV ${camera.fov.toFixed(2)} | x ${controller.position.x.toFixed(2)} y ${controller.position.y.toFixed(2)} z ${controller.position.z.toFixed(2)}`;
  if(qaScenario&&controller.rifle)$('qa-readout').dataset.rifleRange=JSON.stringify({weapon:controller.weapon,nativeMapId:world.nativeMapId??null,sceneRange:controller.rifle.range,nativeRange:controller.rifle.range/.006});
  if(qaScenario&&controller.weapon==='smashrifle')$('qa-readout').dataset.smashSecondary=JSON.stringify({kind:controller.attack?.kind??null,timeMs:controller.attack?.timeMs??null,lowerActive:controller.attack?.lowerActive??false,hits:controller.attack?.hits??0,phase:controller.rifle.phase,ammo:controller.rifle.ammo,criticalPolicy:'normal-only',criticalRayImplemented:false,nativeHpCompared:false});
  if(qaScenario&&controller.cannonade)$('qa-readout').dataset.cannonade=JSON.stringify({phase:controller.cannonade.phase,ammo:controller.cannonade.ammo,chargeMs:controller.cannonade.chargeMs,zoom:controller.cannonade.zoom,pendingContacts:cannonadeEffects?.shots.items.length??0,pushes:cannonadeEffects?.shots.pushes.size??0,lightning:cannonadeEffects?.lightningState()??[]});
  // Pose interpolation, presentation yaw and equipment transitions above can
  // change sockets after their fixed tick. Re-anchor without advancing FX.
  if(avatar){avatar.group.userData.weaponFlameEnabled=!lab&&!touchdown?.health.dead&&!conquestEncounter?.health.dead&&!combat?.playerState.dead;combatEffects?.sampleAvatar(avatar);}
  sprintEffect?.render(camera);weaponTrail?.render?.();combat?.render(camera,(hasControl()||!!qaScenario)&&!escapeMenu.opened);if(!combat)combatEffects?.render(camera);
  if(qaScenario&&qaParams.get('qaTrail')==='off'&&weaponTrail?.mesh)weaponTrail.mesh.visible=false;
  if(qaScenario&&weaponTrail?.snapshot)$('qa-readout').dataset.weaponTrail=JSON.stringify(weaponTrail.snapshot());
  if(qaScenario&&combat?.trail?.snapshot)$('qa-readout').dataset.enemyTrail=JSON.stringify(combat.trail.snapshot());
  if(qaScenario&&controller.rocketLauncher)$('qa-readout').dataset.rocketLauncher=JSON.stringify({phase:controller.rocketLauncher.phase,ammo:controller.rocketLauncher.ammo,reserve:controller.rocketLauncher.reserve,projectiles:rocketLauncherEffects?.projectiles.items.length??0,trails:rocketLauncherEffects?.trailState()??[]});
  rocketLauncherEffects?.render(camera);cannonadeEffects?.render(camera);airgunEffects?.render(camera);rifleEffects?.render(camera);revolverEffects?.render(camera);semiRifleEffects?.render(camera);submachineGunEffects?.render(camera);for(const effects of importedRifleEffects)effects.render(camera);practiceFrameProbe?.mark('presentation');
  // The opaque preparation HUD has its own live character previews. Avoid
  // drawing the entire map, reflections, shadows and post-processing behind it.
  // Continue simulation/pose evaluation above so returning to play is immediate.
  // In-game Settings sits over the live match: keep drawing it (FOV preview).
  if($('welcome').hidden||!$('welcome').classList.contains('s5-entry-host')||document.body.classList.contains('ingame-settings')){
   followShadow.update(avatar?.group.position??controller.position,cameraDirector.free?null:yaw);
   world.renderMapObjects?.(camera);graphicsPresentation.render();
   if(!escapeMenu.opened&&!roomResults?.opened){katanaScreenEffects?.render(renderer);chaserHudEffects?.render(renderer);s4TeamModeEffects?.render(renderer);if(gameMode==='captain')match?.ui.render(renderer);}
   roomResults?.render(renderer);
  }
  renderInventoryPreviews(avatar?.group);practiceFrameProbe?.mark('submission');practiceFrameProbe?.endFrame();requestAnimationFrame(frame);
}
camera.position.set(2,3,15);requestAnimationFrame(frame);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(renderPixelRatio(renderQuality,innerWidth,innerHeight,devicePixelRatio));renderer.setSize(innerWidth,innerHeight);graphicsPresentation.resize(innerWidth,innerHeight);});
// Multi-weapon QA keeps its full arsenal. These single-action snapshots only
// need the selected slots, as do joined-room fixtures and ordinary sessions.
// The selected equipment is prepared first; the full ordinary-session library
// joins the same cache before the lobby is unlocked below.
const startupWeapons=qaScenario&&!qaScenario.startsWith('plasma-rush')&&!['body-contact','melee-contact','opponent-melee-trail','plasma-chain','counter-revenge','counter-revenge-live','conquest-pawn-contact','strong','held-attack','katana-backdash','katana-charge','katana-secondary','katana-contact'].includes(qaScenario)&&!(qaScenario==='modes'&&qaParams.get('qaEntry')==='room')?Object.keys(WEAPON_CHOICES):[...new Set(initialWeaponLoadout.slots.filter(Boolean))];
const assetStartup=startupPhase('avatar','Loading game resources',startupWeapons.length+5);
export const gameReady=Promise.all([
 Promise.all(startupWeapons.map(weapon=>assetStartup.run('Character ready: '+WEAPON_CHOICES[weapon].name,()=>loadAvatar({appearance:qaParams.get('character')||'s5runtime',...loadout,weapon,weaponSkin:preparedWeaponSkin(weapon),shieldAnimations:true,...(qaParams.has('qa')&&qaParams.get('weaponFit')==='default'?{weaponFit:{}}:{})})))),
 assetStartup.run('Movement effects ready',()=>loadImportedEffects()),
 assetStartup.run('Sprint effect ready',()=>loadSprintEffect()),
 assetStartup.run('Trail texture ready',()=>new THREE.TextureLoader().loadAsync('/assets/s5runtime/effects/trail.png')),
 assetStartup.run('Combat texture ready',()=>new THREE.TextureLoader().loadAsync('/assets/s5runtime/combat/gi.png')),
 assetStartup.run('Impact texture ready',()=>new THREE.TextureLoader().loadAsync('/assets/s5runtime/textures/d9726737c5a5b072.png')),
]).then(async([avatars,effects,sprint,texture,swordTexture,breakerTexture])=>{
  const bundleStartup=startupPhase('scene_share_anim','Preparing equipment',avatars.length);
  const a=avatars.find(a=>a.weapon===loadout.weapon);
  swordTexture.flipY=false;swordTexture.colorSpace=THREE.SRGBColorSpace;
  combatTexture=swordTexture;
  weaponSwordTexture=swordTexture;weaponBreakerTexture=breakerTexture;
  breakerTexture.flipY=false;breakerTexture.colorSpace=THREE.SRGBColorSpace;
  trailTexture=texture;
  sprintEffect=sprint;scene.add(sprint.mesh);
  wallEffect.group.removeFromParent();wallEffect.dispose();wallEffect=effects.wall;impactEffect=effects.impact;scene.add(wallEffect.group,impactEffect.group);
  avatar=a;scene.add(a.group,a.helper);a.group.position.copy(controller.position);
  graphicsPresentation.outline.setAvatar(a.group);
  dashEffect=new DashEffect(a.group,{style:selectedDashStyle});scene.add(dashEffect.group);
  poseBuffer=new PoseBuffer([a.group,a.rig,...a.bones.values()]);
  const dagger=a.meshes.find(mesh=>mesh.userData.weapon&&!mesh.userData.source.endsWith('_l.scn')&&(a.weapon!=='katana'||mesh.name==='katana_body'));
  trailTexture.flipY=false;trailTexture.colorSpace=THREE.SRGBColorSpace;
  if(dagger&&!isRifleWeapon(a.weapon)&&!['rocketlauncher','cannonade','airgun'].includes(a.weapon)){weaponTrail=a.weapon==='assassinclaw'?await loadAssassinClawTrails(a):a.weapon==='katana'?await loadKatanaTrails(a):a.weapon==='sigmablade'?await loadSigmaBladeTrails(a):a.weapon==='bat'?await loadBatTrails(a):a.weapon==='demonicknuckle'?await loadDemonicKnuckleTrails(a):a.weapon==='deathscythe'?await loadDeathScytheTrails(a):a.weapon==='breaker'?await loadBreakerTrails(a):a.weapon==='ironboots'?new IronBootsTrails(a,{texture:swordTexture}):a.weapon==='twinblade'?await loadTwinBladeActorTrails(a):new WeaponTrail(dagger,{texture:a.weapon==='breaker'?breakerTexture:a.weapon==='dagger'?trailTexture:swordTexture,weapon:a.weapon});scene.add(weaponTrail.mesh);}
  weaponBundles.set(loadout.weapon,{avatar:a,audio,skin:loadout.weaponSkin,trail:weaponTrail,dash:dashEffect,pose:poseBuffer});
  bundleStartup.done('Equipment ready: '+WEAPON_CHOICES[a.weapon].name);
  for(const other of avatars.filter(candidate=>candidate!==a)){
    const mesh=other.meshes.find(m=>m.userData.weapon&&!m.userData.source.endsWith('_l.scn')&&(other.weapon!=='katana'||m.name==='katana_body'));
    weaponBundles.set(other.weapon,{avatar:other,audio:new GameAudio(other.weapon,loadout.sex),skin:preparedWeaponSkin(other.weapon),
      trail:mesh&&!isRifleWeapon(other.weapon)&&!['rocketlauncher','cannonade','airgun'].includes(other.weapon)?(other.weapon==='assassinclaw'?await loadAssassinClawTrails(other):other.weapon==='katana'?await loadKatanaTrails(other):other.weapon==='sigmablade'?await loadSigmaBladeTrails(other):other.weapon==='bat'?await loadBatTrails(other):other.weapon==='demonicknuckle'?await loadDemonicKnuckleTrails(other):other.weapon==='deathscythe'?await loadDeathScytheTrails(other):other.weapon==='breaker'?await loadBreakerTrails(other):other.weapon==='ironboots'?new IronBootsTrails(other,{texture:swordTexture}):other.weapon==='twinblade'?await loadTwinBladeActorTrails(other):new WeaponTrail(mesh,{texture:other.weapon==='breaker'?breakerTexture:other.weapon==='dagger'?trailTexture:swordTexture,weapon:other.weapon})):null,dash:new DashEffect(other.group,{style:selectedDashStyle}),
      pose:new PoseBuffer([other.group,other.rig,...other.bones.values()])});
    bundleStartup.done('Equipment ready: '+WEAPON_CHOICES[other.weapon].name);
  }
  for(const [weapon,bundle]of weaponBundles)weaponResourceCache.seed(weapon,bundle.skin,bundle);
  publishWeaponResources();
  audioSettings.apply('sfx');
  $('load-status').textContent='Preparing combat effects…';
  const initialWeaponEffects=startupWeapons.filter(weapon=>weaponEffectCache.supports(weapon));
  const initialSkill=['3050001','3050002'].includes(qaParams.get('skill'))?Number(qaParams.get('skill')):null;
  const effectsStartup=startupPhase('effects','Preparing combat effects',1+initialWeaponEffects.length+(initialSkill===null?0:1));
  combatEffects=await effectsStartup.run('Combat effects',()=>loadCombatEffects(scene,{weapons:[]}));
  for(const candidate of avatars){const art=combatEffects.prepareArtAvatar(candidate,controller,weaponEffectSettings);if(art)await effectsStartup.run(WEAPON_CHOICES[candidate.weapon].name+' effect styles',()=>art.warmup(renderer,camera,scene));}
  for(const weapon of initialWeaponEffects)await effectsStartup.run(WEAPON_CHOICES[weapon].name+' effects',()=>ensureWeaponEffects(weapon));
  if(initialSkill!==null)await effectsStartup.run('Equipped skill presentation',()=>ensureGameShield());
  skillCapabilities={unequipReady:true,...Object.fromEntries([3050001,3050002].map(itemKey=>[itemKey,{itemKey,actionType:4,kind:'active',equipmentReady:true,behaviorReady:true,inputReady:true,diagnosticOnly:false,experimental:true}]))};
  $('skill-select').disabled=false;inputSettings.setActive([...GAME_INPUT_COMMANDS,'skill']);
  const inventory=document.querySelector('[data-panel="inventory"]').inventory;
  const interfaceStartup=startupPhase('register_interface','Preparing equipment interface',1);
  await interfaceStartup.run('Equipment interface ready',async()=>{prepareInventoryWeaponPreviews(inventory);return inventory.installSkills({catalog:await readAsset('/assets/s5runtime/skills/catalog.json'),select:$('skill-select'),readCapabilities:()=>skillCapabilities,readEquipment:()=>skillEquipment});});
  document.dispatchEvent(new CustomEvent('s5:skill-capabilities-changed'));
  if(initialSkill!==null)await equipGameSkill(initialSkill);
  const matchStartup=startupPhase('session','Preparing match',1);
  await matchStartup.run('Match prepared',async()=>{
  if(gameMode!=='practice'&&world.nativeMapId!==46)await prepareEnemies(['chaser','battleroyal','captain','siege'].includes(gameMode)?2:1,gameMode==='chaser',gameMode==='training'?trainingOpponentWeapon(qaParams.get('enemyWeapon')):'counter');await attachMatch();
  });
  const warmStartup=startupPhase('shader','Warming combat rendering',2+(world.warmMapObjects?1:0));
  if(world.warmMapObjects)await warmStartup.run('Map object rendering ready',()=>world.warmMapObjects(renderer,camera,scene));
  await warmStartup.run('Combat rendering ready',()=>combatEffects.warmup(renderer,camera,combatEffects.sharedSequences));
  await warmStartup.run('Sprint rendering ready',()=>sprintEffect.warmup(renderer,camera,scene));
  $('load-status').textContent='Preparing weapon rendering…';
  const compileStartup=startupPhase('shader','Preparing character rendering',avatars.length+1);
  for(const candidate of avatars)await compileStartup.run(WEAPON_CHOICES[candidate.weapon].name+' rendering ready',async()=>{await renderer.compileAsync(candidate.group,camera,scene);const bundle=weaponBundles.get(candidate.weapon);await bundle.trail?.warmup?.(renderer,camera,scene);prepareWeaponRendering(bundle);});
  // Do the first uploads and preview-context shader compilation while the
  // startup screen still covers the game, instead of freezing its first frame.
  await compileStartup.run('Lobby and scene rendering ready',async()=>{graphicsPresentation.render();renderInventoryPreviews(a.group);});
  for(const clip of a.clips){const option=document.createElement('option');option.value=clip.name;option.textContent=(MIXAMO_CLIP_LABELS[clip.name]||clip.name)+' · '+clip.duration.toFixed(2)+' s'+(clip.name.startsWith('AIR_')?' · adaptation':'');$('clip-select').append(option);}
  $('clip-select').value=chosenWeapon.idle;$('load-status').textContent=`Ready · ${loadout.sex==='female'?'Female character':'Male character'} · ${chosenWeapon.name}`;sessionReady=true;sessionControls();mapSession.current.warmed=true;
  if(['outfits','weapons','effects'].includes(qaParams.get('inventory'))){
    // The play/status MutationObserver has not run yet in this startup turn.
    // Publish readiness before restoring the requested inventory destination.
    syncEntryShell();
    if(entryShell.flow.go('inventory').accepted){
      slotInventory.showSection(qaParams.get('inventory')==='outfits'?'outfits':'weapons');
      const inventoryUrl=new URL(location.href);inventoryUrl.searchParams.delete('inventory');history.replaceState(null,'',inventoryUrl);
    }
  }
  if(gameMode==='practice'){document.title=`S5 League · ${world.name}`;$('play').innerHTML='PLAY <span>↗</span>';}
  if(qaScenario&&qaScenario!=='modes'){
    if((['profile','front'].includes(qaParams.get('qaView'))||qaScenario.startsWith('plasma-rush')&&qaParams.get('qaView')==='profile-wide')&&combat)combat.avatar.group.visible=false;
    if(combat&&(qaScenario.startsWith('cannonade-')||qaScenario.startsWith('rocket-'))&&!['cannonade-contact','rocket-contact'].includes(qaScenario)&&qaParams.get('qaView')==='profile-wide')combat.avatar.group.visible=false;
    if(qaScenario.startsWith('cannonade-zoom')){camera.fov=BASE_FOV;Object.assign(cannonadeCamera,createCannonadeCameraState());camera.updateProjectionMatrix();}
    runVisualScenario(qaScenario,Number(qaParams.get('t')||.3),controller,motionGraph,avatar,dt=>{
      // Visual scenarios step Controller directly, bypassing TrainingCombat.tick.
      // Advance and cue the same melee effects as normal play after the pose.
      combatEffects.update(dt);
      if(combat)combat.cue(controller,avatar);
      else{playAttackEffects(combatEffects,controller.attack,controller.position,avatar,controller.facing,{collision:controller.collision});}
      combatEffects.sampleAvatar(avatar);
      katanaScreenEffects?.update(controller.attack,{localOwner:true,visible:true});
      updateCannonade(dt);updateRocketLauncher(dt);airgunEffects?.update(dt,controller,avatar);rifleEffects?.update(dt,controller,avatar);revolverEffects?.update(dt,controller,avatar);semiRifleEffects?.update(dt,controller,avatar);submachineGunEffects?.update(dt,controller,avatar);for(const effects of importedRifleEffects)effects.update(dt,controller,avatar);weaponTrail?.update(dt,controller.attack,{cancel:controller.dash>0||!!selectedWeaponEffect(avatar,controller.attack,{replacementOnly:true})});updateWallEffect(dt);dashEffect.update(dt,controller);sprintEffect.update(dt,controller,avatar);
      if(qaScenario.startsWith('cannonade-zoom'))updateCannonadeFov(camera,cannonadeCamera,dt,!!controller.cannonade?.zoom);else updateSprintFov(camera,dt,controller.sprinting);});
    if(combat&&loadout.weapon==='plasma'&&qaScenario==='plasma-chain'){
      const {runPlasmaPrimaryChainQa}=await import('./plasma-primary-chain-qa.js');
      $('qa-readout').dataset.plasmaChain=JSON.stringify(runPlasmaPrimaryChainQa({combat,controller,graph:motionGraph,avatar,animate:animateAvatar,seconds:Number(qaParams.get('t')||1.744),periodMs:Number(qaParams.get('period')||600),contact:qaParams.get('contact')==='1'}));
      poseBuffer.reset();yaw=Math.PI;cameraDirector.setMode('normal');
    }
    if(combat&&qaScenario==='body-contact'){
      $('qa-readout').dataset.bodyContact=JSON.stringify(runActorBodyContactQa({combat,controller,graph:motionGraph,animate:animateAvatar,action:qaParams.get('action')||'land',seconds:Number(qaParams.get('t')||.9)}));
      poseBuffer.reset();yaw=Math.PI;
    }
    if(combat&&loadout.weapon==='counter'&&['counter-revenge','counter-revenge-live'].includes(qaScenario)){
      if(match)for(let i=0;i<Math.ceil(7/.016);i++)match.step(.016,{});
      controller.reset();motionGraph.reset();combat.reset();combat.setMode('attack');combat.avatar.group.visible=true;
      controller.position={x:0,y:0,z:0};controller.facing=0;combat.enemy.position={x:0,y:0,z:1.5};combat.cooldown=0;
      for(const [index,bot]of (combat.bots??[]).entries()){bot.cooldown=0;if(index>0)bot.actor.position={x:8,y:0,z:8};}
      for(let i=0;i<(qaScenario==='counter-revenge-live'?0:Math.ceil(Math.min(4,Number(qaParams.get('t')||1))*1000/10));i++){
        const events=combat.tick(.01,{facing:0,heavy:i===0,heavyHeld:true});motionGraph.events(events);animateAvatar(.01);
      }
      $('qa-readout').dataset.combat=JSON.stringify({playerHp:combat.playerState.hp,playerLocked:combat.playerState.locked,enemyHp:combat.enemyState.hp,enemyStun:combat.enemyState.stun,enemyAge:combat.enemyState.age,enemyLocked:combat.enemyState.locked,attackKind:controller.attack?.kind,clip:avatar.clip});yaw=Math.PI;
      $('qa-readout').dataset.receivedReaction=JSON.stringify({weapon:combat.enemy.weapon,sex:combat.enemy.sex,clip:combat.avatar.clip,playback:combat.avatar.playbackTimes(),ageMs:combat.enemyState.age*1000,holdMs:combat.enemyState.hold*1000,stunMs:combat.enemyState.stun*1000,reaction:combat.enemyState.reaction,counterAttackDamage:combat.enemyState.counterAttackDamage,counterDamageElapsedMs:combat.enemyState.counterDamageElapsedMs,counterDamageLoopAge:combat.enemyState.counterDamageLoopAge,serial:combat.enemyState.serial});
      if(qaScenario==='counter-revenge-live'){controls.attack(2);active=true;fallbackControl=true;}
    }
    if(combat&&controller.rocketLauncher&&qaScenario==='rocket-contact'){
      controller.reset();motionGraph.reset();combat.reset();combat.setMode('passive');rocketLauncherEffects.clear();rocketLauncherEffects.projectiles.resetRandom(Number(qaParams.get('randomSeed')||1));combat.avatar.group.visible=true;
      controller.position={x:0,y:0,z:0};controller.facing=0;combat.enemy.position={x:0,y:0,z:5};
      const secondary=qaParams.get('secondary')==='1',hold=secondary?3.5:.4;
      for(let i=0;i<Math.ceil(Number(qaParams.get('t')||.7)/.01);i++){
        const events=combat.tick(.01,{facing:0,light:!secondary&&i*.01<hold,heavyHeld:secondary&&i*.01<hold,aimTarget:{x:0,y:1.3,z:5}});motionGraph.events(events);animateAvatar(.01);
      }
      $('qa-readout').dataset.combat=JSON.stringify({hp:combat.enemyState.hp,playerHp:combat.playerState.hp,ammo:controller.rocketLauncher.ammo,phase:controller.rocketLauncher.phase,shots:controller.rocketLauncher.shotSerial,projectiles:rocketLauncherEffects.projectiles.items.map(p=>p.position.toArray()),enemyPosition:combat.enemy.position});yaw=Math.PI;
    }
    if(combat&&controller.cannonade&&qaScenario==='cannonade-contact'){
      controller.reset();motionGraph.reset();combat.reset();combat.setMode('passive');cannonadeEffects.clear();combat.avatar.group.visible=true;
      controller.position={x:0,y:0,z:0};controller.facing=0;combat.enemy.position={x:0,y:0,z:5};
      const hold=qaParams.get('charged')==='1'?2.1:.4;
      for(let i=0;i<Math.ceil(Number(qaParams.get('t')||.7)/.01);i++){
        const events=combat.tick(.01,{facing:0,light:i*.01<hold,lightPressed:i===0,aimTarget:{x:0,y:1.3,z:5}});motionGraph.events(events);animateAvatar(.01);
      }
      $('qa-readout').dataset.combat=JSON.stringify({hp:combat.enemyState.hp,ammo:controller.cannonade.ammo,phase:controller.cannonade.phase,shots:controller.cannonade.shotSerial,enemyPosition:combat.enemy.position,pendingContacts:cannonadeEffects.shots.items.length,pushes:cannonadeEffects.shots.pushes.size});yaw=Math.PI;
    }
    if(combat&&controller.weapon==='smashrifle'&&['smash-secondary','smash-secondary-contact'].includes(qaScenario)){
      controller.reset();motionGraph.reset();combat.reset();combat.setMode('passive');combat.avatar.group.visible=true;
      controller.position={x:0,y:0,z:0};controller.facing=0;combat.enemy.position={x:0,y:0,z:qaScenario==='smash-secondary-contact'?1.7:20};
      const dirs={front:[0,1],rightFront:[1,1],right:[1,0],rightBack:[1,-1],back:[0,-1],leftBack:[-1,-1],left:[-1,0],leftFront:[-1,1]},move=dirs[qaParams.get('qaMove')]??[0,0];
      for(let i=0;i<Math.ceil(Number(qaParams.get('t')||.45)/.01);i++){const ev=combat.tick(.01,{facing:0,heavy:i===0,x:move[0],z:move[1]});motionGraph.events(ev);animateAvatar(.01);}
      $('qa-readout').dataset.combat=JSON.stringify({hp:combat.enemyState.hp,ammo:controller.rifle.ammo,shots:controller.rifle.shotSerial,reaction:combat.enemyState.reaction,enemyPosition:combat.enemy.position,criticalPolicy:'normal-only',nativeHpCompared:false});yaw=Math.PI;
    }
    if(combat&&controller.rifle&&qaScenario==='rifle-contact'){
      controller.reset();motionGraph.reset();combat.reset();combat.setMode('passive');combat.avatar.group.visible=true;
      controller.position={x:0,y:0,z:0};controller.facing=0;combat.enemy.position={x:0,y:0,z:5};
      // Normal play converges the muzzle ray on the camera reticle. Supply
      // the same explicit target here: dual SMG barrels can sit above the
      // target box, where a bare horizontal muzzle ray would miss entirely.
      for(let i=0;i<Math.ceil(Number(qaParams.get('t')||.4)/.01);i++){const ev=combat.tick(.01,{facing:0,light:true,lightPressed:i===0,aimTarget:{x:0,y:1.3,z:5}});motionGraph.events(ev);animateAvatar(.01);}
      $('qa-readout').dataset.combat=JSON.stringify({hp:combat.enemyState.hp,ammo:controller.rifle.ammo,shots:controller.rifle.shotSerial,reaction:combat.enemyState.reaction,enemyClip:combat.avatar.clip,locked:combat.enemyState.locked});yaw=Math.PI;
    }
    if(combat&&loadout.weapon==='airgun'&&qaScenario==='airgun-push'){
      controller.reset();motionGraph.reset();combat.reset();combat.setMode('passive');airgunEffects.clear();combat.avatar.group.visible=true;
      controller.position={x:0,y:0,z:0};controller.facing=0;combat.enemy.position={x:0,y:0,z:2};combat.enemy.facing=Math.PI;
      for(let i=0;i<Math.ceil(Math.min(4,Number(qaParams.get('t')||1.5))/.01);i++){
        const events=combat.tick(.01,{facing:0,light:i<110,lightPressed:i===0,lightReleased:i===110});motionGraph.events(events);animateAvatar(.01);
      }
      console.debug('airgun-push-QA',JSON.stringify({enemy:combat.enemy.position,hp:combat.enemyState.hp,velocity:combat.enemy.velocity}));yaw=Math.PI;
    }
    if(combat&&loadout.weapon==='breaker'&&['breaker-contact','breaker-charge','breaker-jump'].includes(qaScenario)){
      controller.reset();motionGraph.reset();combat.reset();combat.setMode('passive');
      controller.position={x:0,y:0,z:0};controller.facing=0;combat.enemy.position={x:0,y:0,z:2};combat.enemy.facing=Math.PI;
      for(let i=0;i<Math.ceil(Math.min(4,Number(qaParams.get('t')||.3))/.01);i++){
        const input={facing:0};
        if(qaScenario==='breaker-contact')input.lightShort=i===0;
        if(qaScenario==='breaker-charge')Object.assign(input,{heavy:i===0,heavyHeld:i<30,heavyReleased:i===30});
        if(qaScenario==='breaker-jump')Object.assign(input,{jump:i===0,lightShort:i===10});
        const events=combat.tick(.01,input);motionGraph.events(events);animateAvatar(.01);
      }
      $('qa-readout').dataset.combat=JSON.stringify({weapon:loadout.weapon,hp:combat.enemyState.hp,reaction:combat.enemyState.reaction,attackKind:controller.attack?.kind,attackHits:controller.attack?.hits??0,enemyPosition:combat.enemy.position});
      const breakerSocket=[...avatar.bones].find(([name])=>name.endsWith('_HM_DMGeffect_Dummy'))?.[1];
      if(breakerSocket){
        breakerSocket.updateWorldMatrix(true,false);const socketPosition=breakerSocket.getWorldPosition(new THREE.Vector3());
        const surface=controller.collision.raycast(socketPosition,{x:0,y:-3,z:0});
        $('qa-readout').dataset.breakerPresentation=JSON.stringify({attackMs:controller.attack?.timeMs,socket:socketPosition.toArray(),surface:surface?.point.toArray()??null});
      }
      $('qa-readout').dataset.receivedReaction=JSON.stringify({weapon:loadout.weapon,sex:loadout.sex,clip:combat.avatar.clip,playback:combat.avatar.playbackTimes(),ageMs:combat.enemyState.age*1000,holdMs:combat.enemyState.hold*1000,reaction:combat.enemyState.reaction,serial:combat.enemyState.serial});
      yaw=Math.PI;cameraDirector.setMode('normal');
    }
    if(combat&&qaScenario==='opponent-melee-trail'){
      combat.reset();controller.reset();motionGraph.reset();combat.setMode('passive');
      controller.position={x:0,y:0,z:12};combat.enemy.position={x:0,y:0,z:0};
      combat.enemy.sigmaTransformed=qaParams.get('enemyForm')==='transformed';
      let first=true;combat.enemyInput=()=>{const input={facing:0,lightShort:first};first=false;return input;};
      const ticks=Math.ceil(Math.min(3000,Number(qaParams.get('t')||.24)*1000)/10);
      for(let i=0;i<ticks;i++){combat.tick(.01,{facing:Math.PI});animateAvatar(.01);}
      combat.enemyInput=null;
      $('qa-readout').dataset.enemyCombat=JSON.stringify({weapon:combat.enemy.weapon,sex:combat.avatar.sex,clip:combat.avatar.clip,transformed:combat.enemy.sigmaTransformed,attackKind:combat.enemy.attack?.kind??null,attackTimeMs:combat.enemy.attack?.timeMs??null,position:combat.enemy.position,playerHp:combat.playerState.hp});
      yaw=Math.PI;cameraDirector.setMode('normal');
    }
    if(combat&&['counter','dagger','plasma','twinblade','bat','assassinclaw','ironboots','sigmablade','vitalshock','deathscythe','demonicknuckle'].includes(loadout.weapon)&&qaScenario==='melee-contact'){
      controller.reset();motionGraph.reset();combat.reset();combat.setMode('passive');combat.avatar.group.visible=true;
      controller.position={x:0,y:0,z:0};controller.facing=0;combat.enemy.position={x:0,y:0,z:2};combat.enemy.facing=Math.PI;
      const rush=['dagger','plasma'].includes(loadout.weapon)&&qaParams.get('action')==='rush';
      const counterAction=loadout.weapon==='counter'?qaParams.get('action'):null;
      const twinAction=loadout.weapon==='twinblade'?qaParams.get('action'):null;
      const batAction=loadout.weapon==='bat'?qaParams.get('action'):null;
      const bootsAction=loadout.weapon==='ironboots'?qaParams.get('action'):null;
      if(bootsAction==='dash'){
        // Diagnostic of the source state; native input binding is still unknown.
        const {createMeleeAttack}=await import('./melee-weapons.js');
        controller.attack=createMeleeAttack('ironboots','dash',0,loadout.sex,0);
      }
      if(['surface','surface-combo'].includes(bootsAction)){
        // Main-game diagnostic: real collision wall and actual surface consumer.
        const wall={minX:-3,maxX:3,minY:0,maxY:3,minZ:1.8,maxZ:2.2};
        controller.setWorld({...controller.world,spawn:{x:0,y:0,z:0},colliders:[...controller.world.colliders,wall]});
        const mesh=new THREE.Mesh(new THREE.BoxGeometry(6,3,.4),new THREE.MeshStandardMaterial({color:0x426a67}));
        mesh.position.set(0,1.5,2);scene.add(mesh);
      }
      const scytheAction=loadout.weapon==='deathscythe'?qaParams.get('action'):null;
      const demonicAction=loadout.weapon==='demonicknuckle'?qaParams.get('action'):null;
      const targetDistance=Number(qaParams.get('targetDistance'));
      if(qaParams.has('targetDistance')&&Number.isFinite(targetDistance)&&targetDistance>=0)combat.enemy.position.z=targetDistance;
      if(scytheAction==='strong'){
        const facing=Number(qaParams.get('targetFacing'));
        if(qaParams.has('targetFacing')&&Number.isFinite(facing))combat.enemy.facing=facing;
      }
      const scythePressed=new Set();
      const counterPressed=new Set();
      const vitalAction=loadout.weapon==='vitalshock'?qaParams.get('action'):null;
      const sigmaAction=loadout.weapon==='sigmablade'?qaParams.get('action'):null;
      if(loadout.weapon==='sigmablade')controller.sigmaTransformed=qaParams.get('sigmaForm')==='transformed';
      const batPressed=new Set();
      const sigmaPressed=new Set();
      if(counterAction==='air-reticle'||['air','air-heavy'].includes(twinAction)||['air','air-facing'].includes(batAction)||bootsAction==='air'||vitalAction==='air'||scytheAction==='air'||demonicAction==='air'){controller.position.y=4;controller.grounded=false;controller.coyote=0;combat.enemy.position.y=4;}
      if(loadout.weapon==='plasma'&&qaParams.get('action')==='air'){
        controller.position.y=3;controller.grounded=false;controller.coyote=0;
      }
      if(['air','air-alternate','air-steer','air-land-move'].includes(sigmaAction)){
        controller.position.y=sigmaAction==='air-alternate'?24:4;controller.grounded=false;controller.coyote=0;combat.enemy.position.y=controller.position.y;
      }
      // Convert the requested seconds to ms before counting10ms ticks:
      // .56/.01 rounds above56 and used to advance one extra QA tick.
      for(let i=0;i<Math.ceil(Math.min(3000,Number(qaParams.get('t')||.4)*1000)/10);i++){
        // Explicit Scythe contact QA keeps the target's requested heading;
        // the passive training actor otherwise turns toward the attacker.
        if(scytheAction==='strong'&&qaParams.has('targetFacing')&&Number.isFinite(Number(qaParams.get('targetFacing'))))combat.enemy.facing=Number(qaParams.get('targetFacing'));
        const twinHeavy=['charge','heavy','air-heavy'].includes(twinAction)||['heavy','spin','spin-critical'].includes(batAction)||['boost','boost-dash'].includes(bootsAction)||sigmaAction==='transform'||['rush','strongFollow'].includes(vitalAction)||scytheAction==='heavy'||demonicAction==='heavy';
        const scytheShort=scytheAction==='combo'&&controller.attack?.kind==='light'&&controller.attack.timeMs>=50&&!scythePressed.has(controller.attack);
        if(scytheShort)scythePressed.add(controller.attack);
        const counterShort=counterAction==='combo-fit'&&controller.attack?.kind==='light'&&controller.attack.comboIndex<3&&controller.attack.timeMs>=50&&!counterPressed.has(controller.attack);
        if(counterShort)counterPressed.add(controller.attack);
        const sigmaShort=sigmaAction==='combo'&&controller.attack&&controller.attack.timeMs>=50&&!sigmaPressed.has(controller.attack);
        if(sigmaShort)sigmaPressed.add(controller.attack);
        const batCriticalPress=batAction==='spin-critical'&&controller.attack&&controller.attack.timeMs>=320&&!batPressed.has(controller.attack);
        if(batCriticalPress)batPressed.add(controller.attack);
        const demonicSecond=demonicAction==='alternate'&&i===60;
        // Keep camera yaw fixed while the reticle changes between strikes.
        const counterAim=counterAction==='air-reticle'||(counterAction==='combo-reticle'&&i>=40)?Math.PI/2:0;
        const events=combat.tick(.01,{facing:(twinAction==='combo'&&i>=40)||batAction==='air-facing'?Math.PI/2:0,
          // Sigma diagnostic: right 0..150 ms, stop to250, left to350,
          // then release through landing. Real Controller/combat path.
          x:demonicAction==='light-move'||batAction==='light-move'||sigmaAction==='air-land-move'?1:sigmaAction==='air-steer'?(i<15?1:i<25?0:i<35?-1:0):0,z:0,
          aimTarget:counterAction?.endsWith('-reticle')?{x:controller.position.x+10*Math.sin(counterAim),y:1,z:controller.position.z+10*Math.cos(counterAim)}:undefined,
          lightPressed:bootsAction==='boost-dash'&&i===12,light:!rush&&!twinHeavy&&i===0,lightShort:!rush&&(!twinHeavy||(vitalAction==='strongFollow'&&i===40))&&bootsAction!=='strong'&&sigmaAction!=='strong'&&vitalAction!=='strong'&&scytheAction!=='strong'&&(i===0||sigmaShort||scytheShort||counterShort||demonicSecond||(sigmaAction==='air-alternate'&&i===60)||(counterAction==='combo-reticle'&&i===20)||(vitalAction==='strongFollow'&&i===40)||(twinAction==='combo'&&i===40)||(['combo','surface-combo'].includes(bootsAction)&&(i===40||i===120))),lightLong:(bootsAction==='strong'||sigmaAction==='strong'||vitalAction==='strong'||scytheAction==='strong')&&i===0,
          heavy:(rush||twinHeavy)&&(i===0||(batAction==='spin'&&i%10===0)||batCriticalPress),heavyHeld:twinHeavy&&(twinAction==='charge'||i<30),heavyReleased:twinAction==='heavy'&&i===30,
          jump:(batAction==='dodge-early'&&i===10)||(['jump-late','dodge-late'].includes(batAction)&&i===40),side:(batAction==='dodge-early'&&i===10)||(batAction==='dodge-late'&&i===40)?1:0});
        // animateAvatar owns the post-pose trail tick, just as in normal play.
        motionGraph.events(events);animateAvatar(.01);
      }
      const qaLowerPose=motionGraph.sample(controller,0);
      $('qa-readout').dataset.receivedReaction=JSON.stringify({weapon:loadout.weapon,sex:loadout.sex,clip:combat.avatar.clip,playback:combat.avatar.playbackTimes(),ageMs:combat.enemyState.age*1000,holdMs:combat.enemyState.hold*1000,reaction:combat.enemyState.reaction,serial:combat.enemyState.serial});
      $('qa-readout').dataset.combat=JSON.stringify({weapon:loadout.weapon,hp:combat.enemyState.hp,reaction:combat.enemyState.reaction,clip:avatar.clip,lowerClip:qaLowerPose.lower,lowerSpeed:qaLowerPose.lowerSpeed,lowerTime:avatar.playbackTimes().lower,upperTime:avatar.playbackTimes().upper,playerPosition:controller.position,playerVelocity:controller.velocity,grounded:controller.grounded,facing:controller.facing,attackKind:controller.attack?.kind,attackTimeMs:controller.attack?.timeMs,attackPhase:controller.attack?.phase,attackPhaseTimeMs:controller.attack?.phaseTimeMs,enemyPosition:combat.enemy.position,enemyVelocity:combat.enemy.velocity,attackHits:controller.attack?.hits??0,...(controller.attack?.scytheSecondImpact?{scytheSecondImpact:{...controller.attack.scytheSecondImpact},scytheCallbackTimeMs:controller.attack.scytheCallbackAttack?.timeMs??null,scytheCallbackHits:controller.attack.scytheCallbackAttack?.hits??0}:{}),transformed:controller.sigmaTransformed});
      yaw=Math.PI;cameraDirector.setMode('normal');
    }
    if(combat&&loadout.weapon==='katana'&&qaScenario==='katana-contact'){
      controller.reset();motionGraph.reset();combat.reset();combat.setMode('passive');
      // Keep the backward-travel QA pose clear of the arena's orange panel.
      const katanaQaX=['backdash','release'].includes(qaParams.get('action'))?-5:0;
      controller.position={x:katanaQaX,y:0,z:0};controller.facing=0;combat.enemy.position={x:katanaQaX,y:0,z:2};combat.enemy.facing=Math.PI;
      if(qaParams.get('action')==='air'){controller.position.y=3;controller.grounded=false;}
      for(let i=0;i<Math.ceil(Math.min(3,Number(qaParams.get('t')||.3))/.01);i++){
        const action=qaParams.get('action');
        const secondary=['backdash','release'].includes(action);
        const releaseTick=Number(qaParams.get('releaseTick')||40);
        const events=combat.tick(.01,{facing:0,lightShort:!['strong','backdash','release'].includes(action)&&(i===0||(action==='combo'&&(i===5||i===45))),lightLong:action==='strong'&&i===0,heavy:secondary&&i===0,heavyHeld:secondary&&(action==='backdash'||i<releaseTick),heavyReleased:action==='release'&&i===releaseTick});motionGraph.events(events);animateAvatar(.01);
      }
      $('qa-readout').dataset.combat=JSON.stringify({hp:combat.enemyState.hp,reaction:combat.enemyState.reaction,clip:avatar.clip,upperTime:avatar.playbackTimes().upper,attackKind:controller.attack?.kind,chargeMs:controller.attack?.chargeMs,fullCharge:controller.attack?.fullCharge,comboIndex:controller.attack?.comboIndex,attackPhase:controller.attack?.phase,attackPhaseTimeMs:controller.attack?.phaseTimeMs,playerPosition:controller.position});
      $('qa-readout').dataset.receivedReaction=JSON.stringify({weapon:loadout.weapon,sex:loadout.sex,clip:combat.avatar.clip,playback:combat.avatar.playbackTimes(),ageMs:combat.enemyState.age*1000,holdMs:combat.enemyState.hold*1000,reaction:combat.enemyState.reaction,serial:combat.enemyState.serial});
      yaw=Math.PI;cameraDirector.setMode('normal');
    }
    if(qaScenario==='down-damage'&&combat&&loadout.weapon==='plasma'){
      controller.reset();motionGraph.reset();combat.reset();combat.setMode('passive');
      controller.position={x:0,y:0,z:0};controller.facing=0;combat.enemy.position={x:0,y:0,z:1.59};combat.enemy.facing=Math.PI;
      const {runDownDamageQA}=await import('./down-damage-qa.js');
      const result=runDownDamageQA({combat,controller,followSeconds:Number(qaParams.get('t')||.15),step:input=>{const events=combat.tick(.01,input);motionGraph.events(events);animateAvatar(.01);}});
      $('qa-readout').dataset.downDamage=JSON.stringify(result);
      $('qa-readout').dataset.receivedReaction=JSON.stringify({clip:combat.avatar.clip,ageMs:combat.enemyState.age*1000,holdMs:combat.enemyState.hold*1000,stateId:combat.enemyState.blowReaction?.stateId,playback:combat.avatar.playbackTimes()});
      yaw=Math.PI;cameraDirector.setMode('normal');
    }
    if(qaScenario==='conquest-pawn-contact'){
      const {createConquestPawnContactQA}=await import('./conquest-pawn-contact-qa.js');
      conquestContactQA=await createConquestPawnContactQA({scene,world,controller,avatar,timeMs:Math.round(Number(qaParams.get('t')??.301)*1000)});
      await renderer.compileAsync(conquestContactQA.actor.model.group,camera,scene);
      $('qa-readout').dataset.conquestPawn=JSON.stringify(conquestContactQA.snapshot());
      window.addEventListener('pagehide',()=>conquestContactQA?.dispose(),{once:true});
    }
    poseBuffer.reset();
    $('welcome').hidden=true;$('qa-readout').hidden=false;
    if(qaParams.get('front')==='1')yaw=Math.PI;
    if(qaScenario==='mouse-orbit')yaw=controller.facing-Math.PI;
    if(combat&&qaParams.has('combatQA')){
      const mode=qaParams.get('combatQA');combat.enemy.position={x:1.4,y:0,z:5.5};combat.enemy.facing=0;
      combat.avatar.group.position.copy(combat.enemy.position);controller.facing=Math.PI;
      const attack={weapon:'plasma',kind:mode==='stun'?'air':'strong'};
      if(mode==='death')combat.enemyState.hp=1;
      combat.receive(combat.enemy,combat.enemyState,combat.avatar,controller,attack);
      for(let i=0;i<Math.round(Number(qaParams.get('effectTime')||.35)*120);i++){
        combat.enemyState.tick(1/120);combat.pose(combat.avatar,combat.enemy,combat.enemyState,1/120,combat.graph);combatEffects.update(1/120);
      }
      console.debug('combat-QA',JSON.stringify({mode,hp:combat.enemyState.hp,reaction:combat.enemyState.reaction,clip:combat.avatar.clip}));
    }
  }
    if(qaScenario&&qaParams.has('effectQA')){
      combatEffects.clear();combatEffects.play(qaParams.get('effectQA'),controller.position,avatar,{follow:true,facing:controller.facing});
      for(let i=0;i<Math.round(Number(qaParams.get('effectTime')||.2)*120);i++)combatEffects.update(1/120);
    }
    // Explicit local diagnostic surface for repeatable verification, never networked.
  window.airDagger={controller,get avatar(){return avatar;},scene,camera,renderer,weaponEffectSettings,get artisticEffects(){return combatEffects?.artState()??[];},...(qaScenario?{selectEffectWeapon:async weapon=>{if(!Object.hasOwn(WEAPON_CHOICES,weapon))throw Error('Unknown QA weapon');const bundle=await ensureWeaponBundle(weapon,preparedWeaponSkin(weapon));return {accepted:switchWeapon(weapon,{apply:true,bundle}),weapon};},replayWeaponEffects:options=>runWeaponEffectQa({controller,avatar,graph:motionGraph,effects:combatEffects,settings:weaponEffectSettings,trail:weaponTrail,poseBuffer,opponent:combat?.avatar,combat,audio,animate:animateAvatar},options)}:{}),get world(){return world;},get touchdown(){return touchdown;},get match(){return match;},get waitingRoom(){return waitingRoom;},get roomLifecycle(){return roomLifecycle.snapshot();},get weaponEffects(){return weaponEffectCache.snapshot();},get combatEffectSequences(){return combatEffects?.sequenceNames()??[];},get audio(){return audio;},get interfaceAudio(){return interfaceAudio.snapshot();},wallEffect,impactEffect,sprintEffect,setLab,get state(){return {active,lab,clip:avatar.clip,position:{...controller.position}};}};
  if(qaScenario==='practice-fx'&&gameMode==='practice'){const {installPracticeFxQA}=await import('./practice-fx-qa.js');const fixture=installPracticeFxQA({getSession:()=>match,setCamera:(position,target)=>{cameraDirector.setMode('free');cameraDirector.freeReady=true;cameraDirector.freePosition.copy(position);camera.position.copy(position);camera.lookAt(target);const rotation=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ');yaw=rotation.y;pitch=-rotation.x;updateCamera(0);}});window.addEventListener('pagehide',()=>fixture.dispose(),{once:true});}
  if(qaScenario==='modes'){const {installModesQA}=await import('./modes-qa.js');installModesQA({touchdown,match,combat,controller,world,avatar,chaserPresentation,roomEntry:qaParams.get('qaEntry')==='room',animate:animateAvatar,resetPose:()=>poseBuffer.reset(),startSession:()=>$('play').onclick()});}
  if(qaScenario==='primary-rifles'){const {installPrimaryRifleQA}=await import('./primary-rifle-qa.js');installPrimaryRifleQA({controller,combat,motionGraph,getAvatar:()=>avatar,getAudio:()=>audio,getEffects:()=>importedRifleEffects,animate:animateAvatar,resetPose:()=>poseBuffer.reset(),selectWeapon:weapon=>switchWeapon(weapon,{apply:true})});yaw=Math.PI;}
  syncWeaponLoadout(weaponLoadoutSlots.snapshot());
  if(weaponLoadoutError)toast('Saved loadout unavailable: '+weaponLoadoutError);
  initialPresentationReady=true;
  document.documentElement.dataset.startupReadyMs=String(performance.now());
  // The equipped loadout is already fully ready. Optional catalog variants no
  // longer hold the lobby hostage; retain every completed bundle in the cache.
  if(!touchMode&&(!qaScenario||qaParams.has('preloadEquipment'))){
   const status=document.createElement('small');status.id='equipment-library-status';status.className='s5-equipment-library-status';status.textContent='Caching resources…';
   entryShell.lobby.element.querySelector('.s5-lobby-profile-info')?.append(status);
   const enabled=[...$('weapon-select').options].filter(option=>!option.disabled).map(option=>option.value);
   equipmentSourcePrefetch=installEquipmentSourcePrefetch({plan:[...equipmentPreloadPlan(WEAPON_CHOICES,enabled),...CHARACTER_PRELOAD_PLAN],scope:{...loadout,appearance:qaParams.get('character')||'s5runtime'},onProgress:report=>{
    document.documentElement.dataset.equipmentSourcePreload=JSON.stringify(report);
    status.textContent=report.error?'Resources load on selection':report.completed===report.total?(report.failures.length?'Resources cached · some unavailable':'Resources cached'):'Caching resources · '+report.completed+'/'+report.total;
   }});
   const syncPrefetch=()=>{const paused=document.hidden||active||sessionBusy||$('welcome').hidden||!!entryShell.flow.snapshot().operation;equipmentSourcePrefetch.setPaused(paused);document.documentElement.dataset.equipmentPrefetchPaused=String(paused);};
   syncPrefetch();const prefetchTimer=setInterval(syncPrefetch,250);
   window.addEventListener('pagehide',event=>{if(!event.persisted){clearInterval(prefetchTimer);equipmentSourcePrefetch.dispose();}},{once:true});
  }
}).catch(error=>{$('load-status').textContent='Loading failed: '+error.message;throw error;});
