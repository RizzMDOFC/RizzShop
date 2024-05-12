// Mendengarkan saat form login disubmit
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Redirect ke dashboard.html setelah login
    window.location.href = 'dashboard.html';
});

// Mendengarkan saat tombol "Minta OTP" diklik
document.getElementById('requestOTP').addEventListener('click', function() {
    // Generate dan menampilkan OTP 6 digit random
    var otp = generateOTP();
    // Mendefinisikan pesan yang akan dikirim ke WhatsApp
    var message = `Halo,\n\nOTP: ${otp}\nSilahkan kirim pesan ini dan kembali lalu masukkan OTP untuk login.`;
    // Membuat link untuk WhatsApp
    var waLink = `https://wa.me/62895613193050?text=${encodeURIComponent(message)}`;
    // Membuka link WhatsApp di jendela baru
    window.open(waLink, '_blank');
});

// Fungsi untuk menghasilkan OTP 6 digit random
function generateOTP() {
    var otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}
