import { ApplyUser } from './current-user.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/userLogin.dto';
import { Request, Response } from 'express';
import { User } from './entities/user.entity';
import { CurrentUser } from './user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async loginUser(@Body() loginDto: any, @Res() res: Response) {
    const { token, user } = await this.authService.login(
      loginDto as UserLoginDto,
    );
    /*res.setHeader('Set-Cookie', token);
    return res.send({ success: true });
*/

    res.cookie('IsAuthenticated', true, { maxAge: 2 * 60 * 60 * 1000 });
    res.cookie('Authentication', token, {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000,
    }); // max age 2 hours

    return res.send({ success: true, user });
  }

  @Post('register')
  registerUser(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('Authentication');
    return res.status(200).send({ success: true });
  }

  @Get('authstatus')
  @UseGuards(ApplyUser)
  authStatus(@CurrentUser() user: User) {
    console.log(!!user);
    return { status: !!user, user };
  }
}
