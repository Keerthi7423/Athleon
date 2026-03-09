import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Athleon Analytics',
  description: 'Pro Sports Intelligence Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0b0f19] text-slate-200 antialiased`}>
        {children}
      </body>
    </html>
  );
}
