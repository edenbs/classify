import {AsyncRouter} from 'express-async-router';
import {hasRole} from '../../auth/auth.service';
import * as controller from './class.controller';

const router = new AsyncRouter();

router.get('/', hasRole(['manager', 'editor', 'viewer']), controller.index);
router.get('/download', hasRole(['manager', 'editor', 'viewer']), controller.download);
router.get('/:id', hasRole(['manager', 'editor', 'viewer']), controller.get);
router.post('/generate', hasRole(['editor']), controller.generate);

export default router;