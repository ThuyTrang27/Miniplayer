////
const API_URL = "https://68e491038e116898997c170f.mockapi.io/Song";

// ========================
// HÀM XỬ LÝ DỮ LIỆU
// ========================
function normalize(song) {
  return {
    id: song.id,
    name: song.Name || song.name,
    artist: song.Artist || song.artist,
    img: song.Img || song.img,
    url: song.Url || song.url,
    genre: song.Genre || song.genre,
    year: song.Year || song.year,
    likes: song.Likes || song.likes || 0,
    release: song.Release || song.release || '',
  };
}

// ========================
// HÀM TẠO THẺ BÀI HÁT
// ========================
function createSongCard(song, opts = {}) {
  const s = normalize(song);
  const card = document.createElement("div");
  card.className = opts.large ? "song-card large" : "song-card";
  if (opts.large) {
    card.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;padding:8px">
        <img src="${s.img}" alt="${s.name}" style="width:96px;height:96px;object-fit:cover;border-radius:6px">
        <div>
          <h3 style="margin:0;font-size:18px">${s.name}</h3>
          <p style="margin:4px 0;color:#666">${s.artist}</p>
          <p style="margin:4px 0;color:#888;font-size:12px">${s.genre || ''} • ${s.year || ''}</p>
        </div>
      </div>
    `;
  } else {
    card.innerHTML = `
      <img src="${s.img}" alt="${s.name}">
      <h4>${s.name}</h4>
      <p>${s.artist}</p>
    `;
  }

  // Khi click vào bài hát → lưu vào localStorage → chuyển sang Player
  card.addEventListener("click", () => {
    localStorage.setItem("currentSong", JSON.stringify(s));
    window.location.href = `player.html?id=${s.id}`;
  });

  return card;
}

// ========================
// HÀM HIỂN THỊ DANH SÁCH BÀI HÁT
// ========================
async function renderSongs() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    localStorage.setItem("songList", JSON.stringify(data));

    const page = document.body.id; // Lấy id của body để biết đang ở trang nào

    // --- TRANG HOMEPAGE ---
    if (page === "homepage") {
      const top = document.getElementById('top')
      const songSection = document.getElementById('Song')
      if (top) data.slice(0, 8).forEach(s => top.appendChild(createSongCard(s)));
      if (songSection) data.slice(8, 16).forEach(s => songSection.appendChild(createSongCard(s)));
    }

    // --- TRANG SONGS (tất cả bài hát) ---
    if (page === "songs") {
      const container = document.getElementById('all');
      if (container) data.forEach(s => container.appendChild(createSongCard(s)));
    }

    // --- TRANG PLAYLIST (phân loại theo Genre) ---
    if (page === "playlist") {
  const genres = ["V-Pop", "US-UK", "K-Pop", "C-Pop"];
  genres.forEach(g => {
    const section = document.getElementById(g);
    if (section) {
      const filtered = data.filter(s => (s.Genre || s.genre) === g);
      filtered.forEach(song => section.appendChild(createSongCard(song)));
    }
  });
}


    // --- TRANG PLAYER (chi tiết bài hát) ---
    
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu:", err);
  }
}


// ========================
// SEARCH (simple) — top-level so it always attaches
// ========================
function stripDiacritics(str){
  if(!str) return '';
  try{ return str.normalize('NFD').replace(/\p{Diacritic}/gu, ''); }catch(e){ return str.replace(/[\u0300-\u036f]/g,''); }
}

function normalizeQuery(q){ return stripDiacritics((q||'').toString().trim().toLowerCase()); }

// Find matches and return an array (does not touch DOM)
async function findMatches(query){
  const q = normalizeQuery(query);
  if (!q) return [];
  let list = [];
  const cached = localStorage.getItem('songList');
  if (cached) {
    try { list = JSON.parse(cached); } catch(e){ localStorage.removeItem('songList'); }
  }
  if (!list || !list.length) {
    try { const res = await fetch(API_URL); list = await res.json(); localStorage.setItem('songList', JSON.stringify(list)); } catch(e){ console.warn('search: failed to fetch list', e); }
  }
  const hits = list.filter(s => {
    const rawName = (s.Name || s.name || '').toString();
    const rawArtist = (s.Artist || s.artist || '').toString();
    const name = stripDiacritics(rawName).toLowerCase();
    const artist = stripDiacritics(rawArtist).toLowerCase();
    return name.includes(q) || artist.includes(q);
  });
  return hits;
}

// Render an array of hits into a container element (use large cards by default for Search page)
function renderHits(container, hits, opts = { large: true }){
  if (!container) return;
  container.innerHTML = '';
  if (!hits || !hits.length) { container.innerHTML = '<p style="padding:12px;color:#666">Không tìm thấy kết quả.</p>'; return; }
  hits.forEach(s => container.appendChild(createSongCard(s, { large: !!opts.large })));
}

// expose helpers globally for Search page
window.findMatches = findMatches;
window.renderHits = renderHits;

async function performSearch(query){
  const q = normalizeQuery(query);
  console.debug('search: performSearch called with', {raw: query, q});
  let container = document.getElementById('Song');
  let createdTemp = false;
  if (!container) {
    // create a temporary results container below the search input so search works on any page
    const input = document.querySelector('.input-homepage');
    if (!input) { console.debug('search: no #Song and no .input-homepage found'); return; }
    let temp = document.getElementById('search-results-temp');
    if (!temp) {
      temp = document.createElement('div');
      temp.id = 'search-results-temp';
      temp.style.padding = '8px';
      temp.style.background = '#fff';
      temp.style.border = '1px solid #eee';
      temp.style.marginTop = '8px';
      temp.style.maxHeight = '320px';
      temp.style.overflow = 'auto';
      input.parentNode.insertBefore(temp, input.nextSibling);
      createdTemp = true;
    }
    container = temp;
  }
  container.innerHTML = '<p style="padding:12px;color:#666">Đang tìm...</p>';

  if (!q) {
    // if empty query, show default recent songs (renderSongs already runs on load)
    // try to re-use cached songList
    const cached = localStorage.getItem('songList');
    container.innerHTML = '';
    if (cached) {
      try { const all = JSON.parse(cached); all.slice(8,16).forEach(s=> container.appendChild(createSongCard(s))); return; } catch(e){}
    }
    return;
  }

  // try cache first
  let list = [];
  const cached = localStorage.getItem('songList');
  if (cached) {
    try { list = JSON.parse(cached); console.debug('search: loaded list from cache', {len: (list && list.length)||0}); } catch(e){ console.warn('search: failed to parse cached songList', e); localStorage.removeItem('songList'); }
  }

  if (!list || !list.length) {
    try { const res = await fetch(API_URL); list = await res.json(); localStorage.setItem('songList', JSON.stringify(list)); } catch(e){ console.warn('search: failed to fetch list', e); }
  }

  console.debug('search: total list length before filter', (list && list.length) || 0);
  const hits = list.filter(s => {
    const rawName = (s.Name || s.name || '').toString();
    const rawArtist = (s.Artist || s.artist || '').toString();
    const name = stripDiacritics(rawName).toLowerCase();
    const artist = stripDiacritics(rawArtist).toLowerCase();
    return name.includes(q) || artist.includes(q);
  });
  console.debug('search: hits found', hits.length);
  container.innerHTML = '';
  if (!hits.length) {
    container.innerHTML = '<p style="padding:12px;color:#666">Không tìm thấy kết quả.</p>';
    return;
  }

  hits.forEach(s => container.appendChild(createSongCard(s, { large: true })));
}

// attach search handlers on pages that have the input
document.addEventListener('DOMContentLoaded', ()=>{
  try{
      const input = document.querySelector('.input-homepage');
      const icon = document.querySelector('.icon-search');
    console.debug('search: initializing handlers', {hasInput: !!input, hasIcon: !!icon});
      if (!input) return;
      // when user submits search, navigate to the search results page so it works from any page
      input.addEventListener('keyup', (e)=>{ if (e.key === 'Enter') { const q = encodeURIComponent(input.value||''); window.location.href = `Search.html?q=${q}`; } });
        if (icon) icon.addEventListener('click', ()=> { const q = encodeURIComponent(input.value||''); window.location.href = `Search.html?q=${q}`; });
    }catch(e){console.warn('search init failed', e);}
  });

// ========================
// CHẠY KHI LOAD TRANG
// ========================
document.addEventListener("DOMContentLoaded", renderSongs);

//SEARCH FOR
