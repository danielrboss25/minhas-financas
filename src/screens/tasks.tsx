import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/theme";
export default function TasksScreen(){ 
  return <View style={styles.c}><Text>Tarefas</Text></View>; 
}
const styles=StyleSheet.create({ c:{flex:1,}});
