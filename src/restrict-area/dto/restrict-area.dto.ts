import { IsNotEmpty, IsString } from "class-validator";

export class restrictAreaDto {
    @IsNotEmpty()
    @IsString()
    client: string
}