import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (roleOrObj, name = "") => {
    // Support both login("buyer", "Name") and login({ role, name, email })
    if (typeof roleOrObj === "object" && roleOrObj !== null) {
      const { role, name: objName, email } = roleOrObj;
      const initials = objName ? objName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : role.slice(0,2).toUpperCase();
      setUser({ id: Date.now(), name: objName || "User", email: email || `${role}@autobazaar.in`, role, avatar: initials });
      return;
    }
    const role = roleOrObj;
    const users = {
      buyer: { id: 1, name: name || "Aryan Kapoor", email: "aryan@email.com", role: "buyer", avatar: "AK" },
      seller: { id: 2, name: name || "Rahul Sharma", email: "rahul@email.com", role: "seller", avatar: "RS" },
      admin: { id: 99, name: "Admin User", email: "admin@carmarket.in", role: "admin", avatar: "AD" },
    };
    setUser(users[role]);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);