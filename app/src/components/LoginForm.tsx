export const LoginForm: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
    <div className="card w-96 bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="text-center text-2xl font-bold">Login</h2>
        <form>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Usuario</span>
            </label>
            <input
              type="text"
              placeholder="Introduzca su usuario"
              className="input input-bordered"
            />
          </div>
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Contraseña</span>
            </label>
            <input
              type="password"
              placeholder="Introduzca su contraseña"
              className="input input-bordered"
            />
          </div>
          <div className="form-control mt-6">
            <button className="btn btn-primary">Login</button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
}
