//
import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

// axios.defaults.baseURL = "http://localhost:5001";
axios.defaults.baseURL =
    process.env.REACT_APP_API_URL || "http://localhost:5001";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
    }, []);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            axios
                .get("/api/auth/profile")
                .then((res) => {
                    setUser(res.data);
                    setLoading(false);
                })
                .catch(() => {
                    logout();
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token, logout]);

    const login = async (email, password) => {
        const res = await axios.post("/api/auth/login", { email, password });
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
    };

    const signup = async (name, email, password) => {
        const res = await axios.post("/api/auth/signup", {
            name,
            email,
            password,
        });
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
