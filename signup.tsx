import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await API.post('/signup', { name, email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/calendar');
    } catch {
      alert('Signup failed');
    }
  }

  return (
    <form onSubmit={handleSignup}>
      <h2>Signup</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required type="email" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required type="password" />
      <button type="submit">Sign Up</button>
    </form>
  );
}