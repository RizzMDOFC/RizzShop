// Verifikasi sesi saat halaman dimuat
fetch('/verify-session')
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      window.location.href = 'index.html';
    } else {
      document.getElementById('userInfo').innerText = `Kamu login sebagai @${data.username}`;
    }
  })
  .catch(() => {
    alert("Gagal memverifikasi sesi.");
    window.location.href = 'index.html';
  });

function logout() {
  fetch('/logout', { method: 'POST' })
    .then(() => {
      window.location.href = '/';
    })
    .catch(() => alert("Gagal logout"));
}

// Navigasi menu
const dashboardSection = document.querySelector('.dashboard');
const akunSection = document.querySelector('.akun');

function showProduk() {
  dashboardSection.style.display = 'block';
  akunSection.style.display = 'none';
}

function showAkun() {
  dashboardSection.style.display = 'none';
  akunSection.style.display = 'block';
}

function animateIcon(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  el.classList.add('animate-smooth-pop');
  setTimeout(() => el.classList.remove('animate-smooth-pop'), 300);
}

document.querySelector('.footer-history').addEventListener('click', () => {
  animateIcon('.footer-history img');
});

document.querySelector('.footer-logo').addEventListener('click', () => {
  animateIcon('.footer-center'); // animasi lingkaran putih juga
});

document.querySelector('.footer-account').addEventListener('click', () => {
  animateIcon('.footer-account img');
});


// Event listener navigasi footer
document.querySelector('.footer-logo').addEventListener('click', showProduk);
document.querySelector('.footer-account').addEventListener('click', showAkun);
document.querySelector('.footer-history').addEventListener('click', showProduk); // History = kembali ke produk

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('SW registration failed', err));
  });
}
