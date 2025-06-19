import { Inter } from "next/font/google";
import "@/styles/globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { metadata } from "@/app/metadata";

const inter = Inter({ subsets: ["latin"] });

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Border-logo.png" type="image/png" />
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
