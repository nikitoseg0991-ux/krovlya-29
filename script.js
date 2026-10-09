function calcDetails() {
  const area = Math.max(1, Math.min(500, Number(document.querySelector("#area")?.value) || 100));
  const work = Number(document.querySelector("#work")?.value) || 800;
  const name = document.querySelector(".cover-card.is-active")?.dataset.name || document.querySelector("#work")?.selectedOptions[0]?.textContent || "Покрытие";
  const lines = [{label:"Монтаж: " + name, qty:area, unit:"м²", rate:work}];
  for (const [id,label,rate] of [["ob","Обрешётка",340],["counter","Контробрешётка",250],["vvz","Ветровлагозащитная плёнка",180]]) {
    if(document.getElementById(id)?.checked) lines.push({label,qty:area,unit:"м²",rate});
  }
  if(document.getElementById("demo")?.checked) {
    const raw = document.getElementById("demo-area")?.value;
    const qty = raw === "" ? area : Math.max(0, Math.min(500,Number(raw)||0));
    if(qty>0) lines.push({label:"Демонтаж старой кровли (20% от монтажа)",qty,unit:"м²",rate:work*0.2});
  }
  document.querySelectorAll(".calc-meter").forEach(input=>{
    const qty=Math.max(0,Number(input.value)||0);
    if(qty>0) lines.push({label:input.dataset.label,qty,unit:"пог. м",rate:Number(input.dataset.price)});
  });
  return {name,area,lines,total:lines.reduce((sum,l)=>sum+l.qty*l.rate,0)};
}
const rub = n => Math.round(n).toLocaleString("ru-RU") + " ₽";
function calc() {
  const areaEl=document.getElementById("area"),range=document.getElementById("area-range");
  const a=Math.max(1,Math.min(500,Number(areaEl?.value)||1));
  if(areaEl && document.activeElement!==areaEl) areaEl.value=a;
  if(range && document.activeElement!==range) range.value=a;
  const d=calcDetails();
  const sum=document.getElementById("sum");
  if(sum) sum.textContent=rub(d.total);
  const formula=document.getElementById("formula");
  if(formula) formula.textContent=d.area+" м² · "+d.name;
  const list=document.getElementById("calc-itemized");
  if(list) list.innerHTML=d.lines.map(l=>"<li><span>"+l.label+" ("+l.qty+" "+l.unit+")</span><b>"+rub(l.qty*l.rate)+"</b></li>").join("");
  for(const id of ["ob","counter","vvz"]) document.querySelector(".x-"+id)?.classList.toggle("is-visible",!!document.getElementById(id)?.checked);
  document.querySelector(".x-none")?.classList.toggle("is-hidden",["ob","counter","vvz"].some(id=>document.getElementById(id)?.checked));
}

function setArea(value) {
  const el = document.querySelector("#area");
  const range = document.querySelector("#area-range");
  const next = Math.max(1, Math.min(500, +value || 0));
  if (el) el.value = next;
  if (range) range.value = next;
  calc();
  trackCalculatorUsed();
}

function bumpArea(delta) {
  const el = document.querySelector("#area");
  if (!el) return;
  setArea((+el.value || 0) + delta);
}

let calculatorGoalSent = false;

function trackCalculatorUsed() {
  if (calculatorGoalSent) return;
  calculatorGoalSent = true;
  if (typeof window.ym === "function") {
    ym(113433742, "reachGoal", "calculator_used");
  }
}

function isCalculatorControl(el) {
  if (!el || !el.id) return false;
  return el.id === "area" || el.id === "area-range" || el.id === "work" ||
    el.id === "ob" || el.id === "counter" || el.id === "vvz" || el.id === "demo" || el.id === "demo-area" || el.classList.contains("calc-meter");
}

document.addEventListener("input", (e) => {
  calc();
  if (isCalculatorControl(e.target)) trackCalculatorUsed();
});
document.addEventListener("change", (e) => {
  calc();
  if (isCalculatorControl(e.target)) trackCalculatorUsed();
});
document.querySelectorAll(".cover-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".cover-card").forEach((c) => c.classList.remove("is-active"));
    card.classList.add("is-active");
    const work = document.querySelector("#work");
    if (work) work.value = card.dataset.work;
    calc();
    trackCalculatorUsed();
  });
});
document.getElementById("area-minus")?.addEventListener("click", () => bumpArea(-10));
document.getElementById("area-plus")?.addEventListener("click", () => bumpArea(10));
document.getElementById("area-range")?.addEventListener("input", (e) => setArea(e.target.value));
calc();

const burger = document.querySelector(".burger");
const menu = document.querySelector("#menu");
if (burger && menu) {
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  });
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Открыть меню");
    });
  });
}

const faqItems = document.querySelectorAll(".home .faq details, .inner .faq details");
faqItems.forEach((item, i) => {
  item.open = i === 0;
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const portfolio = document.querySelector(".portfolio");
if (portfolio) {
  const track = portfolio.querySelector(".pf-track");
  const items = [...track.querySelectorAll(".pf-item")];
  const [prevBtn, nextBtn] = portfolio.querySelectorAll(".pf-arrow");
  const counter = portfolio.querySelector(".pf-count");

  const perView = () => parseInt(getComputedStyle(portfolio).getPropertyValue("--pf-per"), 10) || 1;
  const step = () => items[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
  const pages = () => Math.ceil(items.length / perView());
  const currentPage = () => {
    const max = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= max - 2) return pages() - 1;
    return Math.round(track.scrollLeft / (step() * perView()));
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let targetPage = null;
  let anim = 0;
  let animTimer = 0;
  const render = (page) => {
    counter.textContent = `${page + 1} / ${pages()}`;
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page === pages() - 1;
  };
  const update = () => {
    if (anim) return;
    targetPage = null;
    render(currentPage());
  };
  const finish = (left) => {
    cancelAnimationFrame(anim);
    clearTimeout(animTimer);
    anim = 0;
    track.scrollLeft = left;
    track.style.scrollSnapType = "";
    targetPage = null;
    render(currentPage());
  };
  const goToPage = (page, behavior = "smooth") => {
    const p = Math.max(0, Math.min(pages() - 1, page));
    const left = Math.min(p * perView() * step(), track.scrollWidth - track.clientWidth);
    render(p);
    if (behavior !== "smooth" || reduceMotion.matches) { finish(left); return; }
    cancelAnimationFrame(anim);
    targetPage = p;
    track.style.scrollSnapType = "none";
    const from = track.scrollLeft;
    const start = performance.now();
    const duration = 420;
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      if (t >= 1) { finish(left); return; }
      track.scrollLeft = from + (left - from) * (1 - (1 - t) ** 3);
      anim = requestAnimationFrame(frame);
    };
    anim = requestAnimationFrame(frame);
    clearTimeout(animTimer);
    animTimer = setTimeout(() => finish(left), duration + 80);
  };
  const shift = (delta) => goToPage((targetPage ?? currentPage()) + delta);

  prevBtn.addEventListener("click", () => shift(-1));
  nextBtn.addEventListener("click", () => shift(1));
  track.addEventListener("keydown", (e) => {
    if (e.target !== track) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); shift(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); shift(1); }
  });
  if ("onscrollend" in window) {
    track.addEventListener("scrollend", update);
  } else {
    let scrollTimer;
    track.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(update, 150);
    }, { passive: true });
  }
  window.addEventListener("resize", update);
  update();

  const box = document.getElementById("pf-lightbox");
  const boxImg = box.querySelector(".lb-img");
  const boxCount = box.querySelector(".lb-count");
  const images = items.map((item) => item.querySelector("img"));
  let current = 0;
  let opener = null;

  const show = (index) => {
    current = (index + images.length) % images.length;
    boxImg.src = images[current].currentSrc || images[current].src;
    boxImg.alt = images[current].alt;
    boxImg.style.setProperty("--lb-ratio", images[current].getAttribute("width") / images[current].getAttribute("height"));
    boxCount.textContent = `${current + 1} / ${images.length}`;
  };
  const closeBox = () => box.open && box.close();

  track.addEventListener("click", (e) => {
    const btn = e.target.closest(".pf-open");
    if (!btn) return;
    opener = btn;
    show(Number(btn.dataset.index));
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    box.showModal();
  });
  box.querySelector(".lb-close").addEventListener("click", closeBox);
  box.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
  box.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
  box.querySelector(".lb-stage").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeBox();
  });
  box.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
  });
  box.addEventListener("close", () => {
    document.documentElement.style.overflow = "";
    document.body.style.paddingRight = "";
    const page = Math.floor(current / perView());
    if (page !== currentPage()) goToPage(page, "instant");
    (items[current].querySelector(".pf-open") || opener)?.focus({ preventScroll: true });
  });

  let touchX = 0;
  let touchY = 0;
  box.addEventListener("touchstart", (e) => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });
  box.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
  });
}

function makeLead() {
  const n = document.querySelector("#leadname")?.value || "не указано";
  const city = document.querySelector("#leadcity")?.value || "не указан";
  const text = document.querySelector("#leadtext")?.value || "без комментария";
  const s = `Заявка\nИмя: ${n}\nГород: ${city}\nКомментарий: ${text}\nТелефон для связи: +7 921 484-08-74`;
  const o = document.querySelector("#leadout");
  if (o) {
    o.style.display = "block";
    o.textContent = s + "\n\nПозвоните или отправьте это сообщение в MAX.";
  }
  navigator.clipboard?.writeText(s);
  return false;
}

function buildCalcMessage() {
  const d=calcDetails();
  return "Здравствуйте! Прошу уточнить стоимость кровельных работ.\n"+
    d.lines.map(l=>l.label+": "+l.qty+" "+l.unit+" × "+rub(l.rate)+" = "+rub(l.qty*l.rate)).join("\n")+
    "\nПредварительная стоимость работ: "+rub(d.total)+
    "\nПонимаю, что материалы и невыбранные работы не учтены, итоговая цена после уточнения.";
}
document.getElementById("calc-open")?.addEventListener("click",()=>{
  const d=calcDetails();
  document.getElementById("calc-modal-total").textContent=rub(d.total);
  document.getElementById("calc-modal-lines").textContent=buildCalcMessage();
  document.getElementById("calc-copy-status").textContent="";
  document.getElementById("calc-modal").showModal();
});
document.getElementById("calc-close")?.addEventListener("click",()=>document.getElementById("calc-modal").close());
document.getElementById("calc-copy")?.addEventListener("click",async()=>{
  const message=buildCalcMessage();
  try {await navigator.clipboard.writeText(message);document.getElementById("calc-copy-status").textContent="Заявка скопирована. Откройте MAX и вставьте сообщение.";}
  catch(e){document.getElementById("calc-copy-status").textContent="Не удалось скопировать автоматически. Выделите текст расчёта выше и скопируйте его.";}
});
