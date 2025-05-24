import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import { decode } from 'html-entities';
import "./Home.css";

const Home = () => {
    const { isLoggedIn, user } = useContext(AuthContext);
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // search state

    useEffect(() => {
        if (isLoggedIn) {
            fetchClients();
        }
    }, [isLoggedIn]);

    const fetchClients = () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("token") || (user && user.token);

        fetch(`http://localhost:8001/clients`, {
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

    // filter clients by full name - decode before searching for better UX
    const filteredClients = clients.filter(client => {
        const decodedFirstName = decode(client.first_name);
        const decodedLastName = decode(client.last_name);
        const fullName = `${decodedFirstName} ${decodedLastName}`;
        return fullName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this client?")) return;

        const token = localStorage.getItem("token") || (user && user.token);

        fetch(`http://localhost:8001/clients/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setClients(prev => prev.filter(c => c.client_id !== id));
                } else {
                    alert("❌ Failed to delete client.");
                }
            })
            .catch(err => {
                console.error("❌ Error deleting client:", err);
                alert("❌ Server error during delete.");
            });
    };

    return (
        <div className="home">
            {isLoggedIn ? (
                <>
                    <div className="home-header">
                        <h2>Welcome back, {user?.fullName ? decode(user.fullName) : 
                   (user?.firstName && user?.lastName) ? 
                   `${decode(user.firstName)} ${decode(user.lastName)}` : 
                   "User"}!</h2>
                        <p>Manage your client database below</p>
                    </div>

                    <div className="client-actions">
                        <Link to="/system" className="add-client-btn">Add New Client</Link>
                        <button className="refresh-btn" onClick={fetchClients} disabled={isLoading}>
                            {isLoading ? 'Refreshing...' : 'Refresh List'}
                        </button>
                    </div>

                    {/* search input */}
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {isLoading ? (
                        <div className="loading">Loading clients...</div>
                    ) : (
                        <>
                            {filteredClients.length > 0 ? (
                                <div className="client-table-container">
                                    <table className="client-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Address</th>
                                                <th>Package</th>
                                                <th>Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredClients.map((client) => (
                                                <tr key={client.client_id}>
                                                    {/* SECURE VERSION - Decode ALL fields for user-friendly display */}
                                                    <td>{decode(client.first_name)} {decode(client.last_name)}</td>
                                                    <td>{decode(client.email)}</td>
                                                    <td>{decode(client.phone)}</td>
                                                    <td>{decode(client.address)}</td>
                                                    <td>{decode(client.package)}</td>
                                                    <td>
                                                        <button className="delete-btn" onClick={() => handleDelete(client.client_id)}>
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-clients">
                                    <p>No clients found for the search term.</p>
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