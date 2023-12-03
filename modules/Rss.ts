import { useEffect, useState } from "react";
import { Channel } from "./Episodes";
import * as Parser from "react-native-rss-parser";

export function useRss() {
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
