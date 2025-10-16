window.addEventListener("load", init);

function init() {
  // Set up event listeners for sliders to call the update
  const sliders = ["slider1", "slider2", "slider3", "slider4"];
  sliders.forEach(sliderId => {
    const slider = document.getElementById(sliderId);
    slider.addEventListener("input", update);
  });

  //Initial update
  update();
}

const expensiveUpdate = debounce(uiData => {
  //Those operations are debounced a few milliseconds to avoid excessive calls on every UI control change.

  let edo = uiData.slider3Value;
  let edo2 = uiData.slider4Value;
  if (edo == 1) {
    edo = 13;
    if (edo2 == 1) edo2 = 13; // EDO #1 = 13b, EDO #2 = 18b
  }
  if (edo == 2) {
    edo = 18;
    if (edo2 == 2) edo2 = 18;
  }
  findBezout(edo, edo2); // e.g. (12,13)-->(1,1) and (12,19)-->(8,5)
  //const newSlider2Value = edo == 0 ? 10 : maxEDOfraction;
  //updateSlider2(newSlider2Value);
  //maxFraction = newSlider2Value;
  maxFraction = uiData.slider2Value;

  makeList(maxFraction, edo, edo2);

  //const data = [];
  const data = getData(uiData.slider1Value, edo);
  updateTableList(data);
}, 300);

function update() {
  const uiData = getUiData();
  updateSliderValues(uiData);
  expensiveUpdate(uiData);

  const isEdo = uiData.slider3Value > 0 || uiData.slider4Value > 0;
  updateUnits(isEdo);
}

function updateSlider2(newValue) {
  const slider2 = document.getElementById("slider2");
  const currentMax = parseInt(slider2.max);
  slider2.max = Math.max(currentMax, newValue);
  slider2.value = newValue;

  document.getElementById("slider2-value").textContent = newValue;
}

function updateSliderValues(uiData) {
  document.getElementById("slider1-value").textContent = uiData.slider1Value;
  document.getElementById("slider2-value").textContent = uiData.slider2Value;
  document.getElementById("slider3-value").textContent = uiData.slider3Value;
  document.getElementById("slider4-value").textContent = uiData.slider4Value;
}

function updateTableList(data) {
  const tbody = document.querySelector("#table-list tbody");
  const newTbodyHtml = data
    .map(
      item =>
        `<tr class="${
          item.blockStartType == 2
            ? "t-bt-gray"
            : item.blockStartType == 1
            ? "t-bt"
            : ""
        }">
      <td>${item.index}</td>
        <td><pre>(${(item.pergenName.period + ", ").padEnd(6)}<span class="${
          item.pergenName.isImperfect ? "imperfect" : ""
        }">${item.pergenName.gen}</span>${item.pergenName.fracGen})${
          item.partialSupport ? '<span class="partial-support">*</span>' : ""
        }</pre>
      </td>
      <td class="ta-r">${item.per}</td>
      <td class="t-br ta-r ${
        item.gen.isSmallGenerator ? "small-generator" : ""
      }">${item.gen.result}</td>
      <td>${item.periodDetails.period}</td>
      <td class="${item.periodDetails.isRedEnharmonic ? "lower-enharmonic-degree" : ""}">${item.periodDetails.enharmonic}</td>
      <td class="t-br">${item.periodDetails.cents}</td>
      <td></td>
      <td></td>
      <td class="t-br"></td>
      <td>${item.unreducedPergen || ""}</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td class="t-br"></td>
      <td>${item.mapping || ""}</td>
    </tr>`
    )
    .join("");

  tbody.innerHTML = newTbodyHtml;
}

function updateUnits(isEdo) {
  document.querySelectorAll(".data-unit").forEach(el => {
    el.textContent = `(${isEdo ? "Steps" : "Cents"})`;
  });
}

function getUiData() {
  const slider1Value = parseInt(document.querySelector("#slider1").value);
  const slider2Value = parseInt(document.querySelector("#slider2").value);
  const slider3Value = parseInt(document.querySelector("#slider3").value);
  const slider4Value = parseInt(document.querySelector("#slider4").value);
  return { slider1Value, slider2Value, slider3Value, slider4Value };
}

function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
