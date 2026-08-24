/* ---------------- UI state ---------------- */
const UI = {
  variant:'chaturanga', opponent:'ai', level:2, human:1,
  boardStyle:'ashtapada', hints:true, autoFlip:false, flipped:false,
  sel:-1, targets:[], last:null, over:false, thinking:false,
  moves:[], capByW:[], capByB:[], pendingPromo:null
};
const sideName = s => VARIANT_INFO[UI.variant].sides[s>0?'w':'b'];
const letterAt = i => { const p = Pos.b[i]; return p ? LET[p>0?p:-p] : null; };

/* ---------------- setup screen ---------------- */
const SETUP_FACTS = {
  chaturanga:[
    ['Origin','Gupta-era India, ~6th century'],
    ['Counsellor','Mantri — one diagonal step'],
    ['Elephant','Gaja — leaps exactly two'],
    ['Stalemate','A win for whoever forces it']
  ],
  chess:[
    ['Origin','Europe, from the 15th century'],
    ['Queen','Any distance, any direction'],
    ['Bishop','Slides the whole diagonal'],
    ['Stalemate','A draw — half a point each']
  ]
};
const SETUP_CAPTION = {
  chaturanga:'The armies mirror, so Raja faces Raja down the d-file.',
  chess:'The armies rotate, so each queen starts on her own colour.'
};
const SETUP_SPEECH = {
  chaturanga:"The old game. I'll bring the elephants — you'll want the chariots.",
  chess:"The modern one. Fair warning: I like open files."
};

function renderRankStrips(){
  [['chaturanga',CHAT_BACK],['chess',CHESS_BACK]].forEach(([v,back])=>{
    const el = document.getElementById('strip-'+v);
    if(!el) return;
    const light = UI.variant === v;         // selected card is dark, so its pieces are pale
    el.innerHTML = back.map(t=>`<span class="${light?'pc-w':'pc-b'}">${getArt(v, LET[t])}</span>`).join('');
  });
}

function renderPreview(){
  const v = UI.variant;
  const back = v==='chess' ? CHESS_BACK : CHAT_BACK;
  const style = v==='chess' ? 'checkered' : UI.boardStyle;
  const el = document.getElementById('mini-board');
  el.className = 'mini-board ' + style;
  let html = '';
  for(let r=7;r>=0;r--) for(let f=0;f<8;f++){
    let t = 0, dark = false;
    if(r===7||r===0) t = back[f];
    else if(r===6||r===1) t = P;
    const cls = [(f+r)%2===0 ? 'dark':'', isMarked(SQ(f,r)) ? 'marked':''].join(' ');
    const pc = t ? `<span class="${r>=6?'pc-b':'pc-w'}">${getArt(v, LET[t])}</span>` : '';
    html += `<div class="mini-sq ${cls}">${pc}</div>`;
  }
  el.innerHTML = html;
  document.getElementById('mini-cap').textContent = SETUP_CAPTION[v];
  document.getElementById('facts').innerHTML =
    SETUP_FACTS[v].map(([k,val])=>`<dt>${k}</dt><dd>${val}</dd>`).join('');
  document.getElementById('setup-speech').textContent = SETUP_SPEECH[v];
}

function renderSummary(){
  const v = VARIANT_INFO[UI.variant].title;
  const foe = UI.opponent==='ai'
    ? 'Kreedu · ' + ['','Sishya','Yodha','Senapati'][UI.level]
    : 'two players';
  const side = UI.opponent==='ai' ? ' · you play ' + sideName(UI.human).toLowerCase() : '';
  const el = document.getElementById('setup-summary');
  if(el) el.textContent = `${v} · vs ${foe}${side}`;
}

function setVariant(v){
  UI.variant = v;
  document.getElementById('opt-chaturanga').classList.toggle('sel', v==='chaturanga');
  document.getElementById('opt-chess').classList.toggle('sel', v==='chess');
  document.getElementById('hero-title').textContent = v==='chaturanga'
    ? 'Chaturangam — the four limbs of an army.'
    : 'Chess — what Chaturangam became.';
  document.getElementById('hero-lead').textContent = VARIANT_INFO[v].lead;
  document.getElementById('style-section').style.display = v==='chaturanga' ? '' : 'none';
  setBoardStyle(v==='chess' ? 'checkered' : (UI.chatStyle || 'ashtapada'));
  document.querySelectorAll('#side-row .pill').forEach(p=>{
    p.firstChild.textContent = VARIANT_INFO[v].sides[p.dataset.side];
  });
  renderRankStrips(); renderPreview(); renderSummary();
  buildTutorial();
}
function setOpponent(val){
  UI.opponent = val;
  document.getElementById('opt-ai').classList.toggle('sel', val==='ai');
  document.getElementById('opt-human').classList.toggle('sel', val==='human');
  document.getElementById('ai-options').style.display = val==='ai' ? 'contents' : 'none';
  renderSummary();
}
function setLevel(l){
  UI.level = l;
  document.querySelectorAll('#diff-row .pill').forEach(p => p.classList.toggle('sel', +p.dataset.diff === l));
  renderSummary();
}
function setSide(s){
  UI.human = s === 'w' ? 1 : -1;
  document.querySelectorAll('#side-row .pill').forEach(p => p.classList.toggle('sel', p.dataset.side === s));
  renderSummary();
}
function setBoardStyle(s){
  UI.boardStyle = s;
  if(UI.variant !== 'chess') UI.chatStyle = s;   // remember the ancient board's setting
  document.querySelectorAll('#style-row .pill').forEach(p => p.classList.toggle('sel', p.dataset.style === s));
  const sw = document.getElementById('sw-check');
  if(sw) sw.classList.toggle('on', s === 'checkered');
  if(document.getElementById('mini-board')) renderPreview();
}
function showView(id){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}
function backToSetup(){ closeResult(); showView('view-setup'); }
function confirmLeave(){
  if(!UI.over && UI.moves.length && !confirm('Leave this game? The current board will be lost.')) return;
  backToSetup();
}

function startGame(){
  setStart(UI.variant);
  ttClear();
  UI.sel=-1; UI.targets=[]; UI.last=null; UI.over=false; UI.thinking=false;
  UI.moves=[]; UI.capByW=[]; UI.capByB=[]; UI.pendingPromo=null;
  UI.flipped = (UI.opponent==='ai' && UI.human<0);
  document.getElementById('row-flip').style.display = UI.opponent==='human' ? '' : 'none';
  document.getElementById('g-title').textContent = VARIANT_INFO[UI.variant].title;
  document.getElementById('g-native').textContent = VARIANT_INFO[UI.variant].native;
  buildCoords(); render(); showView('view-game');
  say(UI.opponent==='ai'
    ? `You command ${sideName(UI.human)}. ${sideName(1)} always moves first.`
    : `${sideName(1)} moves first. Tap a piece to see where it can go.`);
  if(UI.opponent==='ai' && Pos.side !== UI.human) scheduleAI();
}
function restartGame(){ closeResult(); startGame(); }

/* ---------------- rendering ---------------- */
function buildCoords(){
  const rs=[8,7,6,5,4,3,2,1], fs=['a','b','c','d','e','f','g','h'];
  const R = UI.flipped ? rs.slice().reverse() : rs;
  const F = UI.flipped ? fs.slice().reverse() : fs;
  document.getElementById('ranks').innerHTML = R.map(r=>`<div class="coord">${r}</div>`).join('');
  document.getElementById('files').innerHTML = F.map(f=>`<div class="coord">${f}</div>`).join('');
}
function viewOrder(){
  const out=[];
  for(let r=7;r>=0;r--) for(let f=0;f<8;f++) out.push(SQ(f,r));
  return UI.flipped ? out.reverse() : out;
}
const isMarked = i => {
  const m = x => x===0||x===3||x===4||x===7;
  return m(FILE(i)) && m(RANK(i));
};

function render(){
  const el = document.getElementById('board');
  el.className = 'board ' + UI.boardStyle;
  el.innerHTML = '';
  const checkedSq = inCheck(Pos.side) ? kingOf(Pos.side) : -1;
  const targetSet = new Set(UI.targets.map(m => mTo(m)));

  viewOrder().forEach(i=>{
    const sq = document.createElement('div');
    sq.className = 'sq';
    sq.dataset.sq = i;
    if((FILE(i)+RANK(i))%2===0) sq.classList.add('dark');
    if(UI.boardStyle==='ashtapada' && isMarked(i)) sq.classList.add('marked');
    if(UI.last && (i===UI.last.from || i===UI.last.to)) sq.classList.add('last');
    if(UI.sel===i) sq.classList.add('sel');
    if(i===checkedSq && !UI.over) sq.classList.add('check');
    const p = Pos.b[i];
    if(p){
      sq.innerHTML = getArt(UI.variant, LET[p>0?p:-p]);
      sq.classList.add(p>0 ? 'pc-w' : 'pc-b');
    }
    if(UI.hints && targetSet.has(i)){
      const mark = document.createElement('span');
      mark.className = p ? 'ring' : 'dot';
      sq.appendChild(mark);
    }
    sq.setAttribute('role','button');
    sq.tabIndex = 0;
    sq.setAttribute('aria-label', NAME_OF_SQ(i) + (p ? ' — ' + sideName(p) + ' ' + PIECE_INFO[UI.variant][LET[p>0?p:-p]].n : ' — empty'));
    sq.onclick = () => onSquare(i);
    sq.onkeydown = e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); onSquare(i); } };
    el.appendChild(sq);
  });

  renderStatus(); renderCaptures(); renderLog();
  document.getElementById('btn-undo').disabled = !UI.moves.length || UI.thinking;
}

function renderStatus(){
  const card=document.getElementById('turn-card');
  const dot=document.getElementById('turn-dot');
  const who=document.getElementById('turn-who');
  const st=document.getElementById('turn-state');
  dot.className = 'turn-dot ' + (Pos.side>0?'w':'b');
  const yours = UI.opponent==='ai' && Pos.side===UI.human;
  who.textContent = UI.over ? 'Game over'
    : (UI.opponent==='ai' ? (yours ? 'Your move' : 'Kreedu is thinking…') : sideName(Pos.side) + ' to move');
  const checked = inCheck(Pos.side);
  card.classList.toggle('alert', checked && !UI.over);
  st.textContent = UI.over ? 'Start a new game below'
    : checked ? sideName(Pos.side) + (UI.variant==='chess' ? ' is in check' : ' Raja is in check')
    : 'Move ' + Pos.full + ' · ' + sideName(Pos.side);
}

function renderCaptures(){
  const worth = {P:1,N:3,B:3,R:5,Q:9,E:1.5,M:2,K:0};
  const fill = (id, list, cls) => {
    const el = document.getElementById(id);
    const label = el.querySelector('.label');
    el.innerHTML=''; el.appendChild(label);
    if(!list.length){
      const s=document.createElement('span');
      s.style.cssText='font-size:12.5px;font-weight:600;color:var(--ink-soft);opacity:.7;';
      s.textContent='Nothing yet'; el.appendChild(s); return 0;
    }
    const rank = ['Q','R','N','B','M','E','P'];
    list.slice().sort((a,b)=>rank.indexOf(a)-rank.indexOf(b)).forEach(t=>{
      const s=document.createElement('span');
      s.className=cls; s.innerHTML=getArt(UI.variant, t);
      s.title=PIECE_INFO[UI.variant][t].n;
      el.appendChild(s);
    });
    return list.reduce((s,t)=>s+worth[t],0);
  };
  document.querySelector('#cap-b .label').textContent = sideName(1) + ' has captured';
  document.querySelector('#cap-w .label').textContent = sideName(-1) + ' has captured';
  const a = fill('cap-b', UI.capByW, 'pc-b');
  const b = fill('cap-w', UI.capByB, 'pc-w');
  const d = a-b;
  if(d!==0){
    const s=document.createElement('span');
    s.className='score'; s.textContent='+'+Math.abs(d).toFixed(Math.abs(d)%1?1:0);
    document.getElementById(d>0?'cap-b':'cap-w').appendChild(s);
  }
}

function renderLog(){
  const el=document.getElementById('log');
  if(!UI.moves.length){ el.innerHTML='<div class="empty">No moves yet.</div>'; return; }
  const txt = UI.moves.map(r=>r.san);
  let rows='';
  for(let i=0;i<txt.length;i+=2)
    rows += `<tr><td class="num">${i/2+1}.</td><td class="mv">${txt[i]}</td><td class="mv">${txt[i+1]||''}</td></tr>`;
  el.innerHTML=`<table>${rows}</table>`;
  el.scrollTop = el.scrollHeight;
}

function say(msg, thinking){
  document.getElementById('kreedu-line').textContent = msg;
  document.getElementById('kreedu-strip').classList.toggle('thinking', !!thinking);
}
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'),2400);
}

/* ---------------- notation ---------------- */
function moveText(m){
  const from=mFrom(m), to=mTo(m), flag=mFlag(m), promo=mPromo(m);
  const pc=Pos.b[from], t=pc>0?pc:-pc;
  const isCap = Pos.b[to]!==0 || flag===FLAG_EP;
  let s='';
  if(flag===FLAG_CASTLE){
    s = FILE(to)===6 ? 'O-O' : 'O-O-O';
  } else if(UI.variant==='chess'){
    if(t===P){
      if(isCap) s += 'abcdefgh'[FILE(from)] + 'x';
      s += NAME_OF_SQ(to);
      if(promo) s += '=' + LET[promo];
    } else {
      s += LET[t];
      const rivals = legalMoves().filter(x => x!==m && mTo(x)===to && Math.abs(Pos.b[mFrom(x)])===t);
      if(rivals.length){
        const sameFile = rivals.some(x=>FILE(mFrom(x))===FILE(from));
        const sameRank = rivals.some(x=>RANK(mFrom(x))===RANK(from));
        s += !sameFile ? 'abcdefgh'[FILE(from)] : (!sameRank ? String(RANK(from)+1) : NAME_OF_SQ(from));
      }
      if(isCap) s += 'x';
      s += NAME_OF_SQ(to);
    }
  } else {
    s = PIECE_INFO.chaturanga[LET[t]].tag + ' ' + NAME_OF_SQ(from) + (isCap ? '×' : '–') + NAME_OF_SQ(to);
    if(promo) s += '=Mn';
  }
  makeMove(m);
  const opp = Pos.side;
  const replies = legalMoves();
  const ck = attacked(kingOf(opp), -opp);
  unmakeMove();
  if(ck) s += replies.length ? '+' : '#';
  else if(!replies.length && UI.variant!=='chess') s += '⊘';
  return s;
}

/* ---------------- interaction ---------------- */
function onSquare(i){
  if(UI.over || UI.thinking || UI.pendingPromo) return;
  if(UI.opponent==='ai' && Pos.side !== UI.human) return;

  const hits = UI.targets.filter(m => mTo(m)===i);
  if(hits.length){
    if(hits.length>1 && UI.variant==='chess'){ askPromotion(hits); return; }
    playMove(hits[0]); return;
  }
  const p = Pos.b[i];
  if(p && (p>0) === (Pos.side>0)){
    if(UI.sel===i){ UI.sel=-1; UI.targets=[]; }
    else {
      UI.sel=i;
      UI.targets = legalMoves().filter(m => mFrom(m)===i);
      if(!UI.targets.length) toast(PIECE_INFO[UI.variant][LET[p>0?p:-p]].n + ' on ' + NAME_OF_SQ(i) + ' has no legal move.');
    }
  } else { UI.sel=-1; UI.targets=[]; }
  render();
}

function askPromotion(options){
  UI.pendingPromo = options;
  const wrap = document.getElementById('promo-choices');
  wrap.innerHTML = '';
  options.sort((a,b)=>mPromo(b)-mPromo(a)).forEach(m=>{
    const t = LET[mPromo(m)];
    const btn = document.createElement('button');
    btn.className = 'promo-btn ' + (Pos.side>0?'pc-w':'pc-b');
    btn.innerHTML = getArt('chess', t) + '<span>' + PIECE_INFO.chess[t].n + '</span>';
    btn.onclick = ()=>{ document.getElementById('promo-modal').classList.remove('active'); UI.pendingPromo=null; playMove(m); };
    wrap.appendChild(btn);
  });
  document.getElementById('promo-modal').classList.add('active');
}

/* ---------------- move animation ----------------
   render() rebuilds the whole board on every move, so a moved piece has
   no continuous DOM node to transition. Instead we grab the departure
   square's on-screen position beforehand, then after render() places the
   piece on its new square we offset it back to where it started and let
   a CSS transition ease it into place — a lightweight FLIP animation. */
function squareRect(idx){
  const el = document.querySelector(`.sq[data-sq="${idx}"]`);
  return el ? el.getBoundingClientRect() : null;
}
function slidePieceIn(toIdx, fromRect){
  if(!fromRect) return;
  const toEl = document.querySelector(`.sq[data-sq="${toIdx}"]`);
  const piece = toEl && toEl.querySelector('svg');
  if(!piece) return;
  const toRect = toEl.getBoundingClientRect();
  const dx = fromRect.left - toRect.left, dy = fromRect.top - toRect.top;
  if(!dx && !dy) return;
  piece.style.transition = 'none';
  piece.style.transform = `translate(${dx}px,${dy}px)`;
  piece.getBoundingClientRect();               // force reflow before easing back
  requestAnimationFrame(()=>{
    piece.style.transition = 'transform .46s cubic-bezier(.21,.85,.24,1)';
    piece.style.transform = 'translate(0,0)';
  });
  piece.addEventListener('transitionend', ()=>{ piece.style.transition=''; piece.style.transform=''; }, {once:true});
}

function playMove(m){
  const mover = Pos.side;
  const from = mFrom(m), to = mTo(m), flag = mFlag(m);
  const capPiece = flag===FLAG_EP ? mover*-P : Pos.b[to];
  const san = moveText(m);
  if(capPiece){
    const t = LET[capPiece>0?capPiece:-capPiece];
    (mover>0 ? UI.capByW : UI.capByB).push(t);
  }

  const fromRect = squareRect(from);            // grab positions before the board rebuilds
  let rookFromRect = null, rookTo = -1;
  if(flag === FLAG_CASTLE){
    const home = mover>0 ? 0 : 7;
    const rookFrom = FILE(to)===6 ? SQ(7,home) : SQ(0,home);
    rookTo = FILE(to)===6 ? SQ(5,home) : SQ(3,home);
    rookFromRect = squareRect(rookFrom);
  }

  makeMove(m);
  UI.moves.push({m, san, cap: capPiece ? LET[Math.abs(capPiece)] : null});
  UI.last = {from, to};
  UI.sel=-1; UI.targets=[];

  if(mPromo(m)) toast(PIECE_INFO[UI.variant][LET[P]].n + ' promoted to ' + PIECE_INFO[UI.variant][LET[mPromo(m)]].n + ' on ' + NAME_OF_SQ(to) + '.');
  render();
  slidePieceIn(to, fromRect);
  if(rookFromRect) slidePieceIn(rookTo, rookFromRect);

  if(checkEnd(mover)) return;

  if(inCheck(Pos.side)){
    say(sideName(Pos.side) + ' is in check — that must be answered this turn.');
  } else if(UI.opponent==='human' && UI.autoFlip){
    UI.flipped = Pos.side<0; buildCoords(); render();
    say('Board turned. ' + sideName(Pos.side) + ' to move.');
  }
  if(UI.opponent==='ai' && Pos.side !== UI.human) scheduleAI();
}

function checkEnd(mover){
  const opp = Pos.side;
  const replies = legalMoves();
  const checked = inCheck(opp);
  if(!replies.length){
    if(checked) return finish(mover,'Checkmate', `${sideName(opp)} is attacked with nowhere to go. ${sideName(mover)} wins.`);
    if(UI.variant==='chess') return finish(null,'Stalemate — a draw', `${sideName(opp)} has no legal move but is not in check. Modern chess scores that as a draw.`);
    return finish(mover,'Stalemate — a win', `${sideName(opp)} has no legal move but is not in check. Under Shatranj rules that is a victory for ${sideName(mover)}, not a draw.`);
  }
  if(UI.variant==='chess'){
    if(insufficientMaterial()) return finish(null,'Draw — not enough material', 'Neither side has the material left to force checkmate.');
    if(Pos.half>=100) return finish(null,'Draw — fifty-move rule', 'Fifty moves each without a capture or a pawn move.');
    if(repetitionCount()>=2) return finish(null,'Draw — threefold repetition', 'The same position has appeared three times.');
  } else {
    if(bareKing(opp) && !bareKing(mover)){
      const canEven = replies.some(mv => { makeMove(mv); const r = bareKing(mover); unmakeMove(); return r; });
      if(canEven) return finish(null,'Drawn — both Rajas bared', `${sideName(opp)} is down to a lone Raja but can strip ${sideName(mover)} bare in reply. The old rule calls that a draw.`);
      return finish(mover,'Raja bared', `${sideName(opp)} has nothing left but the Raja. ${sideName(mover)} wins.`);
    }
  }
  return false;
}

function finish(winner, title, text){
  UI.over=true; UI.sel=-1; UI.targets=[];
  render();
  let kicker='GAME OVER';
  if(winner && UI.opponent==='ai') kicker = winner===UI.human ? 'YOU WIN' : 'KREEDU WINS';
  else if(winner) kicker = sideName(winner).toUpperCase() + ' WINS';
  else kicker = 'DRAWN';
  document.getElementById('result-kicker').textContent = kicker;
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-text').textContent = text;
  document.getElementById('result-modal').classList.add('active');
  say(title + '.');
  return true;
}
function closeResult(){ document.getElementById('result-modal').classList.remove('active'); }
document.getElementById('result-modal').addEventListener('click', e=>{ if(e.target.id==='result-modal') closeResult(); });

function resign(){
  if(UI.over) return;
  if(!confirm('Resign this game?')) return;
  const loser = UI.opponent==='ai' ? UI.human : Pos.side;
  finish(-loser, 'Resignation', `${sideName(loser)} resigns. ${sideName(-loser)} wins.`);
}

function undoMove(){
  if(UI.thinking || !UI.moves.length) return;
  const step = ()=>{
    const rec = UI.moves.pop();
    if(!rec) return false;
    unmakeMove();
    if(rec.cap){ const list = Pos.side>0 ? UI.capByW : UI.capByB; const k=list.lastIndexOf(rec.cap); if(k>=0) list.splice(k,1); }
    return true;
  };
  step();
  if(UI.opponent==='ai') while(Pos.side !== UI.human && UI.moves.length) step();
  UI.over=false; UI.sel=-1; UI.targets=[];
  UI.last = UI.moves.length ? {from:mFrom(UI.moves[UI.moves.length-1].m), to:mTo(UI.moves[UI.moves.length-1].m)} : null;
  if(UI.opponent==='human' && UI.autoFlip){ UI.flipped = Pos.side<0; buildCoords(); }
  closeResult(); render();
  say('Move taken back.');
  if(UI.opponent==='ai' && Pos.side !== UI.human) scheduleAI();
}

function toggleSwitch(which){
  if(which==='hints'){ UI.hints=!UI.hints; document.getElementById('sw-hints').classList.toggle('on',UI.hints); }
  else if(which==='flip'){
    UI.autoFlip=!UI.autoFlip; document.getElementById('sw-flip').classList.toggle('on',UI.autoFlip);
    if(UI.autoFlip){ UI.flipped = Pos.side<0; buildCoords(); }
  } else if(which==='check'){
    setBoardStyle(UI.boardStyle==='checkered' ? 'ashtapada' : 'checkered');
  }
  render();
}

/* ---------------- Kreedu ---------------- */
const CHATTER = {
  chaturanga:[
    'The chariots are the only pieces that reach across this board — mind them.',
    'Elephants touch only eight squares in the whole game. Odd creatures.',
    'No queen here. Everything has to be built one square at a time.',
    'Your Raja can walk into the fight — nothing here punishes it from afar.'
  ],
  chess:[
    'Knights before bishops, usually. Usually.',
    'A rook on an open file does more work than two minor pieces shuffling.',
    'If you are ahead on material, trade pieces and keep pawns.',
    'Every check I give you is a move I am not developing with.'
  ]
};

function scheduleAI(){
  if(UI.over) return;
  UI.thinking = true;
  renderStatus();
  document.getElementById('btn-undo').disabled = true;
  say('Kreedu is reading the board…', true);
  setTimeout(()=>{
    const m = bestMove(UI.level);
    UI.thinking = false;
    if(!m || UI.over){ render(); return; }
    playMove(m);
    if(!UI.over && !inCheck(Pos.side)){
      const pool = CHATTER[UI.variant];
      say(Math.random()<0.35 ? pool[Math.floor(Math.random()*pool.length)] : 'Your move.');
    }
  }, 40);
}

/* ---------------- tutorial ---------------- */
let demoPiece = 'P';

function buildTutorial(){
  const v = UI.variant;
  const panes = TUTORIAL[v];
  document.getElementById('tut-title').textContent = v==='chaturanga' ? 'How to play Chaturangam' : 'How to play chess';
  document.getElementById('tut-nav').innerHTML = panes.map(p=>`<button data-pane="${p.id}" onclick="showPane('${p.id}')">${p.label}</button>`).join('');
  document.getElementById('tut-panes').innerHTML = panes.map(p=>`<div class="tut-pane" id="pane-${p.id}">${p.html}</div>`).join('');
  demoPiece = ORDER[v][0];
  showPane(panes[0].id);
}
function openTutorial(pane){
  document.getElementById('tutorial').classList.add('active');
  buildTutorial();
  if(pane && document.getElementById('pane-'+pane)) showPane(pane);
}
function closeTutorial(){ document.getElementById('tutorial').classList.remove('active'); }
function showPane(id){
  document.querySelectorAll('.tut-pane').forEach(p=>p.classList.remove('active'));
  const pane = document.getElementById('pane-'+id);
  if(pane) pane.classList.add('active');
  document.querySelectorAll('#tut-nav button').forEach(b=>b.classList.toggle('sel', b.dataset.pane===id));
  if(id==='pieces') renderDemo(demoPiece);
}
document.getElementById('tutorial').addEventListener('click', e=>{ if(e.target.id==='tutorial') closeTutorial(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeTutorial(); closeResult(); } });

function renderDemo(t){
  demoPiece = t;
  const v = UI.variant;
  const info = PIECE_INFO[v][t];
  document.getElementById('piece-picker').innerHTML = ORDER[v].map(k=>
    `<button class="${k===t?'sel':''}" onclick="renderDemo('${k}')"><span class="pc-w">${getArt(v, k)}</span>${PIECE_INFO[v][k].n}</button>`).join('');

  const N5=5, C=12, f0=2, r0=2;
  const cells = new Array(25).fill('');
  const put=(f,r,c)=>{ if(f>=0&&f<N5&&r>=0&&r<N5) cells[r*N5+f]=c; };
  const ray=(df,dr)=>{ let f=f0+df,r=r0+dr; while(f>=0&&f<N5&&r>=0&&r<N5){ put(f,r,'mv'); f+=df; r+=dr; } };

  if(t==='R'){ ray(1,0); ray(-1,0); ray(0,1); ray(0,-1); put(f0,4,'cap'); }
  else if(t==='B'){ ray(1,1); ray(1,-1); ray(-1,1); ray(-1,-1); put(4,4,'cap'); }
  else if(t==='Q'){ for(const[a,b] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) ray(a,b); put(4,4,'cap'); }
  else if(t==='P'){
    put(f0,r0+1,'mv');
    if(v==='chess') put(f0,r0+2,'mv');
    put(f0-1,r0+1,'cap'); put(f0+1,r0+1,'cap');
  }
  else if(t==='N'){ for(const[a,b] of [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]]) put(f0+a,r0+b,'mv'); put(f0+1,r0+2,'cap'); }
  else if(t==='K'){ for(const[a,b] of [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]) put(f0+a,r0+b,'mv'); put(f0+1,r0+1,'cap'); }
  else if(t==='M'){ for(const[a,b] of [[1,1],[1,-1],[-1,1],[-1,-1]]) put(f0+a,r0+b,'mv'); put(f0+1,r0+1,'cap'); }
  else if(t==='E'){
    for(const[a,b] of [[2,2],[2,-2],[-2,2],[-2,-2]]) put(f0+a,r0+b,'mv');
    for(const[a,b] of [[1,1],[1,-1],[-1,1],[-1,-1]]) put(f0+a,r0+b,'hop');
    put(4,4,'cap');
  }

  const board=document.getElementById('demo-board');
  board.innerHTML='';
  for(let r=N5-1;r>=0;r--) for(let f=0;f<N5;f++){
    const d=document.createElement('div'), k=r*N5+f;
    if((f+r)%2===0) d.classList.add('alt');
    if(cells[k]) d.classList.add(cells[k]);
    if(k===C){ d.innerHTML=getArt(v, t); d.classList.add('pc-w'); }
    else if(cells[k]==='cap'){ d.innerHTML=getArt(v, 'P'); d.classList.add('pc-b'); }
    board.appendChild(d);
  }

  const chessNote = v==='chess' ? '' :
    `<p style="font-size:13px;color:var(--ink-soft);font-weight:700;">Written as <strong>${info.tag}</strong> in the move record</p>`;
  document.getElementById('demo-info').innerHTML = `
    <span class="worth">${info.worth}</span>
    <h4>${info.n}${info.t ? ' · ' + info.t : ''}${info.en ? ' — ' + info.en : ''}</h4>
    <p><strong>Moves:</strong> ${info.how}</p>
    <p>${info.note}</p>${chessNote}`;
}

/* ---------------- boot ---------------- */
setVariant('chaturanga');
setOpponent('ai');
setLevel(2);
setSide('w');
setBoardStyle('ashtapada');