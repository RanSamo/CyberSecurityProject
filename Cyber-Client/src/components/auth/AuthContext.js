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
        const storedUser = localStorage.getItem("user");
        if (storedUser){
            setUser(JSON.parse(storedUser));
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <AuthContext.Provider value = {{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
        );
};

export default AuthContext;