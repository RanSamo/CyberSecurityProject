import { useContext } from "react";
import AuthContext from "../auth/AuthContext"; // Import AuthContext

const Home = () => {
    const { isLoggedIn, user } = useContext(AuthContext); // Get the isLoggedIn and user from AuthContext
    
    return (
        <div className="home">
            {isLoggedIn ? ( <> 
                <h2>Welcome back, {user.uEmail}!</h2>
                <p>View your customer dashboard</p>
                {/* TODO. need to add the sql GET for the clients table */}
                <button>Add New Client</button>
                
            </> 
            ) : (
                <>
                <h2>Welcome to Cyber-Client</h2>
                <p>Connect with your friends and family</p>
                <p>Share your thoughts and ideas</p>
                <p>Join our community today!</p>
                </>
            )}
        </div>
    );
}

export default Home;