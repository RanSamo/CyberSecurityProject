import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../auth/AuthContext';
import './Navbar.css'; 
import { decode } from 'html-entities';

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
            {/* Decode the user's name since it comes encoded from backend */}
            <span className="welcome">
              Hello, {user?.fullName ? decode(user.fullName) : 
                     (user?.firstName && user?.lastName) ? 
                     `${decode(user.firstName)} ${decode(user.lastName)}` : 
                     'user'}
            </span>
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