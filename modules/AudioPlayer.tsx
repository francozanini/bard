import { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { Pressable, PressableProps, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { Episode } from "./Episodes";

export function AudioPlayer({ episode }: { episode: Episode }) {
  const [previousEpisode, setPreviousEpisode] = useState<Episode | null>(
    episode,
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
      },
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
    [sound],
  );

  return (
    <View>
      <Slider
        onValueChange={(value) => {
          if (sound) {
            sound
              .setPositionAsync(value)
              .then(() =>
                setAudioStatus({ ...audioStatus, positionMillis: value }),
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
        <PlayPauseIcon isPlaying={isPlaying} onPress={playSound} />
        <View>
          <Text style={{ fontWeight: "bold" }}>{episode.title}</Text>
        </View>
        <View>
          <Text>
            {millisToMinutes(
              audioStatus.durationMillis - audioStatus.positionMillis,
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

function PlayPauseIcon({
  isPlaying,
  onPress,
}: {
  isPlaying: boolean;
  onPress: PressableProps["onPress"];
}) {
  return (
    <Pressable onPress={onPress}>
      {isPlaying ? (
        <AntDesign name="pause" size={24} color="black" />
      ) : (
        <AntDesign name="play" size={24} color="black" />
      )}
    </Pressable>
  );
}

export function bitsToHourMinutesSeconds(bits: string) {
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
