// Импортируем функции из React
import React, { createContext, useState, useContext, useCallback } from "react";
import { USER_INFO, API_BASE_URL } from "../utils/constants";
import axios from "axios";

// 1️⃣ Создаём сам контекст для авторизации
// Это как "глобальное хранилище", чтобы не передавать токены через пропсы между компонентами
const AuthContext = createContext(null);

// 2️⃣ Компонент-провайдер, который будет "оборачивать" всё приложение
// и предоставлять доступ к состоянию авторизации (auth, login, logout)
export function AuthProvider({ children }) {
    // 3️⃣ Состояние авторизации
    // При старте проверяем localStorage: если там уже есть токен, значит пользователь авторизован
    const [auth, setAuth] = useState(() => {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const user = localStorage.getItem(USER_INFO);
        return accessToken ? {
            token: accessToken,
            refreshToken: refreshToken,
            user: user ? JSON.parse(user) : null
        } : null;
    });

    // 8️⃣ Функция для обновления access token с помощью refresh token
    const refreshAccessToken = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            console.log("Refreshing access token...");

            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken: refreshToken
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Сохраняем новые токены в localStorage
            localStorage.setItem("accessToken", accessToken);
            if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
            }

            // Обновляем состояние
            const user = localStorage.getItem(USER_INFO);
            const updatedAuth = {
                token: accessToken,
                refreshToken: newRefreshToken || refreshToken,
                user: user ? JSON.parse(user) : null
            };

            setAuth(updatedAuth);

            console.log("Access token refreshed successfully");
            return accessToken;

        } catch (error) {
            console.error("Token refresh failed:", error);
            // Если обновление не удалось, разлогиниваем пользователя
            logout();
            throw error;
        }
    }, []);

    // 9️⃣ Функция проверки истекшего токена
    const isTokenExpired = useCallback((token) => {
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            // Добавляем буфер в 1 минуту для предварительного обновления
            return expirationTime - currentTime < 60000;
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    }, []);

    // 🔟 Функция проверки необходимости обновления токена
    const shouldRefreshToken = useCallback(() => {
        const accessToken = localStorage.getItem("accessToken");
        return isTokenExpired(accessToken);
    }, [isTokenExpired]);

    // 4️⃣ Функция логина
    // Сохраняем токены в localStorage (чтобы пережили перезагрузку страницы) и обновляем состояние auth
    const login = (tokens, userInfo) => {
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        localStorage.setItem(USER_INFO, JSON.stringify(userInfo));
        setAuth({
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: userInfo
        });
    };

    // 5️⃣ Функция логаута
    // Удаляем токены и сбрасываем состояние auth → пользователь становится "гостем"
    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem(USER_INFO);
        setAuth(null);
    };

    // 6️⃣ Возвращаем провайдер, который передаёт детям (всё приложение внутри)
    // текущее состояние и функции login/logout
    return (
        <AuthContext.Provider value={{
            auth,
            login,
            logout,
            refreshAccessToken,
            isTokenExpired,
            shouldRefreshToken
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// 7️⃣ Кастомный хук для удобства использования контекста
// Вместо useContext(AuthContext) можно вызывать просто useAuth()
export function useAuth() {
    return useContext(AuthContext);
}