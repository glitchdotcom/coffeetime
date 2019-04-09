const fs = require('fs');

const DATA_PATH = './.data/coffee.json';

const dataFormat = {
  // Note that "pairs" is sometimes a misnomer, as there can be groups of 3.
  "pairs": [],
  // TODO: userData is probably better as a map (via {}) instead of a list, though
  // it  would take some refactoring to change.
  "userData": [],
  "pastMatches": []
}

// Always loads data from disk and returns a copy of the data.
// If data does not exist on disk, return an empty copy of `dataFormat`.
module.exports.loadData = function() {
  if (fs.existsSync(DATA_PATH)) {
    try {
      const data = fs.readFileSync(DATA_PATH).toString('utf8');
      return { ...dataFormat, ...JSON.parse(data) };
    } catch (error) {
      console.warn("didn't load data file:");
                   console.warn(error);
      return {
        ...dataFormat 
      
      
      }
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