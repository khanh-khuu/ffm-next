import { ActionIcon, Anchor, Box, CopyButton, Table } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";

const { Tbody, Tr, Td, Thead, Th } = Table;

export default function FileList() {
  const [runs, setRuns] = useState<Workflowrun[]>([]);

  function playSound() {
    const audio = document.getElementById("notificationSound");
    (audio! as HTMLAudioElement).pause();
    (audio! as HTMLAudioElement).currentTime = 0;
    (audio! as HTMLAudioElement).play();
  }

  useEffect(() => {
    axios.get<WorkflowrunResponse>("/github/runs").then(({ data }) => {
      setRuns(data.workflow_runs);
    });

    const timer = setInterval(async () => {
      const { data } = await axios.get<WorkflowrunResponse>("/github/runs");
      setRuns(data.workflow_runs);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <Box>
      <audio id="notificationSound" src="/done.mp3"></audio>
      <Table layout="fixed">
        <Thead>
          <Tr>
            {/* <Th>Run ID</Th> */}
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Conclusion</Th>
            <Th>Created At</Th>
            <Th>Updated At</Th>
            <Th w="60">Artifact</Th>
          </Tr>
        </Thead>
        <Tbody>
          {runs.map((x) => (
            <Tr key={x.id}>
              {/* <Td>{x.id}</Td> */}
              <Td>
                <CopyButton value={x.name}>
                  {() => <span>{x.name}</span>}
                </CopyButton>
              </Td>
              <Td>{x.status}</Td>
              <Td>{x.conclusion}</Td>
              <Td>{x.created_at}</Td>
              <Td>{x.updated_at}</Td>
              <Td ta="center">
                {x.conclusion === "success" && (
                  <Anchor
                    href={`/github/artifacts/${x.id}`}
                    target="_blank"
                    underline="never"
                  >
                    <ActionIcon>
                      <IconDownload />
                    </ActionIcon>
                  </Anchor>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
