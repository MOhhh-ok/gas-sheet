type TypeSheetData<T> = T & {
    __rowNum: number;
    __rowIdx: number;
};

class TypeSheet<T> {
    private sheet: GoogleAppsScript.Spreadsheet.Sheet;
    private customHeader: (keyof T)[] | undefined;

    constructor(
        sheet: GoogleAppsScript.Spreadsheet.Sheet | null,
        header?: (keyof T)[]
    ) {
        if (!sheet) {
            throw new Error('Sheet not found');
        }
        this.sheet = sheet;
        this.customHeader = header;
    }

    create(data: T): void {
        const { header } = this.getData();
        const row = header.map((key) => data[key]);
        this.sheet.appendRow(row);
    }

    find(args: {
        where: (row: TypeSheetData<T>) => boolean;
    }): TypeSheetData<T> | undefined {
        const { data } = this.getData();
        return data.find(args?.where || (() => true));
    }

    findMany(args: {
        where: (row: TypeSheetData<T>) => boolean;
    }): TypeSheetData<T>[] {
        const { data } = this.getData();
        return data.filter(args?.where || (() => true));
    }

    findAll(): TypeSheetData<T>[] {
        return this.getData().data;
    }

    update(args: {
        where: (row: TypeSheetData<T>) => boolean;
        set: Partial<T>;
    }): number {
        const { header, data } = this.getData();
        const rowNums = data.filter(args.where).map((row) => row.__rowNum);

        for (const rowNum of rowNums) {
            this.updateRow(header, rowNum, args.set);
        }
        return rowNums.length;
    }

    private updateRow(header: (keyof T)[], rowNum: number, set: Partial<T>) {
        for (const [key, value] of Object.entries(set)) {
            const colIdx = header.indexOf(key as keyof T);
            if (colIdx === -1) {
                throw new Error(`Column ${key} not found`);
            }
            this.sheet.getRange(rowNum, colIdx + 1).setValue(value);
        }
    }

    private getData(): { header: (keyof T)[]; data: TypeSheetData<T>[] } {
        let [header, ...body] = this.sheet.getDataRange().getValues();
        header = this.customHeader || header;
        const result: TypeSheetData<T>[] = [];
        body.forEach((row, rowIdx) => {
            const obj = {} as (typeof result)[number];
            row.forEach((value, colIdx) => {
                obj[header[colIdx] as keyof T] = value;
            });
            obj.__rowIdx = rowIdx + 1;
            obj.__rowNum = rowIdx + 2;
            result.push(obj);
        });
        return { header, data: result };
    }
}
