import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';


export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {
    super({
      ignoreExpiration: false,
      secretOrKey: 'secretStringThatNoOneCanGuess',
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        return request?.cookies?.Authentication;
      }]),
    });
  }

  async validate(payload: any, req: Request) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    const user = await this.repo.findOne({ email: payload.email });
    if (!user) {
      throw new UnauthorizedException();
    }
    req.user = user;
    return req.user;
  }
}
