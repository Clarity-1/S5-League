// Swept-ellipsoid collision matching the original game's actor movement:
//   CCollisionObject::Update/CollideWith/CheckCollision
//   COctreeNode::CheckEllipsoidCollision/GetHeightAtPosition, CheckPointInTriangle, GetLowestRoot
//   CDynamicCollisionChecker::CheckCollisionByActor
//   ray/triangle test (plane straddle + angle sum)
// Branch order, tolerances and the slide-plane formula are kept exactly.
// Ellipsoid-space constants are unit-free; world-space constants are
// native units converted with SCN_SCENE_SCALE. Arithmetic is JS float64, not
// native float32; octree traversal order (exact-tie winner) is not reproduced.
import {SCN_SCENE_SCALE} from './s5runtime-coordinates.js';

const UNIT=SCN_SCENE_SCALE;
export const ACTOR_COLLISION=Object.freeze({
  epsilon:.015,          // CCollisionObject::ms_EPSILON (ellipsoid space, and world units in Update)
  recurrence:5,          // m_uiRecurrenceCount
  restDistance:.0001,    // FLOAT_0_0001
  actorLandingGap:.02,   // FLOAT_0_02
  staticLandingGap:.9,   // FLOAT_0_9
  heightLandingRatio:.7, // FLOAT_0_7
  limitMove:200*.9*UNIT, // ACTGOR_LIMIT_MOVE = ACTOR_BOUNDWIDTH * 0.9
  aabbMargin:1*UNIT,     // CollideWith AABB +/- FLOAT_1_0
  heightFloor:-100000*UNIT,
});
export const TYPE_LAND_GROUND=1<<0,TYPE_ACTOR=1<<12;
export const MODE_NORMAL=0,MODE_GRAVITY=1;
const C=ACTOR_COLLISION,EPS=C.epsilon;

const v3=(x=0,y=0,z=0)=>({x,y,z});
const add=(a,b)=>v3(a.x+b.x,a.y+b.y,a.z+b.z);
const sub=(a,b)=>v3(a.x-b.x,a.y-b.y,a.z-b.z);
const mul=(a,s)=>v3(a.x*s,a.y*s,a.z*s);
const mulv=(a,b)=>v3(a.x*b.x,a.y*b.y,a.z*b.z);
const divv=(a,b)=>v3(a.x/b.x,a.y/b.y,a.z/b.z);
const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
const cross=(a,b)=>v3(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
const lengthSq=a=>dot(a,a);
const length=a=>Math.sqrt(dot(a,a));
// SVector3::Normalize leaves a zero vector unchanged.
const normalize=a=>{const m=length(a);if(m===0)return v3(a.x,a.y,a.z);const d=1/m;return v3(a.x*d,a.y*d,a.z*d);};
const equal=(a,b)=>a.x===b.x&&a.y===b.y&&a.z===b.z;
// Sign bit, including -0, as tested by (u32&)value & 0x80000000.
const negative=n=>n<0||Object.is(n,-0);

export function checkPointInTriangle(p,a,e10,e20){
  const A=dot(e10,e10),B=dot(e10,e20),Cc=dot(e20,e20),acbb=A*Cc-B*B;
  const vp=sub(p,a),d=dot(vp,e10),e=dot(vp,e20);
  const x=d*Cc-e*B,y=e*A-d*B,z=x+y-acbb;
  return negative(z)&&!(negative(x)||negative(y));
}

// Lowest root strictly inside (0, maxR).
export function getLowestRoot(a,b,c,maxR){
  const det=b*b-4*a*c;
  if(det<0)return null;
  let sqrtD=Math.sqrt(det);const twoA=2*a;
  b/=twoA;sqrtD/=twoA;
  let r1=-b-sqrtD,r2=-b+sqrtD;
  if(r1>r2)[r1,r2]=[r2,r1];
  if(r1>0&&r1<maxR)return r1;
  if(r2>0&&r2<maxR)return r2;
  return null;
}

// COctreeNode::CheckEllipsoidCollision (swept) for one triangle, in ellipsoid space.
// Returns {t, point, normal} or null; t is the fraction of velocity.
export function sweepTriangle(pos,vel,velLenSq,v0,v1,v2){
  const e0=sub(v1,v0),e1=sub(v2,v0);
  let n=normalize(cross(e0,e1));
  let planeDist=-dot(n,v0),distToPlane=dot(pos,n)+planeDist;
  if(distToPlane<0){planeDist=-planeDist;distToPlane=-distToPlane;n=mul(n,-1);}
  let found=false,t=1,point=null;
  if(Math.abs(distToPlane)>=1){
    const nDotVel=dot(n,vel);
    let t0=(-1-distToPlane)/nDotVel,t1=(1-distToPlane)/nDotVel;
    if(t0>t1)[t0,t1]=[t1,t0];
    if(t0>1||t1<0)return null;
    if(t0<0)t0=0;
    if(t1>1)t1=1;
    const planePoint=add(sub(pos,n),mul(vel,t0));
    if(checkPointInTriangle(planePoint,v0,e0,e1)){t=t0;found=true;point=planePoint;}
  }
  if(!found){
    const v=[v0,v1,v2];
    for(let x=0;x<3;x++){
      const posToVertex=sub(v[x],pos),posToVertexLenSq=lengthSq(posToVertex);
      let root=getLowestRoot(velLenSq,2*dot(vel,sub(pos,v[x])),posToVertexLenSq-1,t);
      if(root!==null){t=root;found=true;point=v[x];}
      const edge=sub(v[(x+1)%3],v[x]),edgeLenSq=lengthSq(edge),edgeDotVel=dot(edge,vel),edgeDotPtv=dot(edge,posToVertex);
      const a=edgeLenSq*-velLenSq+edgeDotVel*edgeDotVel;
      const b=edgeLenSq*(2*dot(vel,posToVertex))-2*edgeDotVel*edgeDotPtv;
      const c=edgeLenSq*(1-posToVertexLenSq)+edgeDotPtv*edgeDotPtv;
      root=getLowestRoot(a,b,c,t);
      if(root!==null){
        const f=(edgeDotVel*root-edgeDotPtv)/edgeLenSq;
        if(f>=0&&f<=1){t=root;found=true;point=add(v[x],mul(edge,f));}
      }
    }
  }
  return found?{t,point,normal:n}:null;
}

// SPlane::CreateFromTriangle + TestIntersection(ray, plane) + STriangle::IsPointInsideThis.
function angle(a,b){
  const value=Math.acos(dot(a,b)/(length(a)*length(b)));
  return Number.isNaN(value)?0:value;
}
export function downwardRayTriangle(origin,a,b,c){
  const n=normalize(cross(sub(c,a),sub(b,a))),d=-dot(n,a);
  const end=add(origin,v3(0,-1e10,0));
  if((dot(n,origin)+d)*(dot(n,end)+d)>=0)return null;
  // SPlane::IntersectionPoint with direction (0,-1,0).
  const denominator=-n.y,distance=-(dot(n,origin)+d)/denominator;
  const hit=denominator===0?origin:v3(origin.x,origin.y-distance,origin.z);
  const sum=angle(sub(a,hit),sub(b,hit))+angle(sub(b,hit),sub(c,hit))+angle(sub(c,hit),sub(a,hit));
  return sum>=.9999*2*Math.PI?hit:null;
}

// Eberly squared distance point-triangle (TestIntersection(sphere, triangle)).
function sqrDistancePointTriangle(p,a,b,c){
  const ab=sub(b,a),ac=sub(c,a),ap=sub(p,a);
  const d1=dot(ab,ap),d2=dot(ac,ap);
  if(d1<=0&&d2<=0)return lengthSq(ap);
  const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);
  if(d3>=0&&d4<=d3)return lengthSq(bp);
  const vc=d1*d4-d3*d2;
  if(vc<=0&&d1>=0&&d3<=0){const v=d1/(d1-d3);return lengthSq(sub(p,add(a,mul(ab,v))));}
  const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);
  if(d6>=0&&d5<=d6)return lengthSq(cp);
  const vb=d5*d2-d1*d6;
  if(vb<=0&&d2>=0&&d6<=0){const w=d2/(d2-d6);return lengthSq(sub(p,add(a,mul(ac,w))));}
  const va=d3*d6-d5*d4;
  if(va<=0&&d4-d3>=0&&d5-d6>=0){const w=(d4-d3)/((d4-d3)+(d5-d6));return lengthSq(sub(p,add(b,mul(sub(c,b),w))));}
  const denom=1/(va+vb+vc),v=vb*denom,w=vc*denom;
  return lengthSq(sub(p,add(a,add(mul(ab,v),mul(ac,w)))));
}

function boxesIntersect(aMin,aMax,bMin,bMax){
  return aMin.x<=bMax.x&&aMax.x>=bMin.x&&aMin.y<=bMax.y&&aMax.y>=bMin.y&&aMin.z<=bMax.z&&aMax.z>=bMin.z;
}

// Static geometry view over an EllipsoidWorld (world-space triangles).
// One-way lips are an S5 map feature with no native equivalent; they are only
// admitted while the sweep approaches their top face.
function worldTriangles(world){
  world.refresh();
  if(world._actorTriangles&&world._actorTriangleSource===world.triangles)return world._actorTriangles;
  const r=world.radii;
  const triangles=world.triangles.map(tri=>{
    const a=mulv(tri.a,r),b=mulv(tri.b,r),c=mulv(tri.c,r);
    return {a,b,c,ea:tri.a,eb:tri.b,ec:tri.c,oneWay:!!tri.oneWay,up:tri.oneWay?normalize(cross(sub(b,a),sub(c,a))):null,
      min:v3(Math.min(a.x,b.x,c.x),Math.min(a.y,b.y,c.y),Math.min(a.z,b.z,c.z)),
      max:v3(Math.max(a.x,b.x,c.x),Math.max(a.y,b.y,c.y),Math.max(a.z,b.z,c.z))};
  });
  world._actorTriangles=triangles;world._actorTriangleSource=world.triangles;
  return triangles;
}

export class ActorCollisionObject {
  // world: EllipsoidWorld (static triangles); radii/offset in world units.
  // slide=false is EnableSlideMode(0xffffffff, false), e.g. the CFPSCamera sphere.
  constructor(world,{radii,offset,actorBodies=null,slide=true}={}){
    this.slide=slide;
    this.world=world;this.radii=v3(radii.x,radii.y,radii.z);this.offset=v3(offset.x,offset.y,offset.z);
    this.actorBodies=actorBodies; // () => [{position, offset, radii}] of other enabled actors
    this.position=v3();this.lastSafe=v3();this.landing=false;this.mode=MODE_NORMAL;
    this.resetInfo();
  }
  resetInfo(){
    this.info={found:false,nearest:-1,point:v3(),normal:v3(),type:0,types:[],count:0};
  }
  setPosition(p){this.position=v3(p.x,p.y,p.z);this.lastSafe=v3(p.x,p.y,p.z);}
  getPosition(){return v3(this.position.x,this.position.y,this.position.z);}
  // GetFoundCollisionType: last recorded hit type of the latest Update.
  foundCollisionType(){return this.info.type!==0?this.info.types[this.info.count-1]:0;}
  foundCollisionPosition(){return v3(this.info.point.x,this.info.point.y,this.info.point.z);}
  foundCollisionNormal(){return v3(this.info.normal.x,this.info.normal.y,this.info.normal.z);}
  record(type){
    const info=this.info;info.type|=type;
    if(info.count<200){info.types[info.count]=type;info.count++;}
  }
  checkStatic(aabbMin,aabbMax,pos,vel){
    const info=this.info,r=this.radii,moveDist=length(vel),velLenSq=moveDist*moveDist;
    for(const tri of worldTriangles(this.world)){
      if(!boxesIntersect(tri.min,tri.max,aabbMin,aabbMax))continue;
      if(tri.oneWay){
        const worldVel=mulv(vel,r),worldPos=mulv(pos,r);
        if(dot(worldVel,tri.up)>=0||dot(sub(worldPos,tri.a),tri.up)<0)continue;
      }
      const hit=sweepTriangle(pos,vel,velLenSq,tri.ea,tri.eb,tri.ec);
      if(!hit)continue;
      const distance=hit.t*moveDist;
      if(!info.found||distance<info.nearest){
        info.found=true;info.nearest=distance;info.point=hit.point;info.normal=hit.normal;
        this.record(TYPE_LAND_GROUND);
      }
    }
  }
  checkActors(aabbMin,aabbMax,pos,vel){
    const bodies=this.actorBodies?.()??[];if(!bodies.length)return;
    const info=this.info,r=this.radii,dir=normalize(vel),moveDist=length(vel);
    for(const body of bodies){
      let dest=add(body.position,body.offset);
      if(!boxesIntersect(sub(dest,r),add(dest,r),aabbMin,aabbMax))continue;
      dest=divv(dest,r);
      let scaledRadius=1;
      if(!equal(r,body.radii)){const o=divv(body.radii,r);scaledRadius=(o.x+o.y+o.z)/3;}
      // TestIntersectionRaySphere
      const q=sub(dest,pos),cq=length(q),vq=dot(q,dir),rad=1+scaledRadius,d=rad*rad-(cq*cq-vq*vq);
      const distance=d<0?-1:vq-Math.sqrt(d);
      if(distance===-1)continue;
      const absDistance=Math.abs(distance);
      if(absDistance>moveDist)continue;
      if(!info.found||absDistance<info.nearest){
        info.nearest=absDistance;info.point=add(pos,mul(dir,distance));
        info.normal=normalize(sub(pos,dest));info.found=true;
        this.record(TYPE_ACTOR);
      }
    }
  }
  heightAtPosition(center){
    let best=C.heightFloor,result=false;
    for(const tri of worldTriangles(this.world)){
      if(!(tri.min.y<=center.y&&tri.max.y>=best&&tri.min.x<=center.x&&tri.max.x>=center.x&&tri.min.z<=center.z&&tri.max.z>=center.z))continue;
      const hit=downwardRayTriangle(center,tri.a,tri.b,tri.c);
      if(hit&&hit.y>best){best=hit.y;result=true;}
    }
    return result?best:null;
  }
  collideWith(pos,vel,recurrence){
    if(lengthSq(vel)<EPS*EPS)return pos;
    const dest=add(pos,vel),info=this.info,r=this.radii;
    if(recurrence.count<C.recurrence){
      recurrence.count++;
      info.found=false;info.nearest=-1;
      const orig=mulv(r,pos),next=mulv(r,dest),m=C.aabbMargin;
      const aabbMin=v3(Math.min(orig.x,next.x)-r.x-m,Math.min(orig.y,next.y)-r.y-m,Math.min(orig.z,next.z)-r.z-m);
      const aabbMax=v3(Math.max(orig.x,next.x)+r.x+m,Math.max(orig.y,next.y)+r.y+m,Math.max(orig.z,next.z)+r.z+m);
      this.checkStatic(aabbMin,aabbMax,pos,vel);
      this.checkActors(aabbMin,aabbMax,pos,vel);
    }else return pos;
    if(!info.found){
      const len=length(vel);
      return add(pos,mul(vel,(len-EPS)/len));
    }
    let newPos=v3(pos.x,pos.y,pos.z);
    const lastType=info.types[info.count-1],gravity=this.mode===MODE_GRAVITY;
    if(info.nearest>EPS){
      newPos=add(newPos,mul(vel,(info.nearest-EPS)/length(vel)));
    }else if(info.nearest<C.restDistance&&lastType!==TYPE_ACTOR){
      if(gravity)this.landing=true;
      info.nearest=0;
      return newPos;
    }
    let direction=normalize(vel);
    if(lastType===TYPE_ACTOR){
      if(gravity&&(recurrence.count>1||newPos.y-info.point.y<C.actorLandingGap)){this.landing=true;return newPos;}
      if(!this.slide)return newPos;
      direction=mul(direction,length(sub(dest,newPos)));
      const n=info.normal;
      const slide=sub(direction,mul(n,dot(direction,n)));
      if(gravity&&slide.y>0)slide.y=0;
      return this.collideWith(newPos,slide,recurrence);
    }
    if(gravity){
      if(recurrence.count>1||newPos.y-info.point.y>C.staticLandingGap){this.landing=true;return newPos;}
      const probe=mulv(r,v3(newPos.x,info.point.y+EPS,newPos.z));
      const height=this.heightAtPosition(probe);
      if(height!==null&&(probe.y-height)/r.y<C.heightLandingRatio){this.landing=true;return newPos;}
    }
    if(!this.slide){if(gravity)this.landing=true;return newPos;}
    const origin=info.point,n=normalize(sub(newPos,info.point));
    const distance=dot(n,dest)-dot(n,origin);
    const slide=sub(sub(dest,mul(n,distance)),origin);
    if(dot(direction,slide)<0)return newPos;
    if(gravity&&slide.y>0){this.landing=true;return newPos;}
    return this.collideWith(newPos,slide,recurrence);
  }
  // CCollisionObject::CheckCollision: static overlap of the ellipsoid at rest.
  overlaps(){
    const center=add(this.position,this.offset),r=this.radii,scaled=divv(center,r);
    const min=sub(center,r),max=add(center,r);
    for(const tri of worldTriangles(this.world)){
      if(!boxesIntersect(tri.min,tri.max,min,max))continue;
      if(sqrDistancePointTriangle(scaled,tri.ea,tri.eb,tri.ec)<1)return true;
    }
    return false;
  }
  update(next,mode=MODE_NORMAL){
    this.mode=mode;
    if(equal(next,this.position))return;
    const recurrence={count:0},previous=this.getPosition(),info=this.info;
    info.count=0;info.type=0;info.types=[];info.nearest=-1;
    const target=add(next,this.offset),r=this.radii;
    const start=add(this.position,this.offset);
    const result=this.collideWith(divv(start,r),divv(sub(target,start),r),recurrence);
    this.position=sub(mulv(result,r),this.offset);
    if(info.nearest===0){
      if(mode===MODE_GRAVITY)this.position=v3(this.position.x,this.position.y+r.y*EPS,this.position.z);
      // Subtracts the normalized (offset target - previous anchor) here.
      else this.position=sub(this.position,mul(normalize(sub(target,previous)),EPS*UNIT));
      if(!this.overlaps())this.lastSafe=this.getPosition();
      else this.position=v3(this.lastSafe.x,this.lastSafe.y,this.lastSafe.z);
    }else this.lastSafe=this.getPosition();
    info.point=mulv(info.point,r);
    info.normal=normalize(mulv(info.normal,r));
  }
}

// CActor::Move: CALC_ACTOR_LIMIT_MOVE, then one Update, or horizontal +
// MODE_GRAVITY vertical when descending.
export function actorMove(body,delta){
  let d=v3(delta.x,delta.y,delta.z);
  if(d.y>=0||d.x!==0||d.z!==0){const len=length(d);if(!(len<C.limitMove))d=mul(normalize(d),C.limitMove);}
  if(d.y>=0)body.update(add(body.getPosition(),d));
  else{
    body.update(add(body.getPosition(),v3(d.x,0,d.z)));
    body.update(add(body.getPosition(),v3(0,d.y,0)),MODE_GRAVITY);
  }
  return body.getPosition();
}
