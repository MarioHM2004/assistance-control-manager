import { Link } from "react-router-dom";

export const SideBar: React.FC = () => {
  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side z-10">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 flex flex-col items-center">
          {/* Sidebar content here */}
          <img className="max-w-40 max-h-40 pb-4" src="/diselLogo.png" alt="logo de Disel Studio SL" />
          <p className="font-bold pb-2">ACM</p>
          <li>
            <Link to="/dashboard">Tablero</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

