import { inject, injectable } from 'inversify';
import { eq, inArray, asc } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { Service } from '@/domain/models/service';
import type { IServiceRepository } from '@/domain/repositories/service-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { serviceTable, type ServiceEntity } from '@/infra/database/schemas/service';

@injectable()
export class ServiceRepository implements IServiceRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async findAll(): Promise<Service[]> {
    const db = this.database.getInstance();
    const services = await db.query.serviceTable.findMany({
      orderBy: [asc(serviceTable.displayOrder), asc(serviceTable.name)],
    });

    return services.map(s => this.toService(s));
  }

  async findAllActive(): Promise<Service[]> {
    const db = this.database.getInstance();
    const services = await db.query.serviceTable.findMany({
      where: eq(serviceTable.isActive, true),
      orderBy: [asc(serviceTable.displayOrder), asc(serviceTable.name)],
    });

    return services.map(s => this.toService(s));
  }

  async findById(id: string): Promise<Service | null> {
    const db = this.database.getInstance();
    const service = await db.query.serviceTable.findFirst({
      where: eq(serviceTable.id, id),
    });

    if (!service) {
      return null;
    }

    return this.toService(service);
  }

  async create(service: Service): Promise<Service> {
    const db = this.database.getInstance();

    const [result] = await db.insert(serviceTable).values({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      categoryId: service.categoryId,
      isActive: service.isActive,
      displayOrder: service.displayOrder,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }).returning();

    return this.toService(result);
  }

  async update(id: string, service: Partial<Service>): Promise<Service> {
    const db = this.database.getInstance();

    const updateData: Partial<ServiceEntity> = {
      updatedAt: new Date(),
    };

    if (service.name !== undefined) updateData.name = service.name;
    if (service.description !== undefined) updateData.description = service.description;
    if (service.price !== undefined) updateData.price = service.price;
    if (service.categoryId !== undefined) updateData.categoryId = service.categoryId;
    if (service.isActive !== undefined) updateData.isActive = service.isActive;
    if (service.displayOrder !== undefined) updateData.displayOrder = service.displayOrder;

    const [result] = await db.update(serviceTable)
      .set(updateData)
      .where(eq(serviceTable.id, id))
      .returning();

    return this.toService(result);
  }

  async delete(id: string): Promise<void> {
    const db = this.database.getInstance();
    await db.delete(serviceTable).where(eq(serviceTable.id, id));
  }

  async toggleStatus(id: string): Promise<Service> {
    const db = this.database.getInstance();

    // First get the current service
    const currentService = await this.findById(id);
    if (!currentService) {
      throw new Error('Service not found');
    }

    // Toggle the status
    const [result] = await db.update(serviceTable)
      .set({
        isActive: !currentService.isActive,
        updatedAt: new Date(),
      })
      .where(eq(serviceTable.id, id))
      .returning();

    return this.toService(result);
  }

  async bulkUpdateStatus(ids: string[], isActive: boolean): Promise<void> {
    const db = this.database.getInstance();

    await db.update(serviceTable)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(inArray(serviceTable.id, ids));
  }

  async checkServicesExistAndActive(ids: string[]): Promise<{ valid: boolean; invalidIds: string[] }> {
    const db = this.database.getInstance();

    const services = await db.query.serviceTable.findMany({
      where: inArray(serviceTable.id, ids),
    });

    const foundActiveIds = services
      .filter(s => s.isActive)
      .map(s => s.id);

    const invalidIds = ids.filter(id => !foundActiveIds.includes(id));

    return {
      valid: invalidIds.length === 0,
      invalidIds,
    };
  }

  private toService(entity: ServiceEntity): Service {
    return new Service({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      categoryId: entity.categoryId,
      isActive: entity.isActive,
      displayOrder: entity.displayOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

