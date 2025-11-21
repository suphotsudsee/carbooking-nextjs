import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { getSession } from "@/lib/auth/session";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Car Booking",
  description: "Reservation dashboard and vehicle scheduling",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="th">
      <body className={`${kanit.variable} bg-slate-50 text-slate-900`}>
        <AuthProvider session={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
