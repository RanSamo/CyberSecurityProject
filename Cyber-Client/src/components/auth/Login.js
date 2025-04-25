import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file

const Login = () => {
    const [Password, setPassword] = useState(''); //password
    const [uEmail, setuEmail] = useState(''); //user email
    const [isPending, setIsPending] = useState(false); //pending state
    const navigate = useNavigate(); //useNavigate hook to programmatically navigate


    const handleSubmit = (e) => {
        e.preventDefault();
        const user = { uEmail, Password };
        setIsPending(true);

        // TODO. Create the right call for the backend checking for user credentials(Ben)
        // fetch('http://localhost:8000/blogs', {
        //     method: 'POST',
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify(user)
        // })
        // .then(() => {
        //     console.log('New blog added');
        //     setIsPending(false);
        //     navigate('/'); // Redirect to the home page after adding the blog
        // });
    }

    return (
        <div className="login">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email"
                    required
                    value={uEmail}
                    onChange={(e) => setuEmail(e.target.value)}
                />
                <label>Password:</label>
                <input type="password"
                    required
                    value={Password}
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