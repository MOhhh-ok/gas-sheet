export type Id = string | number;
export type Cell = string | number | GoogleAppsScript.Base.Date;

export interface WithId {
  id: Id;
}

export class SheetTable<T extends WithId> {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet;
  private firstRow: number;
  private dataMap: Record<Id, T>;
  private dataToRow: (data: T) => Cell[];
  private rowToData: (row: Cell[]) => T;

  constructor(params: {
    sheet: GoogleAppsScript.Spreadsheet.Sheet | string;
    dataToRow: (data: T) => Cell[];
    rowToData: (row: Cell[]) => T;
    firstRow?: number;
  }) {
    const { sheet, dataToRow, rowToData, firstRow } = params;
    this.firstRow = firstRow || 1;
    this.dataToRow = dataToRow;
    this.rowToData = rowToData;
    this.sheet = this.getSheet(sheet);
    const data = this.getData();
    this.dataMap = this.map(data);
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

  findAll() {
    return Object.values(this.dataMap);
  }

  sort(sortFn: (data: T) => any) {
    const data = Object.values(this.dataMap);
    data.sort(sortFn);
    this.dataMap = this.map(data);
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

  private map(data: T[]) {
    const result: Record<Id, T> = {};
    for (const d of data) {
      result[d.id] = d;
    }
    return result;
  }
}
