import { IsNotEmpty, IsString } from "class-validator";

export class classificationDto {
    @IsNotEmpty()
    @IsString()
    client: string
}