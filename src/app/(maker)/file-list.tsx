"use client";

import { ActionIcon, Anchor, Box, CopyButton, Table } from "@mantine/core";
import {
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconDownload,
} from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import _ from "lodash";

const { Tbody, Tr, Td, Thead, Th } = Table;

// function formatDate(dateStr: string) {
//   return DateTime.fromISO(dateStr).toFormat("ff");
// }

export default function FileList() {
  const [runs, setRuns] = useState<Workflowrun[]>([]);

  // function playSound() {
  //   const audio = document.getElementById("notificationSound");
  //   (audio! as HTMLAudioElement).pause();
  //   (audio! as HTMLAudioElement).currentTime = 0;
  //   (audio! as HTMLAudioElement).play();
  // }

  useEffect(() => {
    axios.get<WorkflowrunResponse>("/github/runs").then(({ data }) => {
      setRuns(_.take(data.workflow_runs, 10));
    });

    const timer = setInterval(async () => {
      const { data } = await axios.get<WorkflowrunResponse>("/github/runs");
      setRuns(_.take(data.workflow_runs, 10));
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  if (runs.length === 0) return null;

  return (
    <Box>
      {/* <audio id="notificationSound" src="/done.mp3"></audio> */}
      <Table layout="fixed" mt="50px">
        {/* <Thead>
          <Tr>
            <Th>Name</Th>
            <Th ta="center" w="100">
              Status
            </Th>
          </Tr>
        </Thead> */}
        <Tbody>
          {runs.map((x, idx) => (
            <Tr key={x.id}>
              <Td p="0">
                
                <CopyButton value={x.name + ' '}>
                  {({ copied, copy }) => (
                    <Box
                      onClick={copy}
                      style={{
                        width: '100%',
                        height: '100%',
                        background: copied ? "green" : "none",
                      }}
                    >
                      {idx + 1}. {x.name}
                    </Box>
                  )}
                </CopyButton>
              </Td>
              {/* <Td ta="center">{formatDate(x.updated_at)}</Td> */}
              {!x.conclusion && (
                <Td ta="center" w="100">
                  {x.status}
                </Td>
              )}
              {x.conclusion && (
                <Td ta="center" w="100">
                  {x.conclusion === "success" ? (
                    <Anchor
                      href={`/github/artifacts/${x.id}`}
                      download
                      underline="never"
                    >
                      <ActionIcon variant="transparent" color="green">
                        <IconDownload />
                      </ActionIcon>
                    </Anchor>
                  ) : x.conclusion === "failure" ? (
                    <IconAlertTriangle color="red" />
                  ) : (
                    x.conclusion
                  )}
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
