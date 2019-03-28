const fs = require('fs');

const DATA_PATH = './.data/coffee.json';

const dataFormat = {
  "pairs": [],
  "userData": [],
  "pastMatches": []
}

module.exports.loadData = function() {
  if (fs.existsSync(DATA_PATH)) {
    try {
      const data = fs.readFileSync(DATA_PATH).toString('utf8');
      return { ...dataFormat, ...JSON.parse(data) };
    } catch (error) {
      console.warn("didn't load data file:");
      console.warn(error);
      return { ...dataFormat }
    }
  } else {
    return { ...dataFormat };
  }
};

module.exports.saveData = function(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), function (err) {
      if (err) {
        console.warn(err);
      }
    });
  } catch (error) {
    console.warn(error);
  }
};

module.exports.deleteAllData = function() {
  module.exports.saveData(dataFormat);
}