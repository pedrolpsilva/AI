import { IsNotEmpty, IsString } from "class-validator";

export class updateLoginDto {
    @IsNotEmpty()
    @IsString()
    user: string
    @IsNotEmpty()
    @IsString()
    fcm: string
}