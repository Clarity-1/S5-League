import {CAMERA_MODES,normalizeCameraMode} from './camera-director.js';
import {DASH_STYLES,normalizeDashStyle} from './dash-effect.js';
import {createSettingsCards} from './settings-cards.js';
import {installCharacterAppearanceSettings} from './character-appearance-settings.js';
import {RENDER_QUALITY,readRenderQuality,saveRenderQuality} from './render-quality.js';
import {FOV_RANGE,normalizeFov} from './camera-fov.js';

const KEY='s5.presentation.settings';
export const normalizeHudScale=value=>Math.max(.75,Math.min(2,Number.isFinite(Number(value))?Number(value):1));
export const normalizeWeaponPicker=value=>value!==false;
export function readPresentationSettings(){
 try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');return {hudScale:normalizeHudScale(value.hudScale),cameraMode:normalizeCameraMode(value.cameraMode),showWeaponPicker:normalizeWeaponPicker(value.showWeaponPicker),dashStyle:normalizeDashStyle(value.dashStyle),infiniteSp:value.infiniteSp===true,shadows:value.shadows!==false,fov:normalizeFov(value.fov??FOV_RANGE.default)};}
 catch{return {hudScale:1,cameraMode:'normal',showWeaponPicker:true,dashStyle:'temporal',infiniteSp:false,shadows:true,fov:FOV_RANGE.default};}
}

export function installPresentationSettings({onFov,onCameraMode,onWeaponPicker,onDashStyle,onInfiniteSp,onShadows,onRenderQuality}={}){
 const section=document.getElementById('graphics-settings'),grid=section?.querySelector('.graphics-grid');
 if(!grid)throw Error('Visual settings unavailable');
 section.querySelector('summary').textContent='Visual and camera settings';
 const settings=readPresentationSettings();
 section.querySelector('summary').innerHTML='<span>Settings</span><small>Graphics, camera, interface and training</small>';
 const character=installCharacterAppearanceSettings(section);
 const hudLabel=document.createElement('label');hudLabel.className='settings-range settings-range--hud';hudLabel.innerHTML='<span>HP / SP scale</span><output id="hud-scale-value"></output><input id="hud-scale" aria-label="HP / SP scale" type="range" min="0.75" max="2" step="0.05">';
 const hud=hudLabel.querySelector('input'),output=hudLabel.querySelector('output');
 // Vertical field of view; CFPSCamera default is 66 degrees.
 const fovLabel=document.createElement('label');fovLabel.className='settings-range settings-range--fov';fovLabel.innerHTML='<span>Field of view</span><output id="camera-fov-value"></output><input id="camera-fov" aria-label="Field of view" type="range">';
 const fov=fovLabel.querySelector('input'),fovOutput=fovLabel.querySelector('output');
 Object.assign(fov,{min:FOV_RANGE.min,max:FOV_RANGE.max,step:FOV_RANGE.step,value:settings.fov});
 const applyFov=()=>{settings.fov=normalizeFov(fov.value);fovOutput.value=settings.fov+'°'+(settings.fov===FOV_RANGE.default?' · default':'');onFov?.(settings.fov);save();};
 const applyHud=()=>{settings.hudScale=normalizeHudScale(hud.value);document.documentElement.style.setProperty('--hud-scale',settings.hudScale);output.value=Math.round(settings.hudScale*100)+' %';save();};
 const applyCamera=value=>{settings.cameraMode=normalizeCameraMode(value);onCameraMode?.(settings.cameraMode);save();};
 const applyPicker=value=>{settings.showWeaponPicker=value==='show';onWeaponPicker?.(settings.showWeaponPicker);save();};
 const applyDash=value=>{settings.dashStyle=normalizeDashStyle(value);onDashStyle?.(settings.dashStyle);save();};
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{}};
 const quality=createSettingsCards({id:'render-quality',title:'Render quality',description:'Controls resolution, shadow detail and post-processing. Applies immediately.',value:readRenderQuality(),onChange:value=>{saveRenderQuality(value);onRenderQuality?.(value);},options:[
  {value:'performance',label:'Performance',caption:'Lower GPU cost'},
  {value:'balanced',label:'Balanced',caption:'Recommended'},
  {value:'high',label:'High',caption:'Higher GPU cost'},
 ]});
 const shadows=createSettingsCards({id:'shadows',title:'Shadows',description:'Turn off shadows to reduce rendering cost.',value:settings.shadows?'on':'off',onChange:value=>{settings.shadows=value==='on';onShadows?.(settings.shadows);save();},options:[{value:'on',label:'On'},{value:'off',label:'Off'}]});
 const infiniteSp=createSettingsCards({id:'infinite-sp',title:'Infinite SP',description:'Train without spending SP · F4',value:settings.infiniteSp?'on':'off',onChange:value=>{settings.infiniteSp=value==='on';onInfiniteSp?.(settings.infiniteSp);save();},options:[{value:'off',label:'Off'},{value:'on',label:'On'}]});
 const camera=createSettingsCards({id:'camera-mode',title:'Camera',description:'Choose responsive tracking or smooth movement.',value:settings.cameraMode,onChange:applyCamera,options:Object.entries(CAMERA_MODES).map(([value,label])=>({value,label,caption:value==='normal'?'Responsive':value==='cinema'?'Smooth tracking':value==='free'?'Direct control':'Smooth free movement'}))});
 const dash=createSettingsCards({id:'dash-effect-style',title:'Dodge effect',description:'Choose a visual effect for each dodge.',value:settings.dashStyle,onChange:applyDash,options:Object.entries(DASH_STYLES).map(([value,label])=>({value,label}))});
 const picker=createSettingsCards({id:'weapon-picker-visibility',title:'Weapon picker',description:'Show weapon choices when switching quickly.',value:settings.showWeaponPicker?'show':'hide',onChange:applyPicker,options:[{value:'show',label:'Show',caption:'Visual feedback'},{value:'hide',label:'Hide',caption:'Clear view'}]});
 hud.value=settings.hudScale;grid.append(quality.element,shadows.element,infiniteSp.element,camera.element,dash.element,picker.element,hudLabel,fovLabel);
 const help=document.createElement('small');help.className='camera-help';help.textContent='Free camera: ZQSD/WASD to move, Space/E to rise, Ctrl/Q to descend, Shift to speed up.';section.append(help);
 const fitting=document.createElement('a');fitting.href='/weapon-fitting.html';fitting.target='_blank';fitting.rel='noopener';fitting.textContent='Meshy weapon fitting workshop ↗';fitting.style.cssText='display:block;margin:14px 0;color:#8fe1cd';section.append(fitting);
 hud.oninput=applyHud;applyHud();fov.oninput=applyFov;applyFov();onCameraMode?.(settings.cameraMode);onWeaponPicker?.(settings.showWeaponPicker);onDashStyle?.(settings.dashStyle);
 return {settings,hud,fov,character,camera:camera.control,picker:picker.control,dash:dash.control,setInfiniteSp:enabled=>infiniteSp.select(enabled?'on':'off')};
}
