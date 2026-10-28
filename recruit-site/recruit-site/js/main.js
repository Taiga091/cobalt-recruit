/* =================================================================
   株式会社コバルト技建 採用サイト  main.js
   外部ライブラリは使わず、Vanilla JavaScript のみで書いています。

   1. 準備（JSが動いていることをCSSに伝える）
   2. スマートフォン用ハンバーガーメニュー
   3. FAQアコーディオン
   3-2. 「もっと見る」アコーディオン
   4. スムーススクロール（固定ヘッダー分を考慮）
   5. スクロール時の軽いフェードイン
   （5-0. トップの見出しの1文字ずつのアニメーションは、控えめな印象にするため廃止）
   5-1. 数字のカウントアップ
   5-2. オープニング（ロゴのアニメーション）
   6. 写真が未配置のときのプレースホルダー表示
   7. ページ内ナビ（※リデザイン版では未使用。.dot-nav が無ければ何もしません）
   8. スライドショー（社会貢献活動の写真）
   9. 右下の「エントリーはこちら」丸ボタン
   10. 募集要項タブ切り替え（PSS事業部・技術部）
   12. トップの写真スライドショー（全画面）
   ================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     1. 準備
     <html> に "js" クラスを付けます（index.html の <head> でも付けています）。
     フェードインはこのクラスがあるときだけ働くので、
     JSが無効な環境でも内容は必ず表示されます。
     --------------------------------------------------------------- */
  document.documentElement.classList.add('js');

  // 「視差効果を減らす」設定がオンかどうか
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---------------------------------------------------------------
     2. スマートフォン用ハンバーガーメニュー
     --------------------------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var globalNav = document.getElementById('global-nav');

  function openNav() {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'メニューを閉じる');
    globalNav.classList.add('is-open');
    document.body.classList.add('is-nav-open');
  }

  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'メニューを開く');
    globalNav.classList.remove('is-open');
    document.body.classList.remove('is-nav-open');
  }

  if (navToggle && globalNav) {
    // ボタンで開閉
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    // メニュー内のリンクを押したら閉じる
    globalNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        closeNav();
      }
    });

    // Escキーで閉じて、ボタンにフォーカスを戻す
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && globalNav.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });

    // 画面幅がPCサイズに戻ったら閉じた状態にリセット
    window.matchMedia('(min-width: 1241px)').addEventListener('change', function (mq) {
      if (mq.matches) {
        closeNav();
      }
    });
  }


  /* ---------------------------------------------------------------
     3. FAQアコーディオン
     ボタンの aria-expanded と、回答の hidden 属性を切り替えます。
     --------------------------------------------------------------- */
  var faqButtons = document.querySelectorAll('.faq__question');

  faqButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var answer = document.getElementById(button.getAttribute('aria-controls'));
      var isOpen = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
    });
  });


  /* ---------------------------------------------------------------
     3-2. 「もっと見る」アコーディオン
     そのほかの有資格者・研修内容など、補足情報の開閉。
     ボタンの文字は data-open-text / data-close-text で切り替えます。
     --------------------------------------------------------------- */
  document.querySelectorAll('.more__toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      var label = button.querySelector('.more__text');

      button.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
      if (label) {
        label.textContent = button.getAttribute(isOpen ? 'data-open-text' : 'data-close-text');
      }
    });
  });


  /* ---------------------------------------------------------------
     4. スムーススクロール
     ページ内リンク（href="#..."）をなめらかにスクロールさせます。
     固定ヘッダーの高さ分だけ手前で止めます。
     --------------------------------------------------------------- */
  var header = document.querySelector('.site-header');

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var id = link.getAttribute('href');

      // href="#" だけのリンク（仮リンク）は何もしない
      if (id === '#' || id.length < 2) {
        return;
      }

      var target = document.querySelector(id);
      if (!target) {
        return;
      }

      event.preventDefault();

      var headerHeight = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
      if (id === '#top') {
        top = 0;
      }

      window.scrollTo({
        top: top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      // URLを更新し、キーボード操作のためにフォーカスを移す
      history.pushState(null, '', id);
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    });
  });


  /* ---------------------------------------------------------------
     5. スクロール時の軽いフェードイン
     class="js-reveal" を付けた要素が画面に入ったら表示します。

     ▼ サイト全体のフェードイン対象
       HTMLに1つずつ class を書かなくても、下のリストにある要素には
       自動で js-reveal を付けます。対象を増やす・減らす場合は
       このリストを編集してください。
     --------------------------------------------------------------- */
  var autoRevealSelectors = [
    // ファーストビュー
    '.hero__inner',
    // 各セクション共通
    '.head',                   // 番号＋見出し（＋説明文）
    '.block-title',            // 小見出し
    '.note',
    '.text-link',
    '.table-scroll',
    // 私たちについて・社会貢献
    '.about__statement',
    '.about__body',
    '.company-data',
    '.about__photo',
    '.volunteer__text',
    '.slider',
    // 発注者支援業務とは・施工管理との違い
    '.position-map',
    '.duty',
    '.contrast__side',
    '.experience__head',
    '.experience__item',
    // 技術部について
    '.engineering__copy',
    '.process-step',
    // 仕事を知る・プロジェクト紹介
    '.dept',
    '.banner-link',
    '.project-group__title',
    '.project',
    // 働く環境
    '.stat',
    '.benefits',
    // キャリア・資格
    '.qual-hero',
    '.qual',
    '.career-step',
    '.training__intro',
    '.training__main',
    // 募集要項・選考フロー・応募・FAQ
    '.job-tabs',
    '.job-card',
    '.flow__step',
    '.apply-list > li',
    '.apply-tel',
    '.faq__item',
    // エントリー・フッター
    '.cta__inner',
    '.footer-contact__main',
    '.office'
  ];

  // カードなど、同じ親の中に並ぶ要素は 0.08秒ずつずらして順番に表示
  var STAGGER = 0.08; // 秒
  var MAX_DELAY = 0.4; // 秒（これ以上は遅らせない）

  // 対象を集める（HTMLで個別に js-reveal を付けたものも含む）
  var revealSet = [];
  autoRevealSelectors.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (revealSet.indexOf(el) === -1) {
        revealSet.push(el);
      }
    });
  });
  document.querySelectorAll('.js-reveal').forEach(function (el) {
    if (revealSet.indexOf(el) === -1) {
      revealSet.push(el);
    }
  });

  // アコーディオンの中身は対象外（閉じている間は判定できず、開いても透明のままになるため）
  revealSet = revealSet.filter(function (el) {
    return !el.closest('.more__panel');
  });

  // 入れ子になっている場合は外側だけを動かす（二重にふわっとさせない）
  revealSet = revealSet.filter(function (el) {
    var parent = el.parentElement;
    while (parent) {
      if (revealSet.indexOf(parent) !== -1) {
        return false;
      }
      parent = parent.parentElement;
    }
    return true;
  });

  // 同じ親の中で、同じ種類の要素の何番目かを数えて遅延を付ける
  revealSet.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (child) {
      return revealSet.indexOf(child) !== -1 && child.className === el.className;
    });
    var index = siblings.indexOf(el);
    if (siblings.length > 1 && index > 0) {
      el.style.setProperty('--reveal-delay', Math.min(index * STAGGER, MAX_DELAY) + 's');
    }
  });
  revealSet.forEach(function (el) {
    el.classList.add('js-reveal');
  });

  var revealItems = document.querySelectorAll('.js-reveal');

  // 表示が終わったらフェードイン用の指定を外し、
  // カードのhoverアニメーションなど本来の動きに戻す
  function finishReveal(el) {
    el.addEventListener('transitionend', function handler(event) {
      if (event.target !== el || event.propertyName !== 'opacity') {
        return;
      }
      el.classList.remove('js-reveal', 'is-visible');
      el.style.removeProperty('--reveal-delay');
      el.removeEventListener('transitionend', handler);
    });
  }

  // フェードインの監視を始める（オープニングが終わってから呼ばれます）
  function startReveal() {
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            finishReveal(entry.target);
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // 一度表示したら監視をやめる
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

      revealItems.forEach(function (item) {
        observer.observe(item);
      });

      // ページの一番下に近い要素は「画面の下10%」の判定に入らず表示されないことがあるため、
      // 最下部までスクロールしたら、画面内に残っている要素をまとめて表示する
      var revealAtBottom = function () {
        var atBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4;
        if (!atBottom) {
          return;
        }
        document.querySelectorAll('.js-reveal:not(.is-visible)').forEach(function (item) {
          if (item.getBoundingClientRect().top < window.innerHeight) {
            finishReveal(item);
            item.classList.add('is-visible');
            observer.unobserve(item);
          }
        });
      };
      window.addEventListener('scroll', revealAtBottom, { passive: true });
      revealAtBottom();
    } else {
      // 非対応ブラウザや動きを減らす設定では、最初から表示
      revealItems.forEach(function (item) {
        item.classList.add('is-visible');
      });
    }
  }


  /* ---------------------------------------------------------------
     5-1. 数字のカウントアップ
     「数字で見る働く環境」「有資格者数」の数字が、画面に入ったときに
     0 から実際の値まで増えていきます。
     数字は HTML に書いてある値がそのまま最終値になります。
     --------------------------------------------------------------- */
  var COUNT_DURATION = 1600; // 何ミリ秒かけて数えるか
  var countItems = document.querySelectorAll('.stat__num, .qual__num');

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var start = null;

    function step(now) {
      if (start === null) {
        start = now;
      }
      var progress = Math.min((now - start) / COUNT_DURATION, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // 最後はゆっくり止まる
      el.textContent = Math.round(target * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = el.getAttribute('data-count-text');
      }
    }
    requestAnimationFrame(step);
  }

  // 準備：数字の値を控えておき、表示を 0 にする
  countItems.forEach(function (el) {
    var text = el.textContent.trim();
    var value = parseFloat(text.replace(/,/g, ''));
    if (isNaN(value) || prefersReducedMotion || !('IntersectionObserver' in window)) {
      return; // 数字でないもの（〇 など）や動きを減らす設定ではそのまま
    }
    el.setAttribute('data-count', value);
    el.setAttribute('data-count-text', text);
    el.textContent = '0';
  });

  function startCountUp() {
    var targets = document.querySelectorAll('[data-count]');
    if (!targets.length) {
      return;
    }
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    targets.forEach(function (el) {
      countObserver.observe(el);
    });
  }


  /* ---------------------------------------------------------------
     5-2. オープニング（ロゴのアニメーション）
     ページを開いたとき、白い背景にロゴを約2.5秒表示してから
     フェードアウトします。終わったらページのフェードインを開始します。
     --------------------------------------------------------------- */
  var LOADER_TIME = prefersReducedMotion ? 800 : 2500; // 表示時間（ミリ秒）
  var LOADER_MAX = 5000; // 画像の読み込みが遅くても、これ以上は待たない
  var loader = document.querySelector('.loader');

  function finishLoader() {
    document.documentElement.classList.add('is-loaded');
    document.body.classList.remove('is-loading');
    startReveal();
    startCountUp();
    startHeroSlider();

    if (loader) {
      loader.classList.add('is-done');
      // フェードアウトが終わったら要素ごと削除
      setTimeout(function () {
        loader.parentNode && loader.parentNode.removeChild(loader);
      }, 700);
    }
  }

  if (loader) {
    document.body.classList.add('is-loading');

    var timeUp = false;
    var pageLoaded = document.readyState === 'complete';
    var finished = false;

    var tryFinish = function () {
      if (!finished && timeUp && pageLoaded) {
        finished = true;
        finishLoader();
      }
    };

    // 最低表示時間
    setTimeout(function () {
      timeUp = true;
      tryFinish();
    }, LOADER_TIME);

    // ページ（写真など）の読み込み完了
    window.addEventListener('load', function () {
      pageLoaded = true;
      tryFinish();
    });

    // 念のための上限
    setTimeout(function () {
      pageLoaded = true;
      timeUp = true;
      tryFinish();
    }, LOADER_MAX);
  } else {
    finishLoader();
  }


  /* ---------------------------------------------------------------
     6. 写真が未配置のときのプレースホルダー表示
     images/ フォルダに画像が無い場合、写真枠（.photo）に
     .is-missing を付けて、ファイル名入りの仮表示に切り替えます。
     画像を配置すれば自動的に写真が表示されます。
     --------------------------------------------------------------- */
  document.querySelectorAll('.photo img').forEach(function (img) {
    var markMissing = function () {
      img.closest('.photo').classList.add('is-missing');
    };

    if (img.complete && img.naturalWidth === 0) {
      markMissing(); // すでに読み込みに失敗している
    } else {
      img.addEventListener('error', markMissing);
    }
  });


  /* ---------------------------------------------------------------
     7. ページ内ナビ（※リデザイン版では未使用。.dot-nav が無ければ何もしません）
     画面の上から40%の位置を通過したセクションを「今いる場所」として、
     対応する丸に .is-current を付けます。
     --------------------------------------------------------------- */
  var dotLinks = Array.prototype.slice.call(document.querySelectorAll('.dot-nav__link'));

  if (dotLinks.length) {
    var dotNav = document.querySelector('.dot-nav');
    // 濃い背景のエリア（写真・濃紺）。増やす場合はここにクラス名を追加
    var darkAreas = document.querySelectorAll('.hero, .section--navy, .cta, .site-footer');

    var spyTargets = dotLinks.map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    });

    var updateCurrent = function () {
      var line = window.innerHeight * 0.4;
      var currentIndex = 0;

      spyTargets.forEach(function (section, index) {
        if (section && section.getBoundingClientRect().top <= line) {
          currentIndex = index;
        }
      });

      // ページの一番下まで来たら最後の項目を現在地にする
      if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 2) {
        currentIndex = dotLinks.length - 1;
      }

      // ナビの位置（画面の縦中央）が濃い背景の上なら色を切り替える
      var middle = window.innerHeight / 2;
      var onDark = Array.prototype.some.call(darkAreas, function (area) {
        var r = area.getBoundingClientRect();
        return r.top <= middle && r.bottom >= middle;
      });
      dotNav.classList.toggle('is-on-dark', onDark);

      dotLinks.forEach(function (link, index) {
        var isCurrent = index === currentIndex;
        link.classList.toggle('is-current', isCurrent);
        if (isCurrent) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    // スクロールのたびに計算しすぎないよう、1フレームに1回だけ実行
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          updateCurrent();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', updateCurrent);
    updateCurrent();
  }


  /* ---------------------------------------------------------------
     8. スライドショー（社会貢献活動の写真）
     ・SLIDE_INTERVAL ミリ秒ごとに自動で次の写真へ
     ・マウスを乗せている間・操作中は一時停止
     ・停止ボタンで自動再生を止められます
     ・スマホでは左右のスワイプで写真送り
     --------------------------------------------------------------- */
  var SLIDE_INTERVAL = 5000;

  document.querySelectorAll('.slider').forEach(function (slider) {
    var track = slider.querySelector('.slider__track');
    var slides = slider.querySelectorAll('.slider__slide');
    var dots = slider.querySelectorAll('.slider__dot');
    var pauseBtn = slider.querySelector('.slider__pause');
    var current = 0;
    var timer = null;
    var userPaused = prefersReducedMotion; // 動きを減らす設定では最初から停止
    var hovering = false;
    var inView = false; // 画面に入っている間だけ自動再生

    function show(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * current) + '%)';
      slides.forEach(function (slide, i) {
        slide.setAttribute('aria-hidden', String(i !== current));
        slide.classList.toggle('is-zooming', i === current && inView && !prefersReducedMotion);
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-current', String(i === current));
      });
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }
    function play() {
      stop();
      if (!userPaused && !hovering && inView) {
        timer = setInterval(function () { show(current + 1); }, SLIDE_INTERVAL);
      }
    }
    function updatePauseButton() {
      if (!pauseBtn) { return; }
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? '自動再生を開始' : '自動再生を停止');
    }

    slider.querySelector('.slider__prev').addEventListener('click', function () { show(current - 1); play(); });
    slider.querySelector('.slider__next').addEventListener('click', function () { show(current + 1); play(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); play(); });
    });
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        userPaused = !userPaused;
        updatePauseButton();
        play();
      });
    }

    // マウスを乗せている間・キーボード操作中は止める
    slider.addEventListener('mouseenter', function () { hovering = true; stop(); });
    slider.addEventListener('mouseleave', function () { hovering = false; play(); });
    slider.addEventListener('focusin', function () { hovering = true; stop(); });
    slider.addEventListener('focusout', function () { hovering = false; play(); });

    // スワイプ（左右に40px以上動かしたら写真送り）
    var startX = null;
    var viewport = slider.querySelector('.slider__viewport');
    viewport.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    viewport.addEventListener('pointerup', function (e) {
      if (startX === null) { return; }
      var diff = e.clientX - startX;
      if (Math.abs(diff) > 40) {
        show(current + (diff < 0 ? 1 : -1));
        play();
      }
      startX = null;
    });

    // 画面に入ったら再生、外れたら停止（見ていない間に進まないように）
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        // 最初の写真も、表示領域に入った時点からズームを始める
        show(current);
        if (inView) { play(); } else { stop(); }
      }, { threshold: 0.3 }).observe(slider);
    } else {
      inView = true;
    }

    show(0);
    updatePauseButton();
    play();
  });


  /* ---------------------------------------------------------------
     9. 右下の「エントリーはこちら」丸ボタン
     ・トップの写真を半分ほど過ぎたら表示
     ・「応募はこちらから」「エントリーする」が画面に見えている間は隠す
       （同じ案内が重ならないように）
     --------------------------------------------------------------- */
  var floatEntry = document.querySelector('.float-entry');

  if (floatEntry) {
    var heroArea = document.querySelector('.hero');
    var hideAreas = document.querySelectorAll('#apply, #entry');

    var updateFloatEntry = function () {
      var pastHero = heroArea ? heroArea.getBoundingClientRect().bottom < window.innerHeight * 0.5 : true;
      var nearApply = Array.prototype.some.call(hideAreas, function (area) {
        var r = area.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      });
      var loaded = document.documentElement.classList.contains('is-loaded');
      floatEntry.classList.toggle('is-visible', loaded && pastHero && !nearApply);
    };

    var floatTicking = false;
    window.addEventListener('scroll', function () {
      if (!floatTicking) {
        requestAnimationFrame(function () {
          updateFloatEntry();
          floatTicking = false;
        });
        floatTicking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', updateFloatEntry);
    updateFloatEntry();
  }


  /* ---------------------------------------------------------------
     10. 募集要項タブ切り替え（PSS事業部・技術部）
     クリックのほか、←→キー・Home/Endキーでも切り替えられます
     （WAI-ARIAのTabsパターンに準拠。表示/非表示だけの軽い切り替えのため、
       フォーカス移動と同時にタブを選択する「自動選択」方式にしています）
     --------------------------------------------------------------- */
  var jobTabs = Array.prototype.slice.call(document.querySelectorAll('.job-tab'));

  if (jobTabs.length) {
    var selectJobTab = function (tab) {
      jobTabs.forEach(function (t) {
        var isSelected = t === tab;
        t.setAttribute('aria-selected', String(isSelected));
        t.setAttribute('tabindex', isSelected ? '0' : '-1');

        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !isSelected;
        }
      });
    };

    jobTabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        selectJobTab(tab);
      });

      tab.addEventListener('keydown', function (event) {
        var nextIndex = null;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          nextIndex = (index + 1) % jobTabs.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          nextIndex = (index - 1 + jobTabs.length) % jobTabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = jobTabs.length - 1;
        }

        if (nextIndex !== null) {
          event.preventDefault();
          jobTabs[nextIndex].focus();
          selectJobTab(jobTabs[nextIndex]);
        }
      });
    });
  }

  /* ---------------------------------------------------------------
     11. ヘッダー下の細いバー（ページをどこまで読んだか）
     --------------------------------------------------------------- */
  var progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    var progressTicking = false;
    var updateProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(window.pageYOffset / max, 1) : 0;
      progressBar.style.setProperty('--progress', ratio.toFixed(4));
    };
    window.addEventListener('scroll', function () {
      if (!progressTicking) {
        requestAnimationFrame(function () { updateProgress(); progressTicking = false; });
        progressTicking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  /* ---------------------------------------------------------------
     12. トップの写真スライドショー（全画面）
     ・HERO_INTERVAL ミリ秒ごとに、ゆっくり重なって次の写真へ
     ・ドットで好きな写真へ移動、丸いボタンで自動再生を停止／再開
     ・画面から外れている間（スクロールで通り過ぎた後）は止める
     ・「動きを減らす」設定の端末では、最初から停止
     ・オープニングが終わってから開始（finishLoader から呼ばれます）
     --------------------------------------------------------------- */
  var HERO_INTERVAL = 6000;

  function startHeroSlider() {
    var hero = document.querySelector('.hero');
    if (!hero) { return; }
    var slides = hero.querySelectorAll('.hero__slide');
    var dots = hero.querySelectorAll('.hero__dot');
    var pauseBtn = hero.querySelector('.hero__pause');
    if (slides.length < 2) { return; }

    var current = 0;
    var timer = null;
    var userPaused = prefersReducedMotion;
    var inView = true;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
        // 初期表示の1枚目にも、ローダー終了後にズームを開始させる
        slide.classList.toggle('is-zooming', i === current && !prefersReducedMotion);
        slide.setAttribute('aria-hidden', String(i !== current));
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-current', String(i === current));
      });
    }
    function stop() {
      clearInterval(timer);
      timer = null;
    }
    function play() {
      stop();
      if (!userPaused && inView) {
        timer = setInterval(function () { show(current + 1); }, HERO_INTERVAL);
      }
    }
    function updatePauseButton() {
      if (!pauseBtn) { return; }
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? '自動再生を開始' : '自動再生を停止');
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); play(); });
    });
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        userPaused = !userPaused;
        updatePauseButton();
        play();
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        play();
      }, { threshold: 0.15 }).observe(hero);
    }

    show(0);
    updatePauseButton();
    play();
  }

})();
