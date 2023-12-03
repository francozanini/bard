import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { AudioPlayer } from "../modules/AudioPlayer";
import { Episode, EpisodeList } from "../modules/Episodes";
import { useRss } from "../modules/Rss";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: Constants.statusBarHeight,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    margin: 10,
  },
  cardTitle: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  cardImage: {
    width: "50%",
    marginHorizontal: "25%",
    height: 200,
    borderRadius: 5,
  },
});

export default function Playlist() {
  const rss = useRss();
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  if (!rss || rss.items?.length === 0)
    return (
      <View>
        <Text>No items</Text>
      </View>
    );

  return (
    <>
      <ScrollView style={styles.container}>
        <Image
          source={{ uri: rss.items[0].itunes.image }}
          style={styles.cardImage}
        />
        <Text style={styles.cardTitle}>{rss.title}</Text>
        <Text style={styles.cardSubtitle}>{rss.description}</Text>
        <EpisodeList episodes={rss.items} selectEpisode={setSelectedEpisode} />
      </ScrollView>
      {selectedEpisode && <AudioPlayer episode={selectedEpisode} />}
    </>
  );
}
