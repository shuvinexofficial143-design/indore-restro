import type { Metadata, Viewport } from "next";
import { Header, Footer } from "@/components/site";
import "./globals.css";
import {publicContent} from "@/lib/site-content";
import PwaRegister from "@/components/pwa-register";
export const metadata: Metadata = {
  title: { default: "The Royal Table | Shuvi 360", template: "%s | The Royal Table" },
  description: "Discover the sample menu, ambience and reservation experience of a fictional Indore restaurant by Shuvi 360.",
  robots: { index: false, follow: false },
};
export const dynamic="force-dynamic";
export const viewport:Viewport={themeColor:"#171512"};
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content=await publicContent();
  const accent=/^#[0-9a-f]{6}$/i.test(content.accentColor)?content.accentColor:"#d5b578";
  return <html lang="en"><body style={{"--gold":accent} as React.CSSProperties}><a className="skip" href="#main">Skip to content</a><Header/>{children}<Footer content={content}/><PwaRegister/></body></html>;
}
