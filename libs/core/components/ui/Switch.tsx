import type { ComponentProps } from "react";
import { Input } from "./Input";
import { Label } from "./Label";

type SwitchProps = Omit<ComponentProps<typeof Input>, "type" | "className">;

export function Switch(props: SwitchProps) {
  return (
    <Label className="relative inline-flex cursor-pointer">
      <Input
        {...props}
        type="checkbox"
        role="switch"
        className="peer sr-only"
      />

      <span className="h-5 w-10 rounded-full bg-primary/50 transition-colors peer-checked:bg-primary" />

      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
    </Label>
  );
}
