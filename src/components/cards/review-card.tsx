
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Review } from "@/types/api";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
  <Card className="border-[hsl(var(--secondary-yellow))]">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? "text-secondary fill-current"
                  : "text-primary/20"
              }`}
            />
          ))}
        </div>
  <p className="text-foreground mb-4">{review.content}</p>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
            <span className="text-primary font-semibold">
              {review.name ? review.name[0].toUpperCase() : "?"}
            </span>
          </div>
          <div>
            <div className="font-semibold">{review.name}</div>
            <div className="text-sm text-accent">{review.accent}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
