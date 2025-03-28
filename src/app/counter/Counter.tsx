"use client";

import { Button, Card, Group, SimpleGrid, TextInput } from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import LivePost from "./LivePost";

export default function Counter() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useLocalStorage<User[]>({
    key: "counter-users",
    defaultValue: [],
  });

  async function fetchUser() {
    setLoading(true);

    const { data } = await axios.get<CounterViewUser>(
      `/counter/user/${userName}`,
      {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
    setUsers([data, ...users.filter(x => x.userId !== data.userId)]);
    setUserName("");
    setLoading(false);
  }

  function deleteCard(user: User) {
    setUsers(users.filter((x) => x.id !== user.id));
  }

  return (
    <Card>
      <Group>
        <TextInput
          disabled={loading}
          flex={1}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchUser();
            }
          }}
        />
        <Button onClick={fetchUser} loading={loading} disabled={loading}>
          Count
        </Button>
      </Group>

      {users.length > 0 && (
        <SimpleGrid
          mt="30px"
          cols={{
            md: 3,
            xs: 2,
          }}
        >
          {users.map((x) => (
            <LivePost data={x} key={x.id} onDelete={deleteCard} />
          ))}
        </SimpleGrid>
      )}
    </Card>
  );
}
