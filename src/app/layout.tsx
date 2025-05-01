import type {Metadata} from 'next';
import { GeistSans } from "geist/font/sans"; // Import GeistSans from geist/font/sans
import { GeistMono } from "geist/font/mono";   // Import GeistMono from geist/font/mono
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

export const metadata: Metadata = {
  title: 'CryptoBolt Inspector', // Updated App Name
  description: 'Check the results of wallet checks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased font-sans`}> {/* Use font-sans */}
        {children}
        <Toaster /> {/* Add Toaster for potential future notifications */}
      </body>
    </html>
  );
}
