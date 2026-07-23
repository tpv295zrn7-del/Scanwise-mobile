import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

const HomeScreen = ({ navigation }) => {
  const userName = useSelector((state) => state.auth.user?.name ?? 'Guest');
  const goals = useSelector((state) => state.onboarding.goals);
  const allergies = useSelector((state) => state.healthProfiles.profile?.allergies ?? []);
  const familyMembers = useSelector((state) => state.healthProfiles.familyMembers);

  return (
    <View>
      <Text>{`Welcome, ${userName}!`}</Text>
      <Pressable onPress={() => navigation.navigate('ScanTab')}><Text>Scan Product</Text></Pressable>
      <Text>Today's summary</Text>
      <Text>{`Goals tracked: ${goals.length}`}</Text>
      <Text>{`Allergens tracked: ${allergies.length}`}</Text>
      <Text>Recent scans</Text>
      <Text>No scans yet</Text>
      <Text>Active family member</Text>
      <Text>{familyMembers[0]?.name ?? 'Self'}</Text>
      <Text>Allergen alerts placeholder</Text>
      <Pressable onPress={() => navigation.navigate('SettingsTab')}><Text>Settings</Text></Pressable>
    </View>
  );
};

export default HomeScreen;
