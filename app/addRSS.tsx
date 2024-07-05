import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Button,
  TextInput,
  Text,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useSubscriptions } from "../modules/Rss";

async function getRSSList() {
  const jsonList = await AsyncStorage.getItem("rssList");
  if (!jsonList) return [];
  return JSON.parse(jsonList) as { rssName: string; rssUrl: string }[];
}

const storeRSS = async (rssName: string, rssUrl: string) => {
  const rssList = await getRSSList();
  rssList.push({ rssName, rssUrl });
  await AsyncStorage.setItem("rssList", JSON.stringify(rssList));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 16,
    gap: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
  },
});

export default function AddRSS() {
  const { subscriptions, loading } = useSubscriptions();
  const [rssUrl, setRssUrl] = useState("");
  const [rssName, setRssName] = useState("");

  console.log(subscriptions, loading);
  return (
    <SafeAreaView style={styles.container}>
      <Text>Name</Text>
      <TextInput
        value={rssName}
        onChangeText={setRssName}
        style={styles.input}
      />
      <Text>Link</Text>
      <TextInput value={rssUrl} onChangeText={setRssUrl} style={styles.input} />
      <Button
        title="Add RSS"
        onPress={(event) => {
          event.persist();
          storeRSS(rssName, rssUrl);
        }}
      />
      <Text>Current RSS List</Text>
      {loading ? <Text>Loading...</Text> : null}
      {subscriptions.map((sub) => (
        <Text key={sub.rssUrl}>{sub.rssName}</Text>
      ))}
    </SafeAreaView>
  );
}
