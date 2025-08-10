import React, { useEffect, useState } from 'react';
import { Popover, ActionIcon, Indicator, Box, Group, Text, ScrollArea, Button, Loader } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { useEnoki } from './EnokiContext';

async function fetchNotifications(wallet) {
  const res = await fetch(`http://localhost:5000/api/notifications?wallet_address=${encodeURIComponent(wallet)}`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

async function markRead(wallet, ids) {
  await fetch('http://localhost:5000/api/notifications/mark-read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet_address: wallet, ids })
  });
}

export default function NotificationsPopover() {
  const { address } = useEnoki();
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!opened || !address) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchNotifications(address);
        if (!cancelled) setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [opened, address]);

  const unreadCount = items.filter(n => !n.is_read).length;

  const handleMarkAll = async () => {
    if (!address) return;
    const ids = items.filter(n => !n.is_read).map(n => n.id);
    if (ids.length === 0) return;
    await markRead(address, ids);
    setItems(prev => prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n));
  };

  return (
    <Popover opened={opened} onChange={setOpened} width={360} position="bottom-end" withArrow shadow="md">
      <Popover.Target>
        <Indicator inline label={unreadCount || null} size={18} disabled={unreadCount === 0} color="red">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            aria-label="Notifications"
            onClick={() => setOpened((v) => !v)}
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>
      <Popover.Dropdown>
        <Group justify="space-between" mb="xs">
          <Text fw={600}>Notifications</Text>
          <Button size="xs" variant="subtle" onClick={handleMarkAll} disabled={unreadCount === 0}>Mark all read</Button>
        </Group>
        {loading ? (
          <Group justify="center" py="md"><Loader size="sm" /></Group>
        ) : (
          <ScrollArea h={260} type="auto">
            {items.length === 0 ? (
              <Text c="dimmed" size="sm">No notifications</Text>
            ) : (
              items.map((n) => (
                <Box key={n.id} p="sm" mb="xs" style={{ background: n.is_read ? '#fff' : '#f8f9fa', borderRadius: 8, border: '1px solid #eee' }}>
                  <Text fw={600} size="sm">{n.title}</Text>
                  <Text size="sm">{n.body}</Text>
                  <Text size="xs" c="dimmed">{new Date(n.created_at).toLocaleString()}</Text>
                </Box>
              ))
            )}
          </ScrollArea>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}


