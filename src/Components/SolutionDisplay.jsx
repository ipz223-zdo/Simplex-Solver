import React from 'react';
import Fraction from 'fraction.js';

export function SolutionDisplay({ steps, variables, maximize }) {
    if (!steps.length) return null;

    const lastStep = steps[steps.length - 1];
    const { matrix, basis } = lastStep;
    const rhsColIndex = matrix[0].length - 1;

    let optimalF = lastStep.objectiveRow[rhsColIndex];

    if (!maximize) {
        optimalF = optimalF.neg();
    }

    const xVars = (variables ?? [])
        .map(v => v.name)
        .filter(name => /^x\d+$/.test(name));

    const xValues = {};
    xVars.forEach(v => xValues[v] = new Fraction(0));

    for (let i = 0; i < basis.length; i++) {
        const varName = basis[i];
        const rhsVal = matrix[i][rhsColIndex];
        if (xValues.hasOwnProperty(varName)) {
            xValues[varName] = rhsVal.clone();
        }
    }

    const fractionsToStr = (frac) => frac.toFraction(true);

    return (
        <div className="mt-4">
            <h4>Відповідь</h4>
            <p>
                {maximize
                    ? `F(${xVars.join(', ')}) = ${fractionsToStr(optimalF)}. `
                    : `F(${xVars.join(', ')}) = -F'(${xVars.join(', ')}) = ${fractionsToStr(optimalF)}. `
                }
                {xVars.length > 0 && ' '}
                {xVars.map(v => `${v} = ${fractionsToStr(xValues[v])}`).join(', ')}
            </p>
        </div>
    );
}
