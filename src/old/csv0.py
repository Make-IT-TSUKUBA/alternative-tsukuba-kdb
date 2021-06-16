import csv
import json

output = []
headline = ""
with open("kdb_202104042.csv", encoding="utf-8") as fp :
	reader = csv.reader(fp)

	for line in reader :
		line.pop(1)

		for i in range(5) :
			line.pop(11)

		isEmpty = False
		isHead = False

		if line[0] == "科目番号" :
			continue

		if line[0] == "" :
			isEmpty = True

		if not isEmpty and line[1] == "" :
			isHead = True

		if isHead :
			headline = line[0]
			print(line[0])

		if isEmpty or isHead :
			continue

		if line[13] == "" :
			line.pop(13)
		if line[12] == "" :
			line.pop(12)

		line.append(headline)
		output.append(line)

with open("kdb.json", "w", encoding="utf-8") as fp :
	json.dump(output, fp, indent="\t", ensure_ascii=False)