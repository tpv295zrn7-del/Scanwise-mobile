export const AllergenItem = ({
  allergen,
  severity,
  onChangeSeverity,
  onRemove
}) => ({
  type: 'AllergenItem',
  props: { allergen, severity, onChangeSeverity, onRemove }
});
