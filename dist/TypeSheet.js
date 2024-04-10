"use strict";
class TypeSheet {
    constructor(sheet, header) {
        if (!sheet) {
            throw new Error('Sheet not found');
        }
        this.sheet = sheet;
        this.customHeader = header;
    }
    create(data) {
        const { header } = this.getData();
        const row = header.map((key) => data[key]);
        this.sheet.appendRow(row);
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
    update(args) {
        const { header, data } = this.getData();
        const rowNums = data.filter(args.where).map((row) => row.__rowNum);
        for (const rowNum of rowNums) {
            this.updateRow(header, rowNum, args.set);
        }
        return rowNums.length;
    }
    updateRow(header, rowNum, set) {
        for (const [key, value] of Object.entries(set)) {
            const colIdx = header.indexOf(key);
            if (colIdx === -1) {
                throw new Error(`Column ${key} not found`);
            }
            this.sheet.getRange(rowNum, colIdx + 1).setValue(value);
        }
    }
    getData() {
        let [header, ...body] = this.sheet.getDataRange().getValues();
        header = this.customHeader || header;
        const result = [];
        body.forEach((row, rowIdx) => {
            const obj = {};
            row.forEach((value, colIdx) => {
                obj[header[colIdx]] = value;
            });
            obj.__rowIdx = rowIdx + 1;
            obj.__rowNum = rowIdx + 2;
            result.push(obj);
        });
        return { header, data: result };
    }
}
