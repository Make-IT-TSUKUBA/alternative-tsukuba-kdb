"""KdB データの CSV ファイルを JSON ファイルに変換する。"""

import argparse
import csv
import datetime
import json
from typing import Any, Dict, List, Tuple


class KdbCSVtoJSON:
    """KdB データの CSV ファイルを JSON ファイルに変換するクラス。"""

    def __init__(self, csvpath: str) -> None:
        """Args:
            csvpath (str): KdB データの CSV ファイルパス。
        """
        self.csvpath = csvpath

        now = datetime.datetime.now()
        self.output = {
            "updated": now.strftime("%Y/%m/%d"),
            "subject": self.__get_subjects(False),
        }
        self.grad_output = {
            "updated": now.strftime("%Y/%m/%d"),
            "subject": self.__get_subjects(True),
        }

    def get_output(self) -> Dict[str, Any]:
        """学群科目の一覧を返す。

        Returns:
            Dict[str, Any]: 科目番号をキーとする学群科目の辞書。
        """
        return self.output

    def get_grad_output(self) -> Dict[str, Any]:
        """大学院科目の一覧を返す。

        Returns:
            Dict[str, Any]: 科目番号をキーとする大学院科目の辞書。
        """
        return self.grad_output

    def __get_subjects(self, grad: bool) -> List[List[str]]:
        """科目一覧を取得する。

        Args:
            grad (bool): 大学院科目を取得するかどうか。true の場合は大学院科目を、false の場合は学群科目を取得する。

        Returns:
            List: 科目のリスト。
        """
        subjects = []
        lines = [line for line in csv.reader(open(self.csvpath))]

        for line in lines:
            code = line[0]

            # ヘッダー行と空行をスキップ
            is_grad = len(code) > 0 and code[0] == "0"
            if (
                code in ["科目番号", ""]
                or (not grad and is_grad)
                or (grad and not is_grad)
            ):
                continue

            # 現行 CSVに含まれる 17 列：
            # 0. 科目番号
            # 1. 科目名
            # 2. 授業方法
            # 3. 単位数
            # 4. 標準履修年次
            # 5. 実施学期
            # 6. 曜時限
            # 7. 担当教員
            # 8. 授業概要
            # 9. 備考
            # 10. 科目等履修生
            # 11. 短期留学生申請可否
            # 12. 申請条件
            # 13. 英語科目名
            # 14. 科目コード
            # 15. 要件科目名
            # 16. データ更新日
            #
            # フロントエンドの JSON が期待する 11 列：
            # 0. 科目番号
            # 1. 科目名
            # 2. 授業方法
            # 3. 単位数
            # 4. 標準履修年次
            # 5. 実施学期
            # 6. 曜時限
            # 7. 教室
            # 8. 担当教員
            # 9. 授業概要
            # 10. 備考

            # メタデータ列（10–16）を削除
            line = line[:10]
            # 教室列（旧形式の 7）が現行 CSV にはないため空文字を挿入
            line.insert(7, "")
            # 備考内の改行をスペースに正規化
            line[10] = line[10].replace("\n", " ").strip()
            subjects.append(line)

        return subjects


def main() -> None:
    """エントリーポイント。"""
    parser = argparse.ArgumentParser()
    parser.add_argument("csv", help="an input csv file")
    parser.add_argument(
        "output_dir", help="the output directory of kdb.json and kdb-grad.json"
    )
    args = parser.parse_args()
    k = KdbCSVtoJSON(args.csv)

    with open(f"{args.output_dir}/kdb.json", "w", encoding="utf-8") as fp:
        json.dump(k.get_output(), fp, indent="  ", ensure_ascii=False)

    with open(f"{args.output_dir}/kdb-grad.json", "w", encoding="utf-8") as fp:
        json.dump(k.get_grad_output(), fp, indent="  ", ensure_ascii=False)


if __name__ == "__main__":
    main()
