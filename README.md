# alternative-tsukuba-kdb

[![CSV scheduled update](https://github.com/Make-IT-TSUKUBA/alternative-tsukuba-kdb/actions/workflows/update-syllabus.yml/badge.svg)](https://github.com/Make-IT-TSUKUBA/alternative-tsukuba-kdb/actions/workflows/update-syllabus.yml)

筑波大学の教育課程編成支援システム（KdB）の非公式代替サイトです。  
An unofficial website of the alternative of KdB, a curriculum planning support system used in University of Tsukuba.  

<https://make-it-tsukuba.github.io/alternative-tsukuba-kdb/>

本サイトは、筑波大学 情報学群情報メディア創成学類の公認を受けています。  
It is approved by The College of Media arts, Science and Technology (MAST) in University of Tsukuba.  
<https://www.mast.tsukuba.ac.jp/lecture/timetable.html>

## 開発

`/csv` 配下に過去の科目データの CSV ファイルが含まれるため、clone/pull に時間を要する場合があります。スパースチェックアウト等を活用することをおすすめします。

```bash
# /csv を除外
git clone --depth 1 --filter=blob:none --no-checkout git@github.com:Make-IT-TSUKUBA/alternative-tsukuba-kdb.git
cd alternative-tsukuba-kdb
git sparse-checkout init --cone
git sparse-checkout set ":!csv"
git checkout
```

詳細な開発手順については、以下の README.md を参照してください。

- `/frontend`：フロントエンド
- `/tools`：科目データの取得、管理用スクリプト

## ライセンス

This application is released under the MPL License, see [LICENSE](https://github.com/Make-IT-TSUKUBA/alternative-tsukuba-kdb/blob/main/LICENSE).
