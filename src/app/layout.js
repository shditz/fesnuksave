import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "./components/header/layout";
import Footer from "./components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FesnukSave - Download Free Online Videos",
  description:
    "Download videos from various platforms Facebook for free and quickly. FesnukSave is a safe and easy-to-use online tool.",
  keywords: [
    "download video",
    "facebook downloader",
    "FesnukSave",
    "video downloader online",
  ],
  authors: [{ name: "FesnukSave by Aditya Kurniawan" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header>
          <Layout />
        </header>
        <main>{children}</main>
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
