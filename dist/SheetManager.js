"use strict";
class SheetManager {
    constructor(sheet, ops) {
        if (typeof sheet === 'string') {
            const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
            if (!s) {
                throw new Error('Sheet not found');
            }
            this.sheet = s;
        }
        else {
            this.sheet = sheet;
        }
        this.headerRowNum = (ops === null || ops === void 0 ? void 0 : ops.headerRowNum) || 1;
        this.customHeader = ops === null || ops === void 0 ? void 0 : ops.header;
    }
    find(args) {
        const { data } = this.getData();
        return data.find((args === null || args === void 0 ? void 0 : args.where) || (() => true));
    }
    findMany(args) {
        const { data } = this.getData();
        return data.filter((args === null || args === void 0 ? void 0 : args.where) || (() => true));
    }
    findAll() {
        return this.getData().data;
    }
    clearCache() {
        this.cache = undefined;
    }
    clearData() {
        const range = this.sheet.getRange(this.headerRowNum + 1, 1, this.sheet.getLastRow() - this.headerRowNum, this.sheet.getLastColumn());
        range.clear();
        this.clearCache();
    }
    create(data) {
        const { header } = this.getData();
        const row = header.map((key) => data[key]);
        this.sheet.appendRow(row);
        this.clearCache();
    }
    update(args) {
        const { header, data } = this.getData();
        const rowNums = data.filter(args.where).map((row) => row.__rowNum);
        for (const rowNum of rowNums) {
            this.updateRow(header, rowNum, args.set);
        }
        return rowNums.length;
    }
    updateRow(header, rowNum, set) {
        try {
            for (const [key, value] of Object.entries(set)) {
                const colIdx = header.indexOf(key);
                if (colIdx === -1) {
                    throw new Error(`Column ${key} not found`);
                }
                this.sheet.getRange(rowNum, colIdx + 1).setValue(value);
            }
        }
        catch (e) {
            throw new Error(e);
        }
        finally {
            this.clearCache();
        }
    }
    getData() {
        if (this.cache) {
            return this.cache;
        }
        let [header, ...body] = this.sheet
            .getDataRange()
            .getValues()
            .slice(this.headerRowNum - 1);
        header = this.customHeader || header;
        const result = [];
        body.forEach((row, rowIdx) => {
            const obj = {};
            row.forEach((value, colIdx) => {
                obj[header[colIdx]] = value;
            });
            obj.__rowIdx = rowIdx + this.headerRowNum;
            obj.__rowNum = rowIdx + this.headerRowNum + 1;
            result.push(obj);
        });
        this.cache = { header, data: result };
        return this.cache;
    }
}
function sheetManagerTest() {
    const s = new SheetManager('test', { headerRowNum: 2 });
    console.log(s.findAll());
    s.update({
        where: (row) => row.__rowNum == 4,
        set: { head1: 'new value' },
    });
}
