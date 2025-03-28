interface CounterViewResponse {
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
  }
  interface Statistics {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
  }