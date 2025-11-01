import React, { useState } from 'react';
import API from '../api';

export default function EventForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [startTime, setStart] = useState('');
  const [endTime, setEnd] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await API.post('/event', { title, startTime, endTime });
    setTitle('');
    setStart('');
    setEnd('');
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
      <input value={startTime} onChange={e => setStart(e.target.value)} type="datetime-local" required />
      <input value={endTime} onChange={e => setEnd(e.target.value)} type="datetime-local" required />
      <button type="submit">Add Event</button>
    </form>
  );
}