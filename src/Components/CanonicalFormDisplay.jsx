import React from 'react';

export function CanonicalFormDisplay({ matrix, objectiveRow, variables, maximize, constraintSigns = [] }) {
    // Функція для коректного виводу дробу зі знаком
    const fracToStr = (frac) => {
        if (frac.n === 0) return '0';
        if (frac.s < 0) return `- ${frac.neg().toFraction(true)}`;
        return frac.toFraction(true);
    };

    // Будуємо вираз: всі змінні з коефіцієнтами
    const buildExpressionWithZeros = (coeffs, vars) =>
        coeffs
            .map((c, i) => {
                const sign = c.s < 0 ? '-' : '+';
                const abs = c.abs().toFraction(true);
                const varName = vars[i].name;
                // Якщо abs === 1, виводимо просто змінну (або 0 якщо c == 0)
                if (c.valueOf() === 0) {
                    return `+ 0${varName}`;
                }
                return `${sign} ${abs === '1' ? '' : abs}${varName}`;
            })
            .join(' ')
            .replace(/^\+ /, ''); // прибираємо початковий '+ '

    // Побудова виразу для обмежень (прибираємо нулі)
    const buildExpression = (coeffs, vars) =>
        coeffs
            .map((c, i) => {
                if (c.valueOf() === 0) return null;
                const sign = c.s < 0 ? '-' : '+';
                const abs = c.abs().toFraction(true);
                const varName = vars[i].name;
                return `${sign} ${abs === '1' ? '' : abs}${varName}`;
            })
            .filter(Boolean)
            .join(' ')
            .replace(/^\+ /, '');

    // Всі змінні для списку в F(...)
    const allVarNames = variables.map(v => v.name);

    // Вираз цільової функції із нулями
    const canonicalExpr = buildExpressionWithZeros(objectiveRow.slice(0, variables.length), variables);

    return (
        <div className="mb-4">
            <h4>Канонічна форма задачі</h4>
            <p>
                {maximize
                    ? `F(${allVarNames.join(', ')}) = ${canonicalExpr} → max`
                    : `F'(${allVarNames.join(', ')}) = ${canonicalExpr} → max`}
            </p>
            {matrix.map((row, idx) => {
                const lhs = buildExpression(row.slice(0, variables.length), variables);
                const rhs = row[row.length - 1].toFraction(true);
                const sign = constraintSigns[idx] || '=';
                return (
                    <p key={idx}>
                        {lhs} {sign} {rhs}
                    </p>
                );
            })}
        </div>
    );
}
