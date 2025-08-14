import { IsNotEmpty, IsString } from "class-validator";

export class monitoringDto {
    @IsNotEmpty()
    @IsString()
    place: string
}