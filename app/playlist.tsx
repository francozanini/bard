import { useSubscriptions } from "../modules/Rss";
import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Playlist() {
  const { loading, subscriptions } = useSubscriptions();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (subscriptions.length === 0) {
    return <Text>No subscriptions</Text>;
  }

  return (
    <View>
      {subscriptions.map((sub) => (
        <Link
          key={sub.rssUrl}
          href={`/playlist/${encodeURIComponent(sub.rssUrl)}`}
        >
          {sub.rssName}
        </Link>
      ))}
    </View>
  );
}
