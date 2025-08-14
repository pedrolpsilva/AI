import { IsNotEmpty, IsNumber } from "class-validator";

export class delAllNotificationDto {
    @IsNotEmpty()
    @IsNumber()
    idUser: number
}