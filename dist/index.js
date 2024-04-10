"use strict";
// type Model = {
//     id: number;
//     name: string;
//     age: number;
// };
// function main() {
//     const sheet = new TypeSheet<Model>(
//         SpreadsheetApp.getActive().getSheetByName('test')
//     );
//     sheet.create({ id: 1, name: 'Alice', age: 20 });
//     const firstRow = sheet.find({ where: (row) => row.id === 1 });
//     const allRows = sheet.findAll();
//     const rows = sheet.findMany({ where: (row) => row.age > 18 });
//     const updatedRows = sheet.update({
//         where: (row) => row.age > 18,
//         set: { age: 21 },
//     });
// }
