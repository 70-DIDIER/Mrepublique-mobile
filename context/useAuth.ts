import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuth = () => {
  const { token, setToken, loading } = useContext(AuthContext);

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
  };

  return { token, setToken, loading, logout };
};
