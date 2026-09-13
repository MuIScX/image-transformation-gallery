import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { MatrixProvider } from "@/context/MatrixContext";
import StepperNav from "@/components/StepperNav";

export const metadata: Metadata = {
  title: "Image Transformation Gallery",
  description:
    "An interactive walkthrough of 2x2 matrix image transformations — scaling, rotation, shear, reflection, determinant, and eigenvalues.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <MatrixProvider>
          <StepperNav />
          <main className="mx-auto max-w-content px-[28px] py-8 md:py-12">{children}</main>
        </MatrixProvider>
      </body>
    </html>
  );
}
