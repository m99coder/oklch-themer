const root = document.querySelector(":root");

const hueAccentSlider = document.getElementById("hue-accent-slider");
const hueAccentInput = document.getElementById("hue-accent-input");
const hueContrastSlider = document.getElementById("hue-contrast-slider");
const hueContrastInput = document.getElementById("hue-contrast-input");
const colorListToggle = document.getElementById("show-color-list");

const panelLight = document.getElementById("panel-light");
const panelDark = document.getElementById("panel-dark");

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

const setProperties = (color) => {
  panelLight.style.setProperty(color.name, color.oklchLight);
  panelDark.style.setProperty(color.name, color.oklchDark);
};

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

updateUI();
