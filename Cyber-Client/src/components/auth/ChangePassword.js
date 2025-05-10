import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ChangePassword.css'; // Import the CSS file

const ChangePassword = () => {
    const [uEmail, setuEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [reNewPassword, setReNewPassword] = useState('');
    const [isPending, setIsPending] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (newPassword !== reNewPassword) {
            alert("New passwords do not match. Please try again.");
            return;
        }

        const passwordChangeRequest = {
            uEmail,
            currentPassword,
            newPassword
        };

        setIsPending(true);

        console.log("📤 Sending password change request:", JSON.stringify(passwordChangeRequest));

        fetch('http://localhost:8000/users/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(passwordChangeRequest)
        })
            .then(res => res.json())
            .then(data => {
                console.log("📥 Server response:", data);

                if (data.success) {
                    console.log('✅ Password changed successfully');
                    alert('Password changed successfully!');
                    navigate('/login');
                } else {
                    alert(data.message || 'Password change failed');
                }
            })
            .catch(err => {
                console.warn('⚠️ Server not available, simulating response...');
                const simulatedResponse = { success: true, message: 'Simulated password change success' };
                console.log('🧪 Simulated response:', simulatedResponse);
                alert(simulatedResponse.message);
            })
            .finally(() => {
                setIsPending(false);
            });
    };

    return (
        <div className="change-password">
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit}>
                <label>User's Email:</label>
                <input
                    type="email"
                    required
                    value={uEmail}
                    onChange={(e) => setuEmail(e.target.value)}
                />

                <label>Current Password:</label>
                <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <label>New Password:</label>
                <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <label>Rewrite Password:</label>
                <input
                    type="password"
                    required
                    value={reNewPassword}
                    onChange={(e) => setReNewPassword(e.target.value)}
                />

                {!isPending && <button>Submit Password Change</button>}
                {isPending && <button disabled>Loading...</button>}

                <div className="login-regi">
                    <Link to="/register">Don't have an account? Register here</Link>
                </div>
            </form>
        </div>
    );
}

export default ChangePassword;
