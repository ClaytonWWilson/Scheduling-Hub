import { format } from "date-fns";

type CSVDecodedRow = {
  [header: string]: string;
};

const csv2json = (csv: string, options?: { headers?: boolean }) => {
  let rows = csv.split("\n");

  if (rows.length == 0) {
    return [];
  }

  const colCount = rows[0].split(",").length;

  let headers: string[] = [];
  let res: Array<CSVDecodedRow>;

  if (options && options.headers) {
    const headerRow = rows[0];
    headers = headerRow.split(",");

    // Remove header row
    rows.splice(0, 1);
    res = new Array<CSVDecodedRow>(rows.length - 1);
  } else {
    res = new Array<CSVDecodedRow>(rows.length - 1);
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

const isDpoLinkValid = (link: string, stationCode: string) => {
  if (
    link.match(
      /^https:\/\/na.dispatch.planning.last-mile.a2z.com\/dispatch-planning\/[A-Z]{3}[1-9]{1}\/.+/g
    ) === null
  ) {
    return false;
  }

  // BUG: Date in DPO link could be incorrect

  // Return true if station code is blank to avoid confusion. User will not be able to proceed in this state anyways.
  if (stationCode.length === 0) {
    return true;
  }

  if (!link.includes(stationCode)) {
    return false;
  }
  return true;
};

const isStationCodeValid = (stationCode: string) => {
  return stationCode.match(/^[A-Z]{3}[1-9]{1}$/) !== null;
};

const percentChange = (initial: number, final: number) => {
  const difference = final - initial;
  const value = difference / Math.abs(initial);
  return value * 100;
};

const dateToSQLiteDateString = (date: Date) => {
  // const year = date.getFullYear()
  // const month = String(date.getMonth()).padStart(4, '0')
  // const day =

  // const dateString = `YYYY-MM-DD HH:MM:SS.SSS`
  const dateString = format(date, "yyyy-MM-dd HH:mm:ss.SSS");
  return dateString;
};

export type { CSVDecodedRow };
export {
  csv2json,
  json2csv,
  isDpoLinkValid,
  isStationCodeValid,
  isNumeric,
  percentChange,
  dateToSQLiteDateString,
};
