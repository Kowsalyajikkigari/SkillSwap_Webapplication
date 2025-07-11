
import React from "react";
import CommunityForum from "../../community/CommunityForum";
import PeerReviewSystem from "../../reviews/PeerReviewSystem";

interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    createdAt: Date;
  }>;
  tags: string[];
}

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

interface CommunityTabProps {
  userId: string;
  userName: string;
  userAvatar: string;
  forumPosts: ForumPost[];
  reviews: Review[];
}

const CommunityTab: React.FC<CommunityTabProps> = ({ 
  userId,
  userName,
  userAvatar,
  forumPosts,
  reviews
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <CommunityForum 
        skillCategory="Programming"
        posts={forumPosts}
      />
      
      <PeerReviewSystem
        userId={userId}
        userName={userName}
        userAvatar={userAvatar}
        reviews={reviews}
      />
    </div>
  );
};

export default CommunityTab;
