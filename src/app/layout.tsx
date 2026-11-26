import type { Metadata } from "next";
import { Header, Footer } from "@/components/site";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "The Royal Table | Shuvi 360", template: "%s | The Royal Table" },
  description: "Discover the sample menu, ambience and reservation experience of a fictional Indore restaurant by Shuvi 360.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><Header/>{children}<Footer/></body></html>;
}
