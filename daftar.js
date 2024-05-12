document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Mendapatkan nilai dari input fields
    var email = document.getElementById('email').value;
    var username = document.getElementById('username').value;
    var numberWhatsApp = document.getElementById('numberWhatsApp').value;
    var password = document.getElementById('password').value;
    var repeatPassword = document.getElementById('repeatPassword').value;

    // Memeriksa apakah password cocok
    if (password !== repeatPassword) {
        alert('Password tidak cocok. Silakan ulangi.');
        return;
    }

    // Membuat pesan untuk dikirim melalui WhatsApp
    var message = `Halo admin, saya mau daftar akun RizzShop\n\nEmail: ${email}\nUsername: ${username}\nNomor WhatsApp: ${numberWhatsApp}\nPassword: ${password}\nRepeat Password: ${repeatPassword}\n\nDitunggu Konfirmasinya Min`;

    // Membuat link untuk WhatsApp
    var waLink = `https://wa.me/62895?text=${encodeURIComponent(message)}`;

    // Redirect ke link WhatsApp
    window.location.href = waLink;
});
