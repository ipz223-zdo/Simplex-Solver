import React from 'react';

export function CanonicalFormDisplay({ matrix, objectiveRow, variableTypes, maximize }) {
    const fracToStr = (frac) => {
        if (frac.n === 0) return '0';
        if (frac.s < 0) return `- ${frac.neg().toFraction(true)}`;
        return frac.toFraction(true);
    };

    const buildExpression = (coeffs, types) =>
        coeffs
            .map((c, i) => {
                if (c.valueOf() === 0) return null;
                const sign = c.s < 0 ? '-' : '+';
                const abs = c.abs().toFraction(true);
                const varName = types[i];
                return `${sign} ${abs === '1' ? '' : abs}${varName}`;
            })
            .filter(Boolean)
            .join(' ')
            .replace(/^\+ /, '');

    const varList = variableTypes.filter(v => v.startsWith('x')).join(', ');

    const canonicalExpr = buildExpression(objectiveRow.slice(0, variableTypes.length), variableTypes);

    return (
        <div className="mb-4">
            <h4>Канонічна форма задачі</h4>
            <p>
                {maximize
                    ? `F(${varList}) = ${canonicalExpr} → max`
                    : `F'(${varList}) = ${canonicalExpr} → max`}
            </p>
            {matrix.map((row, idx) => {
                const lhs = buildExpression(row.slice(0, variableTypes.length), variableTypes);
                const rhs = row[row.length - 1].toFraction(true);
                return (
                    <p key={idx}>
                        {lhs} = {rhs}
                    </p>
                );
            })}
        </div>
    );
}
