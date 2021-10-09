import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '../auth/entities/user.entity';
import { ACGuard, UseRoles } from 'nest-access-control';
import { FileInterceptor } from '@nestjs/platform-express';
import multer, { diskStorage } from 'multer';

@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), ACGuard)
  @UseRoles({
    resource: 'posts',
    action: 'create',
    possession: 'any',
  })
  create(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
    return this.postService.create(createPostDto, req.user as User);
  }

  // Upload Picture to Server
  @Post('upload-photo')
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const name = file.originalname.split('.')[0];
          const fileExtension = file.originalname.split('.')[1];
          const newFilename =
            name.split(' ').join('_') + '_' + Date.now() + '.' + fileExtension;
          cb(null, newFilename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(null, false);
        }
        callback(null, true);
      },
    }),
  )
  uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return {
        error: 'File is not an image, please upload correct format',
      };
    } else {
      const response = {
        filePath: `http://localhost:5000/api/posts/pictures/${file.filename}`,
      };
      return response;
    }
  }

  //  GET Photos
  @Get('pictures/:fileId')
  async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, { root: './uploads' });
  }

  @Get()
  findAll(@Query() query: any) {
    // We are only targeting query parameters, slug and sort
    return this.postService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Get('/slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postService.findBySlug(slug);
  }

  @Patch(':slug')
  @UseGuards(AuthGuard('jwt'), ACGuard)
  @UseRoles({
    resource: 'posts',
    action: 'update',
    possession: 'any',
  })
  update(@Param('slug') slug: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(slug, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), ACGuard)
  @UseRoles({
    resource: 'posts',
    action: 'delete',
    possession: 'any',
  })
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
