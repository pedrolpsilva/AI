import { IsNotEmpty, IsString } from "class-validator";

export class admNotificationDto {
    @IsNotEmpty()
    @IsString()
    body: string
    @IsNotEmpty()
    @IsString()
    tittle: string
}