import Fraction from 'fraction.js';

export function toCanonicalForm({ objective, constraints, maximize }) {
    const numVariables = objective.length;
    const numConstraints = constraints.length;

    const matrix = [];
    const basis = [];

    for (let i = 0; i < numConstraints; i++) {
        const constraint = constraints[i];
        const row = [];

        for (let j = 0; j < numVariables; j++) {
            row.push(new Fraction(constraint.coefficients[j]));
        }

        for (let j = 0; j < numConstraints; j++) {
            row.push(new Fraction(i === j ? 1 : 0));
        }

        row.push(new Fraction(constraint.rhs));
        basis.push(`s${i + 1}`);
        matrix.push(row);
    }

    const objectiveRow = [];

    for (let i = 0; i < numVariables; i++) {
        const coeff = new Fraction(objective[i]);
        objectiveRow.push(maximize ? coeff : coeff.neg());
    }

    for (let i = 0; i < numConstraints; i++) {
        objectiveRow.push(new Fraction(0));
    }

    objectiveRow.push(new Fraction(0));

    const variableTypes = [
        ...Array.from({ length: numVariables }, (_, i) => `x${i + 1}`),
        ...Array.from({ length: numConstraints }, (_, i) => `s${i + 1}`)
    ];

    return {
        matrix,
        objectiveRow,
        basis,
        variableTypes,
        maximize
    };
}
