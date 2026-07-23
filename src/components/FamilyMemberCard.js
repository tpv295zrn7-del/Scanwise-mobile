export const FamilyMemberCard = ({ member, onEdit, onDelete }) => ({
  type: 'FamilyMemberCard',
  props: {
    name: member.name,
    relationship: member.relationship,
    allergenCount: (member.allergies || []).length,
    onEdit,
    onDelete
  }
});
