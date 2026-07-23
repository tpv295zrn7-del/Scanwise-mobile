export const FormInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  maxLength
}) => ({
  type: 'FormInput',
  props: {
    label,
    placeholder,
    value,
    onChangeText,
    error,
    secureTextEntry,
    keyboardType,
    maxLength,
    characterCount: maxLength ? `${(value || '').length}/${maxLength}` : null
  }
});
