import { EasingGradientsSoundProvider } from "./sound-provider";

export default function EasingGradientsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <EasingGradientsSoundProvider>
      <div className="bg-background text-foreground min-h-dvh">{children}</div>
    </EasingGradientsSoundProvider>
  );
}
