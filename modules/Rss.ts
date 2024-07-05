import { useEffect, useState } from "react";
import { Channel } from "./Episodes";
import { parse } from "react-native-rss-parser";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useRss(rssId: string) {
  const [rss, setRss] = useState<Channel | null>(null);

  console.log(rssId, "rssId");

  useEffect(() => {
    getRssById(Number(rssId))
      .then((rss) => rss?.rssUrl)
      .then((rssUrl) => {
        console.log(rssUrl);
        return fetch(rssUrl);
      })
      .then((response) => response.text())
      .then((data) => parse(data) as Promise<Channel>)
      .then((feed) => setRss({ ...feed, items: feed.items.reverse() }))
      .catch(console.error);
  }, []);

  return rss;
}

async function getRSSList() {
  const jsonList = await AsyncStorage.getItem("rssList");
  if (!jsonList) return [];
  return JSON.parse(jsonList) as {
    rssName: string;
    rssUrl: string;
    id: number;
  }[];
}

async function getRssById(id: number) {
  const rssList = await getRSSList();
  console.log(rssList, id);
  return rssList.find((rss) => rss.id === id);
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<
    { rssName: string; rssUrl: string; id: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRSSList().then((list) => {
      setSubscriptions(list);
      setLoading(false);
    });
  }, []);

  return { subscriptions, loading };
}
