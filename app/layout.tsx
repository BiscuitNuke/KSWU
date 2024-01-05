import "../global.css";
import { Inter } from "@next/font/google";
import LocalFont from "@next/font/local";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: {
    default: "ksw.dev",
    template: "%s | ksw.dev",
  },
  description: "Photographer, Developer, and Tech Enthusiast",
  openGraph: {
    title: "ksw.dev",
    description:
      "Photographer, Developer, and Tech Enthusiast",
    url: "https://ksw.dev",
    siteName: "ksw.dev",
    images: [
      {
        url: "https://ksw.dev/og.png",
        width: 1920,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "KSWDev",
    card: "summary_large_image",
  },
  icons: {
    shortcut: "/favicon.png",
  },
};
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const calSans = LocalFont({
  src: "../public/fonts/InstallerReg.ttf",
  variable: "--font-calsans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={[inter.variable, calSans.variable].join(" ")}>
      <head>

      </head>
      <body
        className={`bg-black ${process.env.NODE_ENV === "development" ? "" : undefined
          }`}
      >
        {children}
      </body>
    </html>
  );
}
