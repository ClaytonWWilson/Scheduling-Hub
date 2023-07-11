const csv2json = (csv: string, options?: { headers?: boolean }) => {
  console.log(csv);
  if (options && options.headers) {
    const headerLine = csv.slice(0, csv.indexOf("\n") + 1);
    console.log(headerLine);
  }
};

const json2csv = (json: {}) => {};

const isNumeric = (str: string) => {
  if (typeof str != "string") return false; // we only process strings!
  return (
    // deepcode ignore UseNumberIsNan: NumberisNan does not have the necessary functionality
    // @ts-expect-error
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  );
};

const isStationCodeValid = (stationCode: string) => {
  return stationCode.match(/^[A-Z]{3}[1-9]{1}$/) === null;
};

export { csv2json, json2csv, isStationCodeValid, isNumeric };
