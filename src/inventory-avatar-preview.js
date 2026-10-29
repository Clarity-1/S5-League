import * as THREE from 'three';
import {cloneInventoryPreviewSource} from './inventory-preview-model.js';
import {installAvatarPreviewRotation} from './avatar-preview-rotation.js';

// No animation loop owned here. Root must call renderInventoryPreviews(avatar.group)
// once after the main mixer/attachment evaluation; all reads of source are readonly.
const previews=new Set(),byContainer=new WeakMap();
export function createInventoryAvatarPreview(container,{portrait=false,rotatable=!portrait,presentation='inventory',rendererFactory=()=>new THREE.WebGLRenderer({alpha:true,antialias:true}),onError=error=>console.warn('Inventory preview unavailable',error)}={}){
 if(byContainer.has(container))return byContainer.get(container);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(28,332/387,.01,100);
 // Adapted S5 presentation. Native inventory lighting/FOV are not recovered.
 // Every preview (lobby, inventory, portrait) shares the lobby key/fill rig:
 // the former inventory rig (white ambient 2 + key 2.5, no tone mapping)
 // washed the toon materials out to near white.
 scene.add(new THREE.AmbientLight(0xe4edff,1.35));const light=new THREE.DirectionalLight(0xffead4,2);light.position.set(-3,4,5);scene.add(light);
 const fill=new THREE.DirectionalLight(0xb7dcff,.65);fill.position.set(4,2,-3);scene.add(fill);
 const rotation=rotatable?installAvatarPreviewRotation(container):null;
 let renderer=null,model=null,size='',disposed=false;
 function release(){model?.dispose();model=null;size='';}
 const preview={
  render(source){
   // Hidden lobby descendants can retain a cached layout size. Reject them
   // before querying dimensions, which would force layout during gameplay.
   if(disposed||!source||!container.isConnected||container.closest?.('[hidden]')||container.clientWidth===0||container.clientHeight===0)return;
   if(!renderer){renderer=rendererFactory();renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.25));renderer.domElement.setAttribute('aria-label','Character and equipment preview');renderer.domElement.setAttribute('role','img');container.append(renderer.domElement);}
   if(model?.source!==source){release();model=cloneInventoryPreviewSource(source);scene.add(model.root);}
   model.root.rotation.y=Math.PI+(rotation?.yaw??0);
   if(!model.sync()){release();model=cloneInventoryPreviewSource(source);scene.add(model.root);model.root.rotation.y=Math.PI+(rotation?.yaw??0);model.sync();}
   const nextSize=`${container.clientWidth}/${container.clientHeight}`;
   if(size!==nextSize){
    size=nextSize;renderer.setSize(container.clientWidth,container.clientHeight,false);camera.aspect=container.clientWidth/container.clientHeight;
    const bounds=model.bounds(),center=bounds.getCenter(new THREE.Vector3()),extent=bounds.getSize(new THREE.Vector3());
    // Optional lobby portrait crops the evaluated clone, never the live rig.
    if(portrait){center.y+=extent.y*.35;extent.multiplyScalar(.28);}
    const vertical=extent.y*.5/Math.tan(THREE.MathUtils.degToRad(camera.fov*.5)),horizontal=extent.x*.5/(Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*camera.aspect),distance=Math.max(vertical,horizontal,.5)*1.18;
    camera.position.set(center.x+distance*.08,center.y,center.z+distance);camera.lookAt(center);camera.updateProjectionMatrix();
   }
   renderer.render(scene,camera);if(container.dataset)container.dataset.previewStatus='rendered';
  },
  fail(error){preview.dispose();container.textContent='Preview unavailable';if(container.dataset)container.dataset.previewStatus='unavailable';onError(error);},
  dispose(){if(disposed)return;disposed=true;rotation?.dispose();release();renderer?.dispose();renderer?.domElement.remove();previews.delete(preview);byContainer.delete(container);},
 };
 previews.add(preview);byContainer.set(container,preview);return preview;
}
export function renderInventoryPreviews(source){for(const preview of previews){try{preview.render(source);}catch(error){preview.fail(error);}}}
