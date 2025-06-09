import React from 'react';

const M = 1000000; // Велике число M

function formatCell(val) {
    if (val === null || val === undefined) return '0';

    let num = typeof val.valueOf === 'function' ? val.valueOf() : val;
    if (num === 0) return '0';

    const epsilon = 1e-10;
    const ratio = num / M;

    if (Math.abs(ratio - Math.round(ratio)) < epsilon) {
        const coeff = Math.round(ratio);
        if (coeff === 1) return 'M';
        if (coeff === -1) return '-M';
        return `${coeff}M`;
    }

    if (Math.abs(ratio) > 1) {
        return ratio.toFixed(2) + 'M';
    }

    if (typeof val.toFraction === 'function') {
        return val.toFraction(true);
    }

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
            if (!positiveFound) return true;
        }
    }
    return false;
}

function findPivot(matrix, objectiveRow) {
    const numCols = objectiveRow.length - 1;
    let pivotCol = -1;
    let min = 0;

    // Знаходимо стовпець з найменшим від’ємним значенням у F
    for (let j = 0; j < numCols; j++) {
        const val = objectiveRow[j].valueOf();
        if (val < min) {
            min = val;
            pivotCol = j;
        }
    }

    if (pivotCol === -1) return { row: -1, col: -1 };

    let minRatio = Infinity;
    let pivotRow = -1;

    for (let i = 0; i < matrix.length; i++) {
        const coeff = matrix[i][pivotCol].valueOf();
        const b = matrix[i][matrix[i].length - 1].valueOf();

        if (coeff > 0) {
            const ratio = b / coeff;
            if (ratio < minRatio) {
                minRatio = ratio;
                pivotRow = i;
            }
        }
    }

    return { row: pivotRow, col: pivotCol };
}

function SimplexTable({ stepData, variables, isLastStep = false}) {
    if (!stepData) return <div>Дані відсутні</div>;
    if (!variables) return <div>Змінні відсутні</div>;

    const { matrix, basis, objectiveRow, cRow: initialC } = stepData;
    if (!matrix || !basis || !objectiveRow) return <div>Некоректні дані кроку</div>;

    const noSolution = hasNoSolution(matrix, objectiveRow);
    const hasArtificialVariable = basis.some(name => name.startsWith('a'));
    const pivot = findPivot(matrix, objectiveRow);
    return (
        <div>
            {noSolution && (
                <div className="alert alert-danger mb-3">
                    Розв’язок необмежений (немає доданих елементів у напрямному стовпці). <br/> Цільова функція необмежена на множині допустимих рішень (прямує до +/-∞)».
                </div>
            )}
            {isLastStep && hasArtificialVariable && (
                <div className="alert alert-warning mb-3">
                    У базисі присутня штучна змінна — задача не має допустимого розв’язку.
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
                                {row.slice(0, -1).map((cell, j) => {
                                    const isPivot = i === pivot.row && j === pivot.col;
                                    return (
                                        <td key={j} className={isPivot ? 'bg-success text-light' : ''}>
                                            {formatCell(cell)}
                                        </td>
                                    );
                                })}
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
