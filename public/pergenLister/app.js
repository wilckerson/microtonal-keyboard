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
  const data = makeList(
    uiData.slider1Value,
    uiData.slider2Value,
    uiData.slider3Value,
    uiData.slider4Value
  );
  updateTableList(data);
}, 300);

function update() {
  const isEdo = false;
  updateUnits(isEdo);

  const uiData = getUiData();
  updateSliderValues(uiData);
  expensiveUpdate(uiData);
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
      (item, index) =>
        `<tr>
      <td>${index + 1}</td>
      <td>${item.pergen}</td>
      <td>${item.per}</td>
      <td class="t-br">${item.gen}</td>
      <td></td>
      <td></td>
      <td class="t-br"></td>
      <td></td>
      <td></td>
      <td class="t-br"></td>
      <td>${item.unreducedPergen}</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td class="t-br"></td>
      <td>${item.mapping}</td>
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
