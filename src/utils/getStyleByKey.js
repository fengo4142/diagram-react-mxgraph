export default function getStyleByKey(style, key) {
  let obj = {};
  let stylesArr = style.split(";");
  stylesArr.forEach(v => {
    let [key, value] = v.split("=");
    obj[key] = value;
  });

  return obj[key];
}
