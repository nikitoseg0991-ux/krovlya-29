function calc() {
  const areaEl = document.querySelector("#area");
  const range = document.querySelector("#area-range");
  let a = +areaEl?.value || 0;
  if (areaEl) {
    a = Math.max(1, Math.min(500, a || 0));
    if (document.activeElement !== areaEl) areaEl.value = a;
  }
  if (range && document.activeElement !== range) range.value = a;
  const work = +document.querySelector("#work")?.value || 800;
  const demo = document.querySelector("#demo")?.checked ? 250 : 0;
  const ob = document.querySelector("#ob")?.checked ? 340 : 0;
  const counter = document.querySelector("#counter")?.checked ? 250 : 0;
  const vvz = document.querySelector("#vvz")?.checked ? 180 : 0;
  const total = a * (work + demo + ob + counter + vvz);
  const out = document.querySelector("#sum");
  if (out) out.textContent = total ? Math.round(total).toLocaleString("ru-RU") + " ₽" : "—";
  const formula = document.querySelector("#formula");
  if (formula) {
    const active = document.querySelector(".cover-card.is-active");
    const name = active?.dataset.name || "покрытие";
    const parts = [a + " м²", name, work.toLocaleString("ru-RU") + " ₽/м²"];
    if (ob) parts.push("обрешётка");
    if (counter) parts.push("контробрешётка");
    if (vvz) parts.push("ВВЗ");
    formula.textContent = parts.join(" · ");
  }
}

function setArea(value) {
  const el = document.querySelector("#area");
  const range = document.querySelector("#area-range");
  const next = Math.max(1, Math.min(500, +value || 0));
  if (el) el.value = next;
  if (range) range.value = next;
  calc();
}

function bumpArea(delta) {
  const el = document.querySelector("#area");
  if (!el) return;
  setArea((+el.value || 0) + delta);
}

document.addEventListener("input", calc);
document.addEventListener("change", calc);
document.querySelectorAll(".cover-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".cover-card").forEach((c) => c.classList.remove("is-active"));
    card.classList.add("is-active");
    const work = document.querySelector("#work");
    if (work) work.value = card.dataset.work;
    calc();
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

const faqItems = document.querySelectorAll(".home .faq details");
faqItems.forEach((item, i) => {
  item.open = i === 0;
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

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
