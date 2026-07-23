import { store } from './redux/store';
import { RootNavigator } from './navigation/RootNavigator';

export const App = () => ({
  store,
  routeGroup: RootNavigator(store.getState())
});
