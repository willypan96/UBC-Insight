import { InsightDatasetKind } from "../IInsightFacade";

const OVERALL_YEAR: number = 1900;
const KEY_TRANSLATION: any = {
	Subject: "dept",
	Course: "id",
	Avg: "avg",
	Professor: "instructor",
	Title: "title",
	Pass: "pass",
	Fail: "fail",
	Audit: "audit",
	id: "uuid",
	Year: "year"
};

export const MKEYS: string[] = [
	"avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"
];
export const SKEYS: string[] = [
	"dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number", "name",
	"address", "type", "furniture", "href"
];

/* Translates the row from data representation to query representation. */
export function preprocessRow(id: string, datapoint: any, row: any,
	kind: InsightDatasetKind): any {
	let newRow: any;
	if (kind === InsightDatasetKind.Courses) {
		newRow = translateSection(id, row);
	} else {
		newRow =  translateRoom(id, datapoint, row);
	}
	MKEYS.forEach((mkey) => {
		const translatedKey: string = translateKey(id, mkey);
		if (translatedKey in newRow) {
			newRow[translatedKey] = +newRow[translatedKey];
		}
	});
	SKEYS.forEach((skey) => {
		const translatedKey: string = translateKey(id, skey);
		if (translatedKey in newRow) {
			newRow[translatedKey] = newRow[translatedKey].toString();
		}
	});
	return newRow;
}

/* Translates section of course. */
function translateSection(id: string, section: any): any {
	let newSection: any = {};
	Object.keys(section).forEach((key: string) => {
		let newVal: any;
		if (key === "id") {
			newVal = section[key].toString();
		} else if (key === "Year") {
			newVal = (section.Section === "overall") ? OVERALL_YEAR : +section[key];
		} else {
			newVal = section[key];
		}
		newSection[translateKey(id, key)] = newVal;
	});
	return newSection;
}

/* Translates room of building. */
function translateRoom(id: string, building: any, room: any): any[] {
	let newRoom: any = {};
	Object.keys(room).forEach((key: string) => {
		newRoom[translateKey(id, key)] = room[key];
	});
	Object.keys(building).forEach((key: string) => {
		if (key !== "rooms") {
			newRoom[translateKey(id, key)] = building[key];
		}
	});
	return newRoom;
}

/* Returns the translation of a key if it has on. */
function translateKey(id: string, key: any): string {
	if (key in KEY_TRANSLATION) {
		return id + "_" + KEY_TRANSLATION[key];
	} else {
		return id + "_" + key;
	}
}
