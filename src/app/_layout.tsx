import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <View style={styles.appFrame}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  appFrame: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#ffffff",
  },
});
