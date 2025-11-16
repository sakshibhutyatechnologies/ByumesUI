import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import configuration from '../configuration';

const ELogActivitiesContext = createContext();

export const ELogActivitiesProvider = ({
  children,
  data,
  user,
  eLogOrderName,
  eLogOrderNumber,
  eLogProductName,
  eLogProductNumber,
  equipmentName
}) => {
  const userRole = user?.role;
  const language = user?.language || 'en';
  const userName = user?.full_name || 'Unknown User';

  const [activity, setActivity] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [currentStepData, setCurrentStepData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const activityId = activity?._id;
  const totalSteps = activity?.totalSteps;

  const stepType = useMemo(() => (userRole === 'QA' ? 'current-qa-step' : 'current-step'), [userRole]);
  const stepKeyField = useMemo(() => (userRole === 'QA' ? 'current_qa_step' : 'current_step'), [userRole]);

  const fetchEquipmentActivities = useCallback(async (id) => {
    try {
      const res = await fetch(`${configuration.API_BASE_URL}equipmentActivities/${id}`);
      const data = await res.json();
      const stepsRes = await fetch(`${configuration.API_BASE_URL}equipmentActivities/${id}/total-steps`);
      const steps = await stepsRes.json();
      const enriched = { ...data, totalSteps: steps.totalSteps };
      setActivity(enriched);
      return enriched;
    } catch (err) {
      setError('Error fetching equipment activity');
      return null;
    }
  }, []);

  const fetchStepData = useCallback(async (stepIndex) => {
    try {
      const res = await fetch(`${configuration.API_BASE_URL}equipmentActivities/${activityId}/step/${stepIndex}`);
      return await res.json();
    } catch (err) {
      setError('Error fetching step data');
      return null;
    }
  }, [activityId]);

  const updateStep = useCallback(async (stepIndex, updatedStep) => {
    try {
      const res = await fetch(`${configuration.API_BASE_URL}equipmentActivities/${activityId}/step/${stepIndex}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedStepData: updatedStep }),
      });
      return res.ok;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [activityId]);

  const updateCurrentStepIndex = useCallback(async (stepIndex) => {
    try {
      const res = await fetch(`${configuration.API_BASE_URL}equipmentActivities/${activityId}/${stepType}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [stepKeyField]: stepIndex }),
      });
      if (res.ok) {
        const updated = await fetchEquipmentActivities(activityId);
        setActivity(updated);
      }
      return res.ok;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [activityId, stepType, stepKeyField, fetchEquipmentActivities]);

  const fetchCurrentStepIndex = useCallback(async () => {
    try {
      const res = await fetch(`${configuration.API_BASE_URL}equipmentActivities/${activityId}/${stepType}`);
      const data = await res.json();
      return data?.[stepKeyField] || 0;
    } catch (err) {
      setError('Error fetching current step index');
      return 0;
    }
  }, [activityId, stepType, stepKeyField]);

  const goToStep = useCallback(async (stepIndex) => {
    setIsLoading(true);
    const step = await fetchStepData(stepIndex);
    if (step) {
      setCurrentStepIndex(stepIndex);
      setCurrentStepData(step);
    }
    setIsLoading(false);
  }, [fetchStepData]);

  const goToCurrentStep = useCallback(async () => {
    const index = await fetchCurrentStepIndex();
    await goToStep(index);
  }, [fetchCurrentStepIndex, goToStep]);

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
    const updated = { ...currentStepData, operator_execution: execution };
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
    const updated = { ...currentStepData, qa_execution: execution };
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
    try {
      const res = await fetch(`${configuration.API_BASE_URL}eLogReports/downloadPDF/${eLogOrderNumber}/${eLogProductNumber}/${activityId}/${language}/${userName}/${userRole}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/pdf' },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ELogOrder-${eLogOrderNumber}_Product-${eLogProductNumber}_Activity-${activityId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  }, [eLogOrderNumber, eLogProductNumber, activityId, language, userName, userRole]);

  const isCurrentStep = useMemo(() => {
    return currentStepData?.step === activity?.[stepKeyField];
  }, [currentStepData, activity, stepKeyField]);

  useEffect(() => {
    if (data?._id) 
      fetchEquipmentActivities(data._id);
  }, [data, fetchEquipmentActivities]);

  useEffect(() => {
    if (activity?._id) goToCurrentStep();
  }, [activity, goToCurrentStep]);

  const contextValue = useMemo(() => ({
    activity,
    currentStepIndex,
    currentStepData,
    setCurrentStepData,
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
    activityId,
    totalSteps,
    orderName: eLogOrderName,
    activityName: eLogProductName,
    equipmentName,
    userRole,
    fetchEquipmentActivities, 
    language,
  }), [
    activity, 
    currentStepIndex, 
    currentStepData, 
    isCurrentStep,
    isLoading, 
    error, 
    activityId, 
    totalSteps,
    eLogOrderName, 
    eLogProductName, 
    equipmentName,
    goToStep, 
    updateStep, 
    addComment,
    handleSignAndComplete, 
    handleReviewAndComplete, 
    handleDownloadBatchReport,
    userRole,
    fetchEquipmentActivities, 
    language,
  ]);

  return (
    <ELogActivitiesContext.Provider value={contextValue}>
      {children}
    </ELogActivitiesContext.Provider>
  );
};

export const useELogActivities = () => useContext(ELogActivitiesContext);
