import csv
import datetime
import json
import argparse

parser = argparse.ArgumentParser();
parser.add_argument("csv", help="an input csv file")
parser.add_argument("types", help="a text file of the relation between requirement classification and subject codes")
parser.add_argument("contains_graduate", help="contains subjects for graduate school; \"True\" or \"False\"")

args = parser.parse_args()
input_type_list = "list.txt"


# subject code
def get_subjectcode(str) :
	code_str = str.replace("]", "").split("[")

	codes = code_str[0].split("/")
	if len(code_str) == 2 :
		except_codes = code_str[1].split("/")
	else :
		except_codes = []

	return codes, except_codes


# search the type
def search_type(code, target_types, types) :
	for key in target_types :
		target_codes = target_types[key]["codes"]
		target_excepts = target_types[key]["except-codes"]

		for target_code in target_codes :
			if code.find(target_code) == 0 :
				is_except = False
				
				for target_except in target_excepts :
					if code.find(target_except) == 0:
						is_except = True

				if not is_except :
					types.append(key)
					if len(types) <= 2 :
						target_childs = target_types[key]["childs"]
						search_type(code, target_childs, types)
					else :
						return types

	return types


# type list
types = {}
first = second = None

with open(args.types, encoding="utf-8") as fp:
	type_lines = fp.readlines()

	for line in type_lines :
		rows = line.replace(" ,", ",").replace(", ", ",").split(",")

		# skip empty lines
		if len(rows) < 2 :
			continue

		codes_str = rows[0]
		codes, except_codes = get_subjectcode(codes_str.replace("\t", ""))
		name = rows[1].replace("\n", "").replace("\t", "")
		tab = codes_str.count("\t")

		if tab == 0 :
			first = name
			types[first] = {"codes" : codes, "except-codes" : except_codes, "childs" : {}}
		if tab == 1 :
			second = name
			types[first]["childs"][second] = {"codes" : codes, "except-codes" : except_codes, "childs" : {}}

		if tab == 2 :
			types[first]["childs"][second]["childs"][name] = {"codes" : codes, "except-codes" : except_codes}


# csv
date = datetime.datetime.now()
output = {
	"updated": "%d/%02d/%02d"% (date.year, date.month, date.day),
	"subject": []
}

with open(args.csv) as fp :
	reader = csv.reader(fp)

	for line in reader :
		for i in range(6) :
			line.pop(11)

		code = line[0]

		# skip the header and empty lines
		if code in ["科目番号", ""] :
			continue

		# subjects for graduate school
		if code[0] == '0' and args.contains_graduate == "False" :
			continue

		# types
		searched_types = search_type(code, types, [])

		if len(searched_types) == 0 :
			print(line)

		first = searched_types[0] if len(searched_types) >= 1 else ""
		second = searched_types[1] if len(searched_types) >= 2 else ""
		third = searched_types[2] if len(searched_types) >= 3 else ""

		line += [first, second, third]
		output["subject"].append(line)


# output
with open("../kdb.json", "w", encoding="utf-8") as fp :
	json.dump(output, fp, indent="\t", ensure_ascii=False)

with open("../code-types.json", "w", encoding="utf-8") as fp :
	json.dump(types, fp, indent="\t", ensure_ascii=False)
