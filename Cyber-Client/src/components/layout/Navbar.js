import { Link } from 'react-router-dom';


const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h1>Communication_LTD</h1>
      </Link>
      <div className="links">
        <Link to="/login"> login </Link>
        <Link to="/register"> Register </Link>
      </div>
    </nav>
  );
}

export default Navbar;