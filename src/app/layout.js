import "./globals.css";
import Navbar from "@/components/Navbar";
import { FiltersProvider } from "@/context/FiltersContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <FiltersProvider>
          <Navbar />
          {children}
        </FiltersProvider>
      </body>
    </html>
  );
}