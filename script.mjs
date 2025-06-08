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
  updateDownloadLink();
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
  ".contrast-light-primary",
  ".contrast-light-secondary",
  ".contrast-light-tertiary",
  ".contrast-dark-primary",
  ".contrast-dark-secondary",
  ".contrast-dark-tertiary",
];

const blendColor = (c1, c2) => {
  const alpha = 1 - c1.alpha;
  c1.set({
    "srgb.r": (r) => c1.alpha * r + alpha * Math.round(c2.srgb.r),
    "srgb.g": (g) => c1.alpha * g + alpha * Math.round(c2.srgb.g),
    "srgb.b": (b) => c1.alpha * b + alpha * Math.round(c2.srgb.b),
    alpha: 1,
  });
  return c1;
};

const calculateContrastRatios = () => {
  panelIds.forEach((id) => {
    buttonClasses.forEach((className) => {
      const button = document.querySelector(`${id} ${className}`);
      if (button) {
        const computedStyle = getComputedStyle(button);
        const fgColor = new Color(computedStyle.color);
        let bgColor = new Color(computedStyle.backgroundColor);

        // alpha blending
        if (bgColor.alpha < 1) {
          const panel = document.querySelector(id);
          const panelBgColor = new Color(
            getComputedStyle(panel).backgroundColor
          );
          bgColor = blendColor(bgColor, panelBgColor);
        }

        button.querySelector(".tooltip-text").textContent = fgColor
          .contrastWCAG21(bgColor)
          .toFixed(2);
      }
    });

    contrastClasses.forEach((className) => {
      const circle = document.querySelector(`${id} ${className}`);
      if (circle) {
        const computedStyle = getComputedStyle(circle);
        let bgColor = new Color(computedStyle.backgroundColor);

        const panel = document.querySelector(id);
        const panelBgColor = new Color(getComputedStyle(panel).backgroundColor);

        // alpha blending
        if (bgColor.alpha < 1) {
          bgColor = blendColor(bgColor, panelBgColor);
        }

        circle.querySelector(".tooltip-text").textContent = bgColor
          .contrastWCAG21(panelBgColor)
          .toFixed(2);
      }
    });
  });
};

const downloadAsASE = document.getElementById("download-ase");
const colorVariables = [
  "--bg-light",
  "--fg-light-primary",
  "--fg-light-secondary",
  "--fg-light-tertiary",
  "--accent-light-primary",
  "--accent-light-secondary",
  "--accent-light-tertiary",
  "--contrast-light-primary",
  "--contrast-light-secondary",
  "--contrast-light-tertiary",
  "--border-light-primary",
  "--border-light-secondary",
  "--border-light-tertiary",
  "--surface-light-primary",
  "--surface-light-secondary",
  "--surface-light-tertiary",

  "--bg-dark",
  "--fg-dark-primary",
  "--fg-dark-secondary",
  "--fg-dark-tertiary",
  "--accent-dark-primary",
  "--accent-dark-secondary",
  "--accent-dark-tertiary",
  "--contrast-dark-primary",
  "--contrast-dark-secondary",
  "--contrast-dark-tertiary",
  "--border-dark-primary",
  "--border-dark-secondary",
  "--border-dark-tertiary",
  "--surface-dark-primary",
  "--surface-dark-secondary",
  "--surface-dark-tertiary",
];

// Adobe Swatch Exchange (ASE) file format
// https://www.selapa.net/swatches/colors/fileformats.php#adobe_ase

const createASESwatches = (swatches) => {
  const writeUInt16 = (val) => {
    const buf = new Uint8Array(2);
    buf[0] = (val >> 8) & 0xff;
    buf[1] = val & 0xff;
    return buf;
  };

  const writeUInt32 = (val) => {
    const buf = new Uint8Array(4);
    buf[0] = (val >> 24) & 0xff;
    buf[1] = (val >> 16) & 0xff;
    buf[2] = (val >> 8) & 0xff;
    buf[3] = val & 0xff;
    return buf;
  };

  const writeFloat32 = (val) => {
    const buf = new DataView(new ArrayBuffer(4));
    buf.setFloat32(0, val, false); // big-endian
    return new Uint8Array(buf.buffer);
  };

  const writePascalUTF16StringWithNullTerminator = (str) => {
    const chars = Array.from(str).map((c) => c.charCodeAt(0));
    chars.push(0); // null-terminator
    const len = chars.length;
    const buf = new Uint8Array(2 + len * 2); // 2 bytes for length, then 2 bytes per char
    const view = new DataView(buf.buffer);
    view.setUint16(0, len, false); // big-endian length
    chars.forEach((code, i) => {
      view.setUint16(2 + i * 2, code, false);
    });
    return buf;
  };

  const blocks = [];

  // color blocks
  swatches.map((swatch) => {
    const { name, r, g, b } = swatch;
    const nameData = writePascalUTF16StringWithNullTerminator(name);
    const colorModel = new TextEncoder().encode("RGB ");
    const colorData = [
      ...writeFloat32(r / 255),
      ...writeFloat32(g / 255),
      ...writeFloat32(b / 255),
    ];
    const colorType = writeUInt16(0x0000); // global color

    const blockContent = new Uint8Array([
      ...nameData,
      ...colorModel,
      ...colorData,
      ...colorType,
    ]);

    const blockHeader = new Uint8Array([
      0x00,
      0x01, // block type: color entry
      ...writeUInt32(blockContent.length),
    ]);

    blocks.push(new Uint8Array([...blockHeader, ...blockContent]));
  });

  // assemble the file
  const header = new Uint8Array([
    0x41,
    0x53,
    0x45,
    0x46, // 'ASEF'
    0x00,
    0x01, // major version
    0x00,
    0x00, // minor version
    ...writeUInt32(blocks.length), // number of blocks
  ]);

  const totalLength =
    header.length + blocks.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(totalLength);

  let offset = 0;
  result.set(header, offset);
  offset += header.length;

  for (const block of blocks) {
    result.set(block, offset);
    offset += block.length;
  }

  return result;
};

const updateDownloadLink = () => {
  const blocks = colorVariables.map((variable) => {
    let value = getComputedStyle(root).getPropertyValue(variable);
    // remove line breaks as otherwise the value cannot be parsed as color
    value = value.replace(/\n/g, "");

    let color = new Color(value);

    // blend color if alpha is < 1
    if (color.alpha < 1) {
      const panelId =
        variable.indexOf("-light") !== -1 ? "#panel-light" : "#panel-dark";
      const panel = document.querySelector(panelId);
      const panelBgColor = new Color(getComputedStyle(panel).backgroundColor);
      color = blendColor(color, panelBgColor);
    }

    // convert to srgb and clamp values between 0 and 1
    const clamp = (x) => Math.min(1, Math.max(0, x));
    const [r, g, b] = color
      .to("srgb")
      .coords.map((v) => Math.round(clamp(v) * 255));

    return {
      name: variable.substring(2),
      r,
      g,
      b,
    };
  });

  // create Uint8Array in ASE file format from color variables
  const aseData = createASESwatches(blocks);

  // use array as input for blob
  const blob = new Blob([aseData], { type: "application/octet-stream" });

  downloadAsASE.href = URL.createObjectURL(blob);
  downloadAsASE.download = "palette.ase";
};

updateUI();
