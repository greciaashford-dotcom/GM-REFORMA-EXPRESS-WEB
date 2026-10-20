import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.reformaexpress.com"),
  title: {
    template: "%s | GM REFORMA EXPRESS",
    default: "Reformas en Madrid · Baños y cocinas | GM REFORMA EXPRESS",
  },
  description:
    "Reformas de baños, cocinas y viviendas en Madrid. Cuéntanos tu proyecto, reserva una visita y solicita una propuesta adaptada con GM REFORMA EXPRESS.",
  icons: {
    icon: [
      { url: "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/whatsapp_image_2025-09-09_at_21.53.36-removebg-preview-A0xv36rxqlHrX8j2.png" },
      { url: "/icon.png" },
    ],
    shortcut: "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/whatsapp_image_2025-09-09_at_21.53.36-removebg-preview-A0xv36rxqlHrX8j2.png",
    apple: "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/whatsapp_image_2025-09-09_at_21.53.36-removebg-preview-A0xv36rxqlHrX8j2.png",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
