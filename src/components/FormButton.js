export const FormButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  leftIcon
}) => ({
  type: 'FormButton',
  props: { title, onPress, loading, disabled, variant, leftIcon }
});
