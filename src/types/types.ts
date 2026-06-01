export type TGroup = {
  whatsappGroupId: string;
  name: string;
};

export enum PostType {
  POST = "post",
  STORY = "story",
}

export interface ICreatePost {
  caption: string;
  imageUrl?: string;
}
export interface IPost extends ICreatePost {
  scheduledTime: string;
  postType?: PostType;
}

export interface ISendToGroupParams {
  groupId: string;
  message: string;
  imageUrl?: string;
}

export interface IAppState {
  isClientReady: boolean;
  isCronRunning: boolean;
}

export enum EMessageSentFrom {
  GROUP = "group",
  DIRECT = "direct",
}

export interface ICreatePostPayload {
  media: IMedia;
  caption: string;
  postTime: string;
}

export interface IMedia {
  imageBuffer: Buffer;
  imageName: string;
  mimeType: string;
}
