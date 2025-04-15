let isLogin = true;
const apiBase = "";

function cleanPhoneNumber(phone) {
  const cleaned = phone.replace(/[^0-9]/g, ''); // Hanya angka

  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1); // 08xxx → 628xxx
  } else if (cleaned.startsWith('62')) {
    return cleaned; // Sudah benar
  } else if (cleaned.length <= 13 && cleaned.startsWith('8')) {
    return '62' + cleaned; // 8xxx → 628xxx
  } else {
    return cleaned; // fallback (biar gak kosong)
  }
}

// 🔄 Auto-format nomor saat input
document.getElementById('phone').addEventListener('input', function () {
  this.value = cleanPhoneNumber(this.value);
});

function toggleForm() {
  isLogin = !isLogin;
  document.getElementById('formTitle').innerText = isLogin ? "Login" : "Daftar";
  document.querySelector('button[onclick="submitForm()"]').innerText = isLogin ? "Login" : "Daftar";
  document.getElementById('toggleText').innerHTML = isLogin
    ? `Belum punya akun? <span onclick="toggleForm()">Daftar di sini</span>`
    : `Sudah punya akun? <span onclick="toggleForm()">Login di sini</span>`;
  document.getElementById('username').style.display = isLogin ? 'none' : 'block';
}

async function sendOTP() {
  const phoneRaw = document.getElementById('phone').value;
  const phone = cleanPhoneNumber(phoneRaw);
  const mode = isLogin ? 'login' : 'signup';
  if (!phone) return alert("Nomor tidak boleh kosong");

  const res = await fetch('/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, mode })
  });

  const data = await res.json();
  alert(data.message);
}

async function submitForm() {
  const phoneRaw = document.getElementById('phone').value;
  const phone = cleanPhoneNumber(phoneRaw);
  const password = document.getElementById('password').value;
  const otp = document.getElementById('otp').value;
  const username = document.getElementById('username').value;
  const mode = isLogin ? 'login' : 'signup';

  const res = await fetch('/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, otp, mode, username })
  });

  const data = await res.json();
  alert(data.message);
  if (data.success) {
    document.getElementById('dashboardBtn').style.display = 'block';
  }
}

function goToDashboard() {
  window.location.href = '/dashboard';
}

// 🔄 Reload if .reload file changed
let lastReload = 0;
setInterval(async () => {
  const res = await fetch('.reload');
  const txt = await res.text();
  if (txt > lastReload) {
    lastReload = txt;
    if (confirm("Ada pembaruan di web! Harap restart dengan menekan tombol 'Oke'")) {
      location.reload();
    }
  }
}, 3000);

function showResetPrompt() {
  const phone = prompt("Masukkan nomor WhatsApp kamu untuk reset password:");
  if (!phone) return;

  fetch('/request-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
    })
    .catch(() => {
      alert("Terjadi kesalahan saat mengirim permintaan reset.");
    });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('SW registration failed', err));
  });
}
