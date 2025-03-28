"use client";

import { Button, Card, Flex, Group, SimpleGrid, TextInput } from "@mantine/core";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Post from "./Post";
import { useLocalStorage } from "@mantine/hooks";
import UserCard from "./User";

export default function Counter() {
  const [userName, setUserName] = useState("");
  const [views, setViews] = useState<UserDatum[]>([]);
  const timer = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useLocalStorage<User[]>({
    key: 'counter-users',
    defaultValue: [],
  });
  
  async function getViews(userId: string) {
    const {data: {userData}} = await axios.get<CounterViewResponse>(`/counter/view/${userId}`);
        setViews(userData.slice(0, 9));
  }
  async function startCount() {
    setLoading(true);
    if (timer.current) clearInterval(timer.current);
    
    const {data} = await axios.get<CounterViewUser>(`/counter/user/${userName}`);
    
    if (users.every(x => x.userId !== data.userId)) {
        setUsers(val => val.slice(-6).concat({
            userId: data.userId,
            username: data.username,
            avatar: data.avatar,
        }));
    }

    await getViews(data.userId);
    setLoading(false);
    timer.current = window.setInterval(async () => {
        getViews(data.userId);
    }, 5000);
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
                startCount();
            }
          }}
        />
        <Button onClick={startCount} loading={loading} disabled={loading}>Count</Button>
      </Group>

      {users.length > 0 && <Group justify="center" align="center" gap="xs" mt="md">
          {users.map(x => <UserCard key={x.userId} data={x} onClick={(username) => {
            setUserName(username);
            startCount();
          }} />) }
      </Group> }

      {views.length > 0 && <SimpleGrid
        mt="66px"
        cols={{
          lg: 4,
          md: 3,
          sm: 3,
          xs: 2,
        }}
      >
        {views.map(x => <Post data={x} key={x.id} />)}
      </SimpleGrid>}
    </Card>
  );
}
