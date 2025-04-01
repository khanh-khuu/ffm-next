interface iLoveTikResponse {
  api: Api;
}

interface Api {
  service: string;
  status: string;
  message: string;
  id: string;
  title: string;
  description: string;
  createdTime: string;
  previewUrl: string;
  imagePreviewUrl: string;
  permalink: string;
  userInfo: UserInfo;
  userStats: UserStats;
  mediaStats: MediaStats;
  mediaItems: MediaItem[];
}

interface MediaItem {
  type: string;
  name: string;
  mediaId: string;
  mediaUrl: string;
  mediaPreviewUrl?: string;
  mediaThumbnail?: string;
  mediaRes: boolean | string;
  mediaQuality: string;
  mediaDuration: string;
  mediaExtension: string;
  mediaFileSize: string;
  mediaProcessType: string;
}

interface MediaStats {
  likesCount: string;
  commentsCount: number;
  favouritesCount: string;
  sharesCount: string;
  viewsCount: string;
  downloadsCount: number;
}

interface UserStats {
  mediaCount: number;
  followersCount: string;
  followingCount: number;
  likesCount: string;
}

interface UserInfo {
  name: string;
  userCategory: boolean;
  userBio: boolean;
  username: string;
  userId: string;
  userAvatar: string;
  userPhone: boolean;
  userEmail: boolean;
  externalUrl: boolean;
  isVerified: boolean;
}