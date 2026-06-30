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
  postType?: PostType;
  posted?: boolean;
}

export interface ISendMessageParams {
  groupId?: string;
  to: "group" | "contact";
  contactId?: string;
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
  postType: PostType;
}

export interface IMedia {
  imageBuffer: Buffer;
  imageName: string;
  mimeType: string;
}

export interface IApiResponse {
  success: boolean;
  message: string;
  error: IError;
  data: [];
};

export interface IJWTPayload {
  phoneNumber: string;
  role: ERoles;
}

export interface IError {
  name: string;
  message: string;
}

export interface IClient extends IClientRegister {
  previousPassword: string;
  lastPasswordUpdate: Date;
  lastLogin: Date;
  isEmailVerified: boolean;
};

export interface IClientRegister {
  clientName: string;
  phoneNumber: string,
  email: string;
  role: ERoles;
  password: string;
}

export enum ERoles {
  ADMIN = "admin",
  CLIENT = "client"
}

export interface IError {
  name: string;
  message: string;
}