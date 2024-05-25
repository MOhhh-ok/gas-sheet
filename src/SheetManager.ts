type SheetManagerData<T> = T & {
    __rowNum: number;
    __rowIdx: number;
};

class SheetManager<T> {
    private sheet: GoogleAppsScript.Spreadsheet.Sheet;
    private cache:
        | { header: (keyof T)[]; data: SheetManagerData<T>[] }
        | undefined;
    private customHeader: (keyof T)[] | undefined;
    private headerRowNum: number;

    constructor(
        sheet: GoogleAppsScript.Spreadsheet.Sheet | string,
        ops?: {
            header?: (keyof T)[];
            headerRowNum?: number;
        }
    ) {
        if (typeof sheet === 'string') {
            const s =
                SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
            if (!s) {
                throw new Error('Sheet not found');
            }
            this.sheet = s;
        } else {
            this.sheet = sheet;
        }
        this.headerRowNum = ops?.headerRowNum || 1;
        this.customHeader = ops?.header;
    }

    find(args: {
        where: (row: SheetManagerData<T>) => boolean;
    }): SheetManagerData<T> | undefined {
        const { data } = this.getData();
        return data.find(args?.where || (() => true));
    }

    findMany(args: {
        where: (row: SheetManagerData<T>) => boolean;
    }): SheetManagerData<T>[] {
        const { data } = this.getData();
        return data.filter(args?.where || (() => true));
    }

    findAll(): SheetManagerData<T>[] {
        return this.getData().data;
    }

    clearCache(): void {
        this.cache = undefined;
    }

    clearData() {
        const range = this.sheet.getRange(
            this.headerRowNum + 1,
            1,
            this.sheet.getLastRow() - this.headerRowNum,
            this.sheet.getLastColumn()
        );
        range.clear();
        this.clearCache();
    }

    create(data: T): void {
        const { header } = this.getData();
        const row = header.map((key) => data[key]);
        this.sheet.appendRow(row);
        this.clearCache();
    }

    update(args: {
        where: (row: SheetManagerData<T>) => boolean;
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
        try {
            for (const [key, value] of Object.entries(set)) {
                const colIdx = header.indexOf(key as keyof T);
                if (colIdx === -1) {
                    throw new Error(`Column ${key} not found`);
                }
                this.sheet.getRange(rowNum, colIdx + 1).setValue(value);
            }
        } catch (e: any) {
            throw new Error(e);
        } finally {
            this.clearCache();
        }
    }

    private getData(): { header: (keyof T)[]; data: SheetManagerData<T>[] } {
        if (this.cache) {
            return this.cache;
        }
        let [header, ...body] = this.sheet
            .getDataRange()
            .getValues()
            .slice(this.headerRowNum - 1);
        header = this.customHeader || header;
        const result: SheetManagerData<T>[] = [];
        body.forEach((row, rowIdx) => {
            const obj = {} as (typeof result)[number];
            row.forEach((value, colIdx) => {
                obj[header[colIdx] as keyof T] = value;
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
