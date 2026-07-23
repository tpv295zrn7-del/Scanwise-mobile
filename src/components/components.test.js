import { FormInput } from './FormInput';
import { FormButton } from './FormButton';
import { HealthGoalToggle } from './HealthGoalToggle';
import { AllergenItem } from './AllergenItem';
import { FamilyMemberCard } from './FamilyMemberCard';
import { ProfileReviewCard } from './ProfileReviewCard';
import { ConfidenceBadge } from './ConfidenceBadge';
import { GoalIcon } from './GoalIcon';
import { ScanOverlay } from './ScanOverlay';
import { CancelButton } from './CancelButton';
import { triggerNotification } from '../services/haptic';

jest.mock('../services/haptic', () => ({
  triggerNotification: jest.fn()
}));

test('components render payloads', () => {
  expect(FormInput({ value: 'abc', maxLength: 10 }).props.characterCount).toBe(
    '3/10'
  );
  expect(FormInput({ value: 'abc' }).props.characterCount).toBeNull();
  expect(FormButton({ title: 'Save', leftIcon: 'x' }).props.leftIcon).toBe('x');
  expect(HealthGoalToggle({ goal: 'sugar' }).props.icon).toBeTruthy();
  expect(AllergenItem({ allergen: 'Nuts' }).props.allergen).toBe('Nuts');
  expect(
    FamilyMemberCard({
      member: { name: 'Sam', relationship: 'Kid', allergies: [] }
    }).props.relationship
  ).toBe('Kid');
  expect(ProfileReviewCard({ title: 'Review' }).props.title).toBe('Review');
  expect(ConfidenceBadge({ type: 'incomplete' }).props.text).toBe('#991B1B');
  expect(ConfidenceBadge({}).props.bg).toBe('#D1FAE5');
  expect(
    FamilyMemberCard({ member: { name: 'NoAllergies', relationship: 'Self' } })
      .props.allergenCount
  ).toBe(0);
  expect(GoalIcon({ goal: 'protein' }).props.size).toBe(24);
  expect(ScanOverlay().instructionText).toBe('Align barcode within frame');
  const onCancel = jest.fn();
  CancelButton({ onPress: onCancel }).onPress();
  expect(triggerNotification).toHaveBeenCalled();
  expect(onCancel).toHaveBeenCalled();
  CancelButton().onPress();
  expect(triggerNotification).toHaveBeenCalledTimes(2);
});
