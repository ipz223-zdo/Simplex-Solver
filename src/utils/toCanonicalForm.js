import Fraction from 'fraction.js';

export function toCanonicalForm({ objective, constraints, maximize }) {
    const numVariables = objective.length;
    const matrix = [];
    const basis = [];
    const variables = [];

    const originalObjective = objective.map(val =>
        maximize ? new Fraction(val) : new Fraction(val).neg()
    );

    // Додаємо основні змінні x1, x2, ...
    for (let i = 0; i < numVariables; i++) {
        variables.push({
            name: `x${i + 1}`,
            type: 'normal',
            active: true,
        });
    }

    // Перший прохід: порахувати скільки додаткових змінних буде всього
    let totalSlack = 0;
    let totalSurplus = 0;
    let totalArtificial = 0;

    for (const c of constraints) {
        if (c.sign === '<=') totalSlack++;
        else if (c.sign === '>=') {
            totalSurplus++;
            totalArtificial++;
        } else if (c.sign === '=') {
            totalArtificial++;
        }
    }

    // Запам'ятаємо позиції додаткових змінних для кожного обмеження
    // Щоб ставити 1 або -1 у потрібних індексах
    let slackIndex = 0;
    let surplusIndex = 0;
    let artificialIndex = 0;

    // Загальна довжина рядка (без RHS)
    const totalVars = numVariables + totalSlack + totalSurplus + totalArtificial;

    for (let i = 0; i < constraints.length; i++) {
        const { coefficients, sign, rhs } = constraints[i];
        // Ініціалізуємо рядок нулями потрібної довжини + RHS
        const row = Array(totalVars + 1).fill(null).map(() => new Fraction(0));

        // Основні змінні
        for (let j = 0; j < numVariables; j++) {
            row[j] = new Fraction(coefficients[j]);
        }

        if (sign === '<=') {
            // slack змінна: +1
            const idx = numVariables + slackIndex;
            row[idx] = new Fraction(1);
            variables.push({
                name: `s${slackIndex + 1}`,
                type: 'slack',
                active: true,
            });
            basis.push(`s${slackIndex + 1}`);
            slackIndex++;
        } else if (sign === '>=') {
            // surplus змінна: -1
            const surplusIdx = numVariables + totalSlack + surplusIndex;
            row[surplusIdx] = new Fraction(1);
            variables.push({
                name: `s${totalSlack + surplusIndex + 1}`,
                type: 'surplus',
                active: true,
            });
            surplusIndex++;

            // artificial змінна: +1
            const artificialIdx = numVariables + totalSlack + totalSurplus + artificialIndex;
            row[artificialIdx] = new Fraction(-1);
            variables.push({
                name: `a${artificialIndex + 1}`,
                type: 'artificial',
                active: true,
            });
            basis.push(`a${artificialIndex + 1}`);
            artificialIndex++;
        } else if (sign === '=') {
            // artificial змінна: +1
            const artificialIdx = numVariables + totalSlack + totalSurplus + artificialIndex;
            row[artificialIdx] = new Fraction(1);
            variables.push({
                name: `a${artificialIndex + 1}`,
                type: 'artificial',
                active: true,
            });
            basis.push(`a${artificialIndex + 1}`);
            artificialIndex++;
        }


        // RHS
        row[totalVars] = new Fraction(rhs);

        matrix.push(row);
    }

    const M = new Fraction(1000000); // велике число M

    const objectiveRow = [];

// 1) Коефіцієнти основних змінних (x1, x2, ...)
    for (let i = 0; i < numVariables; i++) {
        objectiveRow.push(maximize ? originalObjective[i].clone() : originalObjective[i].neg());
    }

// 2) Для всіх додаткових змінних в variables (slack, surplus, artificial)
    for (let i = numVariables; i < variables.length; i++) {
        const v = variables[i];
        if (v.type === 'artificial') {
            // Для штучних змінних big-M коефіцієнт:
            objectiveRow.push(maximize ? M.neg() : M.clone());
        } else {
            // Для slack і surplus — 0
            objectiveRow.push(new Fraction(0));
        }
    }

// 3) Додаємо RHS = 0
    objectiveRow.push(new Fraction(0));


    return {
        matrix,
        objectiveRow,
        originalObjective,
        basis,
        variables,
        maximize,
    };
}
