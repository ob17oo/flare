export interface TLauncher {
    id: number,
    title: string,
    image_url: string
}

export interface TGame {
    id: number,
    productId: number,
    launcherId: number,
    launcher: TLauncher
    genre: string
}