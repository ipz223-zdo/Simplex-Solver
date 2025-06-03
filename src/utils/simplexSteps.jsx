import Fraction from 'fraction.js';

function calculateObjectiveRow(matrix, basis, variableTypes, initialC) {
    const numCols = matrix[0].length;

    // Рядок коефіцієнтів C для базисних змінних
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

    // Обчислюємо F_j = Zj - C_j, але не для останнього стовпця (RHS)
    const F = [];
    for (let j = 0; j < zj.length; j++) {
        const cj = (j < initialC.length && j !== numCols - 1) ? initialC[j] : new Fraction(0);
        F.push(zj[j].sub(cj));
    }

    return { F, cRow };
}

export function getSimplexSteps(initialMatrix, objectiveRow, basis, variableTypes) {
    const steps = [];
    let matrix = initialMatrix.map(row => row.map(val => new Fraction(val)));
    const initialC = objectiveRow.map(val => new Fraction(val)); // original C
    let currentBasis = [...basis];

    // Перший розрахунок objectiveRow (F) та cRow
    let { F: z, cRow } = calculateObjectiveRow(matrix, currentBasis, variableTypes, initialC);

    while (true) {
        steps.push({
            matrix: matrix.map(row => [...row]),
            objectiveRow: [...z],
            basis: [...currentBasis],
            variableTypes,
            cRow: [
                ...initialC,
                ...Array(z.length - initialC.length).fill(new Fraction(0))
            ],
            initialC: [...initialC],
        });

        // Вибираємо ведучий стовпець (найменший елемент в objectiveRow, крім RHS)
        const minVal = Math.min(...z.slice(0, z.length - 1).map(val => val.valueOf()));
        if (minVal >= 0) break; // Оптимум знайдено

        const pivotCol = z.findIndex(val => val.valueOf() === minVal);

        // Вибираємо ведучий рядок за правилом мінімального відношення
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

        if (pivotRow === -1) break; // Немає допустимого рішення

        const pivotValue = matrix[pivotRow][pivotCol];

        // Нормалізуємо ведучий рядок
        matrix[pivotRow] = matrix[pivotRow].map(val => val.div(pivotValue));

        // Обнуляємо всі інші значення у ведучому стовпці
        for (let i = 0; i < matrix.length; i++) {
            if (i === pivotRow) continue;
            const multiplier = matrix[i][pivotCol];
            matrix[i] = matrix[i].map((val, j) => val.sub(matrix[pivotRow][j].mul(multiplier)));
        }

        // Оновлюємо базис
        currentBasis[pivotRow] = variableTypes[pivotCol];

        // Перераховуємо рядок objectiveRow (F) після оновлення матриці і базису
        ({ F: z, cRow } = calculateObjectiveRow(matrix, currentBasis, variableTypes, initialC));
    }

    return steps;
}
