export const onboardingSelectors = {
  step: (state) => state.onboarding.currentStep,
  progress: (state) => (state.onboarding.completedSteps.length / 5) * 100,
  complete: (state) => state.onboarding.isComplete,
};
