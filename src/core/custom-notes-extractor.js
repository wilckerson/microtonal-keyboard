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

    var v = undefined;
    if (line.indexOf("/") !== -1) {
      //Ratio
      var parts = line.split("/");
      v = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else if (line.indexOf("\\") !== -1) {
      //Index of edo
      var parts = line.split("\\");
      v = Math.pow(2, parseFloat(parts[0]) / parseFloat(parts[1]));
    } else if (line.indexOf("c") !== -1) {
      //Cents
      var parts = line.split("c");
      var cent = parseFloat(parts[0]);
      v = Math.pow(2, cent / 1200);
    } else {
      v = parseFloat(line);
    }

    if (v !== undefined && !isNaN(v)) {
      result.push({ value: v, name });
    }
  }

  const sortedResult = result.sort((a, b) => a.value - b.value);
  const values = sortedResult.map(item => item.value);
  const names = sortedResult.map(item => item.name);
  return { values, names };
}
