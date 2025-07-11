import { Elysia, t } from 'elysia';
import { BusinessProfileService } from '../services/business-profile.service';
import { businessProfileSchema } from '../utils/validation';

export const businessProfileRouter = new Elysia({ prefix: '/business-profile' })
  .get('/', async ({ jwt, headers: { authorization }, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: 'Unauthorized', error: true };
    }
    try {
      return await BusinessProfileService.getProfile();
    } catch (error) {
      set.status = 404;
      return {
        message: error instanceof Error ? error.message : 'Profil bisnis tidak ditemukan',
        error: true
      };
    }
  })
  .post('/', async ({ jwt, headers: { authorization }, body, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: 'Unauthorized', error: true };
    }
    try {
      const validatedData = businessProfileSchema.parse(body);
      const profile = await BusinessProfileService.create(validatedData);
      set.status = 201;
      return {
        message: 'Profil bisnis berhasil dibuat',
        data: profile
      };
    } catch (error) {
      set.status = 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal membuat profil bisnis',
        error: true
      };
    }
  }, {
    body: t.Object({
      name: t.String(),
      address: t.String(),
      phone: t.String(),
      email: t.String(),
      website: t.Optional(t.String()),
      logoUrl: t.Optional(t.String()),
      bankAccounts: t.Array(t.Object({
        bankName: t.String(),
        accountNumber: t.String(),
        accountName: t.String()
      }))
    })
  })
  .put('/:id', async ({ jwt, headers: { authorization }, params: { id }, body, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: 'Unauthorized', error: true };
    }
    try {
      const validatedData = businessProfileSchema.partial().parse(body);
      const profile = await BusinessProfileService.update(id, validatedData);
      return {
        message: 'Profil bisnis berhasil diupdate',
        data: profile
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal mengupdate profil bisnis',
        error: true
      };
    }
  }, {
    body: t.Partial(t.Object({
      name: t.String(),
      address: t.String(),
      phone: t.String(),
      email: t.String(),
      website: t.Optional(t.String()),
      logoUrl: t.Optional(t.String()),
      bankAccounts: t.Array(t.Object({
        bankName: t.String(),
        accountNumber: t.String(),
        accountName: t.String()
      }))
    }))
  })
  .put('/:id/logo', async ({ jwt, headers: { authorization }, params: { id }, body, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: 'Unauthorized', error: true };
    }
    try {
      if (!body.logoUrl || typeof body.logoUrl !== 'string') {
        set.status = 400;
        return {
          message: 'URL logo tidak valid',
          error: true
        };
      }

      const profile = await BusinessProfileService.updateLogo(id, body.logoUrl);
      return {
        message: 'Logo berhasil diupdate',
        data: profile
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal mengupdate logo',
        error: true
      };
    }
  }, {
    body: t.Object({
      logoUrl: t.String()
    })
  })
  .put('/:id/bank-accounts', async ({ jwt, headers: { authorization }, params: { id }, body, set }) => {
    const user = await jwt.verify(authorization);
    
    if (!user) {
      set.status = 401;
      return { message: 'Unauthorized', error: true };
    }
    try {
      if (!Array.isArray(body.bankAccounts)) {
        set.status = 400;
        return {
          message: 'Format data rekening bank tidak valid',
          error: true
        };
      }

      const profile = await BusinessProfileService.updateBankAccounts(id, body.bankAccounts);
      return {
        message: 'Data rekening bank berhasil diupdate',
        data: profile
      };
    } catch (error) {
      set.status = error instanceof Error && error.message.includes('tidak ditemukan') ? 404 : 400;
      return {
        message: error instanceof Error ? error.message : 'Gagal mengupdate data rekening bank',
        error: true
      };
    }
  }, {
    body: t.Object({
      bankAccounts: t.Array(t.Object({
        bankName: t.String(),
        accountNumber: t.String(),
        accountName: t.String()
      }))
    })
  });