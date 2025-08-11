// feature_data.js (一个模块文件)
const featureVector = {
  a: 'valueA',
  b: 'valueB',
  c: 'valueC'
};

function getFeature(key) {
  return featureVector[key];
}