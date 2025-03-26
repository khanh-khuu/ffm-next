import { Box } from "@mantine/core";
import Link from 'next/link';
import { getAvatars } from "../lib/avatar";

export default function AvatarPage() {
    const avatars = getAvatars();

    return (<Box>
        <Link href="/">Home</Link>
        Xin chào: {JSON.stringify(avatars)}
    </Box>)
}