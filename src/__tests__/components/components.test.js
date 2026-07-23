import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FormInput from '@/components/FormInput';
import FormButton from '@/components/FormButton';
import HealthGoalToggle from '@/components/HealthGoalToggle';
import AllergenItem from '@/components/AllergenItem';
import FamilyMemberCard from '@/components/FamilyMemberCard';
import ProfileReviewCard from '@/components/ProfileReviewCard';

describe('components', () => {
  it('FormInput renders error and counter', () => {
    const { getByText } = render(
      <FormInput
        label="Email"
        value="abc"
        onChangeText={() => {}}
        error="err"
        showCounter
        maxLength={10}
      />
    );
    expect(getByText('err')).toBeTruthy();
    expect(getByText('3/10')).toBeTruthy();
  });

  it('FormButton handles loading and disabled states', () => {
    const onPress = jest.fn();
    const { getByText, queryByTestId, rerender } = render(<FormButton title="Go" onPress={onPress} />);
    fireEvent.press(getByText('Go'));
    expect(onPress).toHaveBeenCalled();
    rerender(<FormButton title="Go" onPress={onPress} loading />);
    expect(queryByTestId('button-loader')).toBeTruthy();
  });

  it('HealthGoalToggle toggles', () => {
    const onToggle = jest.fn();
    const { getByText } = render(<HealthGoalToggle goal={{ key: 'A', label: 'Goal A' }} selected onToggle={onToggle} />);
    fireEvent.press(getByText('Goal A'));
    expect(onToggle).toHaveBeenCalledWith('A');
    expect(getByText('✓')).toBeTruthy();
  });

  it('AllergenItem changes severity and remove', () => {
    const onChangeSeverity = jest.fn();
    const onRemove = jest.fn();
    const { getByText } = render(
      <AllergenItem allergen={{ name: 'nuts', severity: 'mild' }} onChangeSeverity={onChangeSeverity} onRemove={onRemove} />
    );
    fireEvent.press(getByText('severe'));
    fireEvent.press(getByText('Remove'));
    expect(onChangeSeverity).toHaveBeenCalledWith('nuts', 'severe');
    expect(onRemove).toHaveBeenCalledWith('nuts');
  });

  it('FamilyMemberCard and ProfileReviewCard actions', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { getByText } = render(
      <FamilyMemberCard member={{ id: '1', name: 'Sam', relationship: 'child', allergies: [] }} onEdit={onEdit} onDelete={onDelete} />
    );
    fireEvent.press(getByText('Edit'));
    fireEvent.press(getByText('Delete'));
    expect(onEdit).toHaveBeenCalledWith('1');
    expect(onDelete).toHaveBeenCalledWith('1');

    const card = render(<ProfileReviewCard title="Goals" items={['A']} onEdit={onEdit} />);
    fireEvent.press(card.getByText('Edit'));
    expect(onEdit).toHaveBeenCalled();
  });
});
