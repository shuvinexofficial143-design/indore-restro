import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "The Royal Table | Shuvi 360", template: "%s | The Royal Table" },
  description: "A fictional restaurant management system demonstration by Shuvi 360.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
