import { Link } from 'react-router-dom';
import { MdOutlineTableRows } from 'react-icons/md';
import { MdOutlineDisabledByDefault } from 'react-icons/md';
import { GrUserWorker } from 'react-icons/gr';

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
          <img
            className="max-w-40 max-h-40 pb-4"
            src={process.env.PUBLIC_URL + '/diselLogo.png'}
            alt="logo de Disel Studio SL"
          />
          <p className="font-bold pb-2">ACM</p>
          <li className="self-start w-full">
            <div className="flex items-center space-x-2">
              <MdOutlineDisabledByDefault stroke="0.1" size={20} />
              <Link to="/Absence">Nueva ausencia</Link>
            </div>
            <div className="flex items-center space-x-2">
              <MdOutlineTableRows size={20} />
              <Link to="/dashboard">Tablero</Link>
            </div>
            <div className="flex items-center space-x-2">
              <GrUserWorker size={20} />
              <Link to="/employees">Empleados</Link>
            </div>
            <div>
              <Link to="/login">Login</Link>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};
