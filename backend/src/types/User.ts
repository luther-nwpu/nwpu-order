export interface IUser {
    user_id: string
    wx_openid: string
    wx_info: IWxInfo
    create_at: string
    update_at: string
    school_id: string
}

export interface IWxInfo {
    openId: string
    nickName: string
    gender: number
    city: string
    province: string,
    country: string,
    avatarUrl: string,
    unionId: string,
    watermark: {
        appid: string,
        timestamp: number
    }
}
