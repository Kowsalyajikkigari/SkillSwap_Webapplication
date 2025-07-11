
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  content: string;
  skills: string[];
  createdAt: Date;
}

interface PeerReviewSystemProps {
  userId: string;
  userName: string;
  userAvatar: string;
  reviews: Review[];
  onAddReview?: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

const PeerReviewSystem = ({ 
  userId, 
  userName, 
  userAvatar, 
  reviews: initialReviews,
  onAddReview 
}: PeerReviewSystemProps) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const availableSkills = [
    "JavaScript", "React", "Python", "UX Design", "Data Analysis", 
    "Public Speaking", "Project Management", "UI Design"
  ];

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleRatingClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a star rating",
        variant: "destructive",
      });
      return;
    }

    if (!reviewContent.trim()) {
      toast({
        title: "Review content required",
        description: "Please write your feedback",
        variant: "destructive",
      });
      return;
    }

    const newReview = {
      id: `review-${Date.now()}`,
      reviewerId: "current-user",
      reviewerName: "You",
      reviewerAvatar: "https://i.pravatar.cc/150?img=1",
      rating,
      content: reviewContent,
      skills: selectedSkills,
      createdAt: new Date()
    };

    if (onAddReview) {
      const { id, createdAt, ...reviewData } = newReview;
      onAddReview(reviewData);
    }

    setReviews([newReview, ...reviews]);
    setIsWritingReview(false);
    setRating(0);
    setReviewContent("");
    setSelectedSkills([]);

    toast({
      title: "Review submitted",
      description: `Your feedback for ${userName} has been recorded.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Peer Reviews</CardTitle>
              <CardDescription>
                Feedback from skill swapping sessions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${star <= Number(calculateAverageRating()) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                  />
                ))}
              </div>
              <span className="font-bold">
                {calculateAverageRating()}
                <span className="text-muted-foreground text-sm font-normal"> ({reviews.length})</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isWritingReview ? (
            <Button 
              onClick={() => setIsWritingReview(true)}
              variant="outline"
              className="w-full"
            >
              Write a Review
            </Button>
          ) : (
            <div className="space-y-4 border rounded-md p-4">
              <div>
                <p className="text-sm font-medium mb-1">Your rating</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-6 w-6 cursor-pointer transition-all ${
                        star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Skills to review</p>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <Badge 
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedSkills.includes(skill) ? "" : "bg-transparent hover:bg-muted/50"
                      }`}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Your review</p>
                <Textarea 
                  placeholder="Share your experience learning from or teaching this user..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsWritingReview(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitReview}>Submit Review</Button>
              </div>
            </div>
          )}
          
          {reviews.length > 0 ? (
            <div className="space-y-4 mt-6">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-md p-4">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
                        <AvatarFallback>{review.reviewerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.reviewerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm mt-3">{review.content}</p>
                  
                  {review.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {review.skills.map((skill) => (
                        <span 
                          key={skill}
                          className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mt-4 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">No reviews yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PeerReviewSystem;
