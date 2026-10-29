// Explicit S5 route adapter. It does not identify these tabs as native options widgets.
export function installOptionsPanelLifecycle({panel,menuLayout,transaction,beforeClose=()=>{},
 observeRoot=panel.parentNode,observerFactory=callback=>new MutationObserver(callback),onBlocked=null,returnRoute=()=>'loadout'}={}){
 if(!panel||typeof menuLayout?.show!=='function'||!transaction)throw TypeError('Panel, menu layout and transaction required');
 let disposed=false,syncing=false;
 const visible=()=>{for(let node=panel;node;node=node.parentNode)if(node.hidden||node.style?.display==='none'||node.style?.visibility==='hidden')return false;return true;};
 function sync(){
  if(disposed||syncing)return {accepted:false,reason:disposed?'disposed':'syncing'};
  syncing=true;
  try{
   const isVisible=visible(),open=transaction.snapshot().phase==='open';
   if(isVisible&&!open){const result=transaction.open();if(!result.accepted){panel.hidden=true;onBlocked?.(result);}return result;}
   if(!isVisible&&open){beforeClose();return transaction.cancel('s5-route-change');}
   return {accepted:true,changed:false};
  }finally{syncing=false;}
 }
 const originalShow=menuLayout.show;
 function wrappedShow(...args){const result=originalShow.apply(menuLayout,args);sync();return result;}
 menuLayout.show=wrappedShow;
 const observer=observerFactory(sync);observer.observe(observeRoot,{attributes:true,attributeFilter:['hidden','style','class'],subtree:true});
 sync();
 return Object.freeze({sync,
  leaveForPlay(){
   if(disposed)return {accepted:false,reason:'disposed'};
   // Leave Settings only when it is actually open; otherwise Play keeps the
   // current screen (and the entry flow's return route) unchanged.
   beforeClose();const open=transaction.snapshot().phase==='open';let result={accepted:true};if(open)result=transaction.cancel('s5-play');
   if(result.accepted&&open)wrappedShow(returnRoute());return result;
  },
  dispose(){if(disposed)return;disposed=true;observer.disconnect();if(menuLayout.show===wrappedShow)menuLayout.show=originalShow;},
 });
}
