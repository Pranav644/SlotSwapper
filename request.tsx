import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Requests() {
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    API.get('/swap-requests').then(res => {
      setIncoming(res.data.incoming);
      setOutgoing(res.data.outgoing);
    });
  }, [refresh]);

  function respond(id: number, accept: boolean) {
    API.post(`/swap-response/${id}`, { accept }).then(() => setRefresh(r => r + 1));
  }

  return (
    <div>
      <h2>Incoming Swap Requests</h2>
      <ul>
        {incoming.map(req => (
          <li key={req.id}>
            <b>{req.requester.name}</b> wants to swap:
            <br />
            Their slot: {req.mySlot.title} [{new Date(req.mySlot.startTime).toLocaleString()}]
            <br />
            For your slot: {req.theirSlot.title} [{new Date(req.theirSlot.startTime).toLocaleString()}]
            <br />
            Status: {req.status}
            {req.status === 'PENDING' && (
              <>
                <button onClick={() => respond(req.id, true)}>Accept</button>
                <button onClick={() => respond(req.id, false)}>Reject</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <h2>Outgoing Swap Requests</h2>
      <ul>
        {outgoing.map(req => (
          <li key={req.id}>
            To <b>{req.recipient.name}</b>: {req.mySlot.title} for {req.theirSlot.title}
            <br />
            Status: {req.status}
          </li>
        ))}
      </ul>
    </div>
  );
}