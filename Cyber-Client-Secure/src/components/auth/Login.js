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
    const [errorMessage, setErrorMessage] = useState(''); //error message state;

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = { uEmail : email, password: password };
        console.log(user);
        setIsPending(true);

        console.log("📤 Sending login request:", JSON.stringify(user)); // writing Log showing the user creds.
        fetch('http://localhost:8001/users/login', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('User Logged in successfully:', data);
                
                // Create a user object with the structure your frontend expects
                const userData = {
                    id: data.userId,
                    fname: data.firstName, // Use the first name from response
                    lname: data.lastName, // Use the last name from response
                    fullName: `${data.firstName} ${data.lastName}`, // Combine first and last name
                    email: data.email,  // Use the email from response
                    token: data.token // Store the JWT token
                };
                login(userData); // Pass the structured user data to AuthContext
                setIsPending(false);
                navigate('/'); // Redirect to home page after successful login 
            } else {
                console.error('Error logging in user:', data.message);
                setIsPending(false);
                alert(data.message ||'Failed to log in. Please check your credentials.');
            }
        })
        .catch(err => {
            console.error('Error during login:', err);
            setIsPending(false);
            setErrorMessage('Unable to connect to the server. Please try again later.');
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
                {errorMessage && <div className="error-message">{errorMessage}</div>}

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