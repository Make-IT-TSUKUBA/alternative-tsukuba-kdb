import requests


class KdbDownloader():
    def __init__(self, year: int = 2021):
        requests.packages.urllib3.util.ssl_.DEFAULT_CIPHERS += "HIGH:!DH"
        self.year = year
        self.post = {
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

    def get_post(self):
        return self.post.copy()

    def download(self, filename):
        self.__download()
        open(filename, "w", encoding="utf-8").write(self.response_text)

    def __download(self):
        self.__start_session()
        self.__search_kdb()
        self.__download_csv()

    def __start_session(self):
        kdb_url = "https://kdb.tsukuba.ac.jp/"
        self.session = requests.session()
        self.response = self.session.get(kdb_url)

    def __search_kdb(self):
        search_post = self.get_post()
        search_post["_eventId"] = "searchOpeningCourse"
        self.response = self.session.post(self.response.url, data=search_post)
        self.do_url = self.response.url

    def __download_csv(self):
        csv_post = self.get_post()
        csv_post["_eventId"] = "output"
        csv_post["outputFormat"] = 0
        self.response_text = self.session.post(self.do_url, data=csv_post).text


def main() -> None:
    import datetime
    import os

    date = datetime.datetime.now()
    csv_dir = "../csv"
    filename = "%s/kdb-%04d%02d%02d.csv" % (csv_dir,
                                            date.year, date.month, date.day)

    os.makedirs(csv_dir, exist_ok=True)
    KdbDownloader().download(filename)


if __name__ == '__main__':
    main()
