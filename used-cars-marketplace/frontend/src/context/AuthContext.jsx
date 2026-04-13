import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getMe } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // On app load, fetch current user if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    return user; // return user so pages can redirect based on role
  };

  const register = async (name, email, password, role, phone) => {
    const res = await registerUser({ name, email, password, role, phone });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);