import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import {ThemeContextProvider} from "@/context/ThemeContext";
import ThemeProvider from "@/providers/ThemeProvider";
import Copyright from "@/components/copyright/Copyright";
import AuthProvider from "@/providers/AuthProvider";
import ComplexBackground from "@/components/complexBackground/ComplexBackground";
import styles from "@/components/footer/footer.module.css";
import React from "react";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Null',
  description: 'Mind Place',
}

export default function RootLayout({ children }) {
  return (
      <html lang="en">
      <body className={inter.className}>
      <AuthProvider>
        <ThemeContextProvider>
          <ThemeProvider>
            <div className="container">
              <ComplexBackground />
              <div className="wrapper">
                <Navbar/>
              </div>
              <div className="contentWrapper">
                {children}
              </div>
              <div className="wrapper">
                <Footer/>
              </div>
              <div className="wrapper copyright">
                <Copyright/>
              </div>
            </div>
          </ThemeProvider>
        </ThemeContextProvider>
      </AuthProvider>
      </body>
      </html>
  )
}