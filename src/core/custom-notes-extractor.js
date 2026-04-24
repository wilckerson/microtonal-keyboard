export function parseNoteToken(token) {
  const line = (token || "").trim();
  if (!line) {
    return { value: undefined, isValid: false };
  }

  let value;
  if (line.indexOf("/") !== -1) {
    const parts = line.split("/");
    value = parseFloat(parts[0]) / parseFloat(parts[1]);
  } else if (line.indexOf("\\") !== -1) {
    const parts = line.split("\\");
    value = Math.pow(2, parseFloat(parts[0]) / parseFloat(parts[1]));
  } else if (line.toLowerCase().indexOf("c") !== -1 || line.indexOf("¢") !== -1) {
    const centsText = line.toLowerCase().replace("¢", "").replace("c", "");
    const cent = parseFloat(centsText);
    value = Math.pow(2, cent / 1200);
  } else {
    value = parseFloat(line);
  }

  return { value, isValid: value !== undefined && !isNaN(value) };
}

export function extractCustomNotes(input) {
  var result = [];
  var lines = (input || "").split("\n");
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    //Extracting note name
    const matchResult = line.match(/\"(.*?)\"/);
    let name = "";
    if (matchResult) {
      name = matchResult[1];
      line = line.substr(0, matchResult.index).trim();
    }

    const parsed = parseNoteToken(line);
    if (parsed.isValid) {
      result.push({ value: parsed.value, name, text: line });
    }
  }

  const sortedResult = result.sort((a, b) => a.value - b.value);
  const values = sortedResult.map(item => item.value);
  const names = sortedResult.map(item => item.name);
  const texts = sortedResult.map(item => item.text);
  return { values, names, texts };
}
