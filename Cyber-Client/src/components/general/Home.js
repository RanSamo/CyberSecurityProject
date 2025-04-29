import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import "./Home.css";

const Home = () => {
    const { isLoggedIn, user } = useContext(AuthContext);
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch clients data when component mounts and user is logged in
    useEffect(() => {
        if (isLoggedIn) {
            fetchClients();
        }
    }, [isLoggedIn]);

    const fetchClients = () => {
        setIsLoading(true);
        setError(null);

        // Get user email to identify which clients to fetch
        const userEmail = user?.email; 

        // Include user identifier in query params
        fetch(`http://localhost:8000/clients?userEmail=${encodeURIComponent(userEmail)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Token-based auth will be added later
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch clients');
                }
                return response.json();
            })
            .then(data => {
                setClients(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching clients:', err);
                setError('Failed to load clients. Please try again later.');
                setIsLoading(false);
            });
    };

    return (
        <div className="home">
            {isLoggedIn ? (
                <>
                    <div className="home-header">
                    /* TODO. need to get the full name of the user from the backend and display it here. */
                        <h2>Welcome back, {user.email}!</h2> 
                        <p>Manage your client database below</p>
                    </div>

                    <div className="client-actions">
                        <Link to="/system" className="add-client-btn">Add New Client</Link>
                        <button className="refresh-btn" onClick={fetchClients} disabled={isLoading}>
                            {isLoading ? 'Refreshing...' : 'Refresh List'}
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {isLoading ? (
                        <div className="loading">Loading clients...</div>
                    ) : (
                        <>
                            {clients.length > 0 ? (
                                <div className="client-table-container">
                                    <table className="client-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Address</th>
                                                <th>Package</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clients.map((client) => (
                                                <tr key={client.id}>
                                                    <td>{client.firstName} {client.lastName}</td>
                                                    <td>{client.cEmail}</td>
                                                    <td>{client.phoneNumber}</td>
                                                    <td>{client.address}</td>
                                                    <td>{client.packageLevel}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-clients">
                                    <p>No clients found. Add your first client to get started!</p>
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                <div className="welcome-container">
                    <h2>Welcome to Communication_LTD</h2>
                    <p>Providing high-speed internet packages tailored to your needs</p>
                    <p>Please login to manage your clients and services</p>
                    <div className="auth-buttons">
                        <Link to="/login" className="auth-btn login-btn">Login</Link>
                        <Link to="/register" className="auth-btn register-btn">Register</Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;