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

function formatDate(dateStr: string) {
  return DateTime.fromISO(dateStr).toFormat("ff");
}

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
      setRuns(_.take(data.workflow_runs, 10));
    }, 3000);

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
            <Th>Name</Th>
            {/* <Th>Created At</Th> */}
            {/* <Th ta="center" w="25%">
              Updated At
            </Th> */}
            <Th ta="center" w="100">
              Status
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {runs.map((x) => (
            <Tr key={x.id}>
              <Td>
                <CopyButton value={x.name}>
                  {({ copied, copy }) => (
                    <Box
                      onClick={copy}
                      style={{
                        background: copied ? "green" : "none",
                      }}
                    >
                      {x.name}
                    </Box>
                  )}
                </CopyButton>
              </Td>
              {/* <Td ta="center">{formatDate(x.updated_at)}</Td> */}
              {!x.conclusion && <Td ta="center">{x.status}</Td>}
              {x.conclusion && (
                <Td ta="center">
                  {x.conclusion === "success" ? (
                    <Anchor
                      href={`/github/artifacts/${x.id}`}
                      target="_blank"
                      underline="never"
                    >
                      <ActionIcon variant="light" color="green">
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
