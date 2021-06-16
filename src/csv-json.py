import argparse
import csv
import datetime
import json
from typing import Any, Dict, List, Tuple

# TODO: `Dict`型を暇があれば詳しく記述


class KdbCSVtoJSON():
    def __init__(self, csvpath: str, typespath: str,
                 contains_graduate: bool = True) -> None:
        self.csvpath = csvpath
        self.typespath = typespath
        self.contains_graduate = contains_graduate
        self.types = self.__get_types()

        self.empty_typed_subjects: List[List[str]] = []

        now = datetime.datetime.now()
        self.output = {
            "updated": now.strftime("%Y/%m/%d"),
            "subject": self.__get_subjects()
        }

    def get_types(self) -> Dict[str, Any]:
        return self.types

    def get_output(self) -> Dict[str, Any]:
        return self.output

    def print_empty_typed_subjects(self) -> None:
        for s in self.empty_typed_subjects:
            print(s)

    def __get_subjectcode(self, s: str) -> Tuple[List[str], List[str]]:
        """Get subject code

        Args:
            s (str): subject name

        Returns:
            Tuple[List[str], List[str]]: codes and except codes which are defined in given config text
        """
        code = s.replace("]", "").split("[")
        if len(code) == 2:
            except_codes = code[1].split("/")
        else:
            except_codes = []

        codes = code[0].split("/")
        return (codes, except_codes)

    def __search_type(self, code: str, target_types: Dict[str, Any],
                      types: List[str] = []) -> List[str]:
        """Search the type

        Args:
            code (str): target code
            target_types (Dict): dictionary contains info of target types
            types (List[str]): found types

        Returns:
            List[str]: found types
        """
        for key in target_types:
            target_codes = target_types[key]["codes"]
            target_excepts = target_types[key]["except-codes"]

            for target_code in target_codes:
                is_grad = any([code.find(target_except) == 0
                               for target_except in target_excepts])
                if code.find(target_code) == 0 and not is_grad:
                    types.append(key)
                    if len(types) <= 2:
                        target_childs = target_types[key]["childs"]
                        self.__search_type(code, target_childs, types)
                    else:
                        return types

        return types

    def __get_types(self) -> Dict[str, Any]:
        """Get types

        Args:
            args (argparse.Namespace): parsed result of command line args

        Returns:
            Dict: a dictionary of types
        """
        types = {}
        first, second = "", ""
        type_lines = open(self.typespath, encoding="utf-8").readlines()
        rows = [
            row for row in [
                line.replace(" ,", ",").replace(", ", ",").split(",")
                for line in type_lines
            ] if len(row) >= 2]

        for row in rows:
            codes_str = row[0]
            codes, except_codes = self.__get_subjectcode(
                codes_str.replace("\t", ""))
            name = row[1].replace("\n", "").replace("\t", "")
            tab = codes_str.count("\t")

            if tab == 0:
                first = name
                types[first] = {"codes": codes,
                                "except-codes": except_codes, "childs": {}}
            elif tab == 1:
                second = name
                types[first]["childs"][second] = {
                    "codes": codes, "except-codes": except_codes, "childs": {}}
            elif tab == 2:
                types[first]["childs"][second]["childs"][name] = {
                    "codes": codes, "except-codes": except_codes}

        return types

    def __get_subjects(self) -> List[List[str]]:
        """Get subjects

        Args:
            csvpath (str): a csv file path

        Returns:
            List: a list of subjects
        """
        subjects = []
        lines = [line for line in csv.reader(open(self.csvpath))]

        for line in lines:
            for i in range(6):
                line.pop(11)

            code = line[0]

            # skip:
            #   the header and empty lines
            #   subjects for graduate school
            is_grad = (len(code) > 0 and code[0] == '0'
                       and not self.contains_graduate)
            if code in ["科目番号", ""] or is_grad:
                continue

            # types
            searched_types = self.__search_type(code, self.types, [])

            if len(searched_types) == 0:
                self.empty_typed_subjects.append(line)

            first = searched_types[0] if len(searched_types) >= 1 else ""
            second = searched_types[1] if len(searched_types) >= 2 else ""
            third = searched_types[2] if len(searched_types) >= 3 else ""

            line += [first, second, third]
            subjects.append(line)

        return subjects


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("csv", help="an input csv file")
    parser.add_argument(
        "types", help="a text file of the relation between requirement classification and subject codes")
    parser.add_argument("-c", "--contains_graduate", action="store_true",
                        help="contains subjects for graduate school")

    return parser.parse_args()


def main() -> None:
    """main
    """
    args = parse_args()
    csvpath, typespath, contains_graduate = args.csv, args.types, args.contains_graduate
    k = KdbCSVtoJSON(csvpath, typespath, contains_graduate)

    # output
    with open("../kdb.json", "w", encoding="utf-8") as fp:
        json.dump(k.get_output(), fp, indent="\t", ensure_ascii=False)

    with open("../code-types.json", "w", encoding="utf-8") as fp:
        json.dump(k.get_types(), fp, indent="\t", ensure_ascii=False)

    k.print_empty_typed_subjects()


if __name__ == '__main__':
    main()
