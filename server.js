const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('cookie-session');
const crypto = require('crypto');

const {
  sendOtp,
  sendNotifNewUser,
  sendNotifLogin,
  sendNotifLogout
} = require('./bot');

const app = express();
const PORT = 3000;

const usersPath = path.join(__dirname, 'users.json');
const otpPath = path.join(__dirname, 'otp.json');
const resetPath = path.join(__dirname, 'reset.json');

// Middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(session({
  name: 'rizzshop-session',
  keys: ['rahasia'],
  maxAge: 1000 * 60 * 60 * 24 // 1 hari
}));
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Utils
function readJSON(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Routes
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/verify-session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ success: true, username: req.session.user.username });
  } else {
    res.json({ success: false });
  }
});

app.get('/logout', (req, res) => {
  if (req.session && req.session.user) {
    const username = req.session.user.username;
    console.log(`Logout: @${username}`);
    sendNotifLogout(req.session.user); // ⬅️ Kirim notifikasi logout ke WhatsApp
  }

  req.session = null; // Hapus session
  res.redirect('/');
});

// 📩 Kirim OTP
app.post('/send-otp', (req, res) => {
  const { phone, mode } = req.body;
  if (!phone || !mode) return res.status(400).json({ success: false, message: 'Data tidak lengkap' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otps = readJSON(otpPath);
  otps[phone] = { otp, expires: Date.now() + 5 * 60 * 1000 };
  writeJSON(otpPath, otps);

  const users = readJSON(usersPath);
  const user = users[phone];
  const name = user?.username || 'pengguna';

  const msg = `🎉 Halo, @${name}!\n\n🔐 Kode OTP kamu adalah: *${otp}*\n\n> ⏳ Kode ini hanya berlaku 5 menit. Jangan bagikan ke siapa pun!`;
  sendOtp(phone, msg);
  res.json({ success: true, message: 'OTP dikirim ke WhatsApp!' });
});

// ✅ Verifikasi OTP
app.post('/verify-otp', (req, res) => {
  const { phone, otp, password, username, mode } = req.body;
  if (!phone || !otp || !password || !mode) return res.status(400).json({ success: false, message: 'Data tidak lengkap' });

  const otps = readJSON(otpPath);
  const savedOtp = otps[phone];
  if (!savedOtp || savedOtp.otp !== otp || savedOtp.expires < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP salah atau kadaluarsa.' });
  }

  const users = readJSON(usersPath);

  if (mode === 'signup') {
    const isExist = Object.values(users).find(u => u.phone === phone || u.username === username);
    if (isExist) return res.status(400).json({ success: false, message: 'Akun sudah terdaftar.' });

    const newUser = {
      username,
      phone,
      password,
      sn: Date.now().toString().slice(-6)
    };

    users[phone] = newUser;
    writeJSON(usersPath, users);
    delete otps[phone];
    writeJSON(otpPath, otps);

    sendNotifNewUser(newUser);
    return res.json({ success: true, message: 'Akun berhasil dibuat. Silakan login.' });
  }

  if (mode === 'login') {
    const user = users[phone];
    if (!user || user.password !== password) {
      return res.status(400).json({ success: false, message: 'Akun belum terdaftar atau password salah.' });
    }

    if (!req.session.user || req.session.user.phone !== phone) {
      sendNotifLogin(user);
    }

    req.session.user = user;
    return res.json({ success: true, message: `Login sukses sebagai @${user.username}` });
  }

  res.status(400).json({ success: false, message: 'Mode tidak valid.' });
});

// 🔄 Request reset password
app.post('/request-reset', (req, res) => {
  const { phone } = req.body;
  const users = readJSON(usersPath);
  const user = users[phone];

  if (!user) return res.json({ success: false, message: 'Nomor tidak terdaftar' });

  const token = crypto.randomBytes(20).toString('hex');
  const expires = Date.now() + 15 * 60 * 1000;

  const resets = readJSON(resetPath);
  resets[token] = { phone, expires };
  writeJSON(resetPath, resets);

  const link = `https://rizzshop.up.railway.app/reset-password?token=${token}`;
  sendOtp(phone, `🔑 Permintaan reset password RizzShop:\n\nKlik link berikut untuk reset:\n${link}\n\n📌 Link berlaku 15 menit.`);
  res.json({ success: true, message: 'Link reset dikirim ke WhatsApp' });
});

// 🔐 Proses reset password
app.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  const resets = readJSON(resetPath);
  const reset = resets[token];

  if (!reset || reset.expires < Date.now()) {
    return res.json({ success: false, message: 'Token tidak valid atau kadaluarsa.' });
  }

  const users = readJSON(usersPath);
  const user = users[reset.phone];
  if (user) user.password = password;
  writeJSON(usersPath, users);

  delete resets[token];
  writeJSON(resetPath, resets);

  res.json({ success: true, message: 'Password berhasil direset.' });
});

// 🛑 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 RizzShop is running on http://localhost:${PORT}`);
});
