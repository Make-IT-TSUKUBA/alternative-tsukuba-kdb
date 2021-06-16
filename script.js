let subjectMap = {};
let bookmarkTable;

window.onload = function() {
	const table = document.querySelector("table#body tbody");
	const keyword_input = document.querySelector('input[type="text"]');
	const form = document.getElementsByTagName("form")[0];
	const reqA_input = document.getElementById("req-a");
	const reqB_input = document.getElementById("req-b");
	const reqC_input = document.getElementById("req-c");

	let submitButton = document.getElementById("submit");
	const downloadLink = document.getElementById("download");
	const updatedDate = document.getElementById("updated-date");
	const bookmarkInfo = document.getElementById("bookmark-info");

	//clear button
	let clearButton = document.getElementById("clear");
	let clearButtonListener;

	// checkbox
	const checkName = document.getElementById("check-name");
	const checkNo = document.getElementById("check-no");
	const checkPerson = document.getElementById("check-person");
	const checkRoom = document.getElementById("check-room");
	const checkAbstract = document.getElementById("check-abstract");
	const checkBookmark = document.getElementById("check-bookmark");

	// timetable
	const selectedPeriodsSpan = document.getElementById("selected-periods");
	const timetable = document.getElementById("timetable");
	const timetableContent = document.querySelector("#timetable .content");
	const checkConcentration = document.getElementById("check-concentration");
	const checkNegotiable = document.getElementById("check-negotiable");
	const checkAsNeeded = document.getElementById("check-asneeded");
	let timetableLink = document.getElementById("display-timetable");
	let timetableListener;

	// if the device is iOS, displayed lines are limited 100.
	const isIOS = ["iPhone", "iPad", "iPod"].some(
		(name) => navigator.userAgent.indexOf(name) > -1
	);
	const lineLimit = 100;

	// if the device width is under 1100px
	let isUnder1100px = window.matchMedia("screen and (max-width: 1100px)")
		.matches;
	let selectModule, selectDay, selectPeriod;

	if (isUnder1100px) {
		selectModule = document.getElementById("select-module");
		selectDay = document.getElementById("select-day");
		selectPeriod = document.getElementById("select-period");
		submitButton = document.getElementById("submit-sp");
		clearButton = document.getElementById("clear-sp");
		timetableLink = document.getElementById("display-timetable-sp");
	}

	let codeTypes = null;
	let data = null;
	let timeout = void 0;

	keyword_input.addEventListener("keydown", (evt) => {
		const KEYCODE_ENTER = 13;
		if (evt.keyCode === KEYCODE_ENTER) {
			evt.preventDefault();
			search(evt);
		}
	});

	clearButton.addEventListener(
		"click",
		(clearButtonListener = (evt) => {
			evt.stopPropagation();
			keyword_input.value = "";
			reqA_input.selectedIndex = 0;
			deleteOptions(reqB_input);
			deleteOptions(reqC_input);
			form.season.value = "null";
			form.module.value = "null";
			form.online.value = "null";
			form.year.value = "null";

			for (let periods of timetablePeriods)
				for (let period of periods) {
					period.classList.remove("selected");
					period.classList.value = "item period";
				}

			for (let x = 0; x < 7; x++)
				for (let y = 0; y < 6; y++) selectedPeriods[x][y] = false;

			selectedPeriodsSpan.innerHTML = "指定なし";

			if (isUnder1100px) timetableLink.innerHTML = "曜日・時限を選択";

			checkName.checked = true;
			checkNo.checked = true;
			checkPerson.checked = false;
			checkRoom.checked = false;
			checkAbstract.checked = false;
			checkBookmark.checked = false;

			checkConcentration.checked = false;
			checkNegotiable.checked = false;
			checkAsNeeded.checked = false;
		})
	);

	let timetablePeriods = createTimeTable(null);
	let selectedPeriods = createTimeTable(false);

	{
		let displaysTimetable = false;
		let beforeSelected = null;
		let selectedDownPeriods;

		for (let y = 0; y <= maxPeriod; y++) {
			let line = document.createElement("div");
			line.classList.add("line");
			timetableContent.appendChild(line);

			for (let x = -1; x < 7; x++) {
				let item = document.createElement("div");
				item.classList.add("item");
				line.appendChild(item);

				if (y > 0 && x == -1) {
					item.innerHTML = y;
					item.classList.add("no");
				} else if (y == 0 && x > -1) {
					item.innerHTML = daysofweek[x];
					item.classList.add("day");
				} else if (y > 0 && x >= 0) {
					timetablePeriods[x][y - 1] = item;
					item.classList.add("period");

					const changeSelectedPeriods = (x, y) => {
						if (!beforeSelected) return;

						for (let yi = 0; yi < maxPeriod; yi++) {
							for (let xi = 0; xi < daysofweek.length; xi++) {
								let target = timetablePeriods[xi][yi];
								if (
									Math.min(x, beforeSelected.x) <= xi &&
									xi <= Math.max(x, beforeSelected.x) &&
									Math.min(y, beforeSelected.y) <= yi + 1 &&
									yi + 1 <= Math.max(y, beforeSelected.y)
								) {
									if (selectedDownPeriods[xi][yi])
										target.classList.remove("selected");
									else target.classList.add("selected");
									selectedPeriods[xi][yi] = !selectedDownPeriods[xi][yi];
								} else {
									if (selectedDownPeriods[xi][yi])
										target.classList.add("selected");
									else target.classList.remove("selected");
									selectedPeriods[xi][yi] = selectedDownPeriods[xi][yi];
								}
							}
						}
					};

					const onmousedown = (e) => {
						beforeSelected = { x: x, y: y };
						selectedDownPeriods = JSON.parse(JSON.stringify(selectedPeriods));
						changeSelectedPeriods(x, y);
					};

					const onmousemove = (e) => {
						if (selectedDownPeriods) changeSelectedPeriods(x, y);
					};

					const onmouseup = (e) => {
						selectedDownPeriods = null;
						beforeSelected = null;

						let text = "";
						for (let day in selectedPeriods) {
							let dayText = "";
							for (let time in selectedPeriods[day])
								if (selectedPeriods[day][time]) dayText += Number(time) + 1;
							if (dayText.length > 0)
								text += `<span class="day-label"><span class="day">${daysofweek[day]}</span>${dayText}</span>`;
						}
						text = text.length > 0 ? text : "指定なし";
						if (isUnder1100px) timetableLink.innerHTML = text;
						else selectedPeriodsSpan.innerHTML = text;
					};

					const supportsTouch = "ontouchend" in document;
					if (supportsTouch) {
						item.addEventListener("touchstart", onmousedown, { passive: true });
						item.addEventListener("touchmove", onmousemove, { passive: true });
						item.addEventListener("touchend", onmouseup, { passive: true });
					} else {
						item.addEventListener("mousedown", onmousedown, { passive: true });
						item.addEventListener("mousemove", onmousemove, { passive: true });
						item.addEventListener("mouseup", onmouseup, { passive: true });
					}
				}
			}
		}

		const displayMs = 200;
		const supportsTouch = "ontouchend" in document;

		timetableLink.addEventListener(
			supportsTouch ? "touchstart" : "click",
			(timetableListener = () => {
				let linkBounding = timetableLink.getBoundingClientRect();
				timetable.style.top =
					window.pageYOffset + linkBounding.bottom + 10 + "px";
				timetable.style.left = window.pageXOffset + linkBounding.left + "px";
				displaysTimetable = true;
				timetable.style.display = "block";
				selectedPeriodsSpan.innerHTML =
					"カレンダーをクリックして曜日・時限を選択";
				setTimeout(() => {
					timetable.style.opacity = 1;
				}, 0);
			}),
			{ passive: true }
		);

		document.addEventListener("click", (e) => {
			let query =
				"#timetable, " +
				(isUnder1100px ? "#display-timetable-sp" : "#display-timetable");
			if (!e.target.closest(query)) {
				timetable.style.opacity = 0;
				setTimeout(() => {
					timetable.style.display = "none";
				}, displayMs);
			}
		});
	}

	// display a line of the table
	const createLine = (line) => {
		let tr = document.createElement("tr");
		table.appendChild(tr);

		let url = `https://kdb.tsukuba.ac.jp/syllabi/2021/${line.code}/jpn`;
		let methods = ["対面", "オンデマンド", "同時双方向"].filter(
			(it) => line.note.indexOf(it) > -1
		);

		tr.innerHTML += `<td>${line.code}<br/>${line.name}<br/><a href="${url}" class="syllabus" target="_blank">シラバス</a><input type="checkbox" onclick='onBookmarkChanged(event);' class="bookmark" id="bookmark-${line.code}" value="${line.code}" /></td></td>`;
		tr.innerHTML += `<td>${line.credit}単位<br/>${line.year}年次</td>`;
		tr.innerHTML += `<td>${line.termStr}<br/>${line.periodStr}</td>`;
		tr.innerHTML += `<td>${line.room.replace(/,/g, "<br/>")}</td>`;
		tr.innerHTML += `<td>${line.person.replace(/,/g, "<br/>")}</td>`;

		if (methods.length < 1) tr.innerHTML += "<td>不詳</td>";
		else tr.innerHTML += `<td>${methods.join("<br/>")}<br /></td>`;

		tr.innerHTML += `<td>${line.abstract}</td>`;
		tr.innerHTML += `<td>${line.note}</td>`;
	};

	// update the table
	const updateTable = (options, index, displayedIndex) => {
		let regex = new RegExp(options.keyword);
		let bookmarks = getBookmarks();

		index = typeof index === "undefined" ? 0 : index;
		displayedIndex = typeof displayedIndex === "undefined" ? 0 : displayedIndex;

		if (isIOS && displayedIndex >= lineLimit) return;

		for (;;) {
			const line = data[index];

			if (typeof line === "undefined") {
				return;
			}

			// keyword
			let matchesNo = checkNo.checked
				? line.code.indexOf(options.keyword) != 0
				: true;
			let matchesName = checkName.checked
				? line.name.match(regex) == null
				: true;
			let matchesRoom = checkRoom.checked
				? line.room.match(regex) == null
				: true;
			let matchesPerson = checkPerson.checked
				? line.person.match(regex) == null
				: true;
			let matchesAbstract = checkAbstract.checked
				? line.abstract.match(regex) == null
				: true;

			let matchesKeyword =
				options.keyword != "" &&
				matchesNo &&
				matchesName &&
				matchesRoom &&
				matchesPerson &&
				matchesAbstract;

			// period
			let missMatchesPeriod = true;
			let isNotSpecifiedPeriod = true;
			for (let period of line.period) {
				for (let day in options.period) {
					for (let time in options.period[day]) {
						if (options.period[day][time]) {
							isNotSpecifiedPeriod = false;
							if (period.period[day][time]) missMatchesPeriod = false;
						}
					}
				}

				if (
					(options.concentration && period.concentration) ||
					(options.negotiable && period.negotiable) ||
					(options.asneeded && period.asneeded)
				)
					missMatchesPeriod = false;
			}

			if (
				isNotSpecifiedPeriod &&
				!options.concentration &&
				!options.negotiable &&
				!options.asneeded
			)
				missMatchesPeriod = false;

			// other options
			let missMatchesSeason =
				options.season != "null" && line.termStr.indexOf(options.season) < 0;
			let missMatchesModule =
				options.module_ != "null" && line.termStr.indexOf(options.module_) < 0;
			let missMatchesOnline =
				options.online != "null" && line.note.indexOf(options.online) < 0;
			let missMatchesBookmark =
				options.bookmark && !bookmarks.includes(line.code);

			let missMatchesYear;
			if (line.year.indexOf("-") < 0)
				missMatchesYear =
					options.year != "null" && line.year.indexOf(options.year) < 0;
			else {
				let minYear = line.year.replace(/\s-\s[1-6]/g, "");
				let maxYear = line.year.replace(/[1-6]\s-\s/g, "");
				missMatchesYear =
					options.year != "null" &&
					(options.year < minYear || maxYear < options.year);
			}

			let missMatchesReq_A =
				options.reqA != "null" && options.reqA != line.reqA;
			let missMatchesReq_B =
				options.reqB != "null" && options.reqB != line.reqB;
			let missMatchesReq_C =
				options.reqC != "null" && options.reqC != line.reqC;

			if (
				matchesKeyword ||
				missMatchesSeason ||
				missMatchesModule ||
				missMatchesPeriod ||
				missMatchesOnline ||
				missMatchesYear ||
				missMatchesBookmark ||
				missMatchesReq_A ||
				missMatchesReq_B ||
				missMatchesReq_C
			) {
				index++;
				continue;
			}

			createLine(line);

			// Make bookmarked buttons active
			document.getElementById(
				"bookmark-" + line.code
			).checked = getBookmarks().includes(line.code);

			timeout = setTimeout(
				() => updateTable(options, index + 1, ++displayedIndex),
				0
			);
			break;
		}
	};

	// convert table data to CSV file with utf-8 BOM
	const makeCSV = (a, table_, filename) => {
		var escaped = /,|\r?\n|\r|"/;
		var e = /"/g;

		var bom = new Uint8Array([0xef, 0xbb, 0xbf]);
		var csv = [],
			row = [],
			field,
			r,
			c;
		for (let r = 0; r < table_.rows.length; r++) {
			row.length = 0;
			for (let c = 0; c < table_.rows[r].cells.length; c++) {
				field = table_.rows[r].cells[c].innerText.trim();
				if (r !== 0 && c === 0) {
					field = field.slice(0, -5);
				}
				row.push(
					escaped.test(field) ? '"' + field.replace(e, '""') + '"' : field
				);
			}
			csv.push(row.join(","));
		}
		var blob = new Blob([bom, csv.join("\n")], { type: "text/csv" });

		if (window.navigator.msSaveBlob) {
			// IE
			window.navigator.msSaveBlob(blob, filename);
		} else {
			a.download = filename;
			a.href = window.URL.createObjectURL(blob);
		}
	};

	// download CSV file: `kdb_YYYYMMDDhhmmdd.csv`
	const downloadCSV = () => {
		makeCSV(
			downloadLink,
			document.querySelector("main table"),
			`kdb_${getDateString()}.csv`
		);
	};

	// get YYYYMMDDhhmmdd
	const getDateString = () => {
		let date = new Date();
		let Y = date.getFullYear();
		let M = ("00" + (date.getMonth() + 1)).slice(-2);
		let D = ("00" + date.getDate()).slice(-2);
		let h = ("0" + date.getHours()).slice(-2);
		let m = ("0" + date.getMinutes()).slice(-2);
		let d = ("0" + date.getSeconds()).slice(-2);

		return Y + M + D + h + m + d;
	};

	// search
	const search = (e) => {
		// clear tbody contents
		table.innerHTML = "";

		if (e !== null) {
			e.stopPropagation();
		}
		let options = {};

		options.keyword = keyword_input.value;
		options.reqA = reqA_input.options[reqA_input.selectedIndex].value;
		options.reqB =
			reqB_input.selectedIndex > -1
				? reqB_input.options[reqB_input.selectedIndex].value
				: "null";
		options.reqC =
			reqC_input.selectedIndex > -1
				? reqC_input.options[reqC_input.selectedIndex].value
				: "null";
		options.online = form.online.value;
		options.year = form.year.value;
		options.period = selectedPeriods;
		options.concentration = checkConcentration.checked;
		options.negotiable = checkNegotiable.checked;
		options.asneeded = checkAsNeeded.checked;
		options.bookmark = checkBookmark.checked;

		if (isUnder1100px) {
			let seasonModule = selectModule.options[selectModule.selectedIndex].value;
			if (seasonModule == "null") {
				options.season = "null";
				options.module_ = "null";
			} else {
				options.season = seasonModule.slice(0, 1);
				options.module_ = seasonModule.slice(1);
			}
		} else {
			options.season = form.season.value;
			options.module_ = form.module.value;
		}

		clearTimeout(timeout);
		updateTable(options);
	};

	submitButton.onclick = search;
	downloadLink.onclick = downloadCSV;

	const constructOptions = (select, types) => {
		deleteOptions(select);
		{
			let option = document.createElement("option");
			option.value = "null";
			option.innerHTML = "指定なし";
			select.appendChild(option);
		}
		for (let key in types) {
			let option = document.createElement("option");
			option.innerHTML = key;
			select.appendChild(option);
		}
	};

	const deleteOptions = (select) => {
		select.innerHTML = "";
	};

	const selectOnChange = (isA) => {
		deleteOptions(reqC_input);
		const selected = isA ? reqA_input : reqB_input;
		const selectedValue = selected.options[selected.selectedIndex].value;
		const subSelect = isA ? reqB_input : reqC_input;
		const reqA_value = reqA_input.options[reqA_input.selectedIndex].value;
		const reqB_value =
			reqB_input.selectedIndex > -1
				? reqB_input.options[reqB_input.selectedIndex].value
				: "null";

		if (selectedValue == "null") {
			deleteOptions(subSelect);
		} else {
			let types = isA
				? codeTypes[reqA_value]
				: codeTypes[reqA_value].childs[reqB_value];
			constructOptions(subSelect, types.childs);
		}
	};

	// initialize
	(async () => {
		// construct options of requirements
		let response = await fetch("code-types.json");
		codeTypes = await response.json();
		constructOptions(reqA_input, codeTypes);
		reqA_input.addEventListener("change", () => selectOnChange(true));
		reqB_input.addEventListener("change", () => selectOnChange(false));

		// read a json
		response = await fetch("kdb.json");
		kdbJson = await response.json();
		data = kdbJson.subject;
		updated = kdbJson.updated;

		// convert into a map
		for (let i in data) {
			let line = data[i];
			line = {
				code: line[0],
				name: line[1],
				credit: line[3],
				year: line[4],
				termStr: line[5],
				periodStr: line[6],
				room: line[7],
				person: line[8],
				abstract: line[9],
				note: line[10],
				reqA: line[11],
				reqB: line[12],
				reqC: line[13],
			};

			// term (season - module)
			// term code
			// : spring A-C: 0-2
			// : autumn A-C: 3-5
			// : holiday spring, summer, autumn, winter: 6-9
			line.terms = [];
			let termGroups = line.termStr.split(" ");
			let allSeasons = ["春", "夏", "秋", "冬"];
			let season;

			for (let groupStr of termGroups) {
				let group = [];
				let charArray = Array.from(groupStr);
				for (let char of charArray) {
					if (allSeasons.includes(char)) season = char;

					if (season) {
						if (["A", "B", "C"].includes(char)) {
							let no =
								(season == "春" ? 0 : 3) +
								(char == "A" ? 0 : char == "B" ? 1 : 2);
							group.push(no);
						}
						if (char == "休") group.push(allSeasons.indexOf(season) + 6);
					}
				}
				line.terms.push(group);
			}

			// period (day - time)
			line.period = [];
			let termStrArray = line.periodStr.split(" ");

			for (let j in termStrArray) {
				let term = termStrArray[j];
				let periodStrArray = term.split(",");
				let dayArray = [];
				line.period.push({
					concentration: term.indexOf("集中") > -1,
					negotiable: term.indexOf("応談") > -1,
					asneeded: term.indexOf("随時") > -1,
					period: createTimeTable(false),
				});

				for (let period of periodStrArray) {
					let dayStr = period.replace(/[0-9\-]/g, "");
					let days = dayStr
						.split("・")
						.filter((element) => daysofweek.includes(element))
						.map((element) => daysofweek.indexOf(element));
					if (days.length > 0) dayArray = days;

					let timeArray = [];
					let timeStr = period.replace(/[^0-9\-]/g, "");

					if (timeStr.indexOf("-") > -1) {
						let timeStrArray = timeStr.split("-");
						let startTime = Number(timeStrArray[0]);
						let endTime = Number(timeStrArray[1]);
						for (let k = startTime; k <= endTime; k++) timeArray.push(k);
					} else timeArray.push(Number(timeStr));

					if (timeStr.length > 0)
						for (let day of dayArray)
							for (let time of timeArray)
								line.period[j].period[day][time - 1] = true;
				}
			}

			data[i] = line;
			subjectMap[line.code] = line;
		}

		search(null);
		updatedDate.innerHTML = updated;

		// bookmark
		bookmarkTable = new BookmarkTimetable();
		bookmarkTable.update();

		let firstBookmark = document.querySelector("input.bookmark");
		if (!isUnder1100px && localStorage.getItem("kdb_bookmarks") == null)
			bookmarkInfo.style.opacity = 1;
		else bookmarkInfo.style.display = "none";

		let bounding = firstBookmark.getBoundingClientRect();
		bookmarkInfo.style.left = bounding.left + 28 + "px";
		bookmarkInfo.style.top = bounding.top + 4 + "px";
	})();

	// scroll
	window.addEventListener("scroll", () => {
		bookmarkInfo.style.opacity = 0;
		setTimeout(() => (bookmarkInfo.style.display = "none"), 300);
	});

	// resize
	window.addEventListener(
		"resize",
		() => {
			let supportsTouch = "ontouchend" in document;
			timetableLink.removeEventListener(
				supportsTouch ? "touchstart" : "click",
				timetableListener
			);
			clearButton.removeEventListener("click", clearButtonListener);

			isUnder1100px = window.matchMedia("screen and (max-width: 1100px)")
				.matches;
			if (isUnder1100px) {
				selectModule = document.getElementById("select-module");
				selectDay = document.getElementById("select-day");
				selectPeriod = document.getElementById("select-period");
				submitButton = document.getElementById("submit-sp");
				clearButton = document.getElementById("clear-sp");
				timetableLink = document.getElementById("display-timetable-sp");
			} else {
				submitButton = document.getElementById("submit");
				clearButton = document.getElementById("clear");
				timetableLink = document.getElementById("display-timetable");
			}

			bookmarkTable.resized();

			submitButton.onclick = search;
			timetableLink.addEventListener(
				supportsTouch ? "touchstart" : "click",
				timetableListener
			);
			clearButton.addEventListener("click", clearButtonListener);
		},
		{ passive: true }
	);
};

// timetable
const daysofweek = ["月", "火", "水", "木", "金", "土", "日"];
const maxPeriod = 6;

const createTimeTable = (filled) => {
	let table = new Array(daysofweek.length);
	for (let i in daysofweek) table[i] = new Array(maxPeriod).fill(filled);
	return table;
};

// Bookmark
function getBookmarks() {
	let value = localStorage.getItem("kdb_bookmarks");
	if (value != null) return decodeURIComponent(value).split(",");
	else return [];
}

const saveBookmark = (bookmarks) => {
	let value = "";
	for (let i = 0; i < bookmarks.length; i++) {
		value += "," + bookmarks[i];
	}
	value = encodeURIComponent(value.substr(1, value.length - 1));
	localStorage.setItem("kdb_bookmarks", value);
};

const removeBookmark = (subjectId) => {
	let bookmarks = getBookmarks();
	if (!bookmarks.includes(subjectId)) {
		return false;
	} else {
		let newBookmarks = bookmarks.filter((value) => value !== subjectId);
		saveBookmark(newBookmarks);
		return true;
	}
};

function onBookmarkChanged(event) {
	let subjectId = event.target.value;

	const addBookmark = (subjectId) => {
		let bookmarks = getBookmarks();
		if (bookmarks.includes(subjectId)) {
			return false;
		} else {
			bookmarks.push(subjectId);
			saveBookmark(bookmarks);
		}
	};

	if (event.target.checked) addBookmark(subjectId);
	else removeBookmark(subjectId);

	bookmarkTable.update();
	if (
		subjectMap[subjectId].terms.length > 0 &&
		subjectMap[subjectId].terms[0].length > 0
	)
		bookmarkTable.switchTimetable(subjectMap[subjectId].terms[0][0]);
}

const removeAllBookmarks = () => {
	const isApproved = window.confirm(
		"すべてのお気に入りの科目が削除されます。よろしいですか？"
	);
	if (!isApproved) return;

	const bookmarks = getBookmarks();
	for (let subjectId of bookmarks) {
		removeBookmark(subjectId);
		let bookmark = document.getElementById("bookmark-" + subjectId);
		if (bookmark != null) bookmark.checked = false;
	}
	bookmarkTable.update();
};

// timetable displaying blookmarked subjects
class BookmarkTimetable {
	constructor() {
		this.module = 0;
		this.maxModule = 6;
		this.periodItems = [];
		this.displaysTimetable = true;

		this.main = document.querySelector("#bookmark-timetable .main");
		this.timetable = document.querySelector(
			"#bookmark-timetable ul.table-list"
		);
		this.moduleDisplay = document.querySelector("#current-status .module");
		this.credit = document.querySelector("#current-status .credit");
		this.close = document.querySelector("#close-bookmark-table");

		// button
		const clearBookmark = document.querySelector("#clear-bookmarks");
		clearBookmark.addEventListener("click", () => removeAllBookmarks());

		const previous = document.querySelector("#current-status .previous");
		const next = document.querySelector("#current-status .next");
		previous.addEventListener("click", () => this.shiftTimetable(false));
		next.addEventListener("click", () => this.shiftTimetable(true));
		this.close.addEventListener("click", () => this.switchDisplayTimetable());

		// create tables
		for (let termNo = 0; termNo < this.maxModule; termNo++) {
			let table = document.createElement("li");
			table.className = "table tile";
			this.periodItems[termNo] = createTimeTable();

			for (let x = 0; x < daysofweek.length; x++) {
				let row = document.createElement("ul");
				row.className = "row";

				for (let y = -1; y < maxPeriod; y++) {
					let item = document.createElement("li");
					if (y == -1) item.innerHTML = daysofweek[x];
					row.appendChild(item);
					this.periodItems[termNo][x][y] = item;
				}
				table.appendChild(row);
			}
			this.timetable.append(table);
		}

		this.resized();
		this.update();
	}

	resized() {
		let firstTimetable = document.querySelector(
			"#bookmark-timetable ul.table-list li"
		);
		this.width = firstTimetable.clientWidth;
	}

	switchDisplayTimetable() {
		this.main.style.marginBottom = this.displaysTimetable
			? `calc(${-this.main.clientHeight}px + 1.8rem)`
			: 0;
		this.displaysTimetable = !this.displaysTimetable;
		this.close.innerHTML = this.displaysTimetable ? "×" : "︿";
		if (this.displaysTimetable) this.close.classList.remove("closed");
		else this.close.classList.add("closed");
	}

	shiftTimetable(isForward) {
		const maxModule = 5;
		if (isForward && this.module < maxModule)
			this.switchTimetable(this.module + 1);
		if (!isForward && this.module > 0) this.switchTimetable(this.module - 1);
	}

	switchTimetable(moduleNo) {
		if (this.module != moduleNo && moduleNo < 6) {
			this.module = moduleNo;
			this.timetable.style.marginLeft = this.width * this.module * -1 + "px";
			this.update();
		}
	}

	update() {
		let credit = 0.0;
		let bookmarks = getBookmarks();

		// timetable
		for (let termNo = 0; termNo < this.maxModule; termNo++) {
			for (let y = 0; y < maxPeriod; y++) {
				for (let x = 0; x < daysofweek.length; x++) {
					let item = this.periodItems[termNo][x][y];
					item.innerHTML = "";
					let no = 0;

					for (let code of bookmarks) {
						if (!(code in subjectMap)) continue;
						let subject = subjectMap[code];

						// term
						for (let subjectTermNo in subject.terms) {
							if (!subject.terms[subjectTermNo].includes(termNo)) continue;

							// period
							let startNo, endNo;
							[startNo, endNo] =
								subject.terms.length == subject.period.length
									? [subjectTermNo, subjectTermNo]
									: [0, subject.period.length - 1];

							for (let i = startNo; i <= endNo; i++) {
								let period = subject.period[i].period;
								if (period[x][y]) {
									let div = document.createElement("div");
									let h = 200 + no * 20;
									div.className = "class";
									div.innerHTML = subject.name;
									div.style.margin = 0.1 * (no + 1) + "rem";
									div.style.background = `hsl(${h}, 100%, 90%, 0.8)`;
									item.appendChild(div);
									no++;

									// remove button
									let remove = document.createElement("a");
									remove.classList.add("remove");
									remove.innerHTML = "×";
									div.appendChild(remove);

									div.addEventListener("mouseover", () => {
										remove.classList.add("displayed");
									});
									div.addEventListener("mouseout", () => {
										remove.classList.remove("displayed");
									});
									remove.addEventListener("click", () => {
										removeBookmark(code);
										this.update();
									});
								}
							}
						}
					}
				}
			}
		}

		// credit
		for (let code of bookmarks)
			if (code in subjectMap && !isNaN(subjectMap[code].credit))
				credit += Number(subjectMap[code].credit);

		// status
		let season = this.module < 3 ? "春" : "秋";
		let module_ = this.module % 3 == 0 ? "A" : this.module % 3 == 1 ? "B" : "C";
		this.moduleDisplay.innerHTML = season + module_;
		this.credit.innerHTML = credit.toFixed(1) + "単位";
	}
}
