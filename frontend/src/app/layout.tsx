import type { Metadata } from "next";
import FooterComponent from "@/components/footer";
import "./style/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow-condensed",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Sport Live - Real-time Match Updates",
  description: "Watch live sports matches with real-time commentary and scores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "sl-font-body",
        barlow.variable,
        barlowCondensed.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="sl-font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <FooterComponent />
        </ThemeProvider>
      </body>
    </html>
  );
}
