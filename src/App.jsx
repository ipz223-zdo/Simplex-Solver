import { useState } from 'react'
import './styles/App.css'
import ModelForm from './components/ModelForm';
import EquationInput from './components/EquationInput';
import { toCanonicalForm } from './utils/toCanonicalForm.js';
import SimplexTable from "./Components/SimplexTable.jsx";
import {getSimplexSteps} from "./utils/simplexSteps.jsx";
import SimplexSteps from "./Components/SimplexSteps.jsx";

// const testData = {
//     objective: ['1', '1'],
//     constraints: [
//         { coefficients: ['2', '1'], sign: '<=', rhs: '1200' },
//         { coefficients: ['2', '3'], sign: '<=', rhs: '2400' }
//     ],
//     maximize: true
// };

// const testData = {
//     objective: ['1', '4', '0'],
//     constraints: [
//         { coefficients: ['2', '-1', '1'], sign: '<=', rhs: '6' },
//         { coefficients: ['-1', '1', '0'], sign: '<=', rhs: '2'},
//         { coefficients: ['1', '1', '0'], sign: '<=', rhs: '10' }
//     ],
//     maximize: true
// };

// const testData = {
//     objective: ['2', '-4'],
//     constraints: [
//         { coefficients: ['8', '-5'], sign: '<=', rhs: '16' },
//         { coefficients: ['1', '3'], sign: '>=', rhs: '2'},
//         { coefficients: ['2', '7'], sign: '<=', rhs: '9' }
//     ],
//     maximize: false
// };
// function App() {
//     const simplexData = toCanonicalForm(testData);
//     const steps = getSimplexSteps(
//         simplexData.matrix,
//         simplexData.objectiveRow,
//         simplexData.basis,
//         simplexData.variableTypes,
//         simplexData.initialC
//     );
//
//     return (
//         <div className="container mt-4">
//             <SimplexSteps steps={steps} variableTypes={simplexData.variableTypes} />
//         </div>
//     );
// }
//
//
// function App() {
//     const [modelParams, setModelParams] = useState(null);
//     let simplexData;
//
//     const handleModelSubmit = ({ numVariables, numConstraints }) => {
//         setModelParams({ numVariables, numConstraints });
//     };
//
//     return (
//         <div className="container py-5">
//             <h1 className="text-center mb-4">Розв’язувач симплекс-методом</h1>
//
//             {!modelParams ? (
//                 <ModelForm onSubmit={handleModelSubmit}/>
//             ) : (
//                 <EquationInput
//                     numVariables={modelParams.numVariables}
//                     numConstraints={modelParams.numConstraints}
//                     onSubmit={(data) => {
//                         console.log('Введена модель:', data);
//                         simplexData = toCanonicalForm(data);
//                         console.log('модель:', simplexData);
//                     }}
//                 />
//             )}
//         </div>
//     );
// }



function App() {
    const [modelParams, setModelParams] = useState(null);
    const [steps, setSteps] = useState(null);
    const [variableTypes, setVariableTypes] = useState(null);
    const [equationKey, setEquationKey] = useState(0); // додатковий ключ для скидання другої форми

    const handleModelSubmit = ({ numVariables, numConstraints }) => {
        setModelParams({ numVariables, numConstraints });
        setSteps(null);
        setVariableTypes(null);

        // Змінюємо key — примусово перемалюємо EquationInput
        setEquationKey(prev => prev + 1);
    };

    const handleEquationSubmit = (data) => {
        const simplexData = toCanonicalForm(data);
        const computedSteps = getSimplexSteps(
            simplexData.matrix,
            simplexData.objectiveRow,
            simplexData.basis,
            simplexData.variableTypes,
            simplexData.initialC
        );
        setVariableTypes(simplexData.variableTypes);
        setSteps(computedSteps);
    };

    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">Розв’язувач симплекс-методом</h1>

            <ModelForm onSubmit={handleModelSubmit} />

            {modelParams && (
                <EquationInput
                    key={equationKey}   // ключ змінюється — React перемалює компонент повністю
                    numVariables={modelParams.numVariables}
                    numConstraints={modelParams.numConstraints}
                    onSubmit={handleEquationSubmit}
                />
            )}

            {steps && <SimplexSteps steps={steps} variableTypes={variableTypes} />}
        </div>
    );
}

export default App;

