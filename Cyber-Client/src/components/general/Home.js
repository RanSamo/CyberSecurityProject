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

        // Get token from localStorage or user object
        const token = localStorage.getItem("token") || (user && user.token);


        // Include user identifier in query params
        fetch(`http://localhost:8000/clients`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch clients');
                }
                return response.json();
            })
            .then(data => {
                console.log('Client data received:', data); 
                setClients(data.clients);
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
                        <h2>Welcome back, {user.fullName}!</h2> 
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
                                                <tr key={client.client_id}>
                                                    <td>{client.first_name} {client.last_name}</td>
                                                    <td>{client.email}</td>
                                                    <td>{client.phone}</td>
                                                    <td>{client.address}</td>
                                                    <td>{client.package}</td>
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