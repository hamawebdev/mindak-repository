import { inject, injectable } from 'inversify';
import { eq, asc } from 'drizzle-orm';

import { SERVICES_DI_TYPES } from '@/container/services/di-types';
import { ServiceCategory } from '@/domain/models/service-category';
import type { IServiceCategoryRepository } from '@/domain/repositories/service-category-repository.interface';
import type { IDatabase } from '@/infra/database/database';
import { serviceCategoryTable, type ServiceCategoryEntity } from '@/infra/database/schemas/service-category';

@injectable()
export class ServiceCategoryRepository implements IServiceCategoryRepository {
  constructor(
    @inject(SERVICES_DI_TYPES.Database) private readonly database: IDatabase,
  ) {}

  async findAll(): Promise<ServiceCategory[]> {
    const db = this.database.getInstance();
    const categories = await db.query.serviceCategoryTable.findMany({
      orderBy: [asc(serviceCategoryTable.name)],
    });

    return categories.map(c => this.toServiceCategory(c));
  }

  async findAllActive(): Promise<ServiceCategory[]> {
    const db = this.database.getInstance();
    const categories = await db.query.serviceCategoryTable.findMany({
      where: eq(serviceCategoryTable.isActive, true),
      orderBy: [asc(serviceCategoryTable.name)],
    });

    return categories.map(c => this.toServiceCategory(c));
  }

  async findById(id: string): Promise<ServiceCategory | null> {
    const db = this.database.getInstance();
    const category = await db.query.serviceCategoryTable.findFirst({
      where: eq(serviceCategoryTable.id, id),
    });

    if (!category) {
      return null;
    }

    return this.toServiceCategory(category);
  }

  async create(category: ServiceCategory): Promise<ServiceCategory> {
    const db = this.database.getInstance();

    const [result] = await db.insert(serviceCategoryTable).values({
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }).returning();

    return this.toServiceCategory(result);
  }

  async update(id: string, category: Partial<ServiceCategory>): Promise<ServiceCategory> {
    const db = this.database.getInstance();

    const updateData: Partial<ServiceCategoryEntity> = {
      updatedAt: new Date(),
    };

    if (category.name !== undefined) updateData.name = category.name;
    if (category.description !== undefined) updateData.description = category.description;
    if (category.isActive !== undefined) updateData.isActive = category.isActive;

    const [result] = await db.update(serviceCategoryTable)
      .set(updateData)
      .where(eq(serviceCategoryTable.id, id))
      .returning();

    return this.toServiceCategory(result);
  }

  async delete(id: string): Promise<void> {
    const db = this.database.getInstance();
    await db.delete(serviceCategoryTable).where(eq(serviceCategoryTable.id, id));
  }

  private toServiceCategory(entity: ServiceCategoryEntity): ServiceCategory {
    return new ServiceCategory({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

