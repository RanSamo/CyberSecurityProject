import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Import the CSS file

const Register = () => {
    const [fName, setfName] = useState(''); //first name
    const [lName, setlName] = useState(''); //last name
    const [Password, setPassword] = useState(''); //password
    const [rePassword, setrePassword] = useState(''); //re-enter password
    const [email, setuEmail] = useState(''); //user email
    const [isPending, setIsPending] = useState(false); //pending state
    const navigate = useNavigate(); //useNavigate hook to programmatically navigate



    const handleSubmit = (e) => {
        e.preventDefault();

        if (Password !== rePassword) {
            alert("Passwords do not match");
            return;
        }

        const user = {
            firstName: fName,
            lastName: lName,
            uEmail: email,
            password: Password,
        };

        setIsPending(true);

        console.log("📤 Sending registration data:", JSON.stringify(user));

        fetch('http://localhost:8001/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        })
            .then(res => res.json())
            .then(data => {
                console.log("📥 Server response:", data);

                if (data.success) {
                    console.log('✅ Registration successful');
                    navigate('/login');
                } else {
                    alert(data.message || 'Registration failed');
                }
            })
            .catch(err => {
                console.warn("⚠️ Server not available, simulating response...");
                const fakeResponse = {
                    success: true,
                    userId: 101,
                    uEmail: email
                };
                console.log("📥 Simulated response:", fakeResponse);
                alert("Simulated registration complete");
                navigate('/login');
            })
            .finally(() => {
                setIsPending(false);
            });
    };


    return (
        <div className="register">
            <h2>Create a new user</h2>
            <form onSubmit={handleSubmit}>
                <label>First Name:</label>
                <input
                    type="text"
                    required
                    value={fName}
                    onChange={(e) => setfName(e.target.value)}
                />
                <label>Last Name:</label>
                <input
                    type="text"
                    required
                    value={lName}
                    onChange={(e) => setlName(e.target.value)}
                />
                <label>Strong Password:</label>
                <input
                    type="password"
                    required
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <label>Rewrite Password:</label>
                <input
                    type="password"
                    required
                    value={rePassword}
                    onChange={(e) => setrePassword(e.target.value)}
                />
                <label>User's Email:</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setuEmail(e.target.value)}
                />
                {!isPending && <button>Register</button>}
                {isPending && <button disabled>Adding user...</button>}
            </form>
        </div>
    );
}

export default Register;