import Fraction from 'fraction.js';

function calculateObjectiveRow(matrix, basis, variableTypes, initialC) {
    const numCols = matrix[0].length;

    const cRow = basis.map(baseVar => {
        const idx = variableTypes.indexOf(baseVar);
        return idx !== -1 ? initialC[idx].clone() : new Fraction(0);
    });

    const zj = [];

    for (let col = 0; col < numCols; col++) {
        let sum = new Fraction(0);
        for (let row = 0; row < matrix.length; row++) {
            sum = sum.add(cRow[row].mul(matrix[row][col]));
        }
        zj.push(sum);
    }

    const F = [];
    for (let j = 0; j < zj.length; j++) {
        const cj = (j < initialC.length && j !== numCols - 1) ? initialC[j] : new Fraction(0);
        F.push(zj[j].sub(cj));
    }

    return { F, cRow };
}

export function getSimplexSteps(initialMatrix, objectiveRow, basis, variableTypes, initialC, maximize = true) {
    const steps = [];
    let matrix = initialMatrix.map(row => row.map(val => new Fraction(val)));
    initialC = objectiveRow.map(val => new Fraction(val)); // original C
    let currentBasis = [...basis];

    let { F: z, cRow } = calculateObjectiveRow(matrix, currentBasis, variableTypes, initialC);

    while (true) {
        steps.push({
            matrix: matrix.map(row => [...row]),
            objectiveRow: [...z],
            basis: [...currentBasis],
            variableTypes,
            cRow: Array.from({ length: z.length }, (_, j) =>
                j < initialC.length ? initialC[j] : new Fraction(0)
            ),
            initialC: [...initialC],
        });

        const minVal = Math.min(...z.slice(0, z.length - 1).map(val => val.valueOf()));
        if (minVal >= 0) break; // Оптимум знайдено

        const pivotCol = z.findIndex(val => val.valueOf() === minVal);

        let pivotRow = -1;
        let minRatio = Infinity;

        for (let i = 0; i < matrix.length; i++) {
            const val = matrix[i][pivotCol];
            const rhs = matrix[i][matrix[i].length - 1];
            if (val.valueOf() > 0) {
                const ratio = rhs.div(val).valueOf();
                if (ratio < minRatio) {
                    minRatio = ratio;
                    pivotRow = i;
                }
            }
        }

        if (pivotRow === -1) break;

        const pivotValue = matrix[pivotRow][pivotCol];

        matrix[pivotRow] = matrix[pivotRow].map(val => val.div(pivotValue));

        for (let i = 0; i < matrix.length; i++) {
            if (i === pivotRow) continue;
            const multiplier = matrix[i][pivotCol];
            matrix[i] = matrix[i].map((val, j) => val.sub(matrix[pivotRow][j].mul(multiplier)));
        }

        currentBasis[pivotRow] = variableTypes[pivotCol];

        ({ F: z, cRow } = calculateObjectiveRow(matrix, currentBasis, variableTypes, initialC));
    }

    return steps;
}
