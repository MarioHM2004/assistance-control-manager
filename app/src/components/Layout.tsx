import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export const Layout: React.FC = () => {
  return (
    <div>
      <p>This fucking layout is working</p>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/work">Work</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  )
}
