import { useState } from 'react';
import { data, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './AuthContext'; 
import './Login.css'; // Import the CSS file

const Login = () => {
    const { login } = useContext(AuthContext); // Get the Login function from AuthContext
    const [password, setPassword] = useState(''); //password
    const [email, setuEmail] = useState(''); //user email
    const [isPending, setIsPending] = useState(false); //pending state
    const navigate = useNavigate(); //useNavigate hook to programmatically navigate


    const handleSubmit = (e) => {
        e.preventDefault();
        const user = { uEmail : email, password: password };
        console.log(user);
        setIsPending(true);

        // Create the right call for the backend checking for user credentials(Ran did instead of Ben, my bad.)
        fetch('http://localhost:8000/users/login', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('User Logged in successfully:', data);
                login(data.user); // Call the login function from AuthContext
                setIsPending(false);
                navigate('/'); // Redirect to home page after successful login 
            } else{
                console.error('Error logging in user:', data.message);
                setIsPending(false);
                alert('Failed to log in. Please check your credentials.');
            }
        })
        .catch(error => {
            console.error('Error logging in user:', error);
        });
        
    }

    return (
        <div className="login">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email"
                    required
                    value={email}
                    onChange={(e) => setuEmail(e.target.value)}
                />
                <label>Password:</label>
                <input type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <div className="forgot-password-link">
                    <Link to="/TempForgot">Forgot Password?</Link>
                </div>
                {!isPending && <button> Login </button>}
                {isPending && <button disabled> Loading... </button>}
                <div className="login-regi" >
                    <Link to="/register">Don't have an account? Register here</Link>
                </div>
            </form>
        </div>
    );
}

export default Login;