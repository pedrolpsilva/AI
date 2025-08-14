import { IsNotEmpty, IsString } from "class-validator";

export class referencesDto {
    @IsNotEmpty()
    @IsString()
    client: string
}