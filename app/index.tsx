import { View } from "react-native";
import { Link } from "expo-router";

export default function Page() {
  return (
    <View>
      <Link href={"/playlist"}>Playlist</Link>
      <Link href={"/addRSS"}>Add RSS</Link>
    </View>
  );
}
