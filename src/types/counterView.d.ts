interface CounterViewResponse {
    cache: boolean;
    success: boolean;
    userData: UserDatum[];
    author: Author;
  }
  
  interface Author {
    username: string;
    id: string;
    userId: string;
    avatar: string;
  }
  
  interface UserDatum {
    title: string;
    cover: string;
    dynamicCover: string;
    id: string;
    publishedAt: number;
    statistics: Statistics;
    engagement: Engagement;
    estimatedEarnings: EstimatedEarnings;
  }
  
  interface EstimatedEarnings {
    min: string;
    max: string;
  }
  
  interface Engagement {
    all: string;
    likes: string;
    comments: string;
    shares: string;
  }
  
  interface Statistics {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
  }