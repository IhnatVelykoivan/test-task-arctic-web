import { NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';

interface PrismaMock {
  lead: { findUnique: jest.Mock };
  comment: { findMany: jest.Mock; create: jest.Mock };
}

function makePrismaMock(): PrismaMock {
  return {
    lead: { findUnique: jest.fn() },
    comment: { findMany: jest.fn(), create: jest.fn() },
  };
}

describe('CommentsService', () => {
  let prisma: PrismaMock;
  let service: CommentsService;

  beforeEach(() => {
    prisma = makePrismaMock();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service = new CommentsService(prisma as any);
  });

  describe('listForLead', () => {
    it('returns comments newest first when lead exists', async () => {
      prisma.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
      prisma.comment.findMany.mockResolvedValue([{ id: 'c-1', text: 'hi' }]);

      const result = await service.listForLead('lead-1');

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { leadId: 'lead-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([{ id: 'c-1', text: 'hi' }]);
    });

    it('throws NotFoundException when lead is missing', async () => {
      prisma.lead.findUnique.mockResolvedValue(null);

      await expect(service.listForLead('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.comment.findMany).not.toHaveBeenCalled();
    });
  });

  describe('createForLead', () => {
    it('creates the comment under the lead', async () => {
      prisma.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
      prisma.comment.create.mockResolvedValue({
        id: 'c-1',
        leadId: 'lead-1',
        text: 'hello',
      });

      const result = await service.createForLead('lead-1', { text: 'hello' });

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: { leadId: 'lead-1', text: 'hello' },
      });
      expect(result.id).toBe('c-1');
    });

    it('throws NotFoundException when lead is missing', async () => {
      prisma.lead.findUnique.mockResolvedValue(null);

      await expect(
        service.createForLead('missing', { text: 'hello' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.comment.create).not.toHaveBeenCalled();
    });
  });
});
