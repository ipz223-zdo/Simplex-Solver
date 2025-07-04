import React from 'react';
import SimplexTable from './SimplexTable';

const SimplexSteps = ({ steps, variables}) => {
    return (
        <div className="mt-5">
            <h2>Кроки симплекс методу</h2>
            {steps.map((step, index) => (
                <div key={index} className="mb-5">
                    <h5>Крок {index + 1}</h5>
                    <SimplexTable
                        stepData={step}
                        variables={step.variables}
                        isLastStep={index === steps.length - 1}
                    />
                </div>
            ))}
        </div>
    );
};

export default SimplexSteps;
