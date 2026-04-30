import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('comments')
@Controller('leads/:id/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'List comments for a lead (newest first)' })
  @ApiOkResponse({ description: 'Comments for the lead' })
  @ApiNotFoundResponse({ description: 'Lead not found' })
  list(@Param('id', new ParseUUIDPipe()) leadId: string) {
    return this.commentsService.listForLead(leadId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a comment to a lead' })
  @ApiCreatedResponse({ description: 'Comment created' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Lead not found' })
  create(
    @Param('id', new ParseUUIDPipe()) leadId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createForLead(leadId, dto);
  }
}
