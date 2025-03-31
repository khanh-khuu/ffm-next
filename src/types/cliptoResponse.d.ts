interface CliptoResponse {
  success: boolean;
  message: string;
  title: string;
  duration: number;
  thumbnail: string;
  medias: CliptoMedia[];
}

interface CliptoMedia {
  url: string;
  type: string;
  extension: string;
  quality: string;
  is_audio: boolean;
}
