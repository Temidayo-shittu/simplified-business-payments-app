import { SelectQueryBuilder } from 'typeorm';

export class ApiFeatures<T> {
  constructor(
    private readonly query: SelectQueryBuilder<T>,
    private readonly queryStr: any
  ) {}

  search(): this {
    const keyword = this.queryStr.keyword;

    if (keyword) {
      this.query.where('name ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }
    return this;
  }

  filter(): this {
    const queryCopy = { ...this.queryStr };
    const removeFields = ['keyword', 'page', 'limit'];

    removeFields.forEach((key) => delete queryCopy[key]);

    Object.entries(queryCopy).forEach(([key, value]) => {
      this.query.andWhere(`${key} = :value`, { [key]: value });
    });

    return this;
  }

  pagination(resultPerPage: number): this {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    if (isNaN(skip) || isNaN(resultPerPage)) {
      throw new Error('Invalid pagination parameters');
    }

    this.query.skip(skip).take(resultPerPage);
    return this;
  }

  async executeQuery(): Promise<T[]> {
    return await this.query.getMany();
  }
}
