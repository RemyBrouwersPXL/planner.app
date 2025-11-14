// src/components/Login.jsx
import React, { useState } from 'react';
import { signIn, signUp } from '../services/authService';
import { Button, TextField, Box } from '@mui/material';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async () => {
    try {
      if (isRegister) {
        await signUp(email, password);
        alert('Registratie gelukt! Check je e-mail.');
      } else {
        await signIn(email, password);
        onLogin(); // gebruiker ingelogd
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 300, margin: 'auto', mt: 10 }}>
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Wachtwoord" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" onClick={handleSubmit}>{isRegister ? 'Registreer' : 'Login'}</Button>
      <Button variant="text" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Al een account? Login' : 'Nog geen account? Registreer'}
      </Button>
    </Box>
  );
}
