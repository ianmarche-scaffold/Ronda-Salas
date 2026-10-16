(function(){
  "use strict";

  const ROOMS = [
    {id:'nairobi',  name:'Nairóbi',  floor:'Térreo'},
    {id:'acra',     name:'Acra',     floor:'Térreo'},
    {id:'cairo',    name:'Cairo',    floor:'Térreo'},
    {id:'adelaide', name:'Adelaide', floor:'1º andar'},
    {id:'sydney',   name:'Sydney',   floor:'1º andar'},
    {id:'barcelona',name:'Barcelona',floor:'2º andar'},
    {id:'berlim',   name:'Berlim',   floor:'2º andar'},
    {id:'londres',  name:'Londres',  floor:'2º andar'},
    {id:'roma',     name:'Roma',     floor:'2º andar'},
    {id:'pequim',   name:'Pequim',   floor:'4º andar'},
    {id:'seul',     name:'Seul',     floor:'4º andar'},
    {id:'toquio',   name:'Tóquio',   floor:'4º andar'},
  ];
  const FLOORS = ['Térreo','1º andar','2º andar','4º andar'];
  const WEEKDAYS = ['dom','seg','ter','qua','qui','sex','sáb'];

  const state = {
    date: todayKey(),
    checkins: {},   // { roomId: {status:'ok'|'occupied'|'warn', note:'', time:'HH:MM'} }
    activeFloor: FLOORS[0],
    loading: true,
  };

  function todayKey(d){
    const dt = d || new Date();
    return dt.toLocaleDateString('en-CA'); // YYYY-MM-DD, local time
  }

  function formatHeaderDate(dateStr){
    const [y,m,d] = dateStr.split('-');
    return `${d}/${m}`;
  }

  function formatChipLabel(dateStr, todayStr){
    if(dateStr === todayStr) return 'Hoje';
    const dt = new Date(dateStr+'T12:00:00');
    const yestDt = new Date(todayStr+'T12:00:00');
    yestDt.setDate(yestDt.getDate()-1);
    if(dateStr === todayKey(yestDt)) return 'Ontem';
    return WEEKDAYS[dt.getDay()] + ' ' + dateStr.slice(8,10) + '/' + dateStr.slice(5,7);
  }

  function nowTime(){
    return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  }

  // ---------- storage (localStorage do navegador) ----------
  async function loadDay(dateStr){
    try{
      const raw = localStorage.getItem('day:'+dateStr);
      return raw ? JSON.parse(raw) : {};
    }catch(e){
      return {};
    }
  }

  async function saveDay(dateStr, data){
    try{
      localStorage.setItem('day:'+dateStr, JSON.stringify(data));
    }catch(e){
      showToast('Não foi possível salvar (armazenamento do navegador indisponível).');
    }
  }

  async function listRecentDays(){
    try{
      const days = Object.keys(localStorage)
        .filter(k => k.startsWith('day:'))
        .map(k => k.replace('day:',''))
        .sort().reverse();
      const set = new Set(days);
      set.add(state.date);
      return Array.from(set).sort().reverse().slice(0,7);
    }catch(e){
      return [state.date];
    }
  }

  // ---------- render: tabs ----------
  function renderTabs(){
    const nav = document.getElementById('tabs');
    nav.innerHTML = '';
    FLOORS.forEach(floor=>{
      const btn = document.createElement('button');
      btn.textContent = floor;
      if(floor === state.activeFloor) btn.classList.add('active');
      btn.addEventListener('click', ()=>{
        state.activeFloor = floor;
        renderTabs();
        renderRooms();
      });
      nav.appendChild(btn);
    });
  }

  // ---------- render: room list ----------
  function renderRooms(){
    const main = document.getElementById('roomList');
    main.innerHTML = '';
    const rooms = ROOMS.filter(r => r.floor === state.activeFloor);
    if(rooms.length === 0){
      const empty = document.createElement('div');
      empty.className = 'empty-floor';
      empty.textContent = 'Nenhuma sala de reunião neste andar.';
      main.appendChild(empty);
      return;
    }
    rooms.forEach(room=>{
      main.appendChild(renderRoomCard(room));
    });
    renderProgress();
  }

  function renderRoomCard(room){
    const entry = state.checkins[room.id] || {};
    const card = document.createElement('div');
    card.className = 'room-card';

    const head = document.createElement('div');
    head.className = 'room-head';
    const name = document.createElement('div');
    name.className = 'room-name';
    name.textContent = room.name;
    head.appendChild(name);
    const time = document.createElement('div');
    time.className = 'room-time';
    time.textContent = entry.time ? entry.time : '';
    head.appendChild(time);
    card.appendChild(head);

    const statusRow = document.createElement('div');
    statusRow.className = 'status-row';

    const okBtn = document.createElement('button');
    okBtn.className = 'status-btn ok' + (entry.status === 'ok' ? ' selected' : '');
    okBtn.innerHTML = '<span class="dot"></span> Tudo certo';
    okBtn.addEventListener('click', ()=> toggleStatus(room.id, 'ok'));

    const occupiedBtn = document.createElement('button');
    occupiedBtn.className = 'status-btn occupied' + (entry.status === 'occupied' ? ' selected' : '');
    occupiedBtn.innerHTML = '<span class="dot"></span> Sala Ocupada';
    occupiedBtn.addEventListener('click', ()=> toggleStatus(room.id, 'occupied'));

    const warnBtn = document.createElement('button');
    warnBtn.className = 'status-btn warn' + (entry.status === 'warn' ? ' selected' : '');
    warnBtn.innerHTML = '<span class="dot"></span> Cabos desorganizados';
    warnBtn.addEventListener('click', ()=> toggleStatus(room.id, 'warn'));

    statusRow.appendChild(okBtn);
    statusRow.appendChild(occupiedBtn);
    statusRow.appendChild(warnBtn);
    card.appendChild(statusRow);

    const note = document.createElement('textarea');
    note.className = 'note';
    note.placeholder = 'Observação (opcional)';
    note.value = entry.note || '';
    note.addEventListener('change', ()=>{
      const e = state.checkins[room.id] || {status:null, note:'', time:null};
      e.note = note.value;
      state.checkins[room.id] = e;
      saveDay(state.date, state.checkins);
    });
    card.appendChild(note);

    return card;
  }

  function toggleStatus(roomId, status){
    const current = state.checkins[roomId] || {};
    if(current.status === status){
      // undo
      current.status = null;
      current.time = null;
    } else {
      current.status = status;
      current.time = nowTime();
    }
    if(current.note === undefined) current.note = '';
    state.checkins[roomId] = current;
    saveDay(state.date, state.checkins);
    renderRooms();
  }

  function renderProgress(){
    const total = ROOMS.length;
    const done = ROOMS.filter(r => state.checkins[r.id] && state.checkins[r.id].status).length;
    document.getElementById('progressLabel').textContent = `${done}/${total} salas verificadas`;
    document.getElementById('progressFill').style.width = total ? `${(done/total)*100}%` : '0%';
  }

  // ---------- report ----------
  // Use fromCodePoint so the icons are encoding-agnostic (no literal emoji in source).
  const STATUS_ICONS = {
    ok:       String.fromCodePoint(0x2705),          // U+2705  checkmark box
    occupied: String.fromCodePoint(0x1F7E1),          // U+1F7E1 yellow circle
    warn:     String.fromCodePoint(0x1F50C, 0x274C), // U+1F50C + U+274C plug + cross
  };

  function buildReportText(dateStr, checkins){
    const dt = new Date(dateStr+'T12:00:00');
    const dateLabel = dt.toLocaleDateString('pt-BR');
    const lines = [];
    lines.push(`Verificação de Salas – ${dateLabel}`);
    let problems = 0, checked = 0;
    FLOORS.forEach(floor=>{
      const rooms = ROOMS.filter(r=>r.floor===floor);
      if(rooms.length === 0) return;
      lines.push('');
      lines.push(floor);
      rooms.forEach(room=>{
        const e = checkins[room.id];
        if(!e || !e.status){
          lines.push(`  [ ] ${room.name} – não verificada`);
          return;
        }
        checked++;
        if(e.status === 'ok'){
          lines.push(`  [${STATUS_ICONS.ok}] ${room.name} – tudo certo (${e.time || '--:--'})`);
        } else if(e.status === 'occupied'){
          lines.push(`  [${STATUS_ICONS.occupied}] ${room.name} – sala ocupada durante a verificação (${e.time || '--:--'})`);
        } else {
          problems++;
          lines.push(`  [${STATUS_ICONS.warn}] ${room.name} – cabos desorganizados (${e.time || '--:--'})`);
        }
        if(e.note && e.note.trim()){
          lines.push(`       obs: ${e.note.trim()}`);
        }
      });
    });
    lines.splice(1, 0, `${checked}/${ROOMS.length} verificadas · ${problems} com problema`);
    return lines.join('\n');
  }

  let currentReportDate = null;

  async function openReport(){
    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('reportText').textContent = 'Carregando…';
    const days = await listRecentDays();
    currentReportDate = state.date;
    renderDayChips(days);
    await showReportFor(state.date);
  }

  function renderDayChips(days){
    const wrap = document.getElementById('dayChips');
    wrap.innerHTML = '';
    days.forEach(d=>{
      const chip = document.createElement('button');
      chip.className = 'day-chip' + (d === currentReportDate ? ' active' : '');
      chip.textContent = formatChipLabel(d, state.date);
      chip.addEventListener('click', async ()=>{
        currentReportDate = d;
        renderDayChips(days);
        await showReportFor(d);
      });
      wrap.appendChild(chip);
    });
  }

  async function showReportFor(dateStr){
    const data = dateStr === state.date ? state.checkins : await loadDay(dateStr);
    const hasAny = Object.keys(data).length > 0;
    document.getElementById('reportText').textContent = hasAny || dateStr === state.date
      ? buildReportText(dateStr, data)
      : 'Nenhuma sala verificada nesse dia.';
  }

  function closeReport(){
    document.getElementById('modalOverlay').classList.remove('open');
  }

  async function copyReport(){
    const text = document.getElementById('reportText').textContent;
    try{
      await navigator.clipboard.writeText(text);
      showToast('Relatório copiado!');
    }catch(e){
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try{
        document.execCommand('copy');
        showToast('Relatório copiado!');
      }catch(e2){
        showToast('Não foi possível copiar. Selecione o texto manualmente.');
      }
      document.body.removeChild(ta);
    }
  }

  // ---------- WhatsApp share ----------
  function sendWhatsapp(){
    const text = document.getElementById('reportText').textContent;
    const url = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  }

  // ---------- Discord webhook ----------
  const DISCORD_KEY = 'discordWebhookUrl';
  const DISCORD_LIMIT = 1900;
  const DISCORD_OVERFLOW_MSG = '\n\n(relatório completo disponível no botão Copiar)';

  async function sendDiscord(){
    const webhookUrl = localStorage.getItem(DISCORD_KEY) || '';
    if(!webhookUrl.trim()){
      openWebhookModal();
      return;
    }
    let text = document.getElementById('reportText').textContent;
    if(text.length > DISCORD_LIMIT){
      text = text.slice(0, DISCORD_LIMIT - DISCORD_OVERFLOW_MSG.length) + DISCORD_OVERFLOW_MSG;
    }
    try{
      const res = await fetch(webhookUrl, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({content: text})
      });
      if(res.ok || res.status === 204){
        showToast('Enviado ao Discord!');
      } else {
        showToast('Erro ao enviar (' + res.status + '). Verifique a Webhook URL.');
      }
    }catch(err){
      showToast('Falha de rede ao enviar ao Discord.');
    }
  }

  // ---------- Webhook config modal ----------
  function openWebhookModal(){
    const saved = localStorage.getItem(DISCORD_KEY) || '';
    document.getElementById('webhookInput').value = saved;
    document.getElementById('webhookOverlay').classList.add('open');
    setTimeout(()=>document.getElementById('webhookInput').focus(), 80);
  }

  function closeWebhookModal(){
    document.getElementById('webhookOverlay').classList.remove('open');
  }

  function saveWebhook(){
    const val = document.getElementById('webhookInput').value.trim();
    if(!val){
      showToast('Cole a URL do webhook antes de salvar.');
      return;
    }
    localStorage.setItem(DISCORD_KEY, val);
    closeWebhookModal();
    showToast('Webhook salvo!');
  }

  // ---------- toast ----------
  let toastTimer = null;
  function showToast(msg){
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> el.classList.remove('show'), 2200);
  }

  // ---------- init ----------
  async function init(){
    document.getElementById('headerDate').textContent = formatHeaderDate(state.date);
    renderTabs();
    state.checkins = await loadDay(state.date);
    state.loading = false;
    document.getElementById('headerSub').textContent = 'toque numa sala para registrar a verificação';
    renderRooms();

    document.getElementById('openReportBtn').addEventListener('click', openReport);
    document.getElementById('closeReportBtn').addEventListener('click', closeReport);
    document.getElementById('closeReportBtn2').addEventListener('click', closeReport);
    document.getElementById('copyReportBtn').addEventListener('click', copyReport);
    document.getElementById('sendWhatsappBtn').addEventListener('click', sendWhatsapp);
    document.getElementById('sendDiscordBtn').addEventListener('click', sendDiscord);
    document.getElementById('modalOverlay').addEventListener('click', (ev)=>{
      if(ev.target.id === 'modalOverlay') closeReport();
    });
    // Webhook modal
    document.getElementById('openWebhookBtn').addEventListener('click', openWebhookModal);
    document.getElementById('closeWebhookBtn').addEventListener('click', closeWebhookModal);
    document.getElementById('closeWebhookBtn2').addEventListener('click', closeWebhookModal);
    document.getElementById('saveWebhookBtn').addEventListener('click', saveWebhook);
    document.getElementById('webhookOverlay').addEventListener('click', (ev)=>{
      if(ev.target.id === 'webhookOverlay') closeWebhookModal();
    });
    document.getElementById('webhookInput').addEventListener('keydown', (ev)=>{
      if(ev.key === 'Enter') saveWebhook();
    });
  }

  init();

  // ---------- PWA: registrar service worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js');
    });
  }
})();
