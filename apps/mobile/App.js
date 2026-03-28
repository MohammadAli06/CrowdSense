import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { CrowdProvider } from './src/context/CrowdContext';

export default function App() {
  return (
    <CrowdProvider>
      <RootNavigator />
    </CrowdProvider>
  );
}
