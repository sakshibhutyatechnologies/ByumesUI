import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import configuration from '../configuration';

const InstructionsContext = createContext();

export const InstructionsProvider = ({
  children,
  data,
  user,
  orderName,
  orderNumber,
  productName,
  productNumber,
}) => {
  const userRole = user?.role;
  const language = user?.language || 'en';
  const userName = user?.full_name || 'Unknown User';
  const [instruction, setInstruction] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [currentStepData, setCurrentStepData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const instructionId = instruction?._id;
  const totalSteps = instruction?.totalSteps;

  const stepType = useMemo(() => (userRole === 'QA' ? 'current-qa-step' : 'current-step'), [userRole]);
  const stepKeyField = useMemo(() => (userRole === 'QA' ? 'current_qa_step' : 'current_step'), [userRole]);

  const fetchInstruction = useCallback(async (id) => {
    if (!id) return null;
    try {
      const res = await fetch(`${configuration.API_BASE_URL}instructions/${id}`);
      const data = await res.json();
      const stepsRes = await fetch(`${configuration.API_BASE_URL}instructions/${id}/total-steps`);
      const steps = await stepsRes.json();
      const enriched = { ...data, totalSteps: steps.totalSteps };
      setInstruction(enriched);
      return enriched;
    } catch (err) {
      setError('Error fetching instruction');
      return null;
    }
  }, []);

  const fetchCurrentStepIndex = useCallback(async () => {
    if (!instructionId) return 0;
    try {
      const res = await fetch(`${configuration.API_BASE_URL}instructions/${instructionId}/${stepType}`);
      if (!res.ok) throw new Error('Failed to fetch current step');
      const result = await res.json();
      return result?.[stepKeyField] || 0;
    } catch (err) {
      setError(err.message);
      return 0;
    }
  }, [instructionId, stepType, stepKeyField]);

  const fetchStepData = useCallback(async (stepIndex) => {
    if (!instructionId) return null;
    try {
      const res = await fetch(`${configuration.API_BASE_URL}instructions/${instructionId}/step/${stepIndex}`);
      if (!res.ok) throw new Error('Failed to fetch step data');
      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [instructionId]);

  const updateStep = useCallback(async (stepIndex, updatedStep) => {
    if (!instructionId) return false;
    try {
      const res = await fetch(`${configuration.API_BASE_URL}instructions/${instructionId}/step/${stepIndex}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedStepData: updatedStep }),
      });
      return res.ok;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [instructionId]);

  const updateCurrentStepIndex = useCallback(async (stepIndex) => {
    if (!instructionId) return false;
    try {
      const res = await fetch(`${configuration.API_BASE_URL}instructions/${instructionId}/${stepType}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [stepKeyField]: stepIndex }),
      });
      if (res.ok) {
        const updated = await fetchInstruction(instructionId);
        setInstruction(updated);
      }
      return res.ok;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [instructionId, stepType, stepKeyField, fetchInstruction]);

  const goToStep = useCallback(async (stepIndex) => {
    if (!instructionId) return;
    setIsLoading(true);
    const stepData = await fetchStepData(stepIndex);
    if (stepData) {
      setCurrentStepIndex(stepIndex);
      setCurrentStepData(stepData);
    }
    setIsLoading(false);
  }, [fetchStepData, instructionId]);

  const goToCurrentStep = useCallback(async () => {
    if (!instructionId) return;
    const stepIndex = await fetchCurrentStepIndex();
    await goToStep(stepIndex);
  }, [fetchCurrentStepIndex, goToStep, instructionId]);

  // Initial fetch
  useEffect(() => {
    if (data?.instruction_id) {
      fetchInstruction(data?.instruction_id);
    }
  }, [data?.instruction_id, fetchInstruction]);

  // Fetch current step once instruction is loaded
  useEffect(() => {
    if (instruction?._id) {
      goToCurrentStep();
    }
  }, [instruction, goToCurrentStep]);

  const addComment = useCallback(async ({ text }) => {
    if (!text?.trim()) return;
    const newComment = {
      text,
      created_at: new Date().toISOString(),
      user: userName,
    };
    const updated = {
      ...currentStepData,
      comments: currentStepData?.comments
        ? [...currentStepData.comments, newComment]
        : [newComment],
    };
    const success = await updateStep(currentStepIndex, updated);
    if (success) setCurrentStepData(updated);
  }, [currentStepData, currentStepIndex, updateStep, userName]);

  const handleSignAndComplete = useCallback(async () => {
    const execution = {
      executed: true,
      executed_by: userName,
      executed_at: new Date().toISOString(),
    };

    const updated = {
      ...currentStepData,
      operator_execution: execution,
    };

    const success = await updateStep(currentStepIndex, updated);
    if (success) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex <= totalSteps) {
        await updateCurrentStepIndex(nextIndex);
        await goToStep(nextIndex);
      }
    }
  }, [currentStepData, currentStepIndex, totalSteps, userName, updateStep, updateCurrentStepIndex, goToStep]);

  const handleReviewAndComplete = useCallback(async () => {
    const execution = {
      qa_executed: true,
      qa_executed_by: userName,
      qa_executed_at: new Date().toISOString(),
    };

    const updated = {
      ...currentStepData,
      qa_execution: execution,
    };

    const success = await updateStep(currentStepIndex, updated);
    if (success) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex <= totalSteps) {
        await updateCurrentStepIndex(nextIndex);
        await goToStep(nextIndex);
      }
    }
  }, [currentStepData, currentStepIndex, totalSteps, userName, updateStep, updateCurrentStepIndex, goToStep]);

  const handleDownloadBatchReport = useCallback(async () => {
    if (!instructionId) return;
    try {
      const response = await fetch(`${configuration.API_BASE_URL}reports/downloadPDF/${orderNumber}/${productNumber}/${instructionId}/${language}/${userName}/${userRole}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/pdf' },
      });

      if (!response.ok) throw new Error('Failed to fetch report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Order-${orderNumber}_Product-${productNumber}_Instruction-${instructionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  }, [orderNumber, productNumber, instructionId, language, userName, userRole]);

  const isCurrentStep = useMemo(() => {
    return currentStepData?.step === instruction?.[stepKeyField];
  }, [currentStepData, instruction, stepKeyField]);

  const contextValue = useMemo(() => ({
    instruction,
    fetchInstruction,
    currentStepIndex,
    currentStepData,
    setCurrentStepData,
    setCurrentStepIndex,
    goToStep,
    goToCurrentStep,
    updateStep,
    updateCurrentStepIndex,
    addComment,
    handleSignAndComplete,
    handleReviewAndComplete,
    handleDownloadBatchReport,
    isCurrentStep,
    isLoading,
    error,
    instructionId,
    totalSteps,
    orderName,
    orderNumber,
    productName,
    productNumber,
    userRole,
    language,
  }), [
    instruction,
    fetchInstruction,
    currentStepIndex,
    currentStepData,
    goToStep,
    updateStep,
    addComment,
    isCurrentStep,
    instructionId,
    totalSteps,
    orderName,
    orderNumber,
    productName,
    productNumber,
    isLoading,
    error,
    handleSignAndComplete,
    handleReviewAndComplete,
    handleDownloadBatchReport,
    userRole,
    language,
  ]);

  return (
    <InstructionsContext.Provider value={contextValue}>
      {children}
    </InstructionsContext.Provider>
  );
};

export const useInstructions = () => useContext(InstructionsContext);