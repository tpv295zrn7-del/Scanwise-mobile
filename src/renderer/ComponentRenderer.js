import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * Renders a component factory descriptor into a React Native element.
 * Each factory component has a `type` field that identifies its kind,
 * and a `props` (or inline) object with its data.
 */
export const ComponentRenderer = ({ descriptor }) => {
  if (!descriptor || typeof descriptor !== 'object') {
    return null;
  }

  const { type } = descriptor;

  if (!type) {
    // Descriptor without a type — render as plain View with JSON dump
    return null;
  }

  switch (type) {
    case 'cancel-button':
      return (
        <TouchableOpacity
          onPress={descriptor.onPress}
          style={{
            padding: 12,
            backgroundColor: '#EF4444',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {descriptor.title || 'Cancel'}
          </Text>
        </TouchableOpacity>
      );

    case 'scan-overlay':
      return (
        <View
          style={{
            borderWidth: 2,
            borderColor: COLORS.primary,
            borderRadius: 12,
            padding: 24,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
          }}
        >
          <Text style={{ color: COLORS.primary, fontSize: 16 }}>
            {descriptor.instructionText || 'Align barcode within frame'}
          </Text>
        </View>
      );

    case 'ConfidenceBadge': {
      const { source, bg, text, size = 80 } = descriptor.props || {};
      return (
        <View
          style={{
            backgroundColor: bg || '#D1FAE5',
            borderRadius: 16,
            padding: 8,
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
          }}
        >
          {source && (
            <Image
              source={source}
              style={{ width: size * 0.4, height: size * 0.4, marginRight: 6 }}
              resizeMode="contain"
            />
          )}
          <Text style={{ color: text || '#065F46', fontWeight: '600' }}>
            Verified
          </Text>
        </View>
      );
    }

    case 'FormButton': {
      const {
        title,
        onPress,
        loading,
        disabled,
        variant = 'primary',
        leftIcon,
      } = descriptor.props || {};
      const isPrimary = variant === 'primary';
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          style={{
            padding: 14,
            backgroundColor: isPrimary ? COLORS.primary : '#E5E7EB',
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            opacity: disabled ? 0.5 : 1,
            marginVertical: 4,
          }}
        >
          {leftIcon && (
            <Image
              source={leftIcon}
              style={{ width: 20, height: 20, marginRight: 8 }}
              resizeMode="contain"
            />
          )}
          <Text
            style={{
              color: isPrimary ? '#fff' : '#374151',
              fontWeight: '600',
            }}
          >
            {loading ? 'Loading...' : title}
          </Text>
        </TouchableOpacity>
      );
    }

    case 'FormInput': {
      const {
        label,
        placeholder,
        value,
        onChangeText,
        error,
        secureTextEntry,
        keyboardType,
        maxLength,
        characterCount,
      } = descriptor.props || {};

      return (
        <View style={{ marginVertical: 8 }}>
          {label && (
            <Text style={{ fontWeight: '600', marginBottom: 4, color: '#374151' }}>
              {label}
            </Text>
          )}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            maxLength={maxLength}
            style={{
              borderWidth: 1,
              borderColor: error ? '#EF4444' : '#D1D5DB',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
            placeholderTextColor="#9CA3AF"
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 4,
            }}
          >
            {error && <Text style={{ color: '#EF4444', fontSize: 12 }}>{error}</Text>}
            {characterCount && (
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{characterCount}</Text>
            )}
          </View>
        </View>
      );
    }

    case 'GoalIcon': {
      const { goal, source, size = 24 } = descriptor.props || {};
      return (
        <View style={{ alignItems: 'center', margin: 8 }}>
          {source && (
            <Image
              source={source}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          )}
          <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
            {goal}
          </Text>
        </View>
      );
    }

    case 'HealthGoalToggle': {
      const { goal, selected, onToggle, icon } = descriptor.props || {};
      return (
        <TouchableOpacity
          onPress={onToggle}
          style={{
            padding: 12,
            backgroundColor: selected ? COLORS.primary : '#F3F4F6',
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 4,
          }}
        >
          {icon && <ComponentRenderer descriptor={icon} />}
          <Text
            style={{
              marginLeft: 8,
              fontWeight: '600',
              color: selected ? '#fff' : '#374151',
            }}
          >
            {goal}
          </Text>
        </TouchableOpacity>
      );
    }

    case 'AllergenItem': {
      const { allergen, severity, onChangeSeverity, onRemove } =
        descriptor.props || {};
      return (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}
        >
          <Text style={{ fontWeight: '500' }}>{allergen}</Text>
          <Text style={{ color: '#6B7280' }}>{severity || 'unknown'}</Text>
        </View>
      );
    }

    case 'FamilyMemberCard': {
      const { name, relationship, allergenCount, onEdit, onDelete } =
        descriptor.props || {};
      return (
        <View
          style={{
            padding: 12,
            backgroundColor: '#F9FAFB',
            borderRadius: 8,
            marginVertical: 4,
          }}
        >
          <Text style={{ fontWeight: '600' }}>{name}</Text>
          <Text style={{ color: '#6B7280' }}>{relationship}</Text>
          <Text style={{ color: '#6B7280' }}>
            {allergenCount} allergen{allergenCount !== 1 ? 's' : ''}
          </Text>
        </View>
      );
    }

    case 'ProfileReviewCard': {
      const { title, items, onEdit } = descriptor.props || {};
      return (
        <View
          style={{
            padding: 12,
            backgroundColor: '#F9FAFB',
            borderRadius: 8,
            marginVertical: 4,
          }}
        >
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>{title}</Text>
          {(items || []).map((item, idx) => (
            <Text key={idx} style={{ color: '#6B7280' }}>
              • {typeof item === 'string' ? item : item.label || JSON.stringify(item)}
            </Text>
          ))}
        </View>
      );
    }

    default:
      // Unknown component type — render debug info
      return (
        <View style={{ padding: 8, backgroundColor: '#FEF3C7', borderRadius: 4 }}>
          <Text style={{ fontSize: 12, color: '#92400E' }}>
            Unknown component: {type}
          </Text>
        </View>
      );
  }
};
