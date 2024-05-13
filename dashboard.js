document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('menu').addEventListener('click', function() {
        var menu = document.getElementById('menu');
        var menuStyle = window.getComputedStyle(menu);

        if (menuStyle.display === 'none') {
            menu.style.display = 'block';
        } else {
            menu.style.display = 'none';
        }
    });
});
