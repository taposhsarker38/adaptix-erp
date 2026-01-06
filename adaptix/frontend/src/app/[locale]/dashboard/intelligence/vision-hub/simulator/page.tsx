"use client";

import { useState, useEffect, useRef } from "react";
import {
  Camera,
  ShoppingCart,
  Play,
  StopCircle,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Activity,
  Terminal,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Branch {
  id: string;
  name: string;
}

interface VisionCamera {
  uuid: string;
  name: string;
  branch_uuid: string;
}

interface ProductVariant {
  id: string;
  name: string;
  product_name: string;
  price: string;
  sku: string;
}

export default function VisionSimulator() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cameras, setCameras] = useState<VisionCamera[]>([]);
  const [products, setProducts] = useState<ProductVariant[]>([]);

  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("webcam-test-session");
  const [terminalId, setTerminalId] = useState<string>("TERM_001");

  const [isStreaming, setIsStreaming] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initial data loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, camerasRes, productsRes] = await Promise.all([
          api.get("company/wings/"),
          api.get("intelligence/vision/cameras/"),
          api.get("product/variants/"),
        ]);

        const extractData = (res: any) =>
          Array.isArray(res.data) ? res.data : res.data?.results || [];

        setBranches(extractData(branchRes));
        setCameras(extractData(camerasRes));
        setProducts(extractData(productsRes));
      } catch (error) {
        console.error("Failed to fetch simulator data", error);
        toast.error("Failed to initialize simulator data");
      }
    };
    fetchData();
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing webcam", err);
      toast.error("Could not access your webcam. Please check permissions.");
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const handleSimulateDetection = async () => {
    if (!selectedCamera || !selectedProduct) {
      toast.warning("Please select a camera and a product first");
      return;
    }

    setIsSimulating(true);
    try {
      await api.post("intelligence/vision/receive/", {
        camera_uuid: selectedCamera,
        event_type: "item_detected",
        payload: {
          session_id: sessionId,
          product_id: selectedProduct,
          terminal_id: terminalId,
        },
      });

      toast.success("Detection event sent to backend!");
    } catch (error) {
      console.error("Simulation failed", error);
      toast.error("Failed to send simulation event");
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredCameras = cameras.filter(
    (cam) => !selectedBranch || cam.branch_uuid === selectedBranch
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Vision Hub Simulator
          </h1>
          <p className="text-muted-foreground">
            Test your smart checkout flow with your webcam.
          </p>
        </div>
        <Badge
          variant="outline"
          className="px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          <Activity className="w-3 h-3 mr-2 animate-pulse" /> Live Simulation
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Camera Feed */}
        <Card className="lg:col-span-2 overflow-hidden bg-slate-900 border-slate-800 shadow-xl">
          <div className="aspect-video relative flex items-center justify-center bg-black group">
            {!isStreaming && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <Button
                  onClick={startWebcam}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Play className="w-4 h-4 mr-2" /> Start Webcam
                </Button>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover",
                !isStreaming && "hidden"
              )}
            />
            {isStreaming && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-500/80 backdrop-blur-sm border-none animate-pulse">
                  REC
                </Badge>
              </div>
            )}
            {isStreaming && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={stopWebcam}
              >
                <StopCircle className="w-4 h-4 mr-2" /> Stop Feed
              </Button>
            )}
          </div>
          <CardContent className="p-4 bg-slate-950/50 border-t border-slate-800">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isStreaming
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-slate-700"
                  )}
                />
                {isStreaming ? "Camera Active" : "Camera Offline"}
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <div>Status: Monitoring Objects</div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel: Controls */}
        <div className="space-y-6">
          <Card className="shadow-lg border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="w-5 h-5 text-slate-500" /> Setup Context
              </CardTitle>
              <CardDescription>
                Link this camera to a branch and terminal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Store Branch</Label>
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>AI Camera</Label>
                <Select
                  value={selectedCamera}
                  onValueChange={setSelectedCamera}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI Camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCameras.map((c) => (
                      <SelectItem key={c.uuid} value={c.uuid}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Terminal ID (for POS sync)</Label>
                <Input
                  value={terminalId}
                  onChange={(e) => setTerminalId(e.target.value)}
                  placeholder="e.g. TERM_001"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-emerald-100 bg-emerald-50/10">
            <CardHeader className="pb-4 border-b border-emerald-100/50">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                <ShoppingCart className="w-5 h-5" /> Simulate Picking
              </CardTitle>
              <CardDescription>Trigger a "Grab and Go" event.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Select Product to Mimic</Label>
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger className="border-emerald-200">
                    <SelectValue placeholder="Pick a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.product_name} - {p.name} (${p.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSimulateDetection}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg h-12 text-lg font-semibold group"
                disabled={isSimulating || !isStreaming}
              >
                {isSimulating ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                )}
                Pick Product
              </Button>

              <div className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-emerald-100 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />{" "}
                  Web-hook: vision/receive
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Payload:
                  Item Detection
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions Card */}
      <Card className="bg-blue-50/30 border-blue-100">
        <CardContent className="p-4 flex gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="text-sm space-y-1">
            <p className="font-semibold text-blue-900">How to test:</p>
            <p className="text-blue-800/80">
              1. Start your webcam and select a camera linked to{" "}
              <strong>TERM_001</strong>.<br />
              2. Select a product and click <strong>"Pick Product"</strong>.
              <br />
              3. Open the{" "}
              <a
                href="/dashboard/pos"
                target="_blank"
                className="font-bold underline"
              >
                POS Page
              </a>{" "}
              and click <strong>"Sync from AI Cart"</strong>.<br />
              4. The product you "picked" here will magically appear in your POS
              cart!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
