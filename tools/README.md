# alternative-tsukuba-kdb/tools

## ディレクトリ構成

- `python/`：シラバスのダウンロードに必要なツール群
- `src/`：TypeScript ソースファイル
- `../csv/`：取得した CSV データ

## 開発

```bash
# インストール
yarn

# フォーマット
uvx ruff check
uvx ruff format
yarn run check
```

## シラバスデータの保存と変換

KdB からシラバスデータを一括取得した後、学群／大学院開設授業科目に分けて JSON ファイルに変換します。

```bash
# /csv/kdb-YYYYMMDD.csv を保存
cd tools
uv run python python/download.py ../csv

# 以下のファイルを保存
# - /frontend/src/kdb/kdb.json
# - /frontend/src/kdb/kdb-grad.json
uv run python python/csv-json.py ../csv/kdb-YYYYMMDD.csv ../frontend/src/kdb
```

保存した CSV ファイルおよび生成されたファイル群はコミットに含めてください。
なお、これらのスクリプトは基本的に CI 上で実行されます。

## 科目番号対応表

学群／大学院開設授業科目における科目番号の対応は複雑であるため、スクリプトを用いて自動で生成します。この工程は手動で行います。

```bash
# 区分毎の CSV ファイルを取得
# 学群開設授業科目：dst-undergrad/ に保存
yarn run download:undergrad
# 大学院開設授業科目：dst-grad/ に保存
yarn run download:grad

# 保存された CSV ファイルを基に対応表を作成
# 学群開設授業科目：/frontend/src/kdb/code-types-undergrad.json に保存
yarn run code-types:undergrad
# 大学院開設授業科目：/frontend/src/kdb/code-types-grad.json に保存
yarn run code-types:grad
```

この際に使用する区分の並びの定義は、`src/undergrad.yaml`, `src/grad.yaml` に手動で定義します。
