import { useState } from 'react';
import './SystemPage.css';

const SystemPage = () => {
    // State for form inputs
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [permissionLevel, setPermissionLevel] = useState('view');
    
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
            fullName: `${firstName} ${lastName}`,
            permissionLevel
        };
        
        setIsPending(true);
        
        // Here you would normally send to backend
        // For now, we'll simulate a successful submission
        setTimeout(() => {
            console.log('New client added:', clientData);
            setIsPending(false);
            
            // Set the new client data for display
            setNewClient(clientData);
            
            // Show confirmation message
            setShowConfirmation(true);
            
            // Reset form fields
            setFirstName('');
            setLastName('');
            setPermissionLevel('view');
            
            // Hide confirmation after 5 seconds
            setTimeout(() => {
                setShowConfirmation(false);
            }, 10000);
        }, 1000);
    };

    // Helper function to get permission description
    const getPermissionDescription = (level) => {
        switch(level) {
            case 'view':
                return 'Can view';
            case 'edit':
                return 'Can view & edit (including delete)';
            case 'admin':
                return 'Admin access';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="system-page">
            <h2>System Management</h2>
            
            {/* Display the newly added client */}
            {showConfirmation && newClient && (
                <div className="confirmation-message">
                    <h3>New Client Added Successfully!</h3>
                    <div className="client-details">
                        <p><strong>Name:</strong> {newClient.fullName}</p>
                        <p><strong>Permission Level:</strong> {getPermissionDescription(newClient.permissionLevel)}</p>
                    </div>
                </div>
            )}
            
            <div className="add-client-section">
                <h3>Add New Client</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>First Name:</label>
                        <input 
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Last Name:</label>
                        <input 
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Client Permissions:</label>
                        <select 
                            value={permissionLevel}
                            onChange={(e) => setPermissionLevel(e.target.value)}
                        >
                            <option value="view">Can view</option>
                            <option value="edit">Can view & edit (delete included)</option>
                            <option value="admin">Admin access</option>
                        </select>
                    </div>
                    
                    {!isPending && <button className="submit-button">Add Client</button>}
                    {isPending && <button className="submit-button" disabled>Adding Client...</button>}
                </form>
            </div>
            
        </div>
    );
};

export default SystemPage;