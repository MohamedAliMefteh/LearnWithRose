
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { DigitalResource } from "@/types/api";

interface DigitalResourceCardProps {
  resource: DigitalResource;
  onPurchase?: () => void;
}

export function DigitalResourceCard({ resource, onPurchase }: DigitalResourceCardProps) {
  return (
  <Card className="border-[hsl(var(--secondary-yellow))] hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Download className="h-8 w-8 text-primary" />
          <Badge variant="outline">{resource.fileType}</Badge>
        </div>
        <CardTitle className="text-lg">{resource.title}</CardTitle>
        <CardDescription>{resource.description}</CardDescription>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">Category: {resource.category}</Badge>
          {resource.accent && <Badge variant="secondary">Accent: {resource.accent}</Badge>}
          {resource.level && <Badge variant="secondary">Level: {resource.level}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {resource.filePath && <span className="text-sm">File Path: {resource.filePath}</span>}
          {resource.externalUrl && <span className="text-sm">External URL: <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">{resource.externalUrl}</a></span>}
        </div>
      </CardContent>
    </Card>
  );
}
