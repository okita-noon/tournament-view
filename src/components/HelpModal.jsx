import './HelpModal.css'

function HelpModal({ onClose }) {
  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="help-modal-close" onClick={onClose}>×</button>

        <h1>トーナメント表示アプリ - 使い方</h1>

        <section>
          <h2>📝 選手の設定</h2>
          <ul>
            <li>各スロットをクリックしてプルダウンから選手を選択</li>
            <li>選択済みの選手は他のスロットでは選べません</li>
            <li>設定済みの選手をクリックすると選択解除できます</li>
            <li>12人全員を設定すると自動的に対戦モードに移行します</li>
          </ul>
        </section>

        <section>
          <h2>🎲 デバッグ機能</h2>
          <ul>
            <li><strong>ランダム設定ボタン（🎲）</strong>: 12人の選手をランダムに設定</li>
            <li>対戦のテストやデバッグに便利です</li>
          </ul>
        </section>

        <section>
          <h2>⚙️ コントロールパネル</h2>
          <ul>
            <li><strong>⚙️ボタン</strong>: 左下のギアアイコンでコントロールを表示/非表示</li>
          </ul>
        </section>

        <section>
          <h2>🔍 表示操作</h2>
          <ul>
            <li><strong>+ / −</strong>: 拡大・縮小（0.5倍〜2.0倍）</li>
            <li><strong>↑ ↓ ← →</strong>: 表示位置を移動</li>
            <li><strong>●</strong>: 表示位置と拡大率を初期状態に戻す</li>
            <li>設定は自動的に保存されます</li>
          </ul>
        </section>

        <section>
          <h2>🏆 対戦モード</h2>
          <ul>
            <li>選手のプレート中央50%をクリックして勝者を選択</li>
            <li>選択した選手が次のラウンドへ進みます</li>
            <li>赤いアニメーション線で勝ち上がり経路を表示</li>
            <li>敗者のプレートはグレーアウトします</li>
          </ul>
        </section>

        <section>
          <h2>🔄 リセット・やり直し</h2>
          <ul>
            <li><strong>⟲ボタン</strong>: 1つ前の状態に戻す（対戦モード中のみ）</li>
            <li><strong>↻ボタン</strong>: 全てをリセットして最初から
              <ul>
                <li>※ 拡大率や表示位置はリセットされません</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2>💾 データ保存</h2>
          <ul>
            <li>選手設定、対戦結果、表示設定は自動的にブラウザに保存されます</li>
            <li>ページを閉じても続きから再開できます</li>
          </ul>
        </section>

        <section className="help-tips">
          <h2>💡 Tips</h2>
          <ul>
            <li>開発者向け: <kbd>Ctrl/Cmd + Shift + R</kbd> でプレート位置をリセット</li>
            <li>クリック可能範囲はプレートの中央50%のみです</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default HelpModal
