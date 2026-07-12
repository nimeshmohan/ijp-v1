import { Moon, Sun } from "lucide-react";
import { WEBFLOW_COLLECTION_ID } from "@ijp/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "@/providers/ThemeProvider";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Application preferences and connection info.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>
            Choose how the dashboard looks on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            <Sun />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            <Moon />
            Dark
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">
            Connected Webflow Collection
          </CardTitle>
          <CardDescription>
            This app only ever reads and writes to this one CMS collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm text-muted-foreground">
            {WEBFLOW_COLLECTION_ID}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
