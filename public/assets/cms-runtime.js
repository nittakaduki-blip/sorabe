(() => {
  const payload = document.getElementById("cms-content-json");
  if (!payload) return;
  let content;
  try { content = JSON.parse(payload.textContent || "{}"); } catch { return; }

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && typeof value === "string") element.textContent = value;
  };
  const setLines = (selector, lines, lineClass = "journey-title-line") => {
    const element = document.querySelector(selector);
    if (!element || !Array.isArray(lines)) return;
    if (!lineClass) {
      element.replaceChildren(...lines.flatMap((line, index) => {
        const nodes = [document.createTextNode(String(line))];
        if (index < lines.length - 1) nodes.push(document.createElement("br"));
        return nodes;
      }));
      return;
    }
    element.replaceChildren(...lines.map((line) => {
      const span = document.createElement("span");
      span.className = lineClass;
      span.textContent = String(line);
      return span;
    }));
  };

  setText("[data-cms='hero.tagline']", content.hero?.tagline);
  const heroIntro = document.querySelector("[data-cms='hero.introLines']");
  if (heroIntro && Array.isArray(content.hero?.introLines)) {
    heroIntro.replaceChildren(...content.hero.introLines.flatMap((line, index) => {
      const nodes = [document.createTextNode(String(line))];
      if (index < content.hero.introLines.length - 1) nodes.push(document.createElement("br"));
      return nodes;
    }));
  }
  setLines("[data-cms='journey.headingLines'], #journey > header h2", content.journey?.headingLines, "");
  setText("[data-cms='journey.intro'], #journey > header > p:last-child", content.journey?.intro);
  document.querySelectorAll("#journey > .journey-step").forEach((article, index) => {
    const stepIndex = article.hasAttribute("data-cms-step") ? Number(article.getAttribute("data-cms-step")) : index;
    const step = content.journey?.steps?.[stepIndex];
    if (!step) return;
    const text = (field, value) => {
      const fallback = field === "time" ? ".journey-time" : field === "body" ? ".journey-copy > p:not(.journey-time)" : ".journey-copy > small";
      const element = article.querySelector(`[data-cms-field='${field}'], ${fallback}`);
      if (element && typeof value === "string") element.textContent = value;
    };
    text("time", step.time);
    text("body", step.body);
    text("note", step.note);
    const title = article.querySelector("[data-cms-field='titleLines'], .journey-copy > h3");
    if (title && Array.isArray(step.titleLines)) {
      title.replaceChildren(...step.titleLines.map((line) => {
        const span = document.createElement("span");
        span.className = "journey-title-line";
        span.textContent = String(line);
        return span;
      }));
    }
  });
  setLines("[data-cms='tourism.headingLines'], #experience header h2", content.tourism?.headingLines, "");
  setText("[data-cms='tourism.tsuwanoTitle'], #tsuwano-guide h3", content.tourism?.tsuwanoTitle);
  setText("[data-cms='tourism.tsuwanoBody'], #tsuwano-guide h3 + p", content.tourism?.tsuwanoBody);
  setText("[data-cms='tourism.observatoryTitle'], #experience .tourism-card + article h3", content.tourism?.observatoryTitle);
  setText("[data-cms='tourism.observatoryBody'], #experience .tourism-card + article h3 + p", content.tourism?.observatoryBody);
  setText("[data-cms='stay.currentPrice']", content.stay?.currentPrice);
  setText("[data-cms='stay.currentPriceNote']", content.stay?.currentPriceNote);
  setText("[data-cms='stay.renovationHeading']", content.stay?.renovationHeading);
  setText("[data-cms='stay.renovationBody']", content.stay?.renovationBody);
  setText("[data-cms='stay.saunaStatus']", content.stay?.saunaStatus);
  setText("[data-cms='stay.bathStatus']", content.stay?.bathStatus);
  setText("[data-cms='stay.indoorBbqStatus']", content.stay?.indoorBbqStatus);
})();
