import { useState } from 'react'
import './styles/App.css'
import ModelForm from './components/ModelForm';
import EquationInput from './components/EquationInput';
import { toCanonicalForm } from './utils/toCanonicalForm.js';
import { getSimplexSteps } from "./utils/simplexSteps.jsx";
import SimplexSteps from "./Components/SimplexSteps.jsx";
import { CanonicalFormDisplay } from './Components/CanonicalFormDisplay';
import { SolutionDisplay } from './Components/SolutionDisplay';

function App() {
    const [modelParams, setModelParams] = useState(null);
    const [steps, setSteps] = useState(null);
    const [variables, setVariables] = useState(null);
    const [canonicalData, setCanonicalData] = useState(null);
    const [equationKey, setEquationKey] = useState(0);

    const handleModelSubmit = ({ numVariables, numConstraints }) => {
        setModelParams({ numVariables, numConstraints });
        setSteps(null);
        setVariables(null);
        setCanonicalData(null);
        setEquationKey(prev => prev + 1);
    };

    const handleEquationSubmit = (data) => {
        const simplexData = toCanonicalForm(data);
        const computedSteps = getSimplexSteps(
            simplexData.matrix,
            simplexData.objectiveRow,
            simplexData.basis,
            simplexData.variables,
            simplexData.originalObjective
        );
        setVariables(simplexData.variables);
        setSteps(computedSteps);
        setCanonicalData(simplexData);
    };

    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">Розв’язувач симплекс-методом</h1>

            <ModelForm onSubmit={handleModelSubmit} />

            {modelParams && (
                <EquationInput
                    key={equationKey}
                    numVariables={modelParams.numVariables}
                    numConstraints={modelParams.numConstraints}
                    onSubmit={handleEquationSubmit}
                    showPresetButton={
                        modelParams.numVariables === 2 && modelParams.numConstraints === 2
                    }
                />
            )}

            {canonicalData && (
                <CanonicalFormDisplay
                    matrix={canonicalData.matrix}
                    objectiveRow={canonicalData.objectiveRow}
                    variables={canonicalData.variables}
                    maximize={canonicalData.maximize}
                />
            )}

            {steps && <SimplexSteps steps={steps} variables={variables} />}
            {steps && <SolutionDisplay steps={steps} variables={variables} maximize={canonicalData.maximize} />}
        </div>
    );
}

export default App;
