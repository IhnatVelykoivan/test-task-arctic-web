import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ minLength: 1, maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  text!: string;
}
