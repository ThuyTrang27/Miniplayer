// player.js — simple player page logic
const API_URL = "https://68e491038e116898997c170f.mockapi.io/Song";

function qs(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function normalize(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    Name: raw.Name || raw.name || '',
    Artist: raw.Artist || raw.artist || '',
    Img: raw.Img || raw.img || '',
    Url: raw.Url || raw.url || raw.Audio || raw.audio || '' ,
    Times: raw.Times || raw.times || raw.Count || raw.count || '',
  Count: raw.Count || raw.count || raw.Times || raw.times || '',
    Genre: raw.Genre || raw.genre || '',
    Year: raw.Year || raw.year || '',
    Likes: raw.Likes || raw.Like || raw.likes || 0,
    Date: raw.Date || raw.ReleaseDate || ''
  };
}

function renderSong(song) {
  if (!song) return;
  document.getElementById('song-image').src = song.Img || '';
  document.getElementById('song-title').textContent = song.Name || '';
  document.getElementById('song-artist').textContent = song.Artist || '';
  const genreEl = document.getElementById('song-genre'); if (genreEl) genreEl.textContent = song.Genre || '';
  const yearEl = document.getElementById('song-year'); if (yearEl) yearEl.textContent = song.Year || '';
  const timeEl = document.getElementById('song-time'); if (timeEl) timeEl.textContent = song.Times || '';
  const likesEl = document.getElementById('song-likes'); if (likesEl) likesEl.textContent = song.Likes || '';
  const countEl = document.getElementById('song-count'); if (countEl) countEl.textContent = song.Count || song.Times || '';
  const dateEl = document.getElementById('release-date'); if (dateEl) dateEl.textContent = song.Date || '';
  const audio = document.getElementById('player-audio');
  if (audio) {
    audio.src = song.Url || '';
    audio.style.display = song.Url ? '' : 'none';
    // update bottom bar cover/title/artist if present
    const bottomCover = document.getElementById('bottom-cover'); if (bottomCover) bottomCover.src = song.Img || '';
    const bottomTitle = document.getElementById('bottom-title'); if (bottomTitle) bottomTitle.textContent = song.Name || '';
    const bottomArtist = document.getElementById('bottom-artist'); if (bottomArtist) bottomArtist.textContent = song.Artist || '';
    // when metadata loads, set duration display
    audio.addEventListener('loadedmetadata', () => {
      const bottomDuration = document.getElementById('bottom-duration');
      if (bottomDuration && audio.duration && !isNaN(audio.duration)) bottomDuration.textContent = formatTime(audio.duration);
    }, { once: true });
  }
}

function showError(msg) {
  console.error(msg);
  const el = document.getElementById('player-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function showDebug(label, obj) {
  console.log(label, obj);
  const el = document.getElementById('player-debug');
  if (!el) return;
  el.style.display = 'block';
  try { el.textContent += '\n' + label + ': ' + JSON.stringify(obj, null, 2); } catch (e) { el.textContent += '\n' + label + ': (unable to stringify)'; }
}

async function initPlayer() {
  const id = qs('id');
  // Try to read from localStorage first
  const stored = localStorage.getItem('currentSong');
  if (stored) {
    try {
  const raw = JSON.parse(stored);
  showDebug('stored-raw', raw);
  const song = normalize(raw);
  showDebug('normalized', song);
  renderSong(song);
      // still fetch list for prev/next
      const listRes = await fetch(API_URL);
      const list = await listRes.json();
      const index = list.findIndex(x => String(x.id) === String(song.id || song.id));
      setupControls(list, index === -1 ? list.findIndex(x => String(x.id) === String(id)) : index);
      return;
    } catch (err) {
      console.warn('Failed to parse stored song, falling back to fetch', err);
      localStorage.removeItem('currentSong');
      showError('There was a problem reading the stored song. Reloading from server...');
    }
  }

  // If no stored song, try to lookup in cached songList by id before fetching from API
  if (!stored) {
    if (id) {
      const cachedList = localStorage.getItem('songList');
      if (cachedList) {
        try {
          const list = JSON.parse(cachedList);
          const found = list.find(x => String(x.id) === String(id));
          if (found) {
            showDebug('found-in-cached-list', found);
            const song = normalize(found);
            showDebug('normalized', song);
            renderSong(song);
            setupControls(list, list.findIndex(x => String(x.id) === String(id)));
            return;
          }
        } catch (e) {
          console.warn('player.js: failed to parse cached songList', e);
          localStorage.removeItem('songList');
        }
      }
    }
  }

  if (!id) return showError('No song id provided and no stored song found.');
  try {
    // fetch the single song
    const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`);
    const raw = await res.json();
    const song = normalize(raw);
    renderSong(song);

    // also fetch full list to enable prev/next
    const listRes = await fetch(API_URL);
    const list = await listRes.json();
    const index = list.findIndex(x => String(x.id) === String(id));

    setupControls(list, index);
  } catch (err) {
    console.error('Player init error', err);
    showError('Failed to load song from server. Check network or open DevTools for details.');
  }
}

function setupControls(list, currentIndex) {
  const audio = document.getElementById('player-audio');
  const btnPlay = document.getElementById('btn-play');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const bottomBar = document.getElementById('bottom-bar');
  const bottomPlay = document.getElementById('bottom-play');
  const bottomPrev = document.getElementById('bottom-prev');
  const bottomNext = document.getElementById('bottom-next');
  const bottomProgress = document.getElementById('bottom-progress');
  const bottomProgressWrap = document.getElementById('bottom-progress-wrap');
  const bottomCurrent = document.getElementById('bottom-current');
  const bottomDuration = document.getElementById('bottom-duration');
  const bottomCover = document.getElementById('bottom-cover');
  const bottomTitle = document.getElementById('bottom-title');
  const bottomArtist = document.getElementById('bottom-artist');

  if (btnPlay && audio) {
    btnPlay.addEventListener('click', () => {
      if (audio.paused) { audio.play(); btnPlay.textContent = 'Pause'; }
      else { audio.pause(); btnPlay.textContent = 'Play'; }
    });
  }

  // bottom play sync
  if (bottomPlay && audio) {
    bottomPlay.addEventListener('click', () => {
      if (audio.paused) { audio.play(); bottomPlay.textContent = '▌▌'; if (btnPlay) btnPlay.textContent = 'Pause'; }
      else { audio.pause(); bottomPlay.textContent = '▶'; if (btnPlay) btnPlay.textContent = 'Play'; }
    });
  }

  // prev/next from bottom bar
  if (bottomPrev) bottomPrev.addEventListener('click', () => { if (btnPrev) btnPrev.click(); });
  if (bottomNext) bottomNext.addEventListener('click', () => { if (btnNext) btnNext.click(); });

  // show bottom bar when audio plays
  if (audio) {
    audio.addEventListener('play', () => {
      if (bottomBar) bottomBar.style.display = 'flex';
      if (bottomPlay) bottomPlay.textContent = '▌▌';
    });
    audio.addEventListener('pause', () => {
      if (bottomPlay) bottomPlay.textContent = '▶';
    });

    // update progress and times
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration || !bottomProgress) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      bottomProgress.style.width = pct + '%';
      if (bottomCurrent) bottomCurrent.textContent = formatTime(audio.currentTime);
      if (bottomDuration) bottomDuration.textContent = formatTime(audio.duration);
    });

    // clicking on bottom progress to seek
    if (bottomProgressWrap) {
      bottomProgressWrap.addEventListener('click', (ev) => {
        const rect = bottomProgressWrap.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const pct = x / rect.width;
        if (audio.duration) audio.currentTime = pct * audio.duration;
      });
    }
  }

  const goTo = async (idx) => {
    if (idx < 0 || idx >= list.length) return;
    const id = list[idx].id;
    // navigate by replacing location with new id (simple and clear)
    window.location.href = `player.html?id=${encodeURIComponent(id)}`;
  };

  if (btnPrev) btnPrev.addEventListener('click', () => goTo(currentIndex - 1));
  if (btnNext) btnNext.addEventListener('click', () => goTo(currentIndex + 1));

  // update play button on audio end
  if (audio) audio.addEventListener('ended', () => { if (btnPlay) btnPlay.textContent = 'Play'; });
}

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  const min = Math.floor(s / 60);
  return `${min}:${sec}`;
}

// Initialize when DOM ready
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPlayer);
else initPlayer();


// Comment - feature
document.addEventListener("DOMContentLoaded", () => {
  const commentBtn = document.getElementById("comment-btn");
  const commentInput = document.getElementById("comment-input");
  const commentList = document.getElementById("comment-list");
  const loginStatus = document.getElementById("login-status");

  // 🧠 Lấy thông tin người dùng từ localStorage (nếu có)
  const userData = JSON.parse(localStorage.getItem("currentUser"));

  // Cập nhật trạng thái hiển thị
  if (userData && userData.username) {
    loginStatus.innerHTML = `Đã đăng nhập với tên: <strong>${userData.username}</strong>`;
  } else {
    loginStatus.innerHTML = `<span style="color:#ff4d4d">Bạn chưa đăng nhập!</span>`;
  }

  commentBtn.addEventListener("click", () => {
    if (!userData || !userData.username) {
      alert("Vui lòng đăng nhập trước khi bình luận!");
      return;
    }

    const text = commentInput.value.trim();
    if (text === "") {
      alert("Bình luận không được để trống!");
      return;
    }

    // Tạo phần tử bình luận mới
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");

    commentDiv.innerHTML = `
      <strong>${userData.username}</strong>
      <p>${text}</p>
    `;

    // Thêm bình luận vào đầu danh sách
    commentList.prepend(commentDiv);

    // Xóa nội dung ô nhập
    commentInput.value = "";
  });
});