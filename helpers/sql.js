const { BadRequestError } = require("../expressError");

// This is a helper to update queries in the following format: 

// @param dataToUpdate {Object} {field1: newVal, field2: newVal, field3: newVal, ...}

// @param jsToSql {Object} maps data fields in js-style to the column names of the database as such: { firstName: "first_name", lastName: "last_name" }

// @returns {Object} {sqlSetCols, dataToUpdate}
// @example {firstName: 'Alaya', age: 32} => { setCols: '"first_name=$1, "age"=$2', values: ['Aliya', 32] }

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
