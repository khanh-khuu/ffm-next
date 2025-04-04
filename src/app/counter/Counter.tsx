"use client";

import { Button, Card, Group, SimpleGrid, TextInput } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
// import { useLocalStorage } from "@mantine/hooks";
import LivePost from "./LivePost";
import { getUser } from "./_actions/getUser";

export default function Counter() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);

  // const [users, setUsers] = useLocalStorage<User[]>({
  //   key: "counter-users",
  //   defaultValue: [],
  // });

  const [users, setUsers] = useState<User[]>([]);

  async function getUsers() {
    const { data } = await axios.get(`/github/gist`);
    setUsers(data.users);
  }

  useEffect(() => {
    getUsers();
  }, []);

  async function updateUsers(newUser: User[]) {
    await axios.post(`/github/gist`, {
      users: newUser,
    });
  }

  async function fetchUser() {
    setLoading(true);

    const {id, userId, username, stats} = await getUser(userName);

    const newUsers = [ {id, userId, username, stats, avatar: ''}, ...users.filter(x => x.userId !== userId)];
    
    setUsers(newUsers);
    setUserName("");
    setLoading(false);
    updateUsers(newUsers);
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
        <Button onClick={fetchUser} loading={loading} disabled={loading} variant="light">
          Go
        </Button>
      </Group>

      {users.length > 0 && (
        <SimpleGrid
          mt="30px"
          cols={{
            md: 4,
            sm: 3,
            base: 2,
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
