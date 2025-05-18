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

// TODO. need to modify the BE to return the userId, firstName, lastName and email in the response.
    const handleSubmit = (e) => {
        e.preventDefault();
        const user = { uEmail : email, password: password };
        console.log(user);
        setIsPending(true);

        // TODO. VULNERABLE VERSION of login send to BE
        fetch(`http://localhost:8000/users/login?email=${email}&password=${password}`, {
            method: 'GET',
            headers: { "Content-Type": "application/json" },
            })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('User Logged in successfully:', data);
                
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
        
    }

    return (
        <div className="login">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                {/* TODO. this is the vunerable email- with text type instead of email*/}
                <label>Email:</label>
                <input type="text"
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