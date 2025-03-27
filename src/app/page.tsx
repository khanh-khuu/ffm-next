import { Box, Card } from "@mantine/core";
import FileList from "./file-list";
import Maker from "./maker";
import { getAvatars } from "./lib/avatar";

export default function HomePage() {
  const avatars = getAvatars();

  return (
    <Box style={{ maxWidth: 900 }} mx="auto" my="xl">
      <Card>
        <Maker avatars={avatars} />
        <Box mt="xl">
          <FileList />
        </Box>
      </Card>
    </Box>
  );
}
