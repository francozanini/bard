import { useEffect, useState } from "react";
import * as Parser from "react-native-rss-parser";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { Audio } from "expo-av";
import Constants from "expo-constants";
import { AntDesign } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

function useRss() {
  const [rss, setRss] = useState<Channel | null>(null);

  useEffect(() => {
    const RSS_URL = "https://anchor.fm/s/6f4e0c2c/podcast/rss";
    fetch(RSS_URL)
      .then((response) => response.text())
      .then((data) => Parser.parse(data) as Promise<Channel>)
      .then((feed) => setRss({ ...feed, items: feed.items.reverse() }));
  }, []);

  return rss;
}

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

export default function App() {
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
        {rss.items.map((item) => (
          <Pressable key={item.title} onPress={() => setSelectedEpisode(item)}>
            <EpisodeListItem episode={item} />
          </Pressable>
        ))}
      </ScrollView>
      {selectedEpisode && <AudioPlayer episode={selectedEpisode} />}
    </>
  );
}

function bitsToHourMinutesSeconds(bits: string) {
  const byteRate = 128;
  const bytes = parseInt(bits) * 8;
  const seconds = Math.floor(bytes / byteRate / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);

  const minutesWithZero = minutes < 10 ? `0${minutes}` : minutes;
  const secondsWithZero = seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60;
  const hoursWithZero = hours < 10 ? `0${hours}` : hours;

  return `${hoursWithZero}:${minutesWithZero}:${secondsWithZero}`;
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

function AudioPlayer({ episode }: { episode: Episode }) {
  const [previousEpisode, setPreviousEpisode] = useState<Episode | null>(
    episode
  );
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioStatus, setAudioStatus] = useState({
    positionMillis: 0,
    durationMillis: 0,
  });
  const isPlaying = sound !== null;
  const url = episode.enclosures[0].url;
  if (!url)
    return (
      <View>
        <Text>Can not play that episode</Text>
      </View>
    );

  if (previousEpisode?.id !== episode.id) {
    if (sound) {
      sound.unloadAsync().then(() => setSound(null));
    }
    setAudioStatus({ positionMillis: 0, durationMillis: 0 });
    setPreviousEpisode(episode);
  }

  async function playSound() {
    console.log("Loading Sound");

    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      {},
      (status) => {
        if (status.isLoaded) {
          setAudioStatus({
            positionMillis: status.positionMillis,
            durationMillis: status.durationMillis!,
          });
        }
      }
    );
    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  }

  useEffect(
    () =>
      sound
        ? () => {
            console.log("Unloading Sound");
            sound.unloadAsync().then(() => setSound(null));
          }
        : undefined,
    [sound]
  );

  return (
    <View>
      <Slider
        onValueChange={(value) => {
          if (sound) {
            sound
              .setPositionAsync(value)
              .then(() =>
                setAudioStatus({ ...audioStatus, positionMillis: value })
              );
          }
        }}
        style={{ width: "100%", height: 10 }}
        value={audioStatus.positionMillis}
        maximumValue={audioStatus.durationMillis}
      />
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignContent: "center",
          padding: 16,
          gap: 12,
        }}
      >
        <Pressable onPress={playSound}>
          <PlayPauseIcon isPlaying={isPlaying} />
        </Pressable>
        <View>
          <Text style={{ fontWeight: "bold" }}>{episode.title}</Text>
        </View>
        <View>
          <Text>
            {millisToMinutes(
              audioStatus.durationMillis - audioStatus.positionMillis
            )}
          </Text>
        </View>
      </View>
    </View>
  );
}

function millisToMinutes(millis: number) {
  const seconds = millis / 1000;
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.floor(seconds % 60);
  const minutesWithZero = minutes < 10 ? `0${minutes}` : minutes;
  const secondsWithZero = secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft;

  return `${minutesWithZero}:${secondsWithZero}`;
}

function PlayPauseIcon({ isPlaying }: { isPlaying: boolean }) {
  return (
    <>
      {isPlaying ? (
        <AntDesign name="pause" size={24} color="black" />
      ) : (
        <AntDesign name="play" size={24} color="black" />
      )}
    </>
  );
}

type Channel = {
  title: string;
  description: string;
  items: Episode[];
};

type Episode = {
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
