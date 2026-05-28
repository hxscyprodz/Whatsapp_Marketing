export type TGroup = {
    whatsappGroupId: string;
    name: string;
};

export enum PostType {
    POST = "post",
    STORY = "story",
};

export interface IPost {
    caption: string;
    imageUrl: string;
    scheduledTime: string;
    postType?: PostType;
};

export interface ISendToGroupParams {
    groupId: string;
    message: string;
    imageUrl?: string;
};

export interface IAppState {
    isClientReady: boolean;
    isCronRunning: boolean;
};