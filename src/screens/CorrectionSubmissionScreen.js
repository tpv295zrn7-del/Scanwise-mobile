const ISSUE_OPTIONS = [
  'Wrong product',
  'Wrong barcode',
  'Expired',
  'Out of stock',
  'Other'
];

export const CorrectionSubmissionScreen = ({
  barcode,
  submitCorrection,
  onBack,
  onHaptic,
  onToast
} = {}) => {
  let reason = ISSUE_OPTIONS[0];
  let details = '';
  let contact = '';
  let loading = false;
  let submitted = false;
  let error = null;

  return {
    submitIcon: require('../assets/icon-correct.png'),
    issueOptions: ISSUE_OPTIONS,
    get loading() {
      return loading;
    },
    get submitted() {
      return submitted;
    },
    get error() {
      return error;
    },
    setReason: (value) => {
      reason = ISSUE_OPTIONS.includes(value) ? value : ISSUE_OPTIONS[0];
      return reason;
    },
    setDetails: (value) => {
      details = value || '';
      return details;
    },
    setContactInfo: (value) => {
      contact = value || '';
      return contact;
    },
    submit: async () => {
      if (!submitCorrection) {
        submitted = true;
        return true;
      }

      loading = true;
      error = null;

      try {
        await submitCorrection(barcode, {
          reason,
          details,
          contact
        });
        loading = false;
        submitted = true;
        if (onHaptic) onHaptic('impactMedium');
        if (onToast) onToast('Correction submitted successfully');
        return true;
      } catch (submitError) {
        loading = false;
        error = submitError.message;
        if (onToast) onToast('Failed to submit correction');
        return false;
      }
    },
    back: () => {
      if (onBack) onBack();
      return true;
    }
  };
};
