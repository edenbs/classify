import {AsyncRouter} from 'express-async-router';
import * as controller from './class.controller';

const router = new AsyncRouter();

router.get('/', controller.index);
router.get('/download', controller.download);
router.get('/:id', controller.get);
router.post('/generate', controller.generate);

export default router;