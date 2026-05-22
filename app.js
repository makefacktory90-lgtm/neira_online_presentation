const cases = [
  { id: "case01", number: "01", artworkExt: "png", finals: [{ id: "case01", label: "" }] },
  { id: "case02", number: "02", artworkExt: "jpg", finals: [{ id: "case02", label: "" }] },
  { id: "case03", number: "03", artworkExt: "jpg", finals: [{ id: "case03", label: "" }] },
  {
    id: "case04a",
    number: "04",
    artworkExt: "png",
    finals: [
      { id: "case04b", label: "" },
    ],
  },
  { id: "case05", number: "05", artworkExt: "png", finals: [{ id: "case05", label: "" }] },
  { id: "case06b", number: "06", artworkExt: "png", skipCase: true, skipPhoto: true, finals: [{ id: "case06b", label: "" }] },
  { id: "case07", number: "07", artworkExt: "png", finals: [{ id: "case07", label: "" }] },
  { id: "case08", number: "08", artworkExt: "png", finals: [{ id: "case08", label: "" }] },
  {
    id: "case09a",
    number: "09",
    artworkExt: "png",
    variant: "",
    finals: [
      { id: "case09b", label: "" },
    ],
  },
  { id: "case10a", number: "10", artworkExt: "png", finals: [{ id: "case10a", label: "" }] },
].map((item) => ({
  ...item,
  variant: item.variant || "",
  skipCase: Boolean(item.skipCase),
  skipPhoto: Boolean(item.skipPhoto),
  skipVideo: Boolean(item.skipVideo),
  video: `./assets/videos/${item.id}.mp4`,
  poster: `./assets/posters/${item.id}.jpg`,
  artwork: `./assets/artworks/${item.id}.${item.artworkExt}`,
}));

const openingSlide = {
  type: "opening",
  video: "./assets/videos/opening.mp4",
  poster: "./assets/posters/opening.jpg",
};

const slides = [
  openingSlide,
  ...cases.flatMap((item) => {
    const itemSlides = [];
    if (!item.skipCase) itemSlides.push({ type: "case", ...item });
    if (!item.skipPhoto) itemSlides.push({ type: "photo", ...item });
    if (!item.skipVideo) itemSlides.push({ type: "video", ...item });
    item.finals.forEach((final) => {
      itemSlides.push({
        type: "answer",
        ...item,
        final: `./assets/finals/${final.id}.png`,
        finalLabel: final.label,
      });
    });
    return itemSlides;
  }),
  openingSlide,
];

let index = 0;

const slideEl = document.querySelector("#slide");
const counterEl = document.querySelector("#counter");
const progressEl = document.querySelector("#progress");
document.querySelector("#prevBtn").addEventListener("click", () => go(-1));
document.querySelector("#nextBtn").addEventListener("click", () => go(1));

function pad(n) {
  return String(n).padStart(2, "0");
}

function updateChrome() {
  counterEl.textContent = `${pad(index + 1)} / ${pad(slides.length)}`;
  progressEl.style.width = `${((index + 1) / slides.length) * 100}%`;
}

function renderOpening(slide) {
  slideEl.className = "slide opening enter";
  slideEl.innerHTML = `
    <video class="stage-video" src="${slide.video}" poster="${slide.poster}" playsinline preload="auto" muted></video>
  `;
  wireVideo(true);
}

function renderCase(slide) {
  const hasVariant = slide.variant && slide.variant !== "Основная версия";
  slideEl.className = "slide case-only enter";
  slideEl.innerHTML = `
    <div class="case-lockup">
      <div class="eyebrow">Клинический ребус</div>
      <div class="case-number">${slide.number}</div>
      <h1>Кейс ${slide.number}</h1>
      ${hasVariant ? `<div class="version-pill">${slide.variant}</div>` : ""}
    </div>
  `;
}

function renderPhoto(slide) {
  const hasVariant = slide.variant && slide.variant !== "Основная версия";
  slideEl.className = "slide image-stage photo-stage enter";
  slideEl.innerHTML = `
    <header class="minimal-head">
      <div class="eyebrow">Кейс ${slide.number}</div>
      ${hasVariant ? `<div class="video-version">${slide.variant}</div>` : ""}
    </header>
    <figure class="gallery-frame">
      <img src="${slide.artwork}" alt="" />
    </figure>
  `;
}

function renderVideo(slide) {
  slideEl.className = "slide show-video clean-video enter";
  slideEl.innerHTML = `
    <section class="video-card">
      <video class="stage-video" src="${slide.video}" poster="${slide.poster}" playsinline preload="auto"></video>
    </section>
  `;
  wireVideo(false);
}

function renderAnswer(slide) {
  slideEl.className = "slide image-stage answer-stage enter";
  slideEl.innerHTML = `
    <figure class="answer-frame">
      <img src="${slide.final}" alt="" />
      ${slide.finalLabel ? `<figcaption>${slide.finalLabel}</figcaption>` : ""}
    </figure>
  `;
}

function wireVideo(auto) {
  const video = slideEl.querySelector("video");
  const overlay = slideEl.querySelector(".play-overlay");
  if (!video) return;

  if (auto) video.play().catch(() => {});
  video.addEventListener("play", () => overlay?.classList.add("hidden"));
  video.addEventListener("pause", () => overlay?.classList.remove("hidden"));
  video.addEventListener("ended", () => overlay?.classList.remove("hidden"));
  slideEl.addEventListener("click", (event) => {
    if (event.target.closest(".nav-hit")) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });
}

function render() {
  const slide = slides[index];
  updateChrome();
  if (slide.type === "opening") renderOpening(slide);
  if (slide.type === "case") renderCase(slide);
  if (slide.type === "photo") renderPhoto(slide);
  if (slide.type === "video") renderVideo(slide);
  if (slide.type === "answer") renderAnswer(slide);
}

function go(delta) {
  index = Math.max(0, Math.min(slides.length - 1, index + delta));
  render();
}

document.addEventListener("keydown", (event) => {
  const video = slideEl.querySelector("video");
  if (event.key === "ArrowRight" || event.key === "PageDown") go(1);
  if (event.key === "ArrowLeft" || event.key === "PageUp") go(-1);
  if (event.key === "Home") { index = 0; render(); }
  if (event.key === "End") { index = slides.length - 1; render(); }
  if (event.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.();
  if (event.code === "Space" && video) {
    event.preventDefault();
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }
});

render();
