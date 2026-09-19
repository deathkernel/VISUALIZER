import "./globals.css";

export const metadata = {
  title: "Visualizer",
  description: "Visualize code execution step by step."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
