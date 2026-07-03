import { Link } from 'react-router-dom';

/**
 * 首次使用引導（骨架佔位）。2–3 步驟的實際內容與插圖留待後續 stage。
 * 刻意獨立於 AppLayout 之外，之後可做成全螢幕引導。
 */
export function Onboarding() {
  return (
    <section className="onboarding">
      <h1>歡迎來到習慣花園 🌱</h1>
      <ol className="onboarding-steps">
        <li>新增一個想養成的習慣，挑一株代表它的植物。</li>
        <li>每天完成後打卡，植物就會一天天長大。</li>
        <li>持續越久花開得越好；中斷了它會枯萎，提醒你重新開始。</li>
      </ol>
      <Link className="btn" to="/">
        開始種植 →
      </Link>
    </section>
  );
}
