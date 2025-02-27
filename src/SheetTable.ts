import * as R from 'remeda';

type Id = string | number;

interface WithId {
  id: Id;
}

class SheetTable<T extends WithId> {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet;
  private firstRow: number;
  private dataMap: Record<Id, T>;
  private dataToRow: (data: T) => (string | number)[];
  private rowToData: (row: (string | number)[]) => T;

  constructor(
    sheet: GoogleAppsScript.Spreadsheet.Sheet | string,
    dataToRow: (data: T) => (string | number)[],
    rowToData: (row: (string | number)[]) => T,
    firstRow?: number
  ) {
    this.firstRow = firstRow || 1;
    this.dataToRow = dataToRow;
    this.rowToData = rowToData;
    this.sheet = this.getSheet(sheet);
    const data = this.getData();
    this.dataMap = R.indexBy(data, (d) => d.id);
  }

  upsert(data: T) {
    this.dataMap[data.id] = data;
  }

  delete(id: Id) {
    delete this.dataMap[id];
  }

  find(id: Id) {
    return this.dataMap[id];
  }

  sort(sortFn: (data: T) => any) {
    const data = Object.values(this.dataMap);
    data.sort(sortFn);
    this.dataMap = R.indexBy(data, (d) => d.id);
  }

  save() {
    const data = Object.values(this.dataMap);
    const rows = data.map(this.dataToRow);
    this.sheet
      .getRange(this.firstRow, 1, this.sheet.getLastRow(), rows[0].length)
      .clearContent();
    this.sheet
      .getRange(this.firstRow, 1, rows.length, rows[0].length)
      .setValues(rows);
  }

  private getSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet | string) {
    if (typeof sheet === 'string') {
      const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
      if (!s) throw new Error('Sheet not found');
      return s;
    } else {
      return sheet;
    }
  }

  private getData() {
    return this.sheet
      .getDataRange()
      .getValues()
      .slice(this.firstRow - 1)
      .map(this.rowToData);
  }
}
