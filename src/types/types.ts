export type TGroup = {
    whatsappGroupId: string;
    name: string;
};

export interface IPost {
    caption: string;
    imageUrl: string;
    scheduledTime: string;
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