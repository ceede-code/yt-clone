(function () {
    var toggle = document.getElementById('night-mode-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
        var isNight = document.documentElement.classList.toggle('night-mode');
        localStorage.setItem('theme', isNight ? 'night' : 'day');
    });
})();

// VIDEO PREVIEW POPUP — desktop only (min-width: 750px)
(function () {
    var overlay  = document.getElementById('vid-preview-overlay');
    var closeBtn = document.getElementById('vid-preview-close');
    if (!overlay || !closeBtn) return;

    function isDesktop() {
        return window.innerWidth >= 750;
    }

    function openPreview(vidBar) {
        var thumb    = vidBar.querySelector('img[alt="thumbnail"]');
        var avatar   = vidBar.querySelector('.vbt-left img');
        var titleEl  = vidBar.querySelector('h4');
        var channelEl = vidBar.querySelector('.channel > p');
        var statsEl  = vidBar.querySelector('.vbt-right > p');
        var verifiedEl = vidBar.querySelector('.channel > div');

        document.getElementById('vid-preview-thumb').src    = thumb   ? thumb.src   : '';
        document.getElementById('vid-preview-avatar').src   = avatar  ? avatar.src  : '';
        document.getElementById('vid-preview-title').textContent   = titleEl   ? titleEl.textContent   : '';
        document.getElementById('vid-preview-channel').textContent = channelEl ? channelEl.textContent : '';
        document.getElementById('vid-preview-stats').textContent   = statsEl   ? statsEl.textContent   : '';

        var verifiedBadge = document.getElementById('vid-preview-verified');
        verifiedBadge.style.display = verifiedEl ? 'inline-flex' : 'none';

        // Build a plausible YouTube watch URL from the thumbnail src (best-effort)
        var vidId = '';
        if (thumb && thumb.src) {
            var match = thumb.src.match(/\/vi\/([^\/]+)\//);
            if (match) vidId = match[1];
        }
        document.getElementById('vid-preview-btn').href = vidId
            ? 'https://www.youtube.com/watch?v=' + vidId
            : '#';

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePreview() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Delegate click on all .vid-bar elements
    document.addEventListener('click', function (e) {
        if (!isDesktop()) return;

        // Close on overlay backdrop click
        if (e.target === overlay) {
            closePreview();
            return;
        }

        var vidBar = e.target.closest('.vid-bar');
        if (vidBar) {
            // Don't open preview if clicking the more_vert icon
            if (e.target.closest('.material-symbols-outlined')) return;
            e.preventDefault();
            openPreview(vidBar);
        }
    });

    closeBtn.addEventListener('click', closePreview);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closePreview();
    });
})();

// SPLASH SCREEN ANIMATION
(function () {
    var splash  = document.getElementById('splash-screen');
    var logo    = document.getElementById('splash-logo');
    var bar     = document.getElementById('splash-bar');
    var shards  = document.getElementById('splash-shards');
    if (!splash || !logo || !bar || !shards) return;

    var progress = 0;
    var targetProgress = 0;
    var animFrame;

    // Smoothly animate bar width
    function animateBar() {
        if (progress < targetProgress) {
            progress = Math.min(progress + 1.8, targetProgress);
            bar.style.width = progress + '%';
        }
        if (progress < 100) {
            animFrame = requestAnimationFrame(animateBar);
        } else {
            bar.style.width = '100%';
            setTimeout(triggerExit, 120);
        }
    }

    // Drive progress in bursts to feel like real loading
    var steps = [
        { to: 28,  delay: 0   },
        { to: 55,  delay: 350 },
        { to: 78,  delay: 700 },
        { to: 92,  delay: 1050 },
        { to: 100, delay: 1350 },
    ];

    steps.forEach(function(s) {
        setTimeout(function() {
            targetProgress = s.to;
            cancelAnimationFrame(animFrame);
            animFrame = requestAnimationFrame(animateBar);
        }, s.delay);
    });

    // Build shards — coloured fragments that scatter from the logo position
    function spawnShards() {
        var logoRect = logo.getBoundingClientRect();
        var cx = logoRect.left + logoRect.width  / 2;
        var cy = logoRect.top  + logoRect.height / 2;

        var colours = ['#ff0033','#ff3355','#ff6680','#ffffff','#ff0033','#cc0029','#ff99aa'];
        var count   = 38;

        for (var i = 0; i < count; i++) {
            var el = document.createElement('div');
            el.className = 'shard';

            var angle   = (i / count) * 360 + (Math.random() - 0.5) * 30;
            var dist    = 120 + Math.random() * 340;
            var rad     = angle * Math.PI / 180;
            var tx      = Math.cos(rad) * dist;
            var ty      = Math.sin(rad) * dist;
            var rot     = (Math.random() - 0.5) * 720 + 'deg';
            var dur     = (0.55 + Math.random() * 0.45).toFixed(2) + 's';
            var delay   = (Math.random() * 0.12).toFixed(2) + 's';
            var w       = Math.round(8  + Math.random() * 22) + 'px';
            var h       = Math.round(4  + Math.random() * 10) + 'px';
            var colour  = colours[Math.floor(Math.random() * colours.length)];

            el.style.cssText = [
                'left:'  + cx + 'px',
                'top:'   + cy + 'px',
                'width:' + w,
                'height:'+ h,
                'background:' + colour,
                '--tx:' + tx.toFixed(1) + 'px',
                '--ty:' + ty.toFixed(1) + 'px',
                '--rot:' + rot,
                '--dur:' + dur,
                '--delay:' + delay,
                'transform:translate(-50%,-50%)',
                'opacity:0'
            ].join(';');

            shards.appendChild(el);
        }

        // Force reflow then make shards visible so animation fires
        shards.getBoundingClientRect();
        var all = shards.querySelectorAll('.shard');
        all.forEach(function(s) { s.style.opacity = '1'; });
    }

    function triggerExit() {
        spawnShards();
        logo.classList.add('exploding');
        splash.classList.add('fading');

        setTimeout(function () {
            splash.classList.add('done');
        }, 850);
    }
})();
