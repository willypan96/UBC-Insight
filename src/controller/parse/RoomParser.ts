import {
	getElementsByTag,
	getElementsByTagPath,
	elementHasAttribute,
	elementHasAttributes,
	getHrefFromElement
} from "./HTMLParseUtils";

/* Returns the rooms inside the building. */
export function getBuildingRooms(building: any): any[] {
	const getRoomElements = () =>
		getElementsByTagPath(building, ["table", "tbody", "tr"]);
	return getRoomElements().map((tr) => getRoomFromTableRow(tr));
}

const ROOM_NUMBER_ATTRIBUTE = {
	value: "views-field views-field-field-room-number"
};
const ROOM_CAPACITY_ATTRIBUTE = {
	value: "views-field views-field-field-room-capacity"
};
const ROOM_FURNITURE_ATTRIBUTE = {
	value: "views-field views-field-field-room-furniture"
};
const ROOM_TYPE_ATTRIBUTE = {
	value: "views-field views-field-field-room-type"
};

/* Returns a room created from tr element. */
function getRoomFromTableRow(tr: any): any {

	/* Returns the text value from a td element. */
	const getCleanedTextValue = (td: any) => {
		let text: string = getElementsByTag(td, "#text")[0].value;
		return text.trim();
	};

	const getRoomHref = (td: any): string => {
		let a: any = getElementsByTag(td, "a")[0];
		return getHrefFromElement(a);
	};

	const getRoomName = (href: string): string => {
		// Assumes room.href was already set
		let roomName: string = href.substring(href.lastIndexOf("/") + 1, href.length);
		roomName = roomName.replace("-", "_");
		return roomName;
	};

	const getRoomNumber = (td: any): string => {
		let roomNumber: string = getElementsByTagPath(td, ["a", "#text"])[0].value;
		return roomNumber.trim();
	};

	const getRoomCapacity = (td: any) => getCleanedTextValue(td);
	const getRoomFurniture = (td: any) => getCleanedTextValue(td);
	const getRoomType = (td: any) => getCleanedTextValue(td);

	let room: any = {};
	let tds: any[] = getElementsByTag(tr, "td");
	tds.forEach((td: any) => {
		if (elementHasAttribute(td, ROOM_NUMBER_ATTRIBUTE)) {
			room.href = getRoomHref(td);
			room.name = getRoomName(room.href);
			room.number = getRoomNumber(td);
		} else if (elementHasAttribute(td, ROOM_CAPACITY_ATTRIBUTE)) {
			room.seats = getRoomCapacity(td);
		} else if (elementHasAttribute(td, ROOM_FURNITURE_ATTRIBUTE)) {
			room.furniture = getRoomFurniture(td);
		} else if (elementHasAttribute(td, ROOM_TYPE_ATTRIBUTE)) {
			room.type = getRoomType(td);
		}
	});
	return room;
}
