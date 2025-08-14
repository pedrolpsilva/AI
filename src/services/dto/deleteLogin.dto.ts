import { IsNotEmpty, IsString } from "class-validator";

export class deleteLoginDto {
    @IsNotEmpty()
    @IsString()
    fcm: string
}