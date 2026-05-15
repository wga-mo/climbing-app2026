import "./globals.css";
import Navbar from "@/components/Navbar";
import { FiltersProvider } from "@/context/FiltersContext";
import MobileFiltersOverlay from "@/components/MobileFiltersOverlay";
import AuthGuard from "@/components/AuthGuard";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <FiltersProvider>
          <Navbar />
          <MobileFiltersOverlay />
          {children}
        </FiltersProvider>
      </body>
    </html>
  );
}