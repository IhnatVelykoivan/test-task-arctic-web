import { NotFoundException } from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { CreateLeadDto } from './dto/create-lead.dto';
import {
  LeadSortField,
  QueryLeadsDto,
  SortOrder,
} from './dto/query-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

type LeadDelegateMock = {
  create: jest.Mock;
  findMany: jest.Mock;
  count: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

interface PrismaMock {
  lead: LeadDelegateMock;
  $transaction: jest.Mock;
}

function makePrismaMock(): PrismaMock {
  const lead: LeadDelegateMock = {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  return {
    lead,
    $transaction: jest.fn((args: Promise<unknown>[]) => Promise.all(args)),
  };
}

const baseQuery: QueryLeadsDto = {
  page: 1,
  limit: 10,
  sort: LeadSortField.CREATED_AT,
  order: SortOrder.DESC,
} as QueryLeadsDto;

describe('LeadsService', () => {
  let prisma: PrismaMock;
  let service: LeadsService;

  beforeEach(() => {
    prisma = makePrismaMock();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service = new LeadsService(prisma as any);
  });

  describe('create', () => {
    it('delegates to prisma with the dto', async () => {
      const dto: CreateLeadDto = { name: 'Acme' } as CreateLeadDto;
      prisma.lead.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);

      expect(prisma.lead.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toMatchObject({ id: '1', name: 'Acme' });
    });
  });

  describe('findAll', () => {
    it('returns empty pagination meta with totalPages clamped to 1', async () => {
      prisma.lead.findMany.mockResolvedValue([]);
      prisma.lead.count.mockResolvedValue(0);

      const result = await service.findAll(baseQuery);

      expect(result.items).toEqual([]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      });
    });

    it('applies status filter', async () => {
      prisma.lead.findMany.mockResolvedValue([]);
      prisma.lead.count.mockResolvedValue(0);

      await service.findAll({ ...baseQuery, status: LeadStatus.NEW });

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: LeadStatus.NEW }),
        }),
      );
    });

    it('searches name/email/company case-insensitively when q is provided', async () => {
      prisma.lead.findMany.mockResolvedValue([]);
      prisma.lead.count.mockResolvedValue(0);

      await service.findAll({ ...baseQuery, q: 'acme' });

      const call = prisma.lead.findMany.mock.calls[0][0];
      expect(call.where.OR).toEqual([
        { name: { contains: 'acme', mode: 'insensitive' } },
        { email: { contains: 'acme', mode: 'insensitive' } },
        { company: { contains: 'acme', mode: 'insensitive' } },
      ]);
    });

    it('ignores blank q', async () => {
      prisma.lead.findMany.mockResolvedValue([]);
      prisma.lead.count.mockResolvedValue(0);

      await service.findAll({ ...baseQuery, q: '   ' });

      const call = prisma.lead.findMany.mock.calls[0][0];
      expect(call.where.OR).toBeUndefined();
    });

    it('translates page/limit into skip/take and totalPages', async () => {
      prisma.lead.findMany.mockResolvedValue([]);
      prisma.lead.count.mockResolvedValue(25);

      const result = await service.findAll({
        ...baseQuery,
        page: 3,
        limit: 10,
      });

      const call = prisma.lead.findMany.mock.calls[0][0];
      expect(call.skip).toBe(20);
      expect(call.take).toBe(10);
      expect(result.meta.totalPages).toBe(3);
    });

    it('honors sort and order', async () => {
      prisma.lead.findMany.mockResolvedValue([]);
      prisma.lead.count.mockResolvedValue(0);

      await service.findAll({
        ...baseQuery,
        sort: LeadSortField.UPDATED_AT,
        order: SortOrder.ASC,
      });

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { updatedAt: 'asc' } }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the lead when present', async () => {
      const lead = { id: '1', name: 'Acme' };
      prisma.lead.findUnique.mockResolvedValue(lead);

      await expect(service.findOne('1')).resolves.toBe(lead);
    });

    it('throws NotFoundException when missing', async () => {
      prisma.lead.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates an existing lead', async () => {
      prisma.lead.findUnique.mockResolvedValue({ id: '1' });
      prisma.lead.update.mockResolvedValue({ id: '1', name: 'New' });

      const dto: UpdateLeadDto = { name: 'New' };
      const result = await service.update('1', dto);

      expect(prisma.lead.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
      expect(result.name).toBe('New');
    });

    it('throws NotFoundException for missing lead', async () => {
      prisma.lead.findUnique.mockResolvedValue(null);

      await expect(service.update('x', {})).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.lead.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the lead', async () => {
      prisma.lead.findUnique.mockResolvedValue({ id: '1' });
      prisma.lead.delete.mockResolvedValue({});

      await service.remove('1');

      expect(prisma.lead.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('throws NotFoundException for missing lead', async () => {
      prisma.lead.findUnique.mockResolvedValue(null);

      await expect(service.remove('x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.lead.delete).not.toHaveBeenCalled();
    });
  });
});
