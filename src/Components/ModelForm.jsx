import React, { useState } from 'react';

const ModelForm = ({ onSubmit }) => {
    const [numVariables, setNumVariables] = useState('');
    const [numConstraints, setNumConstraints] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const vars = parseInt(numVariables, 10);
        const cons = parseInt(numConstraints, 10);

        if (isNaN(vars) || isNaN(cons) || vars <= 0 || cons <= 0) {
            alert('Введіть натуральні числа більше нуля');
            return;
        }

        onSubmit({ numVariables: vars, numConstraints: cons });
    };

    return (
        <form onSubmit={handleSubmit} className="container mt-4">
            <h2 className="mb-3">Початкові параметри</h2>

            <div className="mb-3">
                <label className="form-label">Кількість змінних:</label>
                <input
                    type="number"
                    min="1"
                    value={numVariables}
                    onChange={(e) => setNumVariables(e.target.value)}
                    className="form-control"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Кількість обмежень:</label>
                <input
                    type="number"
                    min="1"
                    value={numConstraints}
                    onChange={(e) => setNumConstraints(e.target.value)}
                    className="form-control"
                    required
                />
            </div>

            <button type="submit" className="btn btn-primary">
                Далі
            </button>
        </form>
    );
};

export default ModelForm;
