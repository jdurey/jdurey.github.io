const root = document.documentElement;
root.classList.add("js-enabled");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function installScrollProgress() {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.prepend(bar);

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    bar.style.transform = `scaleX(${progress})`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function installReveals() {
  const targets = [
    ...document.querySelectorAll(".hero > *, .section-head, .card, .changelog, .work-group, .page-head, .case-head, .prose > *"),
  ];

  targets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--i", String(index % 8));
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );

  targets.forEach((target) => observer.observe(target));
}

function installHeroInstrument() {
  const instrument = document.querySelector(".hero-instrument");
  const canPoint = window.matchMedia("(pointer: fine)").matches;
  if (!instrument || !canPoint || prefersReducedMotion) return;

  instrument.addEventListener("pointermove", (event) => {
    const rect = instrument.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    instrument.style.setProperty("--mx", `${x.toFixed(1)}%`);
    instrument.style.setProperty("--my", `${y.toFixed(1)}%`);
  });

  instrument.addEventListener("pointerleave", () => {
    instrument.style.setProperty("--mx", "50%");
    instrument.style.setProperty("--my", "50%");
  });
}

function installWorkFilters() {
  const filters = document.querySelector(".work-filters");
  if (!filters) return;

  const buttons = [...filters.querySelectorAll("button[data-filter]")];
  const groups = [...document.querySelectorAll("[data-work-group]")];
  const cards = [...document.querySelectorAll("[data-work-group] .card[data-card-type]")];

  const applyFilter = (filter) => {
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    });

    cards.forEach((card) => {
      const match = filter === "all" || card.dataset.cardType === filter;
      card.hidden = !match;
      if (match) card.classList.add("is-visible");
    });

    groups.forEach((group) => {
      const visibleCards = [...group.querySelectorAll(".card[data-card-type]")].some((card) => !card.hidden);
      group.hidden = !visibleCards;
      if (visibleCards) group.classList.add("is-visible");
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
  });
}

installScrollProgress();
installReveals();
installHeroInstrument();
installWorkFilters();
