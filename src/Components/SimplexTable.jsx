import React from 'react';

function SimplexTable({ stepData, variableTypes }) {
    const { matrix, basis, objectiveRow, initialC } = stepData;

    return (
        <div className="table-responsive">
            <table className="table table-bordered text-center">
                <thead>
                <tr className="table-secondary">
                    <th rowSpan="2">Базис</th>
                    <th rowSpan="2">C</th>
                    {variableTypes.map((_, i) => (
                        <th key={i} className="table-light">
                            {initialC[i]?.toFraction?.() || '0'}
                        </th>
                    ))}
                    <th rowSpan="2">B</th>
                </tr>
                <tr className="table-secondary">
                    {variableTypes.map((v, i) => (
                        <th key={i}>{v}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {matrix.map((row, i) => {
                    const baseVar = basis[i];
                    const varIndex = variableTypes.indexOf(baseVar);
                    const baseC = varIndex !== -1 ? initialC[varIndex]?.toFraction?.() : '0';

                    return (
                        <tr key={i}>
                            <td>{baseVar}</td>
                            <td>{baseC}</td>
                            {row.slice(0, -1).map((cell, j) => (
                                <td key={j}>{cell.toFraction()}</td>
                            ))}
                            <td>{row[row.length - 1].toFraction()}</td>
                        </tr>
                    );
                })}
                <tr className="table-secondary">
                    <td>F</td>
                    <td></td>
                    {objectiveRow.slice(0, -1).map((cell, j) => (
                        <td key={j}>{cell.toFraction()}</td>
                    ))}
                    <td>{objectiveRow[objectiveRow.length - 1].toFraction()}</td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}

export default SimplexTable;
