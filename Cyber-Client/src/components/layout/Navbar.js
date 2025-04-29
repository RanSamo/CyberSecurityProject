import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../auth/AuthContext';
import './Navbar.css'; 

const Navbar = () => {
  const { isLoggedIn, logout, user } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h1>Communication_LTD</h1>
      </Link>
      <div className="links">
        {isLoggedIn ? (
          <>
          /* TODO. need to get the full name of the user from the backend and display it here. */
            <span className="welcome">Hello, {user?.email || 'user'}</span>
            <Link to="/change-password">Change Password</Link>
            <button onClick={logout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;