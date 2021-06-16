import os
import datetime
import requests
import urllib.parse

year = 2021
post = {
	"index": "",
	"locale": "",
	"nendo": year,
	"termCode": "",
	"dayCode": "",
	"periodCode": "",
	"campusCode": "",
	"hierarchy1": "",
	"hierarchy2": "",
	"hierarchy3": "",
	"hierarchy4": "",
	"hierarchy5": "",
	"freeWord": "",
	"_orFlg": 1,
	"_andFlg": 1,
	"_gaiyoFlg": 1,
	"_risyuFlg": 1,
	"_excludeFukaikoFlg": 1,
}

requests.packages.urllib3.util.ssl_.DEFAULT_CIPHERS += "HIGH:!DH:!aNULL"

kdb_url = "https://kdb.tsukuba.ac.jp/"
session = requests.session()
response = session.get(kdb_url)

do_url = response.url
qs = urllib.parse.urlparse(do_url).query
query_dict = urllib.parse.parse_qs(qs)

# search
search_post = post.copy()
search_post["_eventId"] = "searchOpeningCourse"
response = session.post(do_url, data=search_post)
do_url = response.url

# download a csv
csv_post = post.copy()
csv_post["_eventId"] = "output"
csv_post["outputFormat"] = 0
response = session.post(do_url, data=csv_post)

# output
date = datetime.datetime.now()
csv_dir = "../csv"
filename = "%s/kdb-%04d%02d%02d.csv" % (csv_dir, date.year, date.month, date.day)

if not os.path.isdir(csv_dir):
	os.mkdir(csv_dir)

with open(filename, "w", encoding="utf-8") as fp :
	fp.write(response.text)