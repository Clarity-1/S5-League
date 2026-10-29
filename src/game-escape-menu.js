import {installGameWeaponEffects} from './game-weapon-effects.js';
// View only. The game owns input gating, session clocks and accepted transitions.
export const GAME_ESCAPE_ASSETS = Object.freeze({
  identity: '/assets/s5/entry/league-logo-v1.png',
});

export function installGameEscapeMenu({
  document: doc = globalThis.document, onResume = () => {},
  onLeave = () => {}, onSound = () => {}, leaveLabel = 'Leave room', training = null, weaponEffects = null, onSettings = null,
} = {}) {
  if (!doc?.createElement || !doc.body?.append) throw new TypeError('Game menu requires a document body');
  const root = doc.createElement('section');
  root.id = 'game-escape-menu';
  root.className = 'game-escape-menu';
  root.hidden = true;
  root.tabIndex = -1;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Game menu');
  root.setAttribute('aria-hidden', 'true');
  const content = doc.createElement('div');
  content.className = 'game-escape-content';
  const identity = doc.createElement('img');
  identity.className = 'game-escape-identity';
  identity.src = GAME_ESCAPE_ASSETS.identity;
  identity.alt = 'S5 League';
  identity.draggable = false;
  content.append(identity);
  const buttons = doc.createElement('div');
  buttons.className = 'game-escape-buttons';
  content.append(buttons);
  function button(action, label) {
    const node = doc.createElement('button');
    node.type = 'button';
    node.className = 'game-escape-button';
    node.dataset.action = action;
    const text = doc.createElement('span');
    text.textContent = label;
    node.append(text);
    const slash = doc.createElement('i');
    slash.className = 'game-escape-slash';
    slash.setAttribute('aria-hidden', 'true');
    node.append(slash);
    buttons.append(node);
    return node;
  }
  const resume = button('resume', 'Resume');
  const effectsButton = weaponEffects ? button('effects', 'Weapon effects') : null;
  // Opens the game's full Settings view; the owner hides this menu meanwhile.
  const settingsButton = onSettings ? button('settings', 'Settings') : null;
  const leave = button('leave', leaveLabel);
  root.append(content);
  doc.body.append(root);
  let opened = false, disposed = false, previousFocus = null, siblings = [];
  const bindings = [];
  function bind(node, type, callback) {
    node.addEventListener(type, callback);
    bindings.push([node, type, callback]);
  }
  let trainingBusy=false, trainingPanel=null, trainingWeapon=null, trainingBehavior=null, trainingStatus=null;
  if(training){
    trainingPanel=doc.createElement('fieldset');trainingPanel.className='game-escape-training';trainingPanel.hidden=true;
    const legend=doc.createElement('legend');legend.textContent='Training opponent';trainingPanel.append(legend);
    const field=(labelText,name)=>{const label=doc.createElement('label'),caption=doc.createElement('span'),select=doc.createElement('select');caption.textContent=labelText;select.setAttribute('aria-label',name);label.append(caption,select);trainingPanel.append(label);return select;};
    trainingWeapon=field('Weapon','Training opponent weapon');trainingBehavior=field('Behavior','Training opponent behavior');
    trainingStatus=doc.createElement('p');trainingStatus.setAttribute('role','status');trainingPanel.append(trainingStatus);content.append(trainingPanel);
    const change=async(kind,select)=>{
      if(!opened||disposed||trainingBusy||select.disabled)return;
      trainingBusy=true;syncTraining();trainingStatus.textContent='Applying…';
      try{await training.change(kind,select.value);if(!disposed)trainingStatus.textContent='';}
      catch{if(!disposed)trainingStatus.textContent='Could not apply this setting.';}
      finally{trainingBusy=false;if(!disposed)syncTraining();}
    };
    bind(trainingWeapon,'change',()=>change('weapon',trainingWeapon));bind(trainingBehavior,'change',()=>change('behavior',trainingBehavior));
  }
  function syncTraining(){
    if(!trainingPanel)return;
    const snapshot=training.read();trainingPanel.hidden=!snapshot;
    if(!snapshot)return;
    for(const [key,select]of [['weapon',trainingWeapon],['behavior',trainingBehavior]]){
      const value=select.value;while(select.children.length)select.children[0].remove();
      for(const entry of snapshot[key+'s']){const option=doc.createElement('option');option.value=entry.value;option.textContent=entry.label;select.append(option);}
      select.value=trainingBusy?value:snapshot[key];select.disabled=trainingBusy||snapshot.busy===true;
    }
  }
  const effectView=weaponEffects?installGameWeaponEffects(content,{document:doc,...weaponEffects,onBack:()=>back()}):null;
  function back(){if(!effectView?.opened)return false;effectView.close();identity.hidden=false;buttons.hidden=false;root.className='game-escape-menu';syncTraining();effectsButton.focus();return true;}
  function openEffects(){effectView.open();identity.hidden=true;buttons.hidden=true;if(trainingPanel)trainingPanel.hidden=true;root.className='game-escape-menu game-escape-effects-open';effectView.focusables()[0].focus();}
  const eligible = () => effectView?.opened?effectView.focusables():[...(resume.disabled?[]:[resume]),...(effectsButton?[effectsButton]:[]),...(settingsButton?[settingsButton]:[]),leave,...(trainingPanel&&!trainingPanel.hidden?[trainingWeapon,trainingBehavior].filter(select=>!select.disabled):[])];

  function open({ canResume = true } = {}) {
    if (disposed) return false;
    syncTraining();
    resume.disabled = !canResume;
    if (!opened) {
      previousFocus = doc.activeElement;
      siblings = Array.from(doc.body.children).filter(node => node !== root).map(node => ({
        node, inert: node.getAttribute('inert'),
      }));
      for (const { node } of siblings) node.setAttribute('inert', '');
      opened = true;
      root.hidden = false;
      root.setAttribute('aria-hidden', 'false');
    }
    eligible()[0].focus();
    return true;
  }

  function close({ restoreFocus = true } = {}) {
    if (!opened) return false;
    opened = false;
    if(effectView?.opened){effectView.close();identity.hidden=false;buttons.hidden=false;root.className='game-escape-menu';}
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');
    for (const { node, inert } of siblings) {
      if (inert === null) node.removeAttribute('inert');
      else node.setAttribute('inert', inert);
    }
    siblings = [];
    const focus = previousFocus;
    previousFocus = null;
    if (restoreFocus && focus?.isConnected !== false && !focus?.closest?.('[inert]')) focus?.focus?.();
    return true;
  }

  function activate(action) {
    if (!opened || disposed || (action === 'resume' && resume.disabled)) return;
    onSound('click');
    if (!opened || disposed) return;
    // Owner closes only after accepting the action; rejected resume keeps its menu.
    if (action === 'resume') onResume();
    else if(action==='effects')openEffects();
    else if(action==='settings')onSettings();
    else onLeave();
  }
  bind(resume, 'click', () => activate('resume'));
  bind(leave, 'click', () => activate('leave'));
  if(effectsButton)bind(effectsButton,'click',()=>activate('effects'));
  if(settingsButton)bind(settingsButton,'click',()=>activate('settings'));
  for (const node of [resume,...(effectsButton?[effectsButton]:[]),...(settingsButton?[settingsButton]:[]),leave]) bind(node, 'pointerenter', () => {
    if (opened && !disposed && !node.disabled) onSound('hover');
  });
  function keyEvent(event) {
    if (!opened || disposed || event.key === 'Escape') return;
    // Escape belongs to the owner. Preserve native Enter/Space button activation.
    event.stopPropagation();
    if (event.type !== 'keydown' || event.key !== 'Tab') return;
    event.preventDefault();
    const targets = eligible(), index = targets.indexOf(doc.activeElement);
    const next = index < 0 ? (event.shiftKey ? targets.length - 1 : 0)
      : (index + (event.shiftKey ? -1 : 1) + targets.length) % targets.length;
    targets[next].focus();
  }
  for (const type of ['keydown', 'keyup', 'keypress']) bind(root, type, keyEvent);
  const stopPointer = event => { if (opened && !disposed) event.stopPropagation(); };
  for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick']) bind(root, type, stopPointer);

  function dispose() {
    if (disposed) return;
    close({ restoreFocus: false });
    disposed = true;
    for (const [node, type, callback] of bindings) node.removeEventListener(type, callback);
    bindings.length = 0;
    effectView?.dispose();
    root.remove();
  }
  return { root, open, close, back, get opened() { return opened; }, dispose };
}
