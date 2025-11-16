import React from 'react';
import { useInstructions } from '../../Context/InstructionsContext';
import '../../Style/InstructionsView.css';

const InstructionStepText = () => {
  const {
    currentStepData,
    userRole,
    language,
    setCurrentStepData,
    currentStepIndex
  } = useInstructions();

  if (!currentStepData) return null;

  const handleChange = (event, key) => {
    let value = event.target.value;
    if (value.trim() !== '' && !isNaN(value)) {
      value = value.includes('.') ? value : Number(value);
    }

    const updated = { ...currentStepData };
    if (updated.placeholders?.[key]) {
      updated.placeholders[key].value = value;
      setCurrentStepData(updated);
    }
  };

  const handleRadioChange = (event, key) => {
    const value = event.target.value;
    const updated = { ...currentStepData };

    if (updated.placeholders?.[key]) {
      updated.placeholders[key].value = value;

      const option = updated.placeholders[key].options.find(
        (opt) => opt.label === value
      );

      if (option) {
        updated.skip_step = {
          skip_step: true,
          skip_step_numbers: [option.next_step] || [],
        };
      } else {
        updated.skip_step = {
          skip_step: false,
          skip_step_numbers: [],
        };
      }

      setCurrentStepData(updated);
    }
  };

    const handleCheckboxChange = (event, key) => {
    const checked = event.target.checked;
    const updated = { ...currentStepData };
    if (updated.placeholders?.[key]) {
      updated.placeholders[key].value = checked;
      setCurrentStepData(updated);
    }
  };
  
  const formatInstructionText = (instructionText) => {
  if (!instructionText) return <span>No instruction available</span>;

  const raw = instructionText[language] || instructionText['en'] || '';
  const parts = raw.split(/{([^}]*)}/g);

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      const key = part.trim();
      const placeholder = currentStepData?.placeholders?.[key] || {};
      const type = placeholder.type;
      const inputValue = placeholder.value ?? '';

      const isEditable =
        !currentStepData.operator_execution.executed &&
        userRole !== 'QA';

      let inputField = null;

      switch (type) {
        case 'textbox':
        case 'auto':
          inputField = (
            <input
              key={key}
              type="text"
              value={inputValue}
              onChange={(e) => handleChange(e, key)}
              placeholder={`Enter ${key}`}
              disabled={!isEditable}
              className="form-control d-inline mx-2 w-auto"
            />
          );
          break;

        case 'dropdown':
          inputField = (
            <select
              key={key}
              value={inputValue}
              onChange={(e) => handleChange(e, key)}
              disabled={!isEditable}
              className="form-select d-inline mx-2 w-auto"
            >
              {placeholder.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          );
          break;

        case 'radio':
          inputField = (
            <div key={key} className="d-inline mx-2">
              {placeholder.options?.map((opt) => (
                <label key={opt.label} className="me-2">
                  <input
                    type="radio"
                    name={key}
                    value={opt.label}
                    checked={inputValue === opt.label}
                    disabled={!isEditable}
                    onChange={(e) => handleRadioChange(e, key)}
                    className="form-check-input me-1"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          );
          break;

        case 'date':
          inputField = (
            <input
              key={key}
              type="date"
              value={inputValue}
              onChange={(e) => handleChange(e, key)}
              disabled={!isEditable}
              className="form-control d-inline mx-2 w-auto"
            />
          );
          break;

        case 'time':
          inputField = (
            <input
              key={key}
              type="time"
              value={inputValue}
              onChange={(e) => handleChange(e, key)}
              disabled={!isEditable}
              className="form-control d-inline mx-2 w-auto"
            />
          );
          break;

        case 'datetime':
          inputField = (
            <input
              key={key}
              type="datetime-local"
              value={inputValue}
              onChange={(e) => handleChange(e, key)}
              disabled={!isEditable}
              className="form-control d-inline mx-2 w-auto"
            />
          );
          break;

        case 'hyperlink':
          inputField = (
            <a key={key} href={inputValue} target="_blank" rel="noopener noreferrer" className="mx-2">
              Link
            </a>
          );
          break;

        case 'image':
        case 'gif':
          inputField = (
            <img
              key={key}
              src={inputValue}
              alt={type}
              style={{ maxWidth: '100%', height: 'auto' }}
              className="mx-2"
            />
          );
          break;
        case 'checkbox':
            inputField = (
              <input
                key={key}
                type="checkbox"
                checked={Boolean(inputValue)}
                disabled={!isEditable}
                onChange={(e) => handleCheckboxChange(e, key)}
                className="form-check-input d-inline mx-2"
              />
            );
            break;
        default:
          inputField = (
            <input
              key={key}
              type="text"
              value={inputValue}
              onChange={(e) => handleChange(e, key)}
              placeholder={`Enter ${key}`}
              disabled={!isEditable}
              className="form-control d-inline mx-2 w-auto"
            />
          );
          break;
      }
      return inputField;
    } else {
      return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    }
  });
};

  return (
    <div className="container-fluid p-0">
      <div
        className="card shadow p-4 d-flex flex-column justify-content-center align-items-center text-center"
        style={{
          height: 'calc(100vh - 235px)',
          marginTop: '145px',
          marginBottom: '90px',
          overflow: 'auto',
        }}
      >
        <div className="fw-bold fs-5 mb-4">
          Step: {currentStepData.step}
        </div>
        <div className="instruction-content" style={{ maxWidth: '700px', width: '100%'}}>
          {formatInstructionText(currentStepData.instruction)}
        </div>
      </div>
    </div>
  );
};

export default InstructionStepText;