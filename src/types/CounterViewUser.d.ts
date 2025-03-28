interface CounterViewUser {
    id: string;
    userId: string;
    username: string;
    avatar: string;
    stats: Stats;
  }
  
  interface Stats {
    likes: number;
    followers: number;
    following: number;
    videos: number;
  }