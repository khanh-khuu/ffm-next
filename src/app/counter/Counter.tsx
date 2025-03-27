"use client";

import { Button, Card, Group, SimpleGrid, TextInput } from "@mantine/core";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Post from "./Post";

export default function Counter() {
  const [userName, setUserName] = useState("");
  const [views, setViews] = useState<UserDatum[]>([]);
  const timer = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function getViews(userId: string) {
    const {data: {userData}} = await axios.get<CounterViewResponse>(`/counter/view/${userId}`);
        setViews(userData.slice(0, 9));
  }
  async function startCount() {
    setLoading(true);
    if (timer.current) clearInterval(timer.current);
    
    const {data: {userId}} = await axios.get(`/counter/user/${userName}`);
    await getViews(userId);
    setLoading(false);
    timer.current = window.setInterval(async () => {
        getViews(userId);
    }, 3000);
  }

  useEffect(() => {
    return () => {
        if (timer.current) clearInterval(timer.current);
    }
  }, []);

  return (
    <Card>
      <Group>
        <TextInput
          flex={1}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <Button onClick={startCount} loading={loading} disabled={loading}>Count</Button>
      </Group>

      {views.length > 0 && <SimpleGrid cols={3} mt="60px">
        {views.map(x => <Post data={x} key={x.id} />)}
      </SimpleGrid>}
    </Card>
  );
}
