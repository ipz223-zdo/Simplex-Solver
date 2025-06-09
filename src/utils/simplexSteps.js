import Fraction from 'fraction.js';

// функція для пошуку індексу змінної за ім'ям
function findVariableIndex(variables, name) {
    return variables.findIndex(v => v.name === name);
}

function calculateObjectiveRow(matrix, basis, variables, initialC) {
    const numCols = matrix[0].length;

    // cRow: коефіцієнти для базисних змінних
    const cRow = basis.map(baseVarName => {
        const idx = variables.findIndex(v => v.name === baseVarName);
        if (idx === -1 || !initialC[idx]) {
            return new Fraction(0);
        }
        const val = initialC[idx];
        return val ? val.clone() : new Fraction(0);
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

export function getSimplexSteps(initialMatrix, objectiveRow, basis, variablesInput, originalObjective) {
    const steps = [];
    let matrix = initialMatrix.map(row => row.map(val => new Fraction(val)));
    let currentBasis = [...basis];
    let variables = variablesInput.map(v => ({ ...v }));

    const artificialIndexes = variables
        .map((v, i) => v.type === 'artificial' ? i : -1)
        .filter(i => i !== -1);

    const inPhaseOne = artificialIndexes.length > 0;
    let phase = inPhaseOne ? 1 : 2;

    const totalVars = variables.length;

    // === Фаза 1: W = сума штучних змінних ===
    const M = new Fraction(1000000);
    let coeffRow = Array(totalVars).fill(new Fraction(0));
    if (phase === 1) {
        for (const idx of artificialIndexes) {
            coeffRow[idx] = M.neg();
        }
    } else {
        coeffRow = [...originalObjective];
    }

    let { F: z, cRow } = calculateObjectiveRow(matrix, currentBasis, variables, coeffRow);

    while (true) {
        steps.push({
            phase,
            matrix: matrix.map(row => [...row]),
            objectiveRow: [...z],
            basis: [...currentBasis],
            variables: variables.map(v => ({ ...v })),
            cRow: [...coeffRow]
        });

        const minVal = Math.min(...z.slice(0, z.length - 1).map(val => val.valueOf()));
        if (minVal >= 0) {
            if (phase === 1) {
                const hasArtificialInBasis = currentBasis.some(
                    name => {
                        const v = variables.find(v => v.name === name);
                        return v?.type === 'artificial';
                    }
                );

                if (hasArtificialInBasis) {
                    break; // Несумісна модель
                }


                // Переходимо до фази 2
                phase = 2;

                // Видаляємо штучні змінні
                const phase2Variables = variables.filter(v => v.type !== 'artificial');
                const keptIndexes = phase2Variables.map(v => findVariableIndex(variables, v.name));

                matrix = matrix.map(row => keptIndexes.map(i => row[i]).concat([row[row.length - 1]]));
                coeffRow = [...originalObjective];
                currentBasis = currentBasis.filter(name => phase2Variables.some(v => v.name === name));
                variables = phase2Variables.map(v => ({ ...v }));

                ({ F: z, cRow } = calculateObjectiveRow(matrix, currentBasis, variables, coeffRow));
                continue;
            } else {
                break; // Завершення фази 2
            }
        }

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


        if (pivotRow === -1) {
            break;
        }

        const pivotValue = matrix[pivotRow][pivotCol];
        matrix[pivotRow] = matrix[pivotRow].map(val => val.div(pivotValue));


        for (let i = 0; i < matrix.length; i++) {
            if (i === pivotRow) continue;
            const multiplier = matrix[i][pivotCol];
            matrix[i] = matrix[i].map((val, j) => {
                return val.sub(matrix[pivotRow][j].mul(multiplier));
            });
        }

        currentBasis[pivotRow] = variables[pivotCol].name;

        ({ F: z, cRow } = calculateObjectiveRow(matrix, currentBasis, variables, coeffRow));
    }

    return steps;
}
