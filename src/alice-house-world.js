import * as THREE from 'three';
import {sourceMapScale} from './s5runtime-coordinates.js';
import {TUNING} from './movement-profile.js';
import {COLLISION_SETTINGS,EllipsoidWorld} from './collision.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {installAliceHouseDestructibles} from './alice-house-destructibles.js';
import {loadAliceDestructionEffects} from './alice-destruction-effects.js';
import {fitDirectionalShadow,applyDirectionalShadowFit,proposeSourceShadowPolicy} from './alice-house-shadow.js';
import {loadAliceMeshyAssets,installAliceMeshyVisuals} from './alice-house-meshy.js';
import {loadAliceFloorFinish} from './alice-house-floor-finish.js';

const ASSET_ROOT='/assets/maps/alice-house/';
const SOURCE='model/background/alicehouse.scn';

import {nativeMapParentIndices as aliceHouseParentIndices,sourceGeometry,meshTriangles,verticalFloor,previewClearance} from './native-map-source-geometry.js';
export {nativeMapParentIndices as aliceHouseParentIndices} from './native-map-source-geometry.js';

/** Pure source-pose factory for geometry/physics QA; does not load artist pixels. */
export function createAliceHouseSourceWorld(source,{previewSpawnMarker='beta_spawn_pos_01',materialsForModel=null,hiddenSourceModelIndices=[],mirrorX=false}={}){
 if(source.source!==SOURCE||source.models?.length!==89||source.nodes?.length!==106||!Array.isArray(source.root?.matrix))throw Error('Alice main source contract mismatch');
 const root=new THREE.Group();root.name='Alice House';
 const boundary=new THREE.Group();boundary.name='Alice native unit boundary';boundary.scale.set(...sourceMapScale(false));root.add(boundary);
 const sourceRoot=new THREE.Group();sourceRoot.name=source.root.name;sourceRoot.matrix.fromArray(source.root.matrix);sourceRoot.matrixAutoUpdate=false;boundary.add(sourceRoot);
 const parentIndices=aliceHouseParentIndices(source),logicalNodes=[],sourceMeshes=[],movementMeshes=[],weaponMeshes=[],markers=[],geometries=[],ownedMaterials=new Set();
 const modelByNode=new Map(source.models.map((model,index)=>[model.sourceNodeIndex,{model,index}]));
 const hidden=new Set(hiddenSourceModelIndices);let disposed=false;
 try{
  for(const [nodeIndex,node] of source.nodes.entries()){
   const logical=new THREE.Object3D();logical.name=node.name;logical.matrix.fromArray(node.matrix);logical.matrixAutoUpdate=false;
   logical.userData={sourceNodeIndex:nodeIndex,nativeType:node.type,nativeParentName:node.parent,nativeParentIndex:parentIndices[nodeIndex]};
   (parentIndices[nodeIndex]<0?sourceRoot:logicalNodes[parentIndices[nodeIndex]]).add(logical);logicalNodes.push(logical);
   if(node.type!=='ModelData'){
    markers.push({source:SOURCE,nodeIndex,type:node.type,name:node.name,parent:node.parent,matrix:[...node.matrix],object:logical});continue;
   }
   const entry=modelByNode.get(nodeIndex);if(!entry||entry.model.name!==node.name||entry.model.parent!==node.parent||JSON.stringify(entry.model.matrix)!==JSON.stringify(node.matrix))throw Error('Alice source node/model identity mismatch');
   const {model,index}=entry;if(!model.vertices.length)continue;
   const geometry=sourceGeometry(model);geometries.push(geometry);
   const octree=/^oct_/i.test(model.name),weapon=/^oct_weapon/i.test(model.name);
   let materials;
   if(!octree&&materialsForModel)materials=materialsForModel(model,index);
   else{
    const material=new THREE.MeshBasicMaterial({color:octree?0x777777:0xcccccc,side:THREE.DoubleSide});ownedMaterials.add(material);
    materials=Array(Math.max(1,model.textures.length)).fill(material);
   }
   if(!Array.isArray(materials)||materials.length!==Math.max(1,model.textures.length)||materials.some(material=>!material?.isMaterial))throw Error('Alice material slots unresolved: '+model.name);
   const mesh=new THREE.Mesh(geometry,materials);mesh.name=model.name;mesh.matrixAutoUpdate=false;
   mesh.userData={source:SOURCE,sourceModelIndex:index,sourceNodeIndex:nodeIndex,nativeMatrix:[...model.matrix],nativeParentIndex:parentIndices[nodeIndex],collision:octree&&!weapon,weaponCollisionCandidate:weapon};
   mesh.visible=!octree&&!/occlusion|sector/i.test(model.name)&&!hidden.has(index);logical.add(mesh);sourceMeshes.push(mesh);
   if(octree&&!weapon)movementMeshes.push(mesh);if(weapon)weaponMeshes.push(mesh);
  }
  root.updateMatrixWorld(true);
  // Presentation reflection is applied after the authenticated local hierarchy,
  // at the unit boundary. Source attributes, indices and native matrices stay raw.
  const groundMesh=sourceMeshes.find(mesh=>mesh.userData.sourceModelIndex===1);
  if(groundMesh?.name!=='oct_land_ground')throw Error('Alice orientation ground identity mismatch');
  const orientationBounds=new THREE.Box3(),groundPositions=groundMesh.geometry.attributes.position;
  for(let i=0;i<groundPositions.count;i++)orientationBounds.expandByPoint(new THREE.Vector3().fromBufferAttribute(groundPositions,i).applyMatrix4(groundMesh.matrixWorld));
  const pivotX=(orientationBounds.min.x+orientationBounds.max.x)/2,presentationMatrix=new THREE.Matrix4();
  if(mirrorX){
   presentationMatrix.makeTranslation(2*pivotX,0,0).multiply(new THREE.Matrix4().makeScale(-1,1,1));
   boundary.updateMatrix();boundary.matrix.premultiply(presentationMatrix);boundary.matrixAutoUpdate=false;root.updateMatrixWorld(true);
  }
  const mapOrientation={mirrorX:!!mirrorX,pivotX,matrix:presentationMatrix.toArray(),
   pivotSource:{source:SOURCE,sourceModelIndex:1,name:groundMesh.name,unmirroredWorldBounds:{min:orientationBounds.min.toArray(),max:orientationBounds.max.toArray()},policy:'Center X of all source ground vertices after native local hierarchy and .006 unit boundary; before reflection.'}};
  // Audited profile bginfo-alicehouse.ini[STATIC] object_2=alicehouse.scn,
  // lines117..120: this source belongs to main root1A0. Current native
  // octree admission/enable and runtime placement remain separate gates.
  const nativeCollisionOwner='main-static-root1A0';
  const movement=meshTriangles(movementMeshes,SOURCE,{nativeCollisionOwner}),weapon=meshTriangles(weaponMeshes,SOURCE,{nativeCollisionOwner});
  if(mirrorX)for(const extracted of [movement,weapon])for(const [index,record] of extracted.records.entries()){
   // Reflection reverses handedness. Only the derived query winding changes:
   // upward floors remain upward and source triangle IDs retain their provenance.
   [record.points[1],record.points[2]]=[record.points[2],record.points[1]];
   [record.sourceVertexIndices[1],record.sourceVertexIndices[2]]=[record.sourceVertexIndices[2],record.sourceVertexIndices[1]];
   record.normal.negate();extracted.triangles[index]=record.points.map(point=>point.toArray());
  }
  const radii=new THREE.Vector3(TUNING.radius,TUNING.height/2,TUNING.radius),rejectedQueryTriangles=[],queryRecords=[];
  for(const record of movement.records){
   const [a,b,c]=record.points.map(point=>point.clone().divide(radii));
   const crossLengthSq=b.sub(a).cross(c.sub(a)).lengthSq();
   if(crossLengthSq<COLLISION_SETTINGS.epsilon**2)rejectedQueryTriangles.push({sourceModelIndex:record.sourceModelIndex,sourceNodeIndex:record.sourceNodeIndex,
    triangleIndex:record.triangleIndex,sourceVertexIndices:record.sourceVertexIndices,points:record.points.map(point=>point.toArray()),
    ellipsoidSpaceCrossLengthSq:crossLengthSq,solverThresholdSq:COLLISION_SETTINGS.epsilon**2,
    reason:'Current S5 collision.triangle rejects this ellipsoid-space face; exact source retained. Native edge semantics remain unverified.'});
   else queryRecords.push(record);
  }
  if(JSON.stringify(rejectedQueryTriangles.map(record=>[record.sourceModelIndex,record.triangleIndex]))!==JSON.stringify([[1,708],[1,1053]]))throw Error('Alice solver compatibility rejection set changed');
  const queryTriangles=queryRecords.map(record=>record.points.map(point=>point.toArray()));
  // Offline native proof: mode 8 identity comparison at 62FD9C..62FE81,
  // mask reset/add at 62FEE6/62FF5E/62FFC1 -> 9861A0 -> 7B0AE0.
  // Category registration 706F01..70736F maps oct_block_alpha to 0x80000.
  // This qualifies only that role/category selection, not the full native solver.
  const roleBarrierRecords=queryRecords.filter(record=>record.sourceModelIndex===11&&record.sourceNodeIndex===25);
  if(source.models[11].name!=='oct_block_alpha'||roleBarrierRecords.length!==8||roleBarrierRecords.some((record,index)=>record.triangleIndex!==index))throw Error('Alice native role barrier identity mismatch');
  const chaserTriangles=queryTriangles.filter((_,index)=>!(queryRecords[index].sourceModelIndex===11&&queryRecords[index].sourceNodeIndex===25));
  const actorRoles=new WeakMap(),actorCollisionViews=new WeakMap();
  const requireActor=actor=>{if(!actor||(typeof actor!=='object'&&typeof actor!=='function'))throw TypeError('Alice collision role requires an explicit actor object');};
  function collisionWorldForActor(actor){
   requireActor(actor);
   let view=actorCollisionViews.get(actor);
   if(!view){
    view=Object.create(world);
    Object.defineProperty(view,'triangles',{enumerable:true,get:()=>actorRoles.get(actor)==='chaser'?chaserTriangles:queryTriangles});
    actorCollisionViews.set(actor,view);
   }
   return view;
  }
  function setActorCollisionRole(actor,role){
   requireActor(actor);
   if(role!==null&&role!=='chaser'&&role!=='survivor')throw TypeError('Unknown Alice actor collision role');
   if(role===null)actorRoles.delete(actor);else actorRoles.set(actor,role);
   return collisionWorldForActor(actor);
  }
  const solver=new EllipsoidWorld({triangles:queryTriangles,colliders:[]},{x:radii.x,y:radii.y,z:radii.z});
  const ground=new Set(movementMeshes.filter(mesh=>mesh.name==='oct_land_ground').map(mesh=>mesh.userData.sourceModelIndex));
  const groundRecords=queryRecords.filter(record=>ground.has(record.sourceModelIndex));
  const spawnCandidates=[];
  for(const marker of markers.filter(marker=>/^(?:alpha|beta)_spawn_pos_\d+$/i.test(marker.name))){
   const point=marker.object.getWorldPosition(new THREE.Vector3()),floor=verticalFloor(point,groundRecords);
   if(!floor){spawnCandidates.push({name:marker.name,nodeIndex:marker.nodeIndex,markerPoint:point.toArray(),qualified:false,reason:'No downward source terrain support'});continue;}
   const position={...floor.point,y:floor.point.y+COLLISION_SETTINGS.snapBase},clearance=previewClearance(position,queryRecords);
   const sourcePosition={x:point.x,y:point.y,z:point.z};
   const sourceClearance=previewClearance(sourcePosition,queryRecords);
   const sourceSettle=solver.move({x:point.x,y:point.y+radii.y,z:point.z},{x:0,y:floor.point.y-point.y-COLLISION_SETTINGS.snapBase*2,z:0},{stopOnGround:true});
   const sourcePoseQualification={clearance:sourceClearance,groundSupportObserved:sourceSettle.contacts.some(contact=>contact.groundSupport),
    settleExhausted:sourceSettle.exhausted,settledFoot:{x:sourceSettle.position.x,y:sourceSettle.position.y-radii.y,z:sourceSettle.position.z},
    passed:sourceClearance.passed&&!sourceSettle.exhausted&&sourceSettle.contacts.some(contact=>contact.groundSupport),
    policy:'Raw authored marker Y preserved; current S5 body clearance and downward settle are separate checks, not a native floor projection.'};
   const facing=new THREE.Vector3().setFromMatrixColumn(marker.object.matrixWorld,2);facing.y=0;
   if(facing.lengthSq()<1e-12)throw Error('Alice spawn has no horizontal source Box-Z facing: '+marker.name);facing.normalize();
   const settle=solver.move({x:position.x,y:position.y+radii.y,z:position.z},{x:0,y:-COLLISION_SETTINGS.snapBase*2,z:0},{stopOnGround:true});
   const solverQualification={constructedWithCurrentRadii:true,queriedTriangleCount:queryTriangles.length,
    groundSupportObserved:settle.contacts.some(contact=>contact.groundSupport),settleExhausted:settle.exhausted,
    settledFoot:{x:settle.position.x,y:settle.position.y-radii.y,z:settle.position.z},
    passed:!settle.exhausted&&settle.contacts.some(contact=>contact.groundSupport)};
   spawnCandidates.push({name:marker.name,nodeIndex:marker.nodeIndex,markerPoint:point.toArray(),sourcePosition:Object.freeze(sourcePosition),sourceDirection:Object.freeze({x:facing.x,y:0,z:facing.z}),sourcePoseQualification,position,
    floor:{point:floor.point,sourceModelIndex:floor.record.sourceModelIndex,sourceNodeIndex:floor.record.sourceNodeIndex,triangleIndex:floor.record.triangleIndex,sourceVertexIndices:floor.record.sourceVertexIndices,barycentric:floor.barycentric,normal:floor.record.normal.toArray()},
    previewFloorMargin:COLLISION_SETTINGS.snapBase,clearance,solverQualification,qualified:clearance.passed&&solverQualification.passed,
    reason:clearance.passed?'Authenticated marker projected to source terrain; preview volume clear':'Source terrain found but current preview volume intersects geometry'});
  }
  const survivorSpawns=spawnCandidates.filter(candidate=>/^alpha_spawn_pos_\d+$/.test(candidate.name)).sort((a,b)=>a.name.localeCompare(b.name));
  const chaserSpawns=spawnCandidates.filter(candidate=>candidate.name==='beta_spawn_pos_01');
  if(survivorSpawns.length!==6||chaserSpawns.length!==1)throw Error('Alice native role spawn set changed');
  // Free exploration starts outside the gated Chaser room. This is an explicit
  // S5 terrain point, independently qualified against the unchanged source query;
  // it never replaces the authenticated match spawn groups or factory default.
  const trainingFloor=verticalFloor(new THREE.Vector3(8.8,14,-27.5).applyMatrix4(presentationMatrix),groundRecords);
  const trainingPosition=trainingFloor?{...trainingFloor.point,y:trainingFloor.point.y+COLLISION_SETTINGS.snapBase}:null;
  const trainingClearance=trainingPosition?previewClearance(trainingPosition,queryRecords):null;
  const trainingSettle=trainingPosition?solver.move({x:trainingPosition.x,y:trainingPosition.y+radii.y,z:trainingPosition.z},{x:0,y:-COLLISION_SETTINGS.snapBase*2,z:0},{stopOnGround:true}):null;
  const trainingSpawn={position:trainingPosition?Object.freeze(trainingPosition):null,facing:0,
   qualified:!!trainingClearance?.passed&&!trainingSettle?.exhausted&&!!trainingSettle?.contacts.some(contact=>contact.groundSupport),
   floor:trainingFloor?{point:trainingFloor.point,sourceModelIndex:trainingFloor.record.sourceModelIndex,sourceNodeIndex:trainingFloor.record.sourceNodeIndex,triangleIndex:trainingFloor.record.triangleIndex,barycentric:trainingFloor.barycentric}:null,
   clearance:trainingClearance,groundSupportObserved:!!trainingSettle?.contacts.some(contact=>contact.groundSupport),
   policy:'S5 free-training exploration point (8.8,refY14,-27.5), downward source terrain plus snapBase and current Controller clearance/settle. Not a native match spawn.'};
  function spawnForRole(role,{index=0,placement='source'}={}){
   if(role!=='chaser'&&role!=='survivor')return null;
   if(!Number.isInteger(index)||index<0)throw TypeError('Alice spawn index must be a nonnegative integer');
   if(placement!=='source'&&placement!=='preview-floor')throw TypeError('Unknown Alice spawn placement');
   const candidates=role==='chaser'?chaserSpawns:survivorSpawns,selectedIndex=index%candidates.length,candidate=candidates[selectedIndex];
   if(!candidate?.qualified||!candidate.sourcePoseQualification?.passed)throw Error('Alice role spawn failed source/preview body qualification');
   return Object.freeze({role,markerName:candidate.name,sourceNodeIndex:candidate.nodeIndex,index:selectedIndex,requestedIndex:index,placement,
    position:Object.freeze({... (placement==='source'?candidate.sourcePosition:candidate.position)}),direction:Object.freeze({...candidate.sourceDirection}),
    sourcePosition:candidate.sourcePosition,previewFloorPosition:Object.freeze({...candidate.position}),
    nativeRoleGroupQualified:true,nativeSpawnIndexSelectionCertified:false,nativeFootConventionCertified:false,
    selectionPolicy:'S5 deterministic ordinal modulo authenticated role marker count; native state+0x118 producer/order is not certified.',
    placementPolicy:placement==='source'?'Raw source marker Y; native getter71A550 and actor setter51CCD0 do not project to terrain in this path.':'Explicit S5 source-terrain floor projection plus snapBase; not native placement.',
    facingPolicy:'Horizontal normalized source Box Z axis, matching native virtual+0x30 at718470.',
    qualification:candidate.sourcePoseQualification});
  }
  const selected=spawnCandidates.find(candidate=>candidate.name===previewSpawnMarker&&candidate.qualified),bounds=new THREE.Box3();
  for(const record of movement.records)for(const point of record.points)bounds.expandByPoint(point);
  const degenerateCollisionTriangles=movement.records.filter(record=>record.normal.lengthSq()===0).length;
  const target=new THREE.Group();target.name='Alice S5 preview target adapter';target.visible=false;target.userData.sourceGeometry=false;root.add(target);
  const world={root,group:root,name:'Alice House',nativeMapId:225,sourceData:source,boundary,sourceRoot,logicalNodes,parentIndices,sourceMeshes,visualMeshes:sourceMeshes.filter(mesh=>mesh.visible),
   nativeCollisionSources:[{source,parentIndices,requiredModelIndices:[...movementMeshes,...weaponMeshes].map(mesh=>mesh.userData.sourceModelIndex),
    readRecords:()=>disposed?null:[...movement.records,...weapon.records],active:()=>!disposed}],
   target,presentationMatrix,mapOrientation,
   collisionWorldForActor,setActorCollisionRole,spawnForRole,trainingSpawn,
   actorCollisionPolicy:{nativeActorMaskQualified:true,scope:'Alice Chaser mode 8: current Chaser account selects 0x100000; other actors select 0x80000. Only the eight authenticated oct_block_alpha faces differ in this scene.',
    roleSource:'Explicit combat-match assignment; never inferred from names, colors, team or actor position.',unknownRole:'Conservative full S5 movement query',
    category:'0x80000',sourceModelIndex:11,sourceNodeIndex:25,triangleIndices:roleBarrierRecords.map(record=>record.triangleIndex),
    survivorQueryTriangleCount:queryTriangles.length,chaserQueryTriangleCount:chaserTriangles.length,
    proof:'work/s5runtime-map-native-adaptation/alice-house-role-destruction-audit/contract.json',nativeSolverParityCertified:false},
   meshes:movementMeshes,movementMeshes,colliders:[],triangles:queryTriangles,sourceMovementTriangles:movement.triangles,movementTriangleRecords:movement.records,queryTriangleRecords:queryRecords,rejectedQueryTriangles,
   weaponCollisionMeshes:weaponMeshes,weaponTriangles:weapon.triangles,weaponTriangleRecords:weapon.records,weaponCollisionCandidates:weaponMeshes.map(mesh=>({sourceModelIndex:mesh.userData.sourceModelIndex,sourceNodeIndex:mesh.userData.sourceNodeIndex,name:mesh.name,category:'0x40'})),
   markers,spawnCandidates,qualifiedSpawnCandidates:spawnCandidates.filter(candidate=>candidate.qualified),spawn:selected?{...selected.position}:null,
   spawnSelection:{requestedMarker:previewSpawnMarker,selectedMarker:selected?.name??null,selectionNativeVerified:false,
    reason:previewSpawnMarker==='beta_spawn_pos_01'?'Authenticated beta01 preview anchor has source-floor/body clearance and supports the current createCombatMatch Chaser/bot placement checks. No team decoration is inferred.':'Explicit caller-selected authenticated marker; player-volume checks only. Chaser/bot placement QA applies to beta01.',
    policy:'Explicit S5 Chaser preview marker plus source terrain projection and current-controller clearance; native Chaser selector unverified.'},
   readyForController:!!selected,readyForChaserPreview:!!selected&&previewSpawnMarker==='beta_spawn_pos_01',spawnSelectionVerified:false,selectionNativeVerified:false,selectedSpawnMarkerName:selected?.name??null,nativeReady:false,
   bounds,deathY:bounds.min.y-TUNING.height*2,degenerateCollisionTriangles,
   qualification:{staticRawLocalAuthoringPose:true,nativeRuntimePlacementCertified:false,nativeChaserSpawnSelectorCertified:false,
    nativeCollisionMasksCertified:false,nativeActorMaskQualified:true,nativeCollisionExhaustivenessCertified:false,weaponQueriesConsumeSeparateCandidates:false,
    alphaBetaWayfindingRequired:false,mode:'Chaser',collisionPolicy:'S5 movement convention oct_ except oct_weapon; weapon category retained separately, not automatically queried by Controller.'},
   update(){/* Static authoring pose; native clip selection and destructibles are not simulated here. */},
   dispose(){if(disposed)return;disposed=true;root.removeFromParent();for(const geometry of geometries)geometry.dispose();for(const material of ownedMaterials)material.dispose();}};
  return world;
 }catch(error){root.removeFromParent();for(const geometry of geometries)geometry.dispose();for(const material of ownedMaterials)material.dispose();throw error;}
}

async function readAliceJson(file){
 if(!/^[a-z0-9-]+\.json$/i.test(file))throw Error('Unexpected Alice data file');
 const response=await fetch(ASSET_ROOT+file);if(!response.ok)throw Error('Alice asset unavailable: '+file);return response.json();
}

const artistColor=value=>Array.isArray(value)?new THREE.Color().fromArray(value):new THREE.Color(value);
function addArtistLights(root,config,presentationMatrix){
 const group=new THREE.Group();group.name='Alice artist lights / Three scene units';root.add(group);
 if(config.ambient)group.add(new THREE.AmbientLight(artistColor(config.ambient.color),config.ambient.intensity));
 if(config.hemisphere)group.add(new THREE.HemisphereLight(artistColor(config.hemisphere.skyColor),artistColor(config.hemisphere.groundColor),config.hemisphere.intensity));
 for(const entry of config.directional??[]){
  const light=new THREE.DirectionalLight(artistColor(entry.color),entry.intensity);light.name=entry.name??'Alice artist directional';light.position.fromArray(entry.position);
  light.position.applyMatrix4(presentationMatrix);light.target.position.fromArray(entry.target).applyMatrix4(presentationMatrix);group.add(light.target);group.add(light);
 }
 if(config.area?.length)RectAreaLightUniformsLib.init();
 for(const entry of config.area??[]){
  const light=new THREE.RectAreaLight(artistColor(entry.color),entry.intensity,entry.width,entry.height);light.name=entry.name??'Alice artist area';light.position.fromArray(entry.position).applyMatrix4(presentationMatrix);light.lookAt(new THREE.Vector3().fromArray(entry.target).applyMatrix4(presentationMatrix));group.add(light);
 }
 return group;
}

function configureAliceTextureRendering(world,artist,textures){
 const rendering=artist.runtimeRendering;if(!rendering)return;
 // Toon actors do not consume the map's PBR environment or RectArea lights.
 // Keep a diffuse floor for covered rooms, owned by this map so switching
 // maps cannot leave the fill behind or alter the global light settings.
 if(rendering.diffuseFill){
  const fill=rendering.diffuseFill,light=new THREE.HemisphereLight(artistColor(fill.skyColor),artistColor(fill.groundColor),fill.intensity);
  light.name='Alice diffuse fill';light.userData.aliceRuntimeDiffuseFill=true;world.localLights.add(light);
 }
 for(const mesh of world.sourceMeshes){
  const entries=artist.materials.filter(entry=>entry.sourceModelIndex===mesh.userData.sourceModelIndex);
  const policy=proposeSourceShadowPolicy(mesh,entries);mesh.castShadow=policy.castShadow;mesh.receiveShadow=policy.receiveShadow;
 }
 for(const light of world.localLights.children){
  if(light.isDirectionalLight&&rendering.sunShadows){
   const fit=fitDirectionalShadow(world.sourceMeshes,light,rendering.sunShadows);applyDirectionalShadowFit(light,fit);light.userData.aliceShadowFit=fit;
  }
  if(light.isRectAreaLight&&Number.isFinite(rendering.areaIntensityScale))light.intensity*=rendering.areaIntensityScale;
 }
 world.applyTextureFiltering=renderer=>{
  const maximum=renderer.capabilities?.getMaxAnisotropy?.()??1,anisotropy=Math.max(1,Math.min(rendering.textureAnisotropy??1,maximum));
  for(const texture of textures.values())if(texture.mapping!==THREE.EquirectangularReflectionMapping&&texture.anisotropy!==anisotropy){texture.anisotropy=anisotropy;texture.needsUpdate=true;}
  return anisotropy;
 };
}

/** Render retained S5Runtime structure with Blender-authored materials and Meshy replacements. */
export async function loadAliceHouseWorld(scene,{previewSpawnMarker='beta_spawn_pos_01',meshy=true,mirrorX=true,floors=true}={}){
 if(!scene?.isObject3D)throw Error('Alice requires an explicit Three scene');
 const manifest=await readAliceJson('geometry-manifest.json');
 if(manifest.schema!=='alice-house-main-source-runtime-v1'||manifest.source!==SOURCE||manifest.nativeMapId!==225||manifest.scene!=='source.json')throw Error('Alice geometry manifest contract mismatch');
 const [source,artist,destructibles]=await Promise.all([readAliceJson(manifest.scene),readAliceJson(manifest.artistConfig),readAliceJson(manifest.destructibles)]);
 if(artist.schema!=='alice-house-artist-runtime-v1'||artist.source!==SOURCE||!Array.isArray(artist.materials))throw Error('Alice artist configuration mismatch');
 const textureEntries=new Map(),textures=new Map(),materials=new Map(),slots=new Map();let world=null,disposed=false,presentation=null,mapObjects=null,mapEffects=null,meshyBundle=null,meshyAppearance=null,floorFinish=null;
 const textureKey=(url,role,flipY)=>[url,role,flipY].join('|');
 function requireTexture(url,role,flipY){
  if(!url)return null;
  if(!url.startsWith(ASSET_ROOT+'textures/')||!url.endsWith('.png')||url.includes('..'))throw Error('Unexpected Alice artist texture URL');
  const key=textureKey(url,role,flipY);textureEntries.set(key,{url,role,flipY});return key;
 }
 for(const entry of artist.materials){
  const id=`${entry.sourceModelIndex}:${entry.slot}`;if(slots.has(id))throw Error('Duplicate Alice artist slot: '+id);
  slots.set(id,{...entry,colorKey:requireTexture(entry.colorTexture,'color',entry.textureFlipY!==false),alphaKey:requireTexture(entry.alphaTexture,'alpha',entry.alphaTextureFlipY!==false),aoKey:requireTexture(entry.ambientOcclusionTexture,'ao',true)});
 }
 const backgroundKey=artist.background?.url?requireTexture(artist.background.url,'background',true):null;
 function restorePresentation(){
  if(!presentation)return;
  const saved=presentation;presentation=null;
  for(const [light,intensity] of saved.lights)light.intensity=intensity;
  saved.renderer.toneMapping=saved.toneMapping;saved.renderer.toneMappingExposure=saved.exposure;
  saved.scene.background=saved.background;saved.scene.environment=saved.environment;saved.scene.fog=saved.fog;
  saved.scene.backgroundIntensity=saved.backgroundIntensity;saved.scene.environmentIntensity=saved.environmentIntensity;
  saved.scene.backgroundRotation.copy(saved.backgroundRotation);saved.scene.environmentRotation.copy(saved.environmentRotation);
 }
 function dispose(){
  if(disposed)return;disposed=true;mapObjects?.dispose();if(!mapObjects)mapEffects?.dispose();restorePresentation();floorFinish?.dispose();meshyAppearance?.dispose();if(!meshyAppearance)meshyBundle?.dispose();world?.localLights?.traverse(object=>{if(object.isLight)object.dispose?.();});world?.disposeSourceGeometry();
  for(const material of materials.values())material.dispose();for(const texture of textures.values())texture.dispose();
 }
 try{
  const loader=new THREE.TextureLoader();
  const results=await Promise.allSettled([...textureEntries].map(async ([key,entry])=>{
   const texture=await loader.loadAsync(entry.url);texture.flipY=entry.flipY;texture.colorSpace=['alpha','ao'].includes(entry.role)?THREE.NoColorSpace:THREE.SRGBColorSpace;
   if(entry.role==='background')texture.mapping=THREE.EquirectangularReflectionMapping;
   else if(entry.role==='ao'){texture.channel=1;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;}
   else texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
   textures.set(key,texture);
  }));
  const failure=results.find(result=>result.status==='rejected');if(failure)throw failure.reason;
  function materialsForModel(model,index){
   return model.textures.map((native,slotIndex)=>{
    const entry=slots.get(`${index}:${slotIndex}`);if(!entry||entry.renderState!==model.renderState||!entry.colorKey)throw Error('Alice artist slot missing or source mismatch: '+index+':'+slotIndex);
    const key=JSON.stringify([entry.signature,entry.renderState,entry.colorKey,entry.alphaKey,entry.aoKey,entry.ambientOcclusionIntensity,entry.roughness,entry.metallic,entry.opacity,entry.side,entry.transparent,entry.alphaTest,entry.depthWrite]);
    if(materials.has(key))return materials.get(key);
    const material=new THREE.MeshStandardMaterial({map:textures.get(entry.colorKey),alphaMap:entry.alphaKey?textures.get(entry.alphaKey):null,
     aoMap:entry.aoKey?textures.get(entry.aoKey):null,aoMapIntensity:entry.ambientOcclusionIntensity??1,
     roughness:entry.roughness,metalness:entry.metallic,opacity:entry.opacity??1,transparent:entry.transparent===true,
     alphaTest:entry.alphaTest??0,depthWrite:entry.depthWrite!==false,side:entry.side==='double'?THREE.DoubleSide:THREE.FrontSide});
    material.name=entry.materialName??'Alice artist material';material.userData={sourceModelIndex:index,sourceSlot:slotIndex,sourceRenderState:model.renderState,artistSignature:entry.signature,
     qualification:'Approved Blender-v3 Principled appearance, not automatic native render-state shader emulation; native colored lightmap unlinked; optional neutral floor AO uses unchanged source UV1.'};
    materials.set(key,material);return material;
   });
  }
  world=createAliceHouseSourceWorld(source,{previewSpawnMarker,materialsForModel,hiddenSourceModelIndices:artist.hiddenSourceModelIndices??[],mirrorX});
  world.disposeSourceGeometry=world.dispose;
  world.artistConfig=artist;world.localLights=addArtistLights(world.root,artist.lighting??{},world.presentationMatrix);
  configureAliceTextureRendering(world,artist,textures);
  if(meshy){meshyBundle=await loadAliceMeshyAssets();meshyAppearance=installAliceMeshyVisuals(world,meshyBundle);}
  if(floors){
   floorFinish=await loadAliceFloorFinish(world);
   const filterSourceTextures=world.applyTextureFiltering;
   world.applyTextureFiltering=renderer=>{const level=filterSourceTextures?.(renderer);floorFinish.filter(renderer);return level;};
  }
  mapEffects=await loadAliceDestructionEffects(world.root,{playSound:({url})=>mapObjects?.playSound(url)});
  mapObjects=installAliceHouseDestructibles(world,destructibles,{effects:mapEffects});
  const sourceUpdate=world.update;world.update=dt=>{sourceUpdate?.(dt);mapObjects.updateEffects(dt);};world.renderMapObjects=camera=>mapObjects.render(camera);
  world.restorePresentation=()=>{mapObjects.clearPresentation();restorePresentation();};
  world.applyPresentation=({renderer,scene:targetScene=scene,sun}={})=>{
   if(!renderer)throw Error('Alice presentation requires the active renderer');restorePresentation();
   world.applyTextureFiltering?.(renderer);
   meshyAppearance?.filter(renderer);
   const lights=[];targetScene.traverse(object=>{
    if(!object.isHemisphereLight)return;
    for(let parent=object;parent;parent=parent.parent)if(parent===world.root)return;
    lights.push([object,object.intensity]);object.intensity=0;
   });
   if(sun?.isLight&&!lights.some(([light])=>light===sun)){lights.push([sun,sun.intensity]);sun.intensity=0;}
   presentation={renderer,scene:targetScene,lights,toneMapping:renderer.toneMapping,exposure:renderer.toneMappingExposure,
    background:targetScene.background,environment:targetScene.environment,fog:targetScene.fog,backgroundIntensity:targetScene.backgroundIntensity,environmentIntensity:targetScene.environmentIntensity,
    backgroundRotation:targetScene.backgroundRotation.clone(),environmentRotation:targetScene.environmentRotation.clone()};
   if(artist.presentation?.toneMapping==='AgX')renderer.toneMapping=THREE.AgXToneMapping;
   if(Number.isFinite(artist.presentation?.exposure))renderer.toneMappingExposure=artist.presentation.exposure;
   targetScene.fog=null; // The approved Blender v3 presentation has no fog.
   if(backgroundKey){
    const background=textures.get(backgroundKey);targetScene.background=background;targetScene.environment=background;
   // Display brightness is independent of the weaker PBR lighting contribution.
   targetScene.backgroundIntensity=artist.background.displayIntensity??artist.background.intensity??1;
   targetScene.environmentIntensity=artist.background.intensity??1;
    targetScene.backgroundRotation.set(0,artist.background.rotationY??0,0);targetScene.environmentRotation.copy(targetScene.backgroundRotation);
   }
   return restorePresentation;
  };
  world.dispose=dispose;scene.add(world.root);world.root.updateMatrixWorld(true);
  return world;
 }catch(error){dispose();throw error;}
}
