import { Box, Button } from "@mantine/core";
import Home from "@/components/home";
import Link from "next/link";
// import { getAvatars } from "./lib/avatar";
import FileList from "./file-list";
import Maker from "./maker";

export default function HomePage() {
  // const avatars = getAvatars();

  return (
    <Box>
      {/* <Button>Xin chào</Button> */}
      {/* <Link href="/avatar">Avatar v1.0.1</Link> */}
      {/* <Home avatars={avatars} /> */}
      <Maker />
      <FileList />
    </Box>
  );
}
