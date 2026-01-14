import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTextDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
