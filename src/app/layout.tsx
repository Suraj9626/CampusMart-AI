import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { Navbar } from "@/components/navbar";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/footer";
import { AiChatbot } from "@/components/ai-chatbot";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: "Secure, exclusive peer-to-peer student marketplace, live campus auctions, private messaging, and AI student assistant.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${plusJakarta.variable} min-h-screen flex flex-col bg-[#fbfbfe] dark:bg-[#07090e] text-zinc-900 dark:text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white`}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationsProvider>
              <Navbar />
              <div className="ambient-glow-top" aria-hidden="true" />
              <main className="flex-1 relative z-10">
                <AuthGuard>
                  {children}
                </AuthGuard>
              </main>
              <Footer />
              <AiChatbot />
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
