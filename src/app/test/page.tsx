import { Button } from "@/components/ui/button";

export default function ButtonTestPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-10">
      <h1 className="text-2xl font-bold">Shadcn Button Playground</h1>

      <div className="flex flex-wrap gap-4">
        {/* Default */}
        <Button>Default Button</Button>

        {/* Secondary */}
        <Button variant="secondary">Secondary Button</Button>

        {/* Ghost */}
        <Button variant="ghost">Ghost Button</Button>
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Supported sizes */}
        <Button size="default">Default Size</Button>
        <Button size="icon" aria-label="Add">+</Button>
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Disabled */}
        <Button disabled>Disabled</Button>

        {/* Custom Class */}
        <Button className="bg-yellow-500 hover:bg-yellow-600">
          Custom Color
        </Button>
      </div>
    </div>
  );
}
