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
  title: "FesnukSave - Free Facebook Video Downloader",
  description:
    "Download Facebook videos for free and quickly. FesnukSave is a safe and easy-to-use online tool.",
  keywords: [
    "download video",
    "facebook downloader",
    "FesnukSave",
    "video downloader online",
    "download Facebook videos",
    "free video downloader",
    "online video downloader",
    "Facebook video download tool",
  ],
  authors: [{ name: "FesnukSave by Aditya Kurniawan" }],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "FesnukSave - Free Facebook Video Downloader",
    description:
      "Download Facebook videos for free and quickly with FesnukSave.",
    url: "https://fesnuksave.vercel.app/",
    type: "website",
    images: [
      {
        url: "/public/fesnuksave.png",
        width: 800,
        height: 600,
        alt: "FesnukSave Facebook Video Downloader",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://fesnuksave.vercel.app/" />
      </head>
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
