import { IsNotEmpty, IsString } from "class-validator";

export class anchorDto {
    @IsNotEmpty()
    @IsString()
    place: string
}