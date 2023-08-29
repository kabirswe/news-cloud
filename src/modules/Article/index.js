import path from '../../routes/path';
import Content from './Content';
import Edit from './Content/Edit';
import New from './Content/New';
import Preview from './Content/Preview';
import Copy from './Content/New/copyArticle';

export const ArticleModule = [
  {
    path: path.content,
    component: Content
  },
  {
    path: path.contentEdit,
    component: Edit
  },
  {
    path: path.contentCreate,
    component: New
  },
  {
    path: path.contentCopy,
    component: Copy
  },
  {
    path: path.contentPreview,
    component: Preview
  }
];
