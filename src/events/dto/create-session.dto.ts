
import {
  IsString,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsString()
  @IsNotEmpty()
  room: string;
}
