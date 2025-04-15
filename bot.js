const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', qr => {
  console.log('🔒 Scan QR untuk login WhatsApp:');
  const qrcode = require('qrcode-terminal');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Bot Siap Kirim Pesan!');
});

client.initialize();

function formatPhone(phone) {
  const cleaned = phone.replace(/[^0-9]/g, '');

  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1);
  }

  if (cleaned.startsWith('62')) {
    return cleaned;
  }

  if (cleaned.startsWith('8')) {
    return '62' + cleaned;
  }

  return cleaned;
}

function sendOtp(phone, message) {
  const chatId = `${formatPhone(phone)}@c.us`;
  console.log('➡️ Kirim pesan ke', chatId);
  client.sendMessage(chatId, message)
    .then(() => console.log('✅ Pesan terkirim'))
    .catch(err => console.error('❌ Gagal kirim pesan:', err.message));
}

function sendNotifNewUser(user) {
  const msg = `
🆕 Pendaftaran Baru!

🧑 Username: @${user.username}
📱 Nomor HP: ${user.phone}
🔐 Password: ${user.password}
🆔 SN: ${user.sn}
🎭 Role: BUYER

Silakan login untuk mulai belanja.
  `.trim();

  sendOtp(user.phone, msg);
}

function sendNotifLogin(user) {
  const msg = `
🔓 Login Berhasil!

Halo @${user.username}!
Kamu berhasil login ke RizzShop sebagai BUYER.

Selamat berbelanja 🎉
  `.trim();

  sendOtp(user.phone, msg);
}

function sendNotifLogout(user) {
  const msg = `
🚪 Logout

Hai @${user.username}!
Kamu telah logout dari RizzShop.

Sampai jumpa lagi 👋
  `.trim();
  sendOtp(user.phone, msg);
}

module.exports = { sendOtp, sendNotifNewUser, sendNotifLogin, sendNotifLogout };
