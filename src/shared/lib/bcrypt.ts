import { hash } from "bcrypt"

export const hashPassowrd = async (password: string): Promise<string> => {
    return await hash(password, 12)
}
