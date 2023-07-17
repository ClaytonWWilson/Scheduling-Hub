type CSVDecodedRow = {
  [header: string]: string;
};

const csv2json = (csv: string, options?: { headers?: boolean }) => {
  let rows = csv.split("\n");

  const res = new Array<CSVDecodedRow>(rows.length);
  if (rows.length == 0) {
    return res;
  }

  const colCount = rows[0].split(",").length;

  let headers: string[] = [];

  if (options && options.headers) {
    const headerRow = rows[0];
    headers = headerRow.split(",");

    // Remove header row
    rows.splice(0, 1);
  } else {
    // Use generic numbers as the headers
    for (let i = 0; i < colCount; i++) {
      headers.push(i.toString());
    }
  }

  rows.forEach((row, index) => {
    const values = row.split(",");

    // Check for empty last row
    if (values.length === 0 || (values.length == 1 && values[0] === "")) {
      return;
    }

    let decodedRow: CSVDecodedRow = {};

    for (let i = 0; i < values.length; i++) {
      // TODO: Check for duplicates
      decodedRow[headers[i]] = values[i];
    }

    res[index] = decodedRow;
  });

  // TODO: Delete empty rows from array before returning
  return res;
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

export type { CSVDecodedRow };
export { csv2json, json2csv, isStationCodeValid, isNumeric };
