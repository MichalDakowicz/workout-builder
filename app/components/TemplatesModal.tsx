import React from 'react';
import { WorkoutTemplate } from "../data/templates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TemplatesModalProps {
    templates: WorkoutTemplate[];
    onClose: () => void;
    onApplyTemplate: (template: WorkoutTemplate) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
    templates,
    onClose,
    onApplyTemplate
}) => {
    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Choose a Template</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {templates.map((template, i) => (
                        <Card
                            key={i}
                            className="cursor-pointer hover:border-primary transition-all hover:bg-accent/50"
                            onClick={() => onApplyTemplate(template)}
                        >
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">{template.name}</CardTitle>
                                    <span className="text-xs font-bold px-2 py-1 bg-secondary rounded text-secondary-foreground">
                                        {template.days} Days
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <CardDescription>
                                    {template.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
