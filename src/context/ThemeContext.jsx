"use client";

import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext(); // Corrected context name

export const ThemeContextProvider = ({ children }) => {
    // Keep the first render identical on the server and client, then restore
    // the saved preference once the browser is available.
    const [theme, setTheme] = useState("dark");
    const [hydrated, setHydrated] = useState(false);

    const toggle = () => {
        setTheme((currentTheme) => currentTheme === "light" ? "dark" : "light");
    };

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "light" || storedTheme === "dark") {
            setTheme(storedTheme);
        } else {
            setTheme("dark");
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (hydrated) {
            localStorage.setItem("theme", theme);
        }
    }, [hydrated, theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggle }}> {/* Corrected the context provider */}
            {children}
        </ThemeContext.Provider>
    );
};
