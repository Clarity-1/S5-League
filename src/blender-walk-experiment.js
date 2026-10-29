import * as THREE from 'three';
import {readAsset} from './scene-assets.js';
import {lowerBodyBoneNames} from './animation-data.js';
import {SPY_DAGGER_DIRECTIONS,SPY_DAGGER_LOCOMOTION} from './spy-dagger-data.js';

// Separate, removable presentation experiment. Never replace source clips.
export const BLENDER_WALK_ENABLED=true;
export const BLENDER_WALK_CLIP='BLENDER_WALK_FORWARD';
export const BLENDER_WALK_STYLE='blenderTrial';
export const BLENDER_BOLD_STYLE='blenderBold';
export const blenderBoldClip=direction=>'BLENDER_WALK_V2_'+direction.toUpperCase();
const authoredBones=new Set(['Bip01','Bip01 Pelvis','Bip01 Spine','Bip01 Spine1','Bip01 Spine2','Bip01 Neck','Bip01 Head',
  ...['L','R'].flatMap(side=>['Thigh','Calf','Foot','Toe0','Clavicle','UpperArm','Forearm','Hand'].map(part=>`Bip01 ${side} ${part}`))]);

export async function loadBlenderWalkExperiment(sex,bones,clips,reference){
  const data=await readAsset(`/assets/animations/blender-walk-experiment/${sex}.json`);
  return buildBlenderWalkExperiment(data,bones,clips,reference,sex);
}

export async function loadBlenderWalkExperiments(sex,bones,clips,reference){
  const [mild,bold]=await Promise.all([loadBlenderWalkExperiment(sex,bones,clips,reference),readAsset(`/assets/animations/blender-walk-experiment/bold-${sex}.json`)]);
  return [mild,...buildBlenderBoldWalks(bold,bones,clips,reference,sex)];
}

export function buildBlenderWalkExperiment(data,bones,clips,reference,sex){
  return buildWalkClip(data,bones,clips,reference,sex,{format:'s5-blender-walk-experiment-v1',name:BLENDER_WALK_CLIP,upper:'SN004',lower:'E0019'});
}

export function buildBlenderBoldWalks(bundle,bones,clips,reference,sex){
  if(bundle.format!=='s5-blender-walk-bold-bundle-v1'||bundle.sex!==sex||bundle.clips?.length!==8)throw Error('Invalid Blender V2 bundle');
  const directions=new Set();
  const authored=new Set();
  const result=bundle.clips.map(data=>{
    if(!SPY_DAGGER_DIRECTIONS.includes(data.direction)||authored.has(data.direction))throw Error('Unexpected Blender V2 direction');
    authored.add(data.direction);
    // Each clip was authored over an exact source pair. File it under the
    // direction that plays that pair now: the native mapping moved the four
    // diagonal pairs, so the authored diagonal labels are mirrored.
    const direction=SPY_DAGGER_DIRECTIONS.find(d=>data.source?.upper===SPY_DAGGER_LOCOMOTION.run[d]+':upper'&&data.source?.lower===SPY_DAGGER_LOCOMOTION.runLower[d]+':lower');
    if(!direction)throw Error('Blender V2 source mapping differs');
    if(directions.has(direction))throw Error('Unexpected Blender V2 direction');
    directions.add(direction);
    return buildWalkClip(data,bones,clips,reference,sex,{format:'s5-blender-walk-bold-clip-v1',authoredName:blenderBoldClip(data.direction),name:blenderBoldClip(direction),
      upper:SPY_DAGGER_LOCOMOTION.run[direction],lower:SPY_DAGGER_LOCOMOTION.runLower[direction]});
  });
  return result;
}

function buildWalkClip(data,bones,clips,reference,sex,source){
  if(data.format!==source.format||data.name!==(source.authoredName??source.name)||data.sex!==sex)throw Error('Invalid Blender walk experiment');
  const upper=clips.find(c=>c.name===source.upper),lower=clips.find(c=>c.name===source.lower);
  if(!upper||!lower||Math.abs(upper.duration-data.duration)>1e-6||Math.abs(lower.duration-data.duration)>1e-6)throw Error('Blender walk source duration mismatch');
  if(!data.times?.length||data.times[0]!==0||Math.abs(data.times.at(-1)-data.duration)>1e-6||
    !data.times.every((t,i)=>Number.isFinite(t)&&(!i||t>data.times[i-1])))throw Error('Invalid Blender walk timing');
  const lowerIds=new Set([...lowerBodyBoneNames(reference)].map(name=>bones.get(name)?.uuid));
  const tracks=new Map([...upper.tracks.filter(t=>!lowerIds.has(t.name.split('.')[0])),...lower.tracks.filter(t=>lowerIds.has(t.name.split('.')[0]))].map(t=>[t.name,t]));
  for(const [name,pose] of Object.entries(data.bones)){
    if(!authoredBones.has(name)||!bones.has(name))throw Error('Unexpected Blender walk bone '+name);
    for(const [property,Track,width] of [['position',THREE.VectorKeyframeTrack,3],['quaternion',THREE.QuaternionKeyframeTrack,4]]){
      if(pose[property]?.length!==data.times.length*width||!pose[property].every(Number.isFinite))throw Error('Invalid Blender walk track '+name+'/'+property);
      if(property==='quaternion')for(let i=0;i<pose[property].length;i+=4){if(Math.abs(Math.hypot(...pose[property].slice(i,i+4))-1)>.001)throw Error('Non-unit Blender walk quaternion');}
      const key=`${bones.get(name).uuid}.${property}`;tracks.set(key,new Track(key,data.times,pose[property]));
    }
  }
  const clip=new THREE.AnimationClip(source.name,data.duration,[...tracks.values()]);
  clip.userData={experimental:true,authoringTool:'Blender',sourceUpper:source.upper,sourceLower:source.lower,authoredName:data.name,validated:false};
  return clip;
}

export function withBlenderWalkPhase(sample,previous){
  const old=previous?.getClip();
  if(!old||old.name===sample.clip+':upper')return sample;
  const boldFront=blenderBoldClip('front');
  const walk=new Set(['SN004:upper','SMOOTH_WALK_SN004:upper',BLENDER_WALK_CLIP+':upper',boldFront+':upper']);
  if(!walk.has(old.name)||!walk.has(sample.clip+':upper'))return sample;
  if(![BLENDER_WALK_CLIP+':upper',boldFront+':upper'].includes(old.name)&&![BLENDER_WALK_CLIP,boldFront].includes(sample.clip))return sample;
  return {...sample,phase:previous.time/old.duration};
}
