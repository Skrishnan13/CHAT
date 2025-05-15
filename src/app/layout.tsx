import type {Metadata} from 'next';
import { Geist_Sans, Geist_Mono } from 'next/font/google'; // Corrected import for Geist
import './globals.css';
import { Toaster } from "@/components/ui/toaster";


const geistSans = Geist_Sans({ // Corrected usage
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Corrected usage
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PromptFlow',
  description: 'AI Chat Application by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
