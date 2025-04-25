import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ChangePassword.css'; // Import the CSS file

const ChangePassword = () => {
    const [uEmail, setuEmail] = useState(''); //user email
    const [currentPassword, setCurrentPassword] = useState(''); // Current Password either temp from forgot or 
    // the one that was set by the user.
    const [newPassword, setNewPassword] = useState(''); // New password to be set
    const [reNewPassword, setReNewPassword] = useState(''); // Re-enter new password to check for typos
    const [isPending, setIsPending] = useState(false); //pending state
    //const navigate = useNavigate(); //useNavigate hook to programmatically navigate


    const handleSubmit = (e) => {
        e.preventDefault();
        const userCreds = { uEmail, currentPassword, newPassword };
        setIsPending(true);

        if (newPassword !== reNewPassword) {
            alert("New passwords do not match. Please try again.");
            setIsPending(false);
            return;
        }

        // TODO. Create the right function for the changePassword  to be created(Ran)
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
        //navigate('/Login'); // Redirect to the forgot password page after submitting
    }

    return (
        <div className="change-password">
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit}>
                <label>User's Email:</label>
                <input type="email"
                    required
                    value={uEmail}
                    onChange={(e) => setuEmail(e.target.value)}
                />
                <label>Current Password:</label>
                <input type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <label>New Password:</label>
                <input type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <label> Rewrite Password:</label>
                <input type="password"
                    required
                    value={reNewPassword}
                    onChange={(e) => setReNewPassword(e.target.value)}
                />
                {!isPending && <button> Submit Password Change </button>}
                {isPending && <button disabled> Loading... </button>}
                <div className="login-regi" >
                    <Link to="/register">Don't have an account? Register here</Link>
                </div>
            </form>
        </div>
    );
}

export default ChangePassword;