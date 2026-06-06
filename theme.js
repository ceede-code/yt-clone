(function () {
    var toggle = document.getElementById('night-mode-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
        var isNight = document.documentElement.classList.toggle('night-mode');
        localStorage.setItem('theme', isNight ? 'night' : 'day');
    });
})();
