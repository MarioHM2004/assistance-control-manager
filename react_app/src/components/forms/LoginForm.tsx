import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await window.electron.ipcRenderer.invoke('login-admin', { username, password });

      if (response.success) {
        setLoginMessage({ message: response.message, type: 'success' });
        login();
        navigate('/dashboard');
      } else {
        setLoginMessage({ message: response.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginMessage({ message: 'Error interno del servidor', type: 'error' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="card w-full max-w-md bg-base-200 shadow-2xl rounded-lg p-8">
        <div className="card-body">
          <h2 className="text-center text-3xl font-bold text-primary mb-6">
            Iniciar Sesión
          </h2>
          <form onSubmit={handleLogin}>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Usuario</span>
              </label>
              <input
                type="text"
                placeholder="Introduzca su usuario"
                className="input input-bordered input-md"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-semibold">Contraseña</span>
              </label>
              <input
                type="password"
                placeholder="Introduzca su contraseña"
                className="input input-bordered input-md"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-control mt-12">
              <button type="submit" className="btn btn-primary btn-lg">
                Enviar
              </button>
            </div>
            {loginMessage && (
              <div className={`alert mt-4 ${loginMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                <span>{loginMessage.message}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
