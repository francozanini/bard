import { useEffect, useState } from "react";
import { Channel } from "./Episodes";
import { parse } from "react-native-rss-parser";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useRss(rssUrl: string) {
  const [rss, setRss] = useState<Channel | null>(null);

  useEffect(() => {
    fetch(rssUrl)
      .then((response) => response.text())
      .then((data) => parse(data) as Promise<Channel>)
      .then((feed) => setRss({ ...feed, items: feed.items.reverse() }));
  }, []);

  return rss;
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<
    { rssName: string; rssUrl: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRSSList() {
      const jsonList = await AsyncStorage.getItem("rssList");
      if (!jsonList) return [];
      return JSON.parse(jsonList) as { rssName: string; rssUrl: string }[];
    }

    getRSSList().then((list) => {
      setSubscriptions(list);
      setLoading(false);
    });
  }, []);

  return { subscriptions, loading };
}
