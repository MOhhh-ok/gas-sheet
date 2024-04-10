# TypeSheet

This is a script like ORM (but single table) in GAS (Google Apps Script) with typescript.

``` typescript
type Model = {
    id: number;
    name: string;
    age: number;
};

function main() {
    const sheet = new TypeSheet<Model>(
        SpreadsheetApp.getActive().getSheetByName('test')
    );

    // Create one
    sheet.create({ id: 1, name: 'Alice', age: 20 });

    // Find one
    const firstRow = sheet.find({ where: (row) => row.id === 1 });

    // Find many
    const rows = sheet.findMany({ where: (row) => row.age > 18 });

    // Find all
    const allRows = sheet.findAll();

    // Update
    const updatedRows = sheet.update({
        where: (row) => row.age > 18,
        set: { age: 21 },
    });
}
```
