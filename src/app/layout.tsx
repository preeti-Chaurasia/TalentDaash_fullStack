import '../app/globals.css';
import Link from 'next/link';

import Header from '@/components/layout/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F7F7F7]">
        <Header /> {/* ✅ Pura header Client Component ban gaya */}
        <main>{children}</main>
      </body>
    </html>
  );
}