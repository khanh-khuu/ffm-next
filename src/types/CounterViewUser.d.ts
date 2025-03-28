interface CounterViewUser {
    cache: number;
    success: boolean;
    method: number;
    id: string;
    userId: string;
    secUserId: null;
    verified: boolean;
    username: string;
    signature: null;
    avatar: string;
    stats: Stats;
  }
  
  interface Stats {
    likes: number;
    followers: number;
    following: number;
    videos: number;
  }