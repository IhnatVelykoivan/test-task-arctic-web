import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService, PaginatedLeads } from './leads.service';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiCreatedResponse({ description: 'Lead created' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List leads with search, filter, sort, pagination' })
  @ApiOkResponse({
    description: 'Paginated list of leads',
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { type: 'object' } },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 0 },
            totalPages: { type: 'integer', example: 1 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  findAll(@Query() query: QueryLeadsDto): Promise<PaginatedLeads> {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead by id' })
  @ApiOkResponse({ description: 'Lead found' })
  @ApiNotFoundResponse({ description: 'Lead not found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead (partial)' })
  @ApiOkResponse({ description: 'Lead updated' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Lead not found' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lead' })
  @ApiNoContentResponse({ description: 'Lead deleted' })
  @ApiNotFoundResponse({ description: 'Lead not found' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadsService.remove(id);
  }
}
