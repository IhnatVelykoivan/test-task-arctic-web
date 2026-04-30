import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForLead(leadId: string): Promise<Comment[]> {
    await this.assertLeadExists(leadId);
    return this.prisma.comment.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createForLead(leadId: string, dto: CreateCommentDto): Promise<Comment> {
    await this.assertLeadExists(leadId);
    return this.prisma.comment.create({
      data: { leadId, text: dto.text },
    });
  }

  private async assertLeadExists(leadId: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true },
    });
    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} not found`);
    }
  }
}
