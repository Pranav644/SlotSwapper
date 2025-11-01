import React, { useEffect, useState } from 'react';
import API from '../api';
import EventForm from '../components/EventForm';

type Event = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
};

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    API.get('/events').then(res => setEvents(res.data));
  }, [refresh]);

  function updateStatus(id: number, status: string) {
    API.patch(`/event/${id}/status`, { status }).then(() => setRefresh(r => r + 1));
  }

  return (
    <div>
      <h2>My Calendar</h2>
      <EventForm onCreated={() => setRefresh(r => r + 1)} />
      <ul>
        {events.map(ev => (
          <li key={ev.id}>
            <b>{ev.title}</b> [{ev.status}]
            <br />
            {new Date(ev.startTime).toLocaleString()} - {new Date(ev.endTime).toLocaleString()}
            {ev.status === 'BUSY' && (
              <button onClick={() => updateStatus(ev.id, 'SWAPPABLE')}>Make Swappable</button>
            )}
            {ev.status === 'SWAPPABLE' && (
              <button onClick={() => updateStatus(ev.id, 'BUSY')}>Make Busy</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}