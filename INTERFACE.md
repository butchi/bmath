## コマンド・ページインターフェース

bmathは、TeX数式処理を行うためのCLIツールとWebUIを提供します。

### CLI使用方法

#### 基本的な使い方

```bash
npm run cli -- "2x + 1"
# Output: 2 x + 1
```

#### オプション

**`--mode`**: 出力形式モード
- `conventional` (デフォルト): 従来的な表記
- `consistent`: 一貫した表記（cdot を使用）

```bash
npm run cli -- "2x" --mode consistent
# Output: 2 \cdot x
```

**`--output`**: 出力形式
- `tex` (デフォルト): TeX形式
- `expr`: Expr表現（数式オブジェクト）
- `formula`: Formula形式（JSON）
- `morphion`: Morphion形式（JSON）

```bash
npm run cli -- "\sin(x)" --output expr
# Output: sin(x)

npm run cli -- "x^2" --output formula
# Output: 詳細なJSON形式の数式構造
```

#### 使用例

```bash
# TeX式の正規化
npm run cli -- "x + 1"

# 累乗式
npm run cli -- "x^2 + y^2" --mode consistent

# 分数
npm run cli -- "\frac{1}{2}"

# 三角関数
npm run cli -- "\sin(x)" --output expr

# ヘルプ表示
npm run cli -- --help
```

### Webページ

`index.html`をブラウザで開くと、Web UIでTeX数式を対話的に処理できます。

#### 機能

- **リアルタイム処理**: TeX式を入力して「処理」ボタンをクリック
- **複数の出力形式**: TeX、Expr、Formula、Morphionに切り替え可能
- **モード選択**: Conventional / Consistent モード選択
- **使用例**: よくある数式を1クリックで試用可能
- **Enterキー対応**: Enterキーで即座に処理実行

#### サポートする記法

- **基本演算**: `+`, `-`, `*` (2x), `/`
- **累乗**: `x^2`, `x^{2}`
- **分数**: `\frac{a}{b}`
- **定数**: `\pi`, `e` (E)
- **関数**: `\sin`, `\cos`, `\frac`
- **括弧**: `(...)`, `{...}`

### 処理パイプライン

```
TeX入力
  ↓
texToAst() - TeX → Matra AST
  ↓
astToTeX() - AST → TeX出力（正規化）
  ↓
TeX出力

または

TeX入力
  ↓
texToExpr() - TeX → Expr（計算用式）
  ↓
複数の出力形式へ変換
  - toExpression() → Expr文字列表現
  - exprToMatraExprNode() → Matra形式
  - toMorphionForm() → 多項式形式
```

### エラーハンドリング

- 無効な記法はエラーメッセージで報告
- CLIでは失敗時に入力をそのまま返す場合もあります
- WebUIではエラーメッセージを画面に表示
