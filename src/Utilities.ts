import { format } from "date-fns";
import { z } from "zod";

type CSVDecodedRow = {
  [header: string]: string | undefined;
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
      // TODO: Check for duplicate keys
      const dirtyValue = values[i].trim();
      let cleanValue: string;

      if (
        dirtyValue.startsWith('"') &&
        dirtyValue.endsWith('"') &&
        !dirtyValue.includes(" ")
      ) {
        cleanValue = dirtyValue.slice(1).slice(0, -1);
      } else {
        cleanValue = dirtyValue;
      }

      decodedRow[headers[i]] = cleanValue;
    }

    res[index] = decodedRow;
  });

  return res;
};

const json2csv = (
  json: { [key: string]: string | number | undefined }[],
  jsonToCsvHeadersMap: Map<string, string>
) => {
  const csvLines: string[] = [];

  const jsonHeaders = [...jsonToCsvHeadersMap.keys()];
  const csvHeaders = [...jsonToCsvHeadersMap.values()];
  csvLines.push(csvHeaders.join());

  const dataRows = json.map((element) => {
    const rowItems = jsonHeaders.map((header) => {
      let item = element[header];
      if (item === undefined) {
        item = "";
      }
      return item;
    });
    return rowItems.join();
  });

  csvLines.push(...dataRows);

  const rawCSV = csvLines.join("\n");
  return rawCSV;
};

const isNumeric = (str: string, { ignoreCommas = false } = {}) => {
  if (typeof str != "string") return false; // we only process strings!
  let g = "2,012";

  if (ignoreCommas) {
    str = str.replaceAll(",", "");
  }
  return (
    // @ts-expect-error
    // file deepcode ignore UseNumberIsNan: NumberisNan does not have the necessary functionality
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

const coerceToNumber = (val: any) => {
  try {
    val = val.replaceAll(",", "");
  } catch (error) {}
  const numberSchema = z.coerce.number();

  const res = numberSchema.safeParse(val);

  if (res.success) {
    return res.data;
  } else {
    return NaN;
  }
};

const isStationCodeValid = (stationCode: string) => {
  return stationCode.match(/^[A-Z]{3}[1-9]{1}$/) !== null;
};

const percentChange = (initial: number, final: number) => {
  const difference = final - initial;
  const value = difference / Math.abs(initial);
  return Math.abs(value * 100);
};

const dateToSQLiteDateString = (date: Date) => {
  // const year = date.getFullYear()
  // const month = String(date.getMonth()).padStart(4, '0')
  // const day =

  // const dateString = `YYYY-MM-DD HH:MM:SS.SSS`
  const dateString = format(date, "yyyy-MM-dd HH:mm:ss.SSS");
  return dateString;
};

const objectHasData = (obj: {}) => {
  const values = Object.values(obj);
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val !== "" && val !== undefined && val !== null) {
      return true;
    }
  }
  return false;
};

const isSimLinkValid = (simLink: string) => {
  const simLinkRegex = /^https:\/\/sim\.amazon\.com\/issues\/[A-Z]{1}[0-9]+$/g;
  if (simLink.match(simLinkRegex) === null) {
    return false;
  }

  return true;
};

const getTimezoneAdjustedDate = (date: Date) => {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

// Disables autocomplete on MUI Textfield
const noAutocomplete = "new-password";

const countMatchingElements = <T>(elements: T[]) => {
  const occuranceCounter = new Map<T, number>();
  elements.forEach((element) => {
    const temp = occuranceCounter.get(element);
    const count = temp ? temp : 0;
    occuranceCounter.set(element, count + 1);
  });

  return [...occuranceCounter.entries()];
};

export type { CSVDecodedRow };
export {
  csv2json,
  coerceToNumber,
  getTimezoneAdjustedDate,
  json2csv,
  isDpoLinkValid,
  isStationCodeValid,
  isNumeric,
  noAutocomplete,
  percentChange,
  // dateToSQLiteDateString,
  objectHasData,
  isSimLinkValid,
  countMatchingElements,
};
