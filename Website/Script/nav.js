// Simple navigation transition script
// Adds a fade-out transition when navigation links in the menu are clicked.
(function(){
  function fadeOutAndNavigate(href){
    // create a fullscreen overlay that fades in, then navigate
    let overlay = document.getElementById('nav-fade-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'nav-fade-overlay';
      Object.assign(overlay.style, {
        position: 'fixed', inset: '0', background: '#000', opacity: '0', transition: 'opacity 320ms ease', zIndex: 99999
      });
      document.body.appendChild(overlay);
      // force reflow
      void overlay.offsetWidth;
    }
    overlay.style.pointerEvents = 'auto';
    overlay.style.opacity = '0.9';
    setTimeout(()=>{ window.location.href = href; }, 320);
  }

  function initNav(){
    // target menu items and icon-homepage etc
    const menuSelectors = [
      '.list-page li', '.menu li', '.menu .list-icon li', '.menu-music li', '.typeofmusic', '.playlist .typeofmusic'
    ];
    const nodes = new Set();
    menuSelectors.forEach(sel => document.querySelectorAll(sel).forEach(n=>nodes.add(n)));

    nodes.forEach(node => {
      node.style.cursor = 'pointer';
      node.addEventListener('click', (e)=>{
        e.preventDefault();
        // map text content to page
        const txt = (node.textContent||'').trim().toLowerCase();
        // detect genre tiles (V-Pop, K-Pop, C-Pop, US-UK)
        function genreFromText(t){
          if(!t) return null;
          const clean = t.replace(/\s+/g,' ').replace(/[^a-z0-9\- ]/gi,'').toLowerCase();
          if(clean.includes('v pop') || clean.includes('v-pop') || clean.includes('vpop')) return 'V-Pop';
          if(clean.includes('k pop') || clean.includes('k-pop') || clean.includes('kpop')) return 'K-Pop';
          if(clean.includes('c pop') || clean.includes('c-pop') || clean.includes('cpop')) return 'C-Pop';
          if(clean.includes('us-uk') || clean.includes('us uk') || clean.includes('usuk') || clean.includes('us')) return 'US-UK';
          return null;
        }

        let href = 'Homepage.html';
        const genre = genreFromText(txt);
        if(genre){
          href = `Playlist.html#${encodeURIComponent(genre)}`;
        } else {
        if (txt.includes('home')) href = 'Homepage.html';
        else if (txt.includes('songs')) href = 'Songs.html';
        else if (txt.includes('playlist')) href = 'Playlist.html';
        else if (txt.includes('about') || txt.includes('info')) href = 'About.html';
  // if it's a menu item that is actually inside a link element, prefer link href
  const a = node.closest('a');
  if (a && a.getAttribute('href')) href = a.getAttribute('href');
  }
        console.debug('nav.js: clicked', {text: txt, genre, href});
        fadeOutAndNavigate(href);
      });
    });

    // also make the logo image click to home
    const logo = document.querySelector('.logo img'); if (logo) logo.style.cursor='pointer';
    if (logo) logo.addEventListener('click', ()=> fadeOutAndNavigate('Homepage.html'));
  }

  // add CSS for the fade
  function injectNavCss(){
    // noop: overlay-based fade used instead of toggling html opacity
    return;
  }

  // On load, if there's a hash and we're on Playlist.html, scroll to it smoothly
  function scrollToHashOnLoad(){
    try{
      const rawHash = (window.location.hash || '').trim();
      if(!rawHash) return;
      const path = window.location.pathname.split('/').pop() || '';
      if(!path.toLowerCase().includes('playlist')) return;

      // normalize id (remove leading '#') and decode
      const targetId = decodeURIComponent(rawHash.replace(/^#/, ''));

      // compute header offset (menu + header bars) so scrolled element isn't hidden under fixed bars
      const headerCandidates = ['.menu-bar', '.header', '.topbar', 'header'];
      const computeHeaderHeight = ()=>{
        let h = 0;
        headerCandidates.forEach(sel => {
          const node = document.querySelector(sel);
          if (node && node.offsetHeight) h += node.offsetHeight;
        });
        return h;
      };

      const tryScroll = (attempt)=>{
        const el = document.getElementById(targetId);
        console.debug('nav.js: scroll attempt', {attempt, targetId, found: !!el});
        if(el){
          const headerH = computeHeaderHeight();
          const top = el.getBoundingClientRect().top + window.pageYOffset - headerH - 8; // small padding
          window.scrollTo({ top: Math.max(0, top), behavior: attempt === 1 ? 'instant' : 'smooth' });
          return true;
        }
        return false;
      };

      // progressive retries: immediate, 120ms, 300ms, 700ms, 1200ms
      const delays = [0, 120, 300, 700, 1200];
      delays.forEach((d, i) => setTimeout(()=>{ tryScroll(i+1); }, d));
    }catch(e){/* ignore */}
  }

  document.addEventListener('DOMContentLoaded', ()=>{ injectNavCss(); initNav(); scrollToHashOnLoad(); });
})();