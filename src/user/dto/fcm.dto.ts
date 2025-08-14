import { IsNotEmpty, IsString } from "class-validator";

export class fcmUserDto {
    @IsNotEmpty()
    @IsString()
    idUser: string
    @IsNotEmpty()
    @IsString()
    fcm: string
    @IsNotEmpty()
    @IsString()
    date: string
}