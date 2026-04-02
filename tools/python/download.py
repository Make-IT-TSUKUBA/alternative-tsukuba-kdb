"""KdB の科目一覧データを CSV ファイルとしてダウンロードする。"""

import argparse
import datetime
import http.cookiejar
import os
import ssl
import urllib.parse
import urllib.request


class KdbDownloader:
    """KdB の科目一覧データを CSV ファイルとしてダウンロードするクラス。"""

    KDB_URL = "https://kdb.tsukuba.ac.jp/"

    def __init__(self, year: int = 2026) -> None:
        """Args:
            year (int, optional): 取得する年度。デフォルトは 2026。
        """
        self.year = year

    def download(self, filename: str) -> None:
        """KdB のシラバスデータをダウンロードしてファイルに保存する。

        Args:
            filename (str): 保存先のファイルパス。
        """
        ssl_context = ssl.create_default_context()
        opener = urllib.request.build_opener(
            urllib.request.HTTPSHandler(context=ssl_context),
            urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()),
        )

        opener.open(self.KDB_URL)

        # セッションの言語を日本語に切り替え
        lang_data = urllib.parse.urlencode({
            "widgetAction": "change",
            "widgetId": "BS0030",
            "pageId": "SB0070",
            "lang": "jpn",
        }).encode()
        opener.open(self.KDB_URL, data=lang_data)

        post_data = urllib.parse.urlencode({
            "pageId": "SB0070",
            "action": "downloadList",
            "hdnFy": str(self.year),
            "hdnTermCode": "",
            "hdnDayCode": "",
            "hdnPeriodCode": "",
            "hdnOrg": "",
            "hdnReq": "",
            "hdnFac": "",
            "hdnDepth": "",
            "hdnKeywords": "",
            "cmbDwldtype": "csv",
        }).encode()

        with opener.open(self.KDB_URL, data=post_data) as res:
            content = res.read().decode("cp932")

        if len(content) == 0:
            raise ValueError("Response text is empty.")

        open(filename, "w", encoding="utf-8").write(content)


def main() -> None:
    """エントリーポイント。"""
    parser = argparse.ArgumentParser()
    parser.add_argument("output_dir", help="the output directory")
    args = parser.parse_args()

    date = datetime.datetime.now()
    filename = "%s/kdb-%04d%02d%02d.csv" % (
        args.output_dir,
        date.year,
        date.month,
        date.day,
    )

    os.makedirs(args.output_dir, exist_ok=True)
    KdbDownloader().download(filename)


if __name__ == "__main__":
    main()
