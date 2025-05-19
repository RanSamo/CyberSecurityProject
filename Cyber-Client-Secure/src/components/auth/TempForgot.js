import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TempForgot.css'; // Import the CSS file

const TempForgot = () => {
    const [uEmail, setuEmail] = useState(''); //user email
    const [isPending, setIsPending] = useState(false); //pending state
    const navigate = useNavigate(); //useNavigate hook to programmatically navigate

    const handleSubmit = (e) => {
        e.preventDefault();

        const userEmail = { uEmail };
        setIsPending(true);

        console.log("📤 Sending forgot password request:", JSON.stringify(userEmail));

        fetch('http://localhost:8001/users/request-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userEmail)
        })
            .then(res => res.json())
            .then(data => {
                console.log("📥 Server response:", data);

                if (data.success) {
                    console.log('✅ Password reset email sent successfully');
                    navigate('/reset-password'); 
                } else {
                    alert(data.message || 'Failed to request password reset');
                }
            })
            .catch(err => {
                console.error("Error during trying to getting token for changing password:", err);
                alert("Unable to connect to the server. Please try again later.");
            })
            .finally(() => {
                setIsPending(false);
            });
    };

    return (
        <div className="temp-forgot">
            <h2>Enter email to receive a temp password</h2>
            <form onSubmit={handleSubmit}>
                <label>User's Email:</label>
                <input type="email"
                    required
                    value={uEmail}
                    onChange={(e) => setuEmail(e.target.value)}
                />
                {!isPending && <button> Send Password </button>}
                {isPending && <button disabled> Loading... </button>}
                <div className="login-regi" >
                    <Link to="/register">Don't have an account? Register here</Link>
                </div>
            </form>
        </div>
    );
}

export default TempForgot;