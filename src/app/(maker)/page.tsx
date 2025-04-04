import { Box, Card } from "@mantine/core";
import FileList from "./file-list";
import Maker from "./maker";

export default function HomePage() {

  return (
    <Box style={{ maxWidth: 900 }} mx="auto" my="xl">
      <Card>
        <Maker />
        <FileList />
      </Card>
    </Box>
  );
}
