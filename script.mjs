import Color from "https://colorjs.io/dist/color.js";

const root = document.querySelector(":root");

const hueAccentSlider = document.getElementById("hue-accent-slider");
const hueAccentInput = document.getElementById("hue-accent-input");
const hueContrastSlider = document.getElementById("hue-contrast-slider");
const hueContrastInput = document.getElementById("hue-contrast-input");
const colorListToggle = document.getElementById("show-color-list");

let hueAccent = localStorage.getItem("hue-accent")
  ? parseFloat(localStorage.getItem("hue-accent"))
  : 279;
let hueContrast = localStorage.getItem("hue-contrast")
  ? parseFloat(localStorage.getItem("hue-contrast"))
  : 83;
let showColorList = localStorage.getItem("show-color-list")
  ? JSON.parse(localStorage.getItem("show-color-list"))
  : false;

hueAccentSlider.value = hueAccent;
hueAccentInput.value = hueAccent;
hueContrastSlider.value = hueContrast;
hueContrastInput.value = hueContrast;
colorListToggle.checked = showColorList;

const updateUI = () => {
  localStorage.setItem("hue-accent", hueAccent);
  localStorage.setItem("hue-contrast", hueContrast);
  localStorage.setItem("show-color-list", showColorList);

  root.style.setProperty("--hue-accent", hueAccent);
  root.style.setProperty("--hue-contrast", hueContrast);

  const colorSampleLists = document.querySelectorAll(".color-sample-list");
  colorSampleLists.forEach((list) => {
    list.style.display = showColorList ? "block" : "none";
  });

  calculateContrastRatios();
};

hueAccentSlider.addEventListener("input", (event) => {
  hueAccent = event.target.value;
  hueAccentInput.value = hueAccent;
  updateUI();
});

hueAccentInput.addEventListener("input", (event) => {
  hueAccent = event.target.value;
  hueAccentSlider.value = hueAccent;
  updateUI();
});

hueContrastSlider.addEventListener("input", (event) => {
  hueContrast = event.target.value;
  hueContrastInput.value = hueContrast;
  updateUI();
});

hueContrastInput.addEventListener("input", (event) => {
  hueContrast = event.target.value;
  hueContrastSlider.value = hueContrast;
  updateUI();
});

colorListToggle.addEventListener("change", () => {
  showColorList = colorListToggle.checked;
  updateUI();
});

const panelIds = ["#panel-light", "#panel-dark"];
const buttonClasses = [
  ".button-primary",
  ".button-secondary",
  ".button-tertiary",
];
const contrastClasses = [
  ".contrast-primary",
  ".contrast-secondary",
  ".contrast-tertiary",
];

const calculateContrastRatios = () => {
  panelIds.forEach((id) => {
    buttonClasses.forEach((className) => {
      const button = document.querySelector(`${id} ${className}`);
      const computedStyle = getComputedStyle(button);
      const fgColor = new Color(computedStyle.color);
      const bgColor = new Color(computedStyle.backgroundColor);

      // alpha blending
      if (bgColor.alpha < 1) {
        const panel = document.querySelector(id);
        const panelBgColor = new Color(getComputedStyle(panel).backgroundColor);
        const alpha = 1 - bgColor.alpha;
        bgColor.set({
          "srgb.r": (r) =>
            bgColor.alpha * r + alpha * Math.round(panelBgColor.srgb.r),
          "srgb.g": (g) =>
            bgColor.alpha * g + alpha * Math.round(panelBgColor.srgb.g),
          "srgb.b": (b) =>
            bgColor.alpha * b + alpha * Math.round(panelBgColor.srgb.b),
          alpha: 1,
        });
      }

      button.querySelector(".tooltip-text").textContent = fgColor
        .contrastWCAG21(bgColor)
        .toFixed(2);
    });

    contrastClasses.forEach((className) => {
      const circle = document.querySelector(`${id} ${className}`);
      const computedStyle = getComputedStyle(circle);
      const bgColor = new Color(computedStyle.backgroundColor);

      const panel = document.querySelector(id);
      const panelBgColor = new Color(getComputedStyle(panel).backgroundColor);

      // alpha blending
      if (bgColor.alpha < 1) {
        const alpha = 1 - bgColor.alpha;
        bgColor.set({
          "srgb.r": (r) =>
            bgColor.alpha * r + alpha * Math.round(panelBgColor.srgb.r),
          "srgb.g": (g) =>
            bgColor.alpha * g + alpha * Math.round(panelBgColor.srgb.g),
          "srgb.b": (b) =>
            bgColor.alpha * b + alpha * Math.round(panelBgColor.srgb.b),
          alpha: 1,
        });
      }

      circle.querySelector(".tooltip-text").textContent = bgColor
        .contrastWCAG21(panelBgColor)
        .toFixed(2);
    });
  });
};

updateUI();
