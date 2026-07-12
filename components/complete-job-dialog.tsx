"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";

interface CompleteJobDialogProps {
    jobId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (jobId: number, afterPhoto: File | null) => Promise<void>;
}

export function CompleteJobDialog({ jobId, open, onOpenChange, onSuccess }: CompleteJobDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleConfirm = async () => {
        if (!jobId) return;
        setIsSubmitting(true);
        try {
            await onSuccess(jobId, selectedFile);
            setSelectedFile(null);
            setPreviewUrl(null);
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to complete job", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Job Verification</DialogTitle>
                    <DialogDescription>
                        Please upload an "After" photo of the completed lawn service. This builds trust and ensures QA satisfaction.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer relative">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={isSubmitting}
                        />
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="After lawn preview"
                                className="w-full h-40 object-cover rounded-md"
                            />
                        ) : (
                            <div className="text-center space-y-2">
                                <div className="p-3 bg-muted rounded-full w-fit mx-auto">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="text-sm font-medium">Click or Drag "After" photo here</div>
                                <div className="text-xs text-muted-foreground">PNG, JPG or WEBP up to 5MB</div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Completing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirm Completion
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
