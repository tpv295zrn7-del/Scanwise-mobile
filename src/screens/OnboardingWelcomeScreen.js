import { markStepComplete } from '../redux/slices/onboardingSlice';

export const OnboardingWelcomeScreen = ({ dispatch, navigation }) => ({
  hero: require('../assets/onboarding-hero.png'),
  continue: () => {
    dispatch(markStepComplete(0));
    navigation.navigate('HealthGoals');
  },
  skip: () => navigation.navigate('Home')
});
