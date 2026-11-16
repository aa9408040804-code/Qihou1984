/* =======================================================
  旗後食光：1984 / 網站互動
  這是 JavaScript：控制滑鼠動態、點擊切換與捲動進場。
  如果想改文字，可先從 phases 與 characters 陣列開始。
======================================================= */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 01｜細緻的首頁視差與光線反應
const hero = document.querySelector('.hero');
if (hero && !reducedMotion && window.matchMedia('(pointer:fine)').matches) {
  let frame = 0;
  hero.addEventListener('pointermove', (event) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      hero.style.setProperty('--cursor-x', `${Math.round(x * 100)}%`);
      hero.style.setProperty('--cursor-y', `${Math.round(y * 100)}%`);
      hero.style.setProperty('--parallax-x', `${(0.5 - x) * 35}px`);
      hero.style.setProperty('--parallax-y', `${(0.5 - y) * 25}px`);
    });
  });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--parallax-x', '0px');
    hero.style.setProperty('--parallax-y', '0px');
  });
}

// 02｜捲動進場 + 頂部閱讀進度
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in-view'));
}
const progress = document.querySelector('.page-progress');
let scrolling = false;
const updateProgress = () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${h > 0 ? (window.scrollY / h) * 100 : 0}%`;
  scrolling = false;
};
window.addEventListener('scroll', () => {
  if (!scrolling) {
    requestAnimationFrame(updateProgress);
    scrolling = true;
  }
}, { passive: true });
updateProgress();

// 03｜手機選單
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
menuToggle?.addEventListener('click', () => {
  const opened = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!opened));
  siteNav.classList.toggle('is-open', !opened);
});
siteNav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  siteNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded','false');
}));

// 04｜點選「日間／傍晚／夜晚」，切換妳自己的場景圖
const timeTabs = document.querySelectorAll('[data-time]');
const sceneImages = document.querySelectorAll('[data-scene]');
timeTabs.forEach(tab => tab.addEventListener('click', () => {
  const selected = tab.dataset.time;
  timeTabs.forEach(item => {
    const active = item === tab;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  sceneImages.forEach(img => img.classList.toggle('is-active', img.dataset.scene === selected));
}));

// 05｜遊戲玩法：這段文字之後可以依你們的正式機制再微調
const phases = [
  {title:'今日採購，從選擇開始。', desc:'市場的食材、價格與數量，將影響接下來的營業。每一次選擇，都有自己的成本。'},
  {title:'用時間，換一桌好菜。', desc:'依照客人的點餐製作料理，安排步驟與時間，讓每道菜順利送上餐桌。'},
  {title:'每位客人，都不太一樣。', desc:'送餐、收桌、處理特殊需求與突發事件；天氣與評價，也會改變店裡的節奏。'},
  {title:'今天的成果，明天的起點。', desc:'檢視營收、成本與評價，再根據結果安排下一個營業日。'}
];
const phaseTabs = [...document.querySelectorAll('[data-phase]')];
const phaseNumber = document.querySelector('#phase-number');
const phaseTitle = document.querySelector('#phase-title');
const phaseDescription = document.querySelector('#phase-description');
const phasePanel = document.querySelector('#phase-panel');
function showPhase(n) {
  const phase = phases[n];
  phaseNumber.textContent = `${String(n+1).padStart(2,'0')} / 04`;
  phaseTitle.textContent = phase.title;
  phaseDescription.textContent = phase.desc;
  document.getElementById("supply-demo").hidden = n !== 0;
  document.getElementById("cook-demo").hidden = n !== 1;
  document.getElementById("service-demo").hidden = n !== 2;
  document.getElementById("settlement-demo").hidden = n !== 3;
  if (n === 3) updateSettlement();
  phaseTabs.forEach((tab, i) => {
    const active = i === n;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  phasePanel.setAttribute('aria-labelledby', `phase-tab-${n}`);
}
phaseTabs.forEach((tab, n) => tab.addEventListener('click', () => showPhase(n)));
phaseTabs.forEach((tab, n) => tab.addEventListener('keydown', e => {
  if (!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;
  e.preventDefault();
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? phases.length-1 : (n + (e.key === 'ArrowRight' ? 1 : -1) + phases.length) % phases.length;
  showPhase(next); phaseTabs[next].focus();
}));
showPhase(0);

// 06｜角色介紹：使用妳上傳的正式角色立繪


const characters = [
  {
    name: '蘇瑞英',
    role: '主角 / 返鄉經營者',
    desc: '1984 年返鄉接手家中歇業的小店，帶著積蓄重新開始餐廳經營。',
   img: 'assets/suying.webp',
    alt: '蘇瑞英角色立繪'
  },
  {
    name: '蔬果店老闆娘',
    role: '市場攤商 / 蔬果',
    desc: '在市場經營蔬果攤，是玩家採購每日食材時會遇見的熟面孔。',
    img: 'assets/vegetable_owner.webp',
    alt: '蔬果店老闆娘角色立繪'
  },
  {
    name: '肉舖老闆',
    role: '市場攤商 / 肉品',
    desc: '市場中的肉舖老闆，為餐廳的日常採購提供肉品。',
    img: 'assets/butcher.webp',
    alt: '肉舖老闆角色立繪'
  },
  {
    name: '銀行人員',
    role: '銀行 / 金融服務',
    desc: '負責銀行相關業務，提供餐廳經營所需的金融服務。',
   img: 'assets/bank_clerk.webp',
    alt: '銀行人員角色立繪'
  },
  {
    name: '一般女性客人 01',
    role: '一般顧客',
    desc: '來到海產店用餐的顧客，讓店內每天都有不同的相遇。',
   img: 'assets/customer_01.webp',
    alt: '一般女性客人01'
  },
  {
    name: '一般女性客人 02',
    role: '一般顧客',
    desc: '日常會出現在海產店的顧客，等待玩家完成點餐與送餐服務。',
   img: 'assets/customer_02.webp',
    alt: '一般女性客人02'
  },
  {
    name: '一般女性客人 03',
    role: '一般顧客',
    desc: '走進海產店用餐的長者，為港邊的小店增添生活氣息。',
   img: 'assets/customer_03.webp',
    alt: '一般女性客人03'
  }
];


let currentCharacter = 0;
let requestedCharacter = 0;
let characterChanging = false;
let queuedCharacter = null;

const characterImage = document.querySelector('#character-image');
const characterVisual = document.querySelector('.character-visual');

// 預先載入角色圖片，減少切換時的等待
const characterPictures = characters.map(c => {
  const picture = new Image();
  picture.src = c.img;
  return picture;
});


async function showCharacter(index) {
  const nextIndex =
    (index + characters.length) % characters.length;

  requestedCharacter = nextIndex;

  if (characterChanging) {
    queuedCharacter = nextIndex;
    return;
  }

  if (nextIndex === currentCharacter) return;

  characterChanging = true;

  const c = characters[nextIndex];
  const picture = characterPictures[nextIndex];

  // 先確保下一張圖片載入完成
  try {
    if (picture.decode) {
      await picture.decode();
    } else if (!picture.complete) {
      await new Promise((resolve, reject) => {
        picture.onload = resolve;
        picture.onerror = reject;
      });
    }

    if (!picture.naturalWidth) {
      throw new Error('圖片不存在：' + c.img);
    }
  } catch (error) {
    console.error('圖片載入失敗', error);
    characterChanging = false;
    return;
  }

  // 第一階段：舊角色原地淡出
  characterImage.classList.add('character-fade-out');

  await new Promise(resolve =>
    setTimeout(resolve, reducedMotion ? 0 : 240)
  );

  // 第二階段：更換角色圖片及文字
  const characterBackdrops = [
  "5_Zhongzhou_Fish_Market.png",
  "4_Cijin_Old_Street.png",
  "9_Fishing_Boat_Repair_Yard.png",
  "3_Cijin_Tianhou_Temple.png",
  "7_Cijin_Ferry.png",
  "8_Cijin_Beach.png",
  "2_Cihou_Fort.png"
];

document.querySelector(".character-stage").style.setProperty(
  "--character-bg",
  `url("assets/${characterBackdrops[nextIndex]}")`
);
  characterImage.src = c.img;
  characterImage.alt = c.alt;

  const nameElement =
    document.querySelector('#character-name');

  nameElement.textContent = c.name;
  nameElement.classList.toggle(
    'long-name',
    c.name.length >= 7
  );

  document.querySelector('#character-role')
    .textContent = c.role;

  document.querySelector('#character-desc')
    .textContent = c.desc;

  document.querySelector('#character-index')
    .textContent = String(nextIndex + 1).padStart(3, '0');

  document.querySelector('#character-current')
    .textContent = String(nextIndex + 1).padStart(2, '0');

  currentCharacter = nextIndex;

  // 第三階段：新角色原地淡入
  characterImage.classList.remove('character-fade-out');

  await new Promise(resolve =>
    setTimeout(resolve, reducedMotion ? 0 : 300)
  );

  characterChanging = false;

  if (queuedCharacter !== null) {
    const wanted = queuedCharacter;
    queuedCharacter = null;

    if (wanted !== currentCharacter) {
      showCharacter(wanted);
    }
  }
}


// 左右箭頭
document.querySelector('#character-prev')?.addEventListener(
  'click',
  () => showCharacter(requestedCharacter - 1)
);

document.querySelector('#character-next')?.addEventListener(
  'click',
  () => showCharacter(requestedCharacter + 1)
);

/* 角色切換按鈕音效 */

let soundContext;

function playClickSound() {
  soundContext ??= new AudioContext();

  const oscillator = soundContext.createOscillator();
  const volume = soundContext.createGain();
  const now = soundContext.currentTime;

  oscillator.type = 'sine';

  oscillator.frequency.setValueAtTime(650, now);
  oscillator.frequency.exponentialRampToValueAtTime(
    400, now + 0.12
  );

  volume.gain.setValueAtTime(0.12, now);
  volume.gain.exponentialRampToValueAtTime(
    0.001, now + 0.12
  );

  oscillator.connect(volume);
  volume.connect(soundContext.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.12);
}

document.querySelector('#character-prev')
  ?.addEventListener('click', playClickSound);

document.querySelector('#character-next')
  ?.addEventListener('click', playClickSound);




/* ===== 背景音樂自動播放與靜音 ===== */

const bgm = document.querySelector('#bgm');
const musicButton = document.querySelector('#music-toggle');

bgm.volume = 0.45;
bgm.loop = true;

// 預設希望播放音樂
let wantsMusic = true;

function updateMusicButton() {
  musicButton.textContent =
    !bgm.paused && !bgm.muted
      ? '♫ 靜音'
      : '♫ 開啟音樂';
}

async function startMusic() {
  if (!wantsMusic) return;

  bgm.muted = false;

  try {
    await bgm.play();
  } catch (error) {
    console.log('等待使用者操作以啟動音樂');
  }

  updateMusicButton();
}

// 一進網站就嘗試播放
startMusic();

// 若瀏覽器阻擋，第一次操作網站時播放
document.addEventListener('pointerdown', (event) => {
  if (event.target.closest('#music-toggle')) return;

  if (wantsMusic && bgm.paused) {
    startMusic();
  }
});

// 使用者自己控制靜音
musicButton.addEventListener('click', async () => {
  if (bgm.paused || bgm.muted) {
    wantsMusic = true;
    await startMusic();
  } else {
    wantsMusic = false;
    bgm.muted = true;
    updateMusicButton();
  }
});

/* 點擊「開始探索」時啟動背景音樂 */
document.querySelector('.round-link[href="#story"]')
  ?.addEventListener('click', () => {
    if (wantsMusic && bgm.paused) {
      startMusic();
    }
  });
// 餐廳場景滑鼠跟隨
document.querySelectorAll(".scene-frame").forEach(frame => {
    frame.addEventListener("pointermove", e => {
        const r = frame.getBoundingClientRect();

        frame.style.setProperty("--mx", `${((e.clientX - r.left) / r.width - 0.5) * 3}%`);
        frame.style.setProperty("--my", `${((e.clientY - r.top) / r.height - 0.5) * 3}%`);
    });
});
// 採購與料理試玩
let supplyCount = 0;
let supplyTotal = 0;

const demoStock = { squid: 0, oyster: 0, shrimp: 0 };
const demoMeals = { squid: 0, oyster: 0, shrimp: 0 };

function updateSupply() {
    document.getElementById("supply-count").textContent = supplyCount;
    document.getElementById("supply-total").textContent = supplyTotal;

    document.getElementById("cook-stock").textContent =
        `庫存｜小卷 ${demoStock.squid}・蚵仔 ${demoStock.oyster}・鮮蝦 ${demoStock.shrimp}`;
        document.querySelectorAll("[data-recipe]").forEach(button => {
    button.disabled = demoStock[button.dataset.recipe] <= 0;
});
updateService();
}

document.querySelectorAll("#supply-demo [data-ingredient]").forEach(button => {
    const key = button.dataset.ingredient;
    const cost = Number(button.dataset.cost);

    const group = document.createElement("div");
    group.className = "supply-item-choice";
    button.before(group);

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "supply-minus";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "退回一份" + button.textContent.trim());

    group.append(button, minus);

    button.addEventListener("click", () => {
        supplyCount++;
        supplyTotal += cost;
        demoStock[key]++;
        updateSupply();
    });

    minus.addEventListener("click", () => {
        if (demoStock[key] <= 0) return;

        supplyCount--;
        supplyTotal -= cost;
        demoStock[key]--;
        updateSupply();
    });
});

document.getElementById("supply-reset").addEventListener("click", () => {
    supplyCount = 0;
    supplyTotal = 0;

    for (const key in demoStock) {
        demoStock[key] = 0;
        demoMeals[key] = 0;
    }

    document.getElementById("cook-result-img").hidden = true;
    document.getElementById("cook-status").textContent = "請購買食材後開始料理。";
    demoOrder = 0;
demoRevenue = 0;
demoServed = 0;
demoErrors = 0;

document.getElementById("service-status").textContent =
    "請依照客人的需求送餐。";
    updateSupply();
});

document.querySelectorAll("[data-recipe]").forEach(button => {
    button.addEventListener("click", () => {
        const key = button.dataset.recipe;
        const status = document.getElementById("cook-status");
        const result = document.getElementById("cook-result-img");

        if (demoStock[key] <= 0) {
            status.textContent = "食材不足，請先進行採購！";
            result.hidden = true;
            return;
        }

        demoStock[key]--;
        demoMeals[key]++;
        result.src = button.querySelector("img").src;
        result.hidden = false;
        status.textContent = button.textContent.trim() + " 製作完成！";

        updateSupply();
    });
});

// 03 服務與事件
const demoMenu = {
    squid: { name: "烤小卷", price: 90 },
    oyster: { name: "蚵仔煎", price: 75 },
    shrimp: { name: "海鮮麵", price: 85 }
};

const demoOrders = Object.keys(demoMenu);
let demoOrder = 0;
let demoRevenue = 0;
let demoServed = 0;
let demoErrors = 0;

function updateService() {
    const key = demoOrders[demoOrder];

    document.getElementById("service-order").textContent =
        "我要" + demoMenu[key].name;

    document.getElementById("service-stock").textContent =
        `已完成｜烤小卷 ${demoMeals.squid}・蚵仔煎 ${demoMeals.oyster}・海鮮麵 ${demoMeals.shrimp}`;

    document.querySelectorAll("[data-serve]").forEach(button => {
        button.disabled = demoMeals[button.dataset.serve] <= 0;
    });
}

document.querySelectorAll("[data-serve]").forEach(button => {
    button.addEventListener("click", () => {
        const key = button.dataset.serve;
        const status = document.getElementById("service-status");

        if (demoMeals[key] <= 0) return;

        if (key !== demoOrders[demoOrder]) {
            demoErrors++;
            document.getElementById("service-order").textContent =
    "這不是我點的餐！";

setTimeout(updateService, 1800);
            status.textContent = "客人抱怨：這不是我點的餐！";
            return;
        }

        demoMeals[key]--;
        demoRevenue += demoMenu[key].price;
        demoServed++;

        status.textContent = "送餐成功！營收 +" + demoMenu[key].price;

        demoOrder = (demoOrder + 1) % demoOrders.length;
        updateService();
    });
});

updateSupply();
updateService();
// 04 營業結算
function updateSettlement() {
    const profit = demoRevenue - supplyTotal;
    const attempts = demoServed + demoErrors;

    document.getElementById("settlement-revenue").textContent = "$" + demoRevenue;
    document.getElementById("settlement-cost").textContent = "$" + supplyTotal;
    document.getElementById("settlement-served").textContent = demoServed;
    document.getElementById("settlement-errors").textContent = demoErrors;

    document.getElementById("settlement-profit").textContent =
        profit < 0 ? "-$" + Math.abs(profit) : "$" + profit;

    document.getElementById("settlement-rating").textContent =
        attempts > 0
            ? (demoServed / attempts * 5).toFixed(1) + " / 5"
            : "尚未營業";
}

document.getElementById("settlement-restart").addEventListener("click", () => {
    document.getElementById("supply-reset").click();
    showPhase(0);
});
// 遊戲理念互動
const ideaDetails = [
    "玩家必須在有限的預算與時間內，安排食材採購、庫存管理、料理與營業，在每一次經營決策中尋找平衡。",
    "不同類型的顧客、突發事件與食材變化，讓玩家學習應對不確定性，每一天都有新的挑戰。",
    "透過聘用不同身分與背景的員工，讓餐廳不只追求營利，也創造就業機會與社會價值，帶入 SROI 的概念。"
];

document.querySelectorAll(".idea-en").forEach((item, index) => {
    const card = item.closest("article");

    const detail = document.createElement("p");
    detail.className = "idea-expand";
    detail.textContent = ideaDetails[index];
    detail.hidden = true;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "idea-readmore";
    button.textContent = "了解更多 ＋";
    button.setAttribute("aria-expanded", "false");

    card.append(button, detail);

    card.addEventListener("click", () => {
        detail.hidden = !detail.hidden;
        button.textContent = detail.hidden ? "了解更多 ＋" : "收合 −";
        button.setAttribute("aria-expanded", String(!detail.hidden));
    });
});
;(() => {
  const cursor = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 32 32">
<path d="M3 14 Q10 3 20 11 L29 5 L27 14 L29 23 L20 17 Q10 25 3 14Z" fill="#B83B35" stroke="#fff0d5" stroke-width="1.5"/>
<circle cx="10" cy="12" r="1.5" fill="white"/>
<path d="M12 0L13.5 3L17 4L13.5 5L12 8L10.5 5L7 4L10.5 3Z" fill="#c6a36c"/>
</svg>`;

  const style = document.createElement("style");

  style.textContent = `
    html, body, body * {
  cursor: url("data:image/svg+xml,${encodeURIComponent(cursor)}") 4 19, auto !important;
}

    .click-spark {
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      color: #fff1c6;
      text-shadow: 0 0 8px #c6a36c;
      animation: spark-out .65s ease-out forwards;
    }

    @keyframes spark-out {
      from {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      to {
        transform: translate(var(--dx), var(--dy)) scale(.2);
        opacity: 0;
      }
    }
  `;

  document.head.appendChild(style);

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;

    for (let i = 0; i < 6; i++) {
      const spark = document.createElement("span");
      const angle = i * Math.PI / 3;

      spark.className = "click-spark";
      spark.textContent = "✦";
      spark.style.left = e.clientX + "px";
      spark.style.top = e.clientY + "px";
      spark.style.fontSize = "14px";
      spark.style.setProperty("--dx", Math.cos(angle) * 35 + "px");
      spark.style.setProperty("--dy", Math.sin(angle) * 35 + "px");

      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 700);
    }
  });
})();