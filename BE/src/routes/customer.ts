import { Elysia } from 'elysia';
import { CustomerService } from '../services/customer.service';
import { customerSchema } from '../utils/validation';
import { isAuthenticated } from '../middleware/auth';

export const customerRouter = new Elysia({ prefix: '/customers' })
  .use(isAuthenticated)
  .get('/', async ({ query }) => {
    const { search, page, limit } = query;
    return await CustomerService.findAll({
      search: search as string,
      page: Number(page) || 1,
      limit: Number(limit) || 10
    });
  })
  .get('/:id', async ({ params: { id }, set }) => {
    try {
      return await CustomerService.findById(id);
    } catch (error) {
      set.status = 404;
      return {
        message: error instanceof Error ? error.message : 'Customer tidak ditemukan',
        error: true
      };
    }
  })
  .post('/', async ({ body, set }) => {
    try {
      const validatedData = customerSchema.parse(body);
      const customer = await CustomerService.create(validatedData);
      set.status = 201;
      return {
        message: 'Customer berhasil dibuat',
        data: customer
      };
    } catch (error) {
      set.status = 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal membuat customer',
        error: true
      };
    }
  })
  .put('/:id', async ({ params: { id }, body, set }) => {
    try {
      const validatedData = customerSchema.partial().parse(body);
      const customer = await CustomerService.update(id, validatedData);
      return {
        message: 'Customer berhasil diupdate',
        data: customer
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal mengupdate customer',
        error: true
      };
    }
  })
  .delete('/:id', async ({ params: { id }, set }) => {
    try {
      await CustomerService.delete(id);
      return {
        message: 'Customer berhasil dihapus'
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal menghapus customer',
        error: true
      };
    }
  });