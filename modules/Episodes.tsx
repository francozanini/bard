import { Pressable, StyleSheet, Text, View } from "react-native";

import { bitsToHourMinutesSeconds } from "./AudioPlayer";

export type Channel = {
  title: string;
  description: string;
  items: Episode[];
};
export type Episode = {
  title: string;
  description: string;
  links: Link[];
  content: string;
  id: string;
  published: string;
  enclosures: Enclosure[];
  itunes: Itunes;
};
type Link = {
  url: string;
  rel: string;
};
type Enclosure = {
  url: string;
  length: string;
  mimeType: string;
};
type Itunes = {
  image: string;
  block: any;
  summary: string;
  explicit: string;
  duration: string;
};

export function EpisodeList({
  episodes,
  selectEpisode,
}: {
  episodes: Episode[];
  selectEpisode: (ignored: Episode) => void;
}) {
  return (
    <>
      {episodes.map((episode) => (
        <Pressable key={episode.title} onPress={() => selectEpisode(episode)}>
          <EpisodeListItem episode={episode} />
        </Pressable>
      ))}
    </>
  );
}

function EpisodeListItem({ episode }: { episode: Episode }) {
  const date = new Date(episode.published);
  const dateString = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={styles.listItem}>
      <Text style={styles.listTitle}>{episode.title}</Text>
      <View
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#6a6a6a", fontSize: 12 }}>{dateString}</Text>
        <Text style={{ color: "#6a6a6a" }}>
          {bitsToHourMinutesSeconds(episode.enclosures[0].length)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  list: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  listTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
});
