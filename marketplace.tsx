import React, { useEffect, useState } from 'react';
import API from '../api';

type Event = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  owner: { name: string; email: string };
};

type MyEvent = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
};

export default function Marketplace() {
  const [slots, setSlots] = useState<Event[]>([]);
  const [mySlots, setMySlots] = useState<MyEvent[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);

  useEffect(() => {
    API.get('/swappable-slots').then(res => setSlots(res.data));
    API.get('/events').then(res => setMySlots(res.data.filter((ev: MyEvent) => ev.status === 'SWAPPABLE')));
  }, []);

  function requestSwap(theirSlotId: number, mySlotId: number) {
    API.post('/swap-request', { theirSlotId, mySlotId }).then(() => {
      alert('Swap requested!');
      setChosen(null);
    });
  }

  return (
    <div>
      <h2>Swappable Slots Marketplace</h2>
      <ul>
        {slots.map(slot => (
          <li key={slot.id}>
            <b>{slot.title}</b> [{slot.owner.name} | {new Date(slot.startTime).toLocaleString()}]
            <button onClick={() => setChosen(slot.id)}>Request Swap</button>
            {chosen === slot.id && (
              <div>
                <h4>Pick one of your swappable slots to offer:</h4>
                <ul>
                  {mySlots.length === 0 && <span>No swappable slots</span>}
                  {mySlots.map(ms => (
                    <li key={ms.id}>
                      {ms.title} [{new Date(ms.startTime).toLocaleString()}]
                      <button onClick={() => requestSwap(slot.id, ms.id)}>Offer this slot</button>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setChosen(null)}>Cancel</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}