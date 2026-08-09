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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Null | Mind Place',
    template: '%s | Null',
  },
  description: 'Null is a personal space for philosophy, technology, security, science, and curious ideas.',
  applicationName: 'Null',
  keywords: ['philosophy', 'technology', 'security research', 'science', 'artificial intelligence', 'Null'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Null',
    title: 'Null | Mind Place',
    description: 'A personal space for philosophy, technology, security, science, and curious ideas.',
    url: '/',
    images: [{ url: '/logo.png', alt: 'Null' }],
  },
  twitter: {
    card: 'summary',
    title: 'Null | Mind Place',
    description: 'A personal space for philosophy, technology, security, science, and curious ideas.',
    images: ['/logo.png'],
  },
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