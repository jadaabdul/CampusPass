import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/utils/ThemeContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ThemeProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
