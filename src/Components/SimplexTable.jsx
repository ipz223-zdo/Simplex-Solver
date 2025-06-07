import React from 'react';

const M = 1000000; // Велике число M

function formatCell(val) {
    if (val === null || val === undefined) return '0';

    // Отримаємо числове значення val
    let num;
    if (typeof val.valueOf === 'function') {
        num = val.valueOf();
    } else {
        num = val;
    }

    // Якщо num дорівнює 0
    if (num === 0) return '0';

    // Перевірка на кратність M (приблизно)
    // Тут допустимо невелике похиблення через дійсні числа
    const epsilon = 1e-10;
    const ratio = num / M;

    if (Math.abs(ratio - Math.round(ratio)) < epsilon) {
        // Кратне M з цілим коефіцієнтом
        const coeff = Math.round(ratio);
        if (coeff === 1) return 'M';
        if (coeff === -1) return '-M';
        return `${coeff}M`;
    }

    // Якщо коефіцієнт не цілий, але близький, показати з дробом (2.5M)
    if (Math.abs(ratio) > 1) {
        return ratio.toFixed(2) + 'M';
    }

    // Якщо val — об'єкт з методом toFraction, виводимо його
    if (typeof val.toFraction === 'function') {
        return val.toFraction(true);
    }

    // Інакше просто рядок числа
    return num.toString();
}

function hasNoSolution(matrix, objectiveRow) {
    for (let col = 0; col < objectiveRow.length - 1; col++) {
        if (objectiveRow[col].valueOf() < 0) {
            let positiveFound = false;
            for (let row = 0; row < matrix.length; row++) {
                if (matrix[row][col].valueOf() > 0) {
                    positiveFound = true;
                    break;
                }
            }
            if (!positiveFound) {
                return true;
            }
        }
    }
    return false;
}

function SimplexTable({ stepData, variables }) {
    if (!stepData) {
        return <div>Дані відсутні</div>;
    }
    if (!variables) {
        return <div>Змінні відсутні</div>;
    }

    const { matrix, basis, objectiveRow, cRow: initialC } = stepData;

    if (!matrix || !basis || !objectiveRow) {
        return <div>Некоректні дані кроку</div>;
    }

    const noSolution = hasNoSolution(matrix, objectiveRow);

    return (
        <div>
            {noSolution && (
                <div className="alert alert-danger mb-3">
                    Розв’язок відсутній
                </div>
            )}
            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                    <tr className="table-secondary">
                        <th rowSpan="2">Базис</th>
                        <th rowSpan="2">C</th>
                        {variables.map((v, i) => (
                            <th key={i} className="table-light">
                                {formatCell(initialC && initialC[i])}
                            </th>
                        ))}
                        <th rowSpan="2">B</th>
                    </tr>
                    <tr className="table-secondary">
                        {variables.map((v, i) => (
                            <th key={i}>{v.name}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {matrix.map((row, i) => {
                        const baseVar = basis[i];
                        const varIndex = variables.findIndex(v => v.name === baseVar);
                        const baseC =
                            varIndex !== -1 && initialC && initialC[varIndex]
                                ? initialC[varIndex]
                                : 0;

                        return (
                            <tr key={i}>
                                <td>{baseVar}</td>
                                <td>{formatCell(baseC)}</td>
                                {row.slice(0, -1).map((cell, j) => (
                                    <td key={j}>{formatCell(cell)}</td>
                                ))}
                                <td>{formatCell(row[row.length - 1])}</td>
                            </tr>
                        );
                    })}
                    <tr className="table-secondary">
                        <td>F</td>
                        <td></td>
                        {objectiveRow.slice(0, -1).map((cell, j) => (
                            <td key={j}>{formatCell(cell)}</td>
                        ))}
                        <td>{formatCell(objectiveRow[objectiveRow.length - 1])}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SimplexTable;
