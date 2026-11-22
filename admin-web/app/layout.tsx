import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShopEasy — Store Owner Admin Portal',
  description: 'Enterprise single-vendor e-commerce management dashboard for ShopEasy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#F8F6FD] text-[#171428]">
        {children}
      </body>
    </html>
  );
}
