import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TempForgot.css'; // Import the CSS file

const TempForgot = () => {
    const [uEmail, setuEmail] = useState(''); //user email
    const [isPending, setIsPending] = useState(false); //pending state
    //const navigate = useNavigate(); //useNavigate hook to programmatically navigate


    const handleSubmit = (e) => {
        e.preventDefault();
        const userEmail = { uEmail };
        setIsPending(true);

        // TODO. Create the right function for the temp password to be created(ben)
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
        //navigate('/forgot'); // Redirect to the forgot password page after submitting
    }

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