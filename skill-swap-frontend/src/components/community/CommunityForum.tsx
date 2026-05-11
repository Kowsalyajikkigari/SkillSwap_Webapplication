
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, ThumbsUp, ThumbsDown, BadgeCheck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
  comments: {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    createdAt: Date;
  }[];
  tags: string[];
  isVerified?: boolean;
}

interface CommunityForumProps {
  skillCategory: string;
  posts: ForumPost[];
}

const CommunityForum = ({ skillCategory, posts: initialPosts }: CommunityForumProps) => {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [newPost, setNewPost] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleNewPost = () => {
    if (!newPost.trim()) {
      toast({
        title: "Empty post",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }

    const post: ForumPost = {
      id: `post-${Date.now()}`,
      userId: "current-user",
      userName: "You",
      userAvatar: "https://i.pravatar.cc/150?img=1",
      content: newPost,
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
      comments: [],
      tags: [skillCategory],
      isVerified: true,
    };

    setPosts([post, ...posts]);
    setNewPost("");
    
    toast({
      title: "Post created",
      description: "Your question has been posted to the community.",
    });
  };

  const handleAddComment = (postId: string) => {
    const comment = commentInputs[postId];
    if (!comment?.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `comment-${Date.now()}`,
              userId: "current-user",
              userName: "You",
              userAvatar: "https://i.pravatar.cc/150?img=1",
              content: comment,
              createdAt: new Date(),
            }
          ]
        };
      }
      return post;
    }));

    // Clear the comment input
    setCommentInputs({
      ...commentInputs,
      [postId]: ""
    });
  };

  const handleVote = (postId: string, type: 'like' | 'dislike') => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (type === 'like') {
          return { ...post, likes: post.likes + 1 };
        } else {
          return { ...post, dislikes: post.dislikes + 1 };
        }
      }
      return post;
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Community Forum</CardTitle>
          <CardDescription>
            Ask questions, share tips, or help others with {skillCategory} skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Ask a question or share a tip..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleNewPost}>Post</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.userAvatar} alt={post.userName} />
                    <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{post.userName}</span>
                      {post.isVerified && (
                        <BadgeCheck className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {post.createdAt.toLocaleDateString()} at {post.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm">{post.content}</p>
            </CardContent>
            <CardFooter className="pt-0 flex-col items-start">
              <div className="flex items-center gap-3 w-full pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 h-7 text-xs"
                  onClick={() => handleVote(post.id, 'like')}
                >
                  <ThumbsUp className="h-3.5 w-3.5" /> {post.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 h-7 text-xs"
                  onClick={() => handleVote(post.id, 'dislike')}
                >
                  <ThumbsDown className="h-3.5 w-3.5" /> {post.dislikes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 h-7 text-xs ml-auto"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> {post.comments.length}
                </Button>
              </div>

              {post.comments.length > 0 && (
                <div className="w-full border-t pt-3 space-y-3">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                        <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {comment.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 w-full pt-3">
                <Input
                  placeholder="Write a comment..."
                  className="text-sm h-8"
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => 
                    setCommentInputs({
                      ...commentInputs,
                      [post.id]: e.target.value
                    })
                  }
                />
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-8 px-3"
                  onClick={() => handleAddComment(post.id)}
                >
                  Reply
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-8 bg-muted/20 rounded-lg">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">
              No discussions yet. Start the conversation!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityForum;
