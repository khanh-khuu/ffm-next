'use client'

import { ActionIcon, Button, Card, CloseButton, CopyButton, Group, Table } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { IconDownload, IconClipboard, IconClipboardCheck, IconShare } from '@tabler/icons-react';
import { modals } from "@mantine/modals";

const { Tbody, Thead, Tr, Td, Th } = Table;

export default function FileList() {
    const [files, setFiles] = useState<string[]>([]);

    async function remove(file: string) {
        modals.openConfirmModal({
            title: 'Confirm to delete file',
            children: 'Are you sure to delete this file?',
            centered: true,
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: async () => {
                await axios.get('/api/file/delete/' + file);
                const { data } = await axios.get('/api/file/list?random=' + Date.now());
                setFiles(data);
            }
        });
    }

    async function removeAll() {
        modals.openConfirmModal({
            title: 'Confirm to remove all files',
            children: 'Are you sure to remove all files?',
            centered: true,
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: async () => {
                await axios.get('/api/file/clear');
                const { data } = await axios.get('/api/file/list');
                setFiles(data);
            }
        });
    }

    useEffect(() => {
        const timer = setInterval(async () => {
            const { data } = await axios.get('/api/file/list');
            setFiles(data);
        }, 2000);

        return () => {
            clearInterval(timer);
        }
    });

    if (files.length === 0) return null;

    return (

        <Table>
            <Thead>
                <Tr>
                    <Th></Th>
                    <Th ta="right">
                        <Button onClick={removeAll} variant="transparent">Clear all</Button>
                    </Th>
                </Tr>
            </Thead>
            <Tbody>
                {files.map(file =>
                    <Tr key={file}>
                        <Td>{file}</Td>
                        <Td ta="right">

                            <CloseButton onClick={() => remove(file)} />
                            <ActionIcon variant="subtle" onClick={() => {
                                        window.open(`/api/file/${file}`, '_blank');
                                    }}><IconShare />
                                    </ActionIcon>

                                    <ActionIcon variant="subtle" onClick={() => {
                                        window.open(`/api/file/download/${file}`, '_blank');
                                    }}><IconDownload  />
                                    </ActionIcon>
                        </Td>
                    </Tr>
                )}
            </Tbody>
        </Table>

    )
}