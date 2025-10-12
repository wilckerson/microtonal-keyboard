function makeList(firstPergenDisplayed, maxFraction, edoFilter, edoFilter2) {
  console.log("Make list called with:", {
    firstPergenDisplayed,
    maxFraction,
    edoFilter,
    edoFilter2
  });
  const data = [
    {
      pergen: "(P8, P5)",
      per: 1200,
      gen: 700,
      unreducedPergen: "(P8, P4)",
      mapping: "1 1 1"
    },
    {
      pergen: "(P8, M3)",
      per: 1200,
      gen: 700,
      unreducedPergen: "(P8, M2)",
      mapping: "1 1 1"
    }
  ];
  return data;
}
