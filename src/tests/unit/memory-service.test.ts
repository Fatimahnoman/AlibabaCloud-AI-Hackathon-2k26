import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryService } from '@/services/chat/memory.service';

vi.mock('@/lib/prisma', () => {
  const mock = {
    userMemory: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
  return { default: mock };
});

import prisma from '@/lib/prisma';
const mockedPrisma = vi.mocked(prisma);

describe('MemoryService', () => {
  let service: MemoryService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MemoryService();
  });

  describe('getMemory', () => {
    it('returns all memories for a user', async () => {
      const memories = [
        { id: '1', userId: 'u1', key: 'country', value: 'Pakistan', source: 'conversation', createdAt: new Date(), updatedAt: new Date() },
      ];
      mockedPrisma.userMemory.findMany.mockResolvedValue(memories);

      const result = await service.getMemory('u1');
      expect(result).toEqual(memories);
      expect(mockedPrisma.userMemory.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('setMemory', () => {
    it('creates or updates memory via upsert', async () => {
      const mem = { id: '1', userId: 'u1', key: 'country', value: 'Pakistan', source: 'auto', createdAt: new Date(), updatedAt: new Date() };
      mockedPrisma.userMemory.upsert.mockResolvedValue(mem);

      const result = await service.setMemory('u1', 'country', 'Pakistan');
      expect(result).toEqual(mem);
      expect(mockedPrisma.userMemory.upsert).toHaveBeenCalled();
    });

    it('normalizes key to lowercase with underscores', async () => {
      mockedPrisma.userMemory.upsert.mockResolvedValue({} as never);

      await service.setMemory('u1', '  Education Level  ', 'Bachelors');

      const call = mockedPrisma.userMemory.upsert.mock.calls[0][0];
      expect(call.where.userId_key.key).toMatch(/education_level/);
      expect(call.create.key).toMatch(/education_level/);
    });

    it('blocks sensitive keys', async () => {
      const result = await service.setMemory('u1', 'password', 'secret123');
      expect(result).toBeNull();
      expect(mockedPrisma.userMemory.upsert).not.toHaveBeenCalled();
    });

    it('blocks credit card numbers', async () => {
      const result = await service.setMemory('u1', 'card', '4111 1111 1111 1111');
      expect(result).toBeNull();
    });

    it('blocks API key patterns', async () => {
      const result = await service.setMemory('u1', 'key', 'api_key=abc123');
      expect(result).toBeNull();
    });

    it('blocks password patterns in value', async () => {
      const result = await service.setMemory('u1', 'info', 'password: hunter2');
      expect(result).toBeNull();
    });
  });

  describe('deleteMemory', () => {
    it('deletes a specific memory key', async () => {
      mockedPrisma.userMemory.deleteMany.mockResolvedValue({ count: 1 });

      await service.deleteMemory('u1', 'country');
      expect(mockedPrisma.userMemory.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1', key: 'country' },
      });
    });
  });

  describe('deleteAllMemory', () => {
    it('deletes all memories for a user', async () => {
      mockedPrisma.userMemory.deleteMany.mockResolvedValue({ count: 5 });

      await service.deleteAllMemory('u1');
      expect(mockedPrisma.userMemory.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
    });
  });

  describe('extractAndStoreFacts', () => {
    it('extracts education level', async () => {
      mockedPrisma.userMemory.upsert.mockResolvedValue({} as never);

      await service.extractAndStoreFacts('u1', 'I am studying bachelors in CS');

      const call = mockedPrisma.userMemory.upsert.mock.calls[0][0];
      expect(call.create.key).toBe('education_level');
      expect(call.create.value).toBe('studying');
      expect(call.create.source).toBe('conversation');
    });

    it('extracts country name', async () => {
      mockedPrisma.userMemory.upsert.mockResolvedValue({} as never);

      await service.extractAndStoreFacts('u1', 'I am from Pakistan');

      const call = mockedPrisma.userMemory.upsert.mock.calls[0][0];
      expect(call.create.key).toBe('preferred_country');
      expect(call.create.value).toBe('Pakistan');
    });

    it('extracts field of study', async () => {
      mockedPrisma.userMemory.upsert.mockResolvedValue({} as never);

      await service.extractAndStoreFacts('u1', 'I study computer science');

      const call = mockedPrisma.userMemory.upsert.mock.calls[0][0];
      expect(call.create.key).toBe('field');
      expect(call.create.value).toBe('computer science');
    });

    it('extracts budget info', async () => {
      mockedPrisma.userMemory.upsert.mockResolvedValue({} as never);

      await service.extractAndStoreFacts('u1', 'My budget is $500');

      const call = mockedPrisma.userMemory.upsert.mock.calls[0][0];
      expect(call.create.key).toBe('budget');
    });

    it('extracts language preference', async () => {
      mockedPrisma.userMemory.upsert.mockResolvedValue({} as never);

      await service.extractAndStoreFacts('u1', 'I prefer roman urdu');

      const call = mockedPrisma.userMemory.upsert.mock.calls[0][0];
      expect(call.create.key).toBe('language_preference');
      expect(call.create.value).toBe('roman urdu');
    });

    it('does not store sensitive extracted facts', async () => {
      await service.extractAndStoreFacts('u1', 'my password is abc123');
      expect(mockedPrisma.userMemory.upsert).not.toHaveBeenCalled();
    });
  });
});
