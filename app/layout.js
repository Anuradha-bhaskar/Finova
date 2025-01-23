import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Finova",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        variables: {
          colorPrimary: "hsl(205, 43%, 51%)", // --primary
          colorText: "hsl(205, 5%, 10%)", // --fore
        },
      }}
    >
      <html lang="en">
        <body
          className={`${inter.className}`}
        >
          {/*Header*/}
          <Header />
          <main className="min-h-screen">{children}</main>
          {/*Footer*/}
          <footer className="bg-[#f3f5f7] py-12">
            <div className="container mx-auto text-gray-600 px-4 text-center">
              <p>Made by Anuradha with 💗</p>
            </div>
          </footer>
        </body>
      </html>
    </ ClerkProvider>
  );
}
