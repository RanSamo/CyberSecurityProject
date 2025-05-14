import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    // Check if a token is expired
    const isTokenExpired = (token) => {
        if (!token) return true;
        
        try {
            // Decode the JWT token
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            // Check if token is expired
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
            console.error("Error checking token expiration:", error);
            return true; // Consider token expired if there's an error
        }
    };


    // login function
    const login = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);

        // Store user data in local storage
        localStorage.setItem("user", JSON.stringify(userData));

        if (userData.token) {
        localStorage.setItem("token", userData.token);
    }
    };

    // logout function
    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);

        // Remove user data from local storage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    // get the auth header for API requests
    const getAuthHeader = () => {
                const token = localStorage.getItem("token") || (user && user.token);
                return token ? { 'Authorization': `Bearer ${token}` } : {};
    };


    // Check if the user is already logged in when the app loads
    useEffect(() => {
        try {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");
            // Only set user as logged in if token exists and is not expired
            if (token && !isTokenExpired(token) && storedUser && storedUser !== "undefined") {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsLoggedIn(true);
            } else if (token && isTokenExpired(token)) {
                // Token is expired, log the user out
                console.log("Token expired, logging out");
                logout();
            }
        } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
    }, []);

    // Periodic token check (every minute)
    useEffect(() => {
        // Skip if not logged in
        if (!isLoggedIn) return;
        
        const checkTokenInterval = setInterval(() => {
            const token = localStorage.getItem("token");
            if (token && isTokenExpired(token)) {
                console.log("Token expired during session, logging out");
                logout();
            }
        }, 60000); // Check every minute
        
        return () => clearInterval(checkTokenInterval);
    }, [isLoggedIn]);


    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, getAuthHeader}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;