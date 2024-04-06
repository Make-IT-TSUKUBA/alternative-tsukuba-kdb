## ディレクトリ構成

- `csv/`：取得した CSV データ
- `python/`：シラバスのダウンロード・変換等に必要なツール群

## 開発

```bash
python -m ruff check
python -m ruff format
```

## シラバスデータの保存と変換

KdB からシラバスデータを取得し、学群／大学院開設授業科目に分けて JSON ファイルに変換します。
また、科目番号と科目区分の対応表を出力します。
対応付けを変更する場合は `python/list.txt` を編集します。

```bash
# tools/csv/ に kdb-YYYYMMDD.csv を保存
python tools/python/download.py tools/csv

# 以下のファイルを保存
# - src/kdb.json
# - src/kdb-grad.json
# - src/code-types.json
python tools/python/csv-json.py tools/csv/kdb-YYYYMMDD.csv tools/python/list.txt src
```

保存した CSV ファイルと、生成されたファイル群はコミットに含めてください。
なお、これらのスクリプトは基本的に CI 上で実行されます。

## 大学院開設授業科目の科目番号対応表

大学院開設授業科目における科目番号の対応は複雑であるため、スクリプトを用いて自動で生成します。この工程は手動で行います。

```bash
# 区分毎の CSV ファイルを取得し、dst/ に保存
python tools/python/download-grad.py
# 保存された CSV ファイルを基に対応表を作成し、src/code-types-grad.json に保存
python tools/python/code-types-grad.py
```
