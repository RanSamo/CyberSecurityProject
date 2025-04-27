import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    // login function
    const login = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);

        // Store user data in local storage
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // logout function
    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);

        // Remove user data from local storage
        localStorage.removeItem("user");
    };

    // Check if the user is already logged in when the app loads
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            // Only parse if storedUser is not null/undefined and not the string "undefined"
            if (storedUser && storedUser !== "undefined") {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            // Clean up corrupted data
            localStorage.removeItem("user");
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;