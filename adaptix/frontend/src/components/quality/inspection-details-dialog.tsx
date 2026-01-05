"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { qualityApi, Inspection, QCPhoto } from "@/lib/api/quality";
import { format } from "date-fns";
import {
  Loader2,
  ClipboardList,
  Camera,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface InspectionDetailsDialogProps {
  inspectionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InspectionDetailsDialog({
  inspectionId,
  open,
  onOpenChange,
}: InspectionDetailsDialogProps) {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [photos, setPhotos] = useState<QCPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && inspectionId) {
      fetchDetails();
    }
  }, [open, inspectionId]);

  const fetchDetails = async () => {
    if (!inspectionId) return;
    try {
      setLoading(true);
      // Fetch specific inspection details directly
      const data = await qualityApi.getInspectionDetail(inspectionId);
      setInspection(data);

      const photoData = await qualityApi.getPhotos(inspectionId);
      setPhotos(photoData);
    } catch (error) {
      console.error("Failed to fetch inspection details", error);
    } finally {
      setLoading(false);
    }
  };

  if (!inspectionId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Inspection Details # {inspectionId}
            </DialogTitle>
            {inspection && (
              <Badge
                className="mr-6"
                variant={
                  inspection.status === "PASSED"
                    ? "default"
                    : inspection.status === "FAILED" ||
                      inspection.status === "REJECTED"
                    ? "destructive"
                    : "secondary"
                }
              >
                {inspection.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : inspection ? (
          <div className="space-y-6 py-4">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-900/50">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Source Reference
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {inspection.reference_type}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {inspection.reference_uuid}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-900/50">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Inspection Date
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span className="text-sm">
                    {inspection.inspection_date
                      ? format(new Date(inspection.inspection_date), "PPP p")
                      : "Not Set"}
                  </span>
                </div>
              </div>
            </div>

            {/* Decision & Findings */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" /> Findings &
                Notes
              </h4>
              <div className="p-4 rounded-lg border bg-white dark:bg-slate-950 space-y-4">
                {inspection.defect_category_name && (
                  <div>
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                      Defect Category:
                    </span>
                    <p className="font-bold text-lg">
                      {inspection.defect_category_name}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Inspector Notes:
                  </span>
                  <p className="text-sm mt-1 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {inspection.notes ||
                      "No notes provided for this inspection."}
                  </p>
                </div>
              </div>
            </div>

            {/* Photos Section */}
            {photos.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" /> Evidence Photos
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-xl border overflow-hidden bg-slate-100"
                    >
                      <img
                        src={photo.photo_url}
                        alt={photo.caption || "Defect Evidence"}
                        className="w-full aspect-video object-cover hover:scale-105 transition-transform"
                      />
                      {photo.caption && (
                        <div className="p-2 bg-white dark:bg-slate-950 border-t">
                          <p className="text-[10px] italic text-muted-foreground text-center">
                            {photo.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
            <p>Could not load details for this inspection.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
