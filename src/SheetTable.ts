export type Id = string | number;
export type Cell = string | number | GoogleAppsScript.Base.Date;

export interface WithId {
  id: Id;
}

export class SheetTable<T extends WithId> {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet;
  private firstRow: number;
  private dataMap: Map<Id, T>;
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

  upsert(data: Partial<T> & { id: Id }) {
    const key = data.id;
    const existing = this.dataMap.get(key);
    if (existing) {
      this.dataMap.set(key, { ...existing, ...data });
    } else {
      this.dataMap.set(key, data as T);
    }
  }

  delete(id: Id) {
    this.dataMap.delete(id);
  }

  find(id: Id) {
    return this.dataMap.get(id);
  }

  findAll() {
    return Array.from(this.dataMap.values());
  }

  sort(sortFn: (a: T, b: T) => number) {
    const data = Array.from(this.dataMap.values());
    data.sort(sortFn);
    this.dataMap = this.map(data);
  }

  save() {
    const data = Array.from(this.dataMap.values());
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
    const data = this.sheet
      .getDataRange()
      .getValues()
      .slice(this.firstRow - 1)
      .map(this.rowToData)
      .filter(Boolean);
    return data;
  }

  private map(data: T[]) {
    const result = new Map<Id, T>();
    for (const d of data) {
      result.set(d.id, d);
    }
    return result;
  }
}
