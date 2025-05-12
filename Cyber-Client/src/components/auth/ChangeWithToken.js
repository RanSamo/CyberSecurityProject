import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../auth/AuthContext';
import './ChangeWithToken.css';

const ChangeWithToken = () => {
    const { getAuthHeader } = useContext(AuthContext);
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [reNewPassword, setReNewPassword] = useState('');
    const [isPending, setIsPending] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // שליפה אוטומטית של הטוקן מה-URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenFromURL = params.get('token');
        if (tokenFromURL) {
            setToken(tokenFromURL);
        }
    }, [location]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (newPassword !== reNewPassword) {
            alert("New passwords do not match. Please try again.");
            return;
        }

        const passwordChangeRequest = {
            token,  // שים לב לאות קטנה - זה חשוב
            newPassword
        };

        setIsPending(true);

        fetch('http://localhost:8000/users/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(passwordChangeRequest)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('Password changed successfully!');
                    navigate('/login');
                } else {
                    alert(data.message || 'Password change failed');
                }
            })
            .catch(err => {
                console.error('Server error:', err);
                alert('Error occurred while changing password');
            })
            .finally(() => {
                setIsPending(false);
            });
    };

    return (
        <div className="reset-password">
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit}>
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
            </form>
        </div>
    );
};

export default ChangeWithToken;
