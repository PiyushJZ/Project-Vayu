import { Button } from "@project-vayu/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@project-vayu/ui/components/dropdown-menu";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
        <Sun
          aria-hidden="true"
          className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all motion-reduce:transition-none dark:scale-0 dark:-rotate-90"
        />
        <Moon
          aria-hidden="true"
          className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all motion-reduce:transition-none dark:scale-100 dark:rotate-0"
        />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
          {THEMES.map((t) => (
            <DropdownMenuRadioItem key={t.value} value={t.value} closeOnClick>
              {t.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
