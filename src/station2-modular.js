import {readAsset} from './scene-assets.js';
import {createFumbi} from './fumbi.js';
import {createModularWorld} from './modular-map.js';
import {STATION2_LAYOUT} from './station2-layout.js';
import {installTrainWindowSupports} from './station2-window-support.js';
export async function createStation2Modular(scene,layout=STATION2_LAYOUT){
 const started=performance.now();
 const ids=[...new Set(layout.modules.filter(m=>m.kind==='prefab').map(m=>m.prefab))];
 const prefabs=new Map(await Promise.all(ids.map(async id=>[id,await readAsset('/assets/station2-kit/'+id+'.json')])));
 const loaded=performance.now();
 const world=await createModularWorld(scene,layout,prefabs);
 world.nativeMapId=66;
 if(prefabs.has('train'))installTrainWindowSupports(world,prefabs.get('train'));
 if(layout.ball){const ball=await createFumbi(await readAsset('/assets/s5runtime/maps/fumbi.json'));ball.scale.set(.006,.006,-.006);world.attach(ball,layout.ball);world.fumbi=ball;}
 world.station2Performance={sourceLoadMs:loaded-started,sourceBuildMs:performance.now()-loaded};
 return world;
}
