import { useState } from 'react';
import Logo from '../components/Logo/Logo';
import { adminApi } from './api';
import './AdminLogin.css';

export default function AdminLogin({ configured, onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await adminApi.login(password);
      onLogin();
    } catch (loginError) {
      setError(loginError.message);
      setPending(false);
    }
  };

  return (
    <main className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <Logo className="admin-login__logo" />
        <h1 className="admin-login__title">Espace administrateur</h1>
        {configured === false ? (
          <p className="admin-error">Espace non configuré : définissez ADMIN_PASSWORD dans les variables d’environnement.</p>
        ) : (
          <>
            <label className="admin-field">
              Mot de passe
              <input
                className="admin-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                required
              />
            </label>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="admin-button admin-button--primary admin-login__submit" disabled={pending || !password}>
              {pending ? 'Connexion…' : 'Se connecter'}
            </button>
          </>
        )}
        <a className="admin-link admin-link--muted" href="/">
          ← Retour au site
        </a>
      </form>
    </main>
  );
}
