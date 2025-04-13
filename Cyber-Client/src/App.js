import Navbar from './Navbar';
import Home from './Home';
import Register from './Register';
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NotFound from './NotFound';
import Login from './Login';
import TempForgot from './TempForgot';
import ChangePassword from './ChangePassword';
import SystemPage from './SystemPage';

function App() {
  return (
    <Router>
    <div className="App">
      <Navbar/>
      <div className="content">
      <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={ <Login/> } />
            <Route path="/register" element={<Register />} />
            <Route path="/tempforgot" element={<TempForgot />} />
            <Route path="/changePassword" element={<ChangePassword />} />
            <Route path="/system" element={<SystemPage />} />
            <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
    </div>
    </Router>
  );
}

export default App;
