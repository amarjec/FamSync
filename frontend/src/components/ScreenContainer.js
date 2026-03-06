import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

const ScreenContainer = ({ children }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7'
  },
  content: {
    flex: 1,
    padding: 16
  }
});

export default ScreenContainer;
