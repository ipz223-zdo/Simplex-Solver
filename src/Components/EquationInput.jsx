import React, { useState } from 'react';

const EquationInput = ({ numVariables, numConstraints, onSubmit, showPresetButton }) => {
    const [objective, setObjective] = useState(Array(numVariables).fill(''));
    const [maximize, setMaximize] = useState(true); // true = max, false = min

    const [constraints, setConstraints] = useState(
        Array(numConstraints).fill().map(() => ({
            coefficients: Array(numVariables).fill(''),
            sign: '<=',
            rhs: '',
        }))
    );

    const handleObjectiveChange = (index, value) => {
        const updated = [...objective];
        updated[index] = value;
        setObjective(updated);
    };

    const handleConstraintChange = (i, j, value) => {
        const updated = [...constraints];
        updated[i].coefficients[j] = value;
        setConstraints(updated);
    };

    const handleRHSChange = (i, value) => {
        const updated = [...constraints];
        updated[i].rhs = value;
        setConstraints(updated);
    };

    const handleSignChange = (i, value) => {
        const updated = [...constraints];
        updated[i].sign = value;
        setConstraints(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ objective, constraints, maximize });
    };

    const handlePresetClick = () => {
        setObjective(['1', '1']);
        setConstraints([
            { coefficients: ['2', '1'], sign: '<=', rhs: '1200' },
            { coefficients: ['2', '3'], sign: '<=', rhs: '2400' }
        ]);
        setMaximize(true);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <h4 className="mb-3">Цільова функція</h4>

            <div className="mb-4 d-flex align-items-center flex-wrap">
                <span className="me-2">F(x₁...x{numVariables}) =</span>
                {objective.map((val, index) => (
                    <div key={index} className="d-flex align-items-center me-2 mb-2">
                        <input
                            type="text"
                            className="form-control form-control-sm me-1"
                            placeholder=""
                            value={val}
                            onChange={(e) => handleObjectiveChange(index, e.target.value)}
                            style={{ width: '60px' }}
                            required
                        />
                        <span className="me-1">x{index + 1}</span>
                        {index < numVariables - 1 && <span className="me-1">+</span>}
                    </div>
                ))}
                <span className="me-2">→</span>
                <select
                    className="form-select form-select-sm w-auto"
                    value={maximize ? 'max' : 'min'}
                    onChange={(e) => setMaximize(e.target.value === 'max')}
                >
                    <option value="max">max</option>
                    <option value="min">min</option>
                </select>
            </div>

            <h4 className="mb-3">Обмеження</h4>
            {constraints.map((constraint, i) => (
                <div className="d-flex align-items-center mb-2 flex-wrap" key={i}>
                    {constraint.coefficients.map((val, j) => (
                        <div key={j} className="d-flex align-items-center me-2 mb-2">
                            <input
                                type="text"
                                className="form-control form-control-sm me-1"
                                value={val}
                                onChange={(e) => handleConstraintChange(i, j, e.target.value)}
                                style={{ width: '60px' }}
                                required
                            />
                            <span className="me-1">x{j + 1}</span>
                            {j < numVariables - 1 && <span className="me-1">+</span>}
                        </div>
                    ))}
                    <select
                        className="form-select form-select-sm w-auto me-2"
                        value={constraint.sign}
                        onChange={(e) => handleSignChange(i, e.target.value)}
                    >
                        <option value="<=">≤</option>
                        <option value="=">=</option>
                        <option value=">=">≥</option>
                    </select>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder=""
                        value={constraint.rhs}
                        onChange={(e) => handleRHSChange(i, e.target.value)}
                        style={{ width: '60px' }}
                        required
                    />
                </div>
            ))}

            <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-success">Знайти розв’язок</button>
                {showPresetButton && (
                    <button type="button" className="btn btn-secondary" onClick={handlePresetClick}>
                        Задача
                    </button>
                )}
            </div>
        </form>
    );
};

export default EquationInput;
