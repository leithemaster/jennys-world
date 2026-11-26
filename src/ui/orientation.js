// Phones play in landscape. A web page can't force that on its own (iPhones
// ignore orientation locks, Android only allows one in fullscreen), so a phone
// held upright gets a "turn your phone" screen (shown by CSS), and on phones
// that support it, a button that goes fullscreen and locks to landscape.

const canLock = () => !!(document.documentElement.requestFullscreen && screen.orientation?.lock);

export async function playLandscape() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    await screen.orientation.lock('landscape');
  } catch { /* not supported here: the player rotates the phone by hand */ }
}

export function initOrientation() {
  const el = document.createElement('div');
  el.className = 'rotate-screen';
  el.setAttribute('role', 'alert');
  el.innerHTML = `
    <svg class="rotate-phone" viewBox="0 0 120 120" aria-hidden="true">
      <rect x="38" y="14" width="44" height="80" rx="9" fill="#fff4e6" stroke="#2a1626" stroke-width="5"/>
      <rect x="45" y="24" width="30" height="56" rx="3" fill="#f3a6bd"/>
      <circle cx="60" cy="87" r="3" fill="#2a1626"/>
      <path d="M96 40 A40 40 0 0 1 96 80" fill="none" stroke="#fff4e6" stroke-width="5" stroke-linecap="round"/>
      <path d="M90 76 L96 82 L102 75" fill="none" stroke="#fff4e6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <h2>Turn your phone sideways</h2>
    <p>Kioku Tower plays in landscape.</p>
    ${canLock() ? '<button class="btn big yellow" data-landscape>Play fullscreen</button>' : ''}`;
  el.querySelector('[data-landscape]')?.addEventListener('click', playLandscape);
  document.body.appendChild(el);
}
