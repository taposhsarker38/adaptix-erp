"use client";

import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Palette, Globe, Mail, Layout, Save } from "lucide-react";

export const WhiteLabelSettings: React.FC = () => {
  const { theme, updateTheme } = useTheme();
  const [radius, setRadius] = useState<number>(
    parseFloat(theme.theme_config?.radius || "0.5")
  );
  const [font, setFont] = useState(theme.theme_config?.font_main || "Inter");
  const [domain, setDomain] = useState("");
  const [smtp, setSmtp] = useState({
    host: "",
    port: "587",
    user: "",
    pass: "",
    from: "",
  });

  const handleSaveTheme = async () => {
    try {
      await updateTheme({
        theme_config: {
          ...theme.theme_config,
          radius: `${radius}rem`,
          font_main: font,
        },
      });
      toast.success("Theme settings saved!");
    } catch (error) {
      toast.error("Failed to save theme settings");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theming Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" /> Appearance
            </CardTitle>
            <CardDescription>
              Customize your brand's look and feel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Border Radius ({radius}rem)</Label>
              <Slider
                value={[radius]}
                max={2}
                step={0.1}
                onValueChange={(v) => setRadius(v[0])}
              />
            </div>
            <div className="space-y-2">
              <Label>Main Font</Label>
              <Input
                value={font}
                onChange={(e) => setFont(e.target.value)}
                placeholder="e.g. Inter, Roboto, Poppins"
              />
            </div>
            <Button onClick={handleSaveTheme} className="w-full">
              <Save className="w-4 h-4 mr-2" /> Apply Styles
            </Button>
          </CardContent>
        </Card>

        {/* Custom Domain Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" /> Custom Domain
            </CardTitle>
            <CardDescription>
              Connect your own domain to the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Domain Name</Label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="portal.acmecorp.com"
              />
            </div>
            <Button variant="outline" className="w-full" disabled>
              Verify Domain (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* SMTP Card */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" /> SMTP Configuration
            </CardTitle>
            <CardDescription>Send emails from your own server.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input placeholder="smtp.gmail.com" />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input placeholder="587" />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input placeholder="noreply@acmecorp.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button className="md:col-span-2">
              <Save className="w-4 h-4 mr-2" /> Save SMTP Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
