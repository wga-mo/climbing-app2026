import "./globals.css";
import Navbar from "@/components/Navbar";
import { FiltersProvider } from "@/context/FiltersContext";
import MobileFiltersOverlay from "@/components/MobileFiltersOverlay";
import { AuthProvider } from "@/context/AuthContext";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden flex flex-col">
        <FiltersProvider>
          <AuthProvider>
            <Navbar />
            <MobileFiltersOverlay />
            {children}
          </AuthProvider>
        </FiltersProvider>
      </body>
    </html>
  );
}