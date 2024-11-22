import { AVAILABLE_FILE_TYPES } from '@/constants/file.constants';
import { getRouter } from '@/utils/router.utils';

export const configRouter = getRouter();

configRouter.get('/file-types', (c) => {
  return c.json(AVAILABLE_FILE_TYPES);
});
