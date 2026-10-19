import "./globals.css";

export const metadata = {
  title: "MathsLab — Interactive Maths Visualizer",
  description: "Explore arithmetic, multiplication, division, algebra graphs, and geometry with interactive visual explanations."
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
