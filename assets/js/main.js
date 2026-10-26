/* =====================================================================
   madaeri-site-preview-20261026 / r1
   순수 JS · 외부 의존성 없음 · 네트워크 호출 없음 · 저장 없음
   기능: 모바일 메뉴(열기/닫기/Esc/바깥 클릭/링크 클릭/포커스 이탈),
         현재 섹션 표시(스크롤 스파이), FAQ 단일 열림(점진적 향상)
   ===================================================================== */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var label = toggle ? toggle.querySelector('.nav-toggle__label') : null;
  var desktop = window.matchMedia('(min-width: 56em)');

  /* ---------- 모바일 메뉴 ---------- */
  function isOpen() {
    return header.classList.contains('nav-open');
  }

  function openNav() {
    header.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (label) label.textContent = '닫기';
    var first = nav.querySelector('a');
    if (first) first.focus();
  }

  function closeNav(restoreFocus) {
    if (!isOpen()) return;
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = '메뉴';
    if (restoreFocus) toggle.focus();
  }

  if (header && toggle && nav) {
    toggle.addEventListener('click', function () {
      if (isOpen()) {
        closeNav(true);
      } else {
        openNav();
      }
    });

    // Esc 로 닫기 (포커스는 토글 버튼으로 복귀)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        closeNav(true);
      }
    });

    // 메뉴 바깥 클릭/터치 시 닫기
    document.addEventListener('click', function (e) {
      if (isOpen() && !header.contains(e.target)) {
        closeNav(false);
      }
    });

    // 메뉴 링크 선택 시 닫기 (섹션 이동은 브라우저 기본 앵커 동작)
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        closeNav(false);
      }
    });

    // 키보드 탭으로 헤더 밖으로 나가면 닫기
    document.addEventListener('focusin', function (e) {
      if (isOpen() && !desktop.matches && !header.contains(e.target)) {
        closeNav(false);
      }
    });

    // 데스크톱 폭으로 바뀌면 열림 상태 해제
    var onMq = function (e) {
      if (e.matches) closeNav(false);
    };
    if (typeof desktop.addEventListener === 'function') {
      desktop.addEventListener('change', onMq);
    } else if (typeof desktop.addListener === 'function') {
      desktop.addListener(onMq);
    }
  }

  /* ---------- 스크롤 스파이 (현재 섹션을 메뉴에 표시) ---------- */
  if (nav && 'IntersectionObserver' in window) {
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = { link: a, section: sec };
    });

    var setCurrent = function (id) {
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) {
          a.setAttribute('aria-current', 'true');
        } else {
          a.removeAttribute('aria-current');
        }
      });
    };

    var visible = {};
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0;
        });
        var best = null;
        var bestRatio = 0;
        Object.keys(visible).forEach(function (id) {
          if (visible[id] > bestRatio) {
            bestRatio = visible[id];
            best = id;
          }
        });
        if (best) setCurrent(best);
      },
      {
        rootMargin: '-35% 0px -50% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
      }
    );

    Object.keys(map).forEach(function (id) {
      io.observe(map[id].section);
    });
  }

  /* ---------- FAQ: 하나만 열리도록 (details name 미지원 브라우저 보완) ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.faq details'));
  items.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      items.forEach(function (o) {
        if (o !== d && o.open) o.open = false;
      });
    });
  });

  /* ---------- 해시 이동 시 섹션에 포커스 (스크린리더/키보드 사용자) ---------- */
  function focusHashTarget() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (el && el.hasAttribute('tabindex')) {
      el.focus({ preventScroll: true });
    }
  }
  window.addEventListener('hashchange', focusHashTarget);
})();
