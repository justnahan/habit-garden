import { Link } from 'react-router-dom';
import { EmptyState as EmptyStateBlock } from '../design/states';
import { IconPlus } from '../design/icons';

/**
 * 空狀態預覽路由（/empty）。
 *
 * 真正的空狀態在花園總覽無習慣時就會顯示（同一個 design-system 元件）；
 * 這條路由只是方便單獨預覽該畫面，兩者共用 `design/states` 的 EmptyState，
 * 不各自維護一份插圖與文案。
 */
export function EmptyState() {
  return (
    <EmptyStateBlock
      actions={
        <Link className="btn btn--accent" to="/habits/new">
          <IconPlus size={18} /> 種下第一個習慣
        </Link>
      }
    />
  );
}
