import "./globals.css";
export const metadata = {
  title: "Descriptive Master",
  description: "IBPS PO Descriptive Practice"
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}