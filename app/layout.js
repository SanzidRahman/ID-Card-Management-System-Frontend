import "./globals.css";
import QueryProvider from "../providers/QueryProvider";
import { AuthProvider } from "../providers/AuthProvider";
import { ToastProvider } from "../components/ui";

export const metadata = {
  title: "IDPass Manager — ID Card Management System",
  description: "Modern full-stack system to manage organizations, dynamic records, templates and ID card generation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-50 antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
