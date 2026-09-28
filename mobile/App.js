import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { CompetitionDetailsScreen } from './src/screens/CompetitionDetailsScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <CompetitionDetailsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
