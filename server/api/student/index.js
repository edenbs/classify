import {AsyncRouter} from 'express-async-router';
import * as controller from './student.controller';
import {hasRole} from '../../auth/auth.service';
import paginate from 'express-paginate';
import multiparty from 'connect-multiparty';
const router = new AsyncRouter();

router.get('/', hasRole(['manager', 'editor', 'viewer']), paginate.middleware(10,15), controller.index);
router.get('/search', hasRole(['editor']),controller.searchStudent);
router.get('/:id', hasRole(['editor']),controller.searchStudentByID);
router.post('/', hasRole('editor'), controller.create);
router.put('/upload', hasRole('editor'), multiparty(), controller.loadExcel);
router.put('/:id', hasRole('editor'), controller.update);
router.delete('/:id', hasRole('editor'), controller.remove);

export default router;
