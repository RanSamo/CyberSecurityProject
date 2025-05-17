import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import AuthContext from '../auth/AuthContext'; // Import AuthContext
import './SystemPage.css';

const SystemPage = () => {
    // Get auth context and navigation
    const { isLoggedIn, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login'); // Redirect to login page if not logged in
        }
    }, [isLoggedIn, navigate]);

    // State for form inputs
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [cEmail, setCEmail] = useState('');
    const [packageLevel, setPackageLevel] = useState('100 Mb');

    // State to store the newly added client for display
    const [newClient, setNewClient] = useState(null);

    // State for submission status
    const [isPending, setIsPending] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create client object
        const clientData = {
            firstName,
            lastName,
            phoneNumber,
            address,
            cEmail,
            packageLevel
        };

        setIsPending(true);

        // Get token from localStorage or user object
        const token = localStorage.getItem("token") || (user && user.token);

        fetch('http://localhost:8000/system', {
            method: 'POST',
            headers: { 
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(clientData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Client was added successfully:', data);
                setIsPending(false);
                
                // Set the new client data for display
                setNewClient({
                    ...clientData,
                    fullName: `${firstName} ${lastName}`
                });

                // Show confirmation message
                setShowConfirmation(true);

                // Reset form fields
                setFirstName('');
                setLastName('');
                setPhoneNumber('');
                setAddress('');
                setCEmail('');
                setPackageLevel('100 Mb');

                // Hide confirmation after 5 seconds
                setTimeout(() => {
                    setShowConfirmation(false);
                }, 10000);
            } else {
                console.error('Error while adding a client:', data.message);
                setIsPending(false);
                alert('Failed to add client, please check what is missing.');
            }
        })
        .catch(error => {
            console.error('Error adding a client:', error);
            setIsPending(false);
            alert('Failed to add client. Please try again.');
        });
    };

    // Helper function to get package description
    const getPackageDescription = (level) => {
        switch (level) {
            case '100 Mb':
                return '100 Mb';
            case '200 Mb':
                return '200 Mb';
            case '300 Mb':
                return '300 Mb';
            default:
                return 'Unknown';
        }
    };

    // Don't render anything while checking auth status or if not logged in
    if (!isLoggedIn) {
        return null; // Or return a loading spinner
    }

    return (
        <div className="system-page">
            <h2>System Management</h2>
            
            {/* Optional welcome message showing logged-in user */}
            <p className="welcome-message">Welcome, {user.uEmail}</p>

            {/* Display the newly added client */}
            {showConfirmation && newClient && (
                <div className="confirmation-message">
                    <h3>New Client Added Successfully!</h3>
                    <div className="client-details">
                        <p><strong>Name:</strong> {newClient.fullName}</p>
                    {/* TODO. This is the vunerable version.
                    <p><strong>Name:</strong> <span dangerouslySetInnerHTML={{ __html: newClient.fullName }}></span></p> */}
                        <p><strong>Phone:</strong> {newClient.phoneNumber}</p>
                        <p><strong>Address:</strong> {newClient.address}</p>
                        <p><strong>Email:</strong> {newClient.cEmail}</p>
                        <p><strong>Package Level:</strong> {getPackageDescription(newClient.packageLevel)}</p>
                    </div>
                </div>
            )}

            <div className="add-client-section">
                <h3>Add New Client</h3>
                <form onSubmit={handleSubmit}>
                    <label>First Name:</label>
                    <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />

                    <label>Last Name:</label>
                    <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />

                    <label>Phone Number:</label>
                    <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />

                    <label>Address:</label>
                    <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />

                    <label>Client Email:</label>
                    <input
                        type="email"
                        required
                        value={cEmail}
                        onChange={(e) => setCEmail(e.target.value)}
                    />

                    <label>Client Package:</label>
                    <select
                        value={packageLevel}
                        onChange={(e) => setPackageLevel(e.target.value)}
                    >
                        <option value="100 Mb">100 Mb</option>
                        <option value="200 Mb">200 Mb</option>
                        <option value="300 Mb">300 Mb</option>
                    </select>

                    {!isPending && <button>Add Client</button>}
                    {isPending && <button disabled>Adding Client...</button>}
                </form>
            </div>
        </div>
    );
};

export default SystemPage;