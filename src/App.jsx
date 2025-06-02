import { useState } from 'react'
import './styles/App.css'
import ModelForm from './components/ModelForm';


function App() {
    const [modelParams, setModelParams] = useState(null);

    const handleModelSubmit = ({ numVariables, numConstraints }) => {
        setModelParams({ numVariables, numConstraints });
    };

    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">Розв’язувач симплекс-методом</h1>

            {!modelParams ? (
                <ModelForm onSubmit={handleModelSubmit} />
            ) : (
                <div className="alert alert-info text-center">
                    Введено: <strong>{modelParams.numVariables}</strong> змінних і <strong>{modelParams.numConstraints}</strong> обмежень.
                    <br />
                    (Тут буде форма для введення коефіцієнтів)
                </div>
            )}
        </div>
    );
}

export default App;

