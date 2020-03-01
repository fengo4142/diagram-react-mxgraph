export default function getStyleStringByObj(styles) {
  return Object.keys(styles).reduce((prev, current) => {
    if (typeof styles[current] !== "function") {
      return prev + ";" + current + "=" + styles[current];
    }
    var shapeIndicator = styles["shape"] === "connector" ? "elbowEdgeStyle" : styles["shape"] + "Perimeter";
    return prev + ";" + current + "=" + shapeIndicator;
  }, "");
}
