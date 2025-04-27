import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/general/Home'
import Register from './components/auth/Register';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NotFound from './NotFound';
import Login from './components/auth/Login';
import TempForgot from './components/auth/TempForgot';
import ChangePassword from './components/auth/ChangePassword';
import SystemPage from './components/general/SystemPage';
import { AuthProvider } from './components/auth/AuthContext'; // Import AuthProvider

function App() {
  return (
    <AuthProvider> {/* Wrap the entire app with AuthProvider */}
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tempforgot" element={<TempForgot />} />
            <Route path="/changePassword" element={<ChangePassword />} />
            <Route path="/system" element={<SystemPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
    </AuthProvider> // Close AuthProvider
  );
}

export default App;