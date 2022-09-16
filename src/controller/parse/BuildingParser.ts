import { getBuildingRooms } from "./RoomParser";
import { getJSONFromHTMLFile } from "./DiskUtils";
import { getGeolocation } from "./GeolocationUtils";
import {
	getElementsByTag,
	getElementsByTagPath,
	elementHasAttribute,
	elementHasAttributes,
	getHrefFromElement
} from "./HTMLParseUtils";

const ROOMS_DIR = "rooms";
const ROOMS_INDEX_FILEPATH = `${ROOMS_DIR}/index.htm`;

/* Returns a list of buildings. */
export async function extractValidBuildings(zip: any): Promise<any[]> {
	let buildings: any[] = [];
	let buildingHrefs: any[] = await getBuildingHrefs(zip);
	for (let href of buildingHrefs) {
		try {
			const filepath = ROOMS_DIR + href.slice(1);
			if (filepath in zip.files) {
				let file = zip.files[filepath];
				let building = await getBuildingByFile(file);
				if (typeof building !== "undefined" && building !== null) {
					buildings.push(building);
				}
			}
		} catch (error: any)  {
			// skip
		}
	}
	return buildings;
}

/* Returns list of hrefs linking to buildings.  */
async function getBuildingHrefs(zip: any): Promise<any[]> {
	const getUniqueSetOfHrefs = (aElements: any[]): string[] =>
		aElements.filter((a: any) => elementHasAttributes(a, [{name: "href"}]))
			.map((a: any) => getHrefFromElement(a))
			.filter((href, i, hrefs) => href !== "" && hrefs.indexOf(href) === i);

	let index: any = await getJSONFromHTMLFile(zip.files[ROOMS_INDEX_FILEPATH]);
	const hrefSequence = ["table", "tbody", "td", "a"];
	let aElements: any[] = getElementsByTagPath(index, hrefSequence);
	return getUniqueSetOfHrefs(aElements);
}

/* Returns the building information by file.
 * Assumes that filepath is valid. */
async function getBuildingByFile(file: any): Promise<any> {
	let buildingHTMLObject = await getJSONFromHTMLFile(file);
	let newBuilding: any = {};

	newBuilding.rooms = getBuildingRooms(buildingHTMLObject);
	if (newBuilding.rooms.length === 0) {
		return null;
	} else {
		setBuildingFields(newBuilding, buildingHTMLObject);
	}

	let geoResponse = await getGeolocation(newBuilding.address);
	if (typeof geoResponse.error !== "undefined") {
		return null;
	} else {
		setCoordinates(newBuilding, geoResponse);
	}

	return newBuilding;
}

/* Returns the full name of a building from inof div. */
function getBuildingFullname(infoDiv: any): string {
	const tagPath = ["h2", "span", "#text"];
	let fullnameElement: any = getElementsByTagPath(infoDiv, tagPath)[0];
	return fullnameElement.value.trim();
}

/* Returns the short name of a building. */
function getBuildingShortname(room: any): string {
	return room.name.substring(0, room.name.indexOf("_"));
}

/* Returns the address of a building from the info div element. */
function getBuildingAddress(infoDiv: any): string{
	const tagPath = ["div", "div", "#text"];
	let addressElement: any = getElementsByTagPath(infoDiv, tagPath)[0];
	return addressElement.value.trim();
}

/* Sets the fields of the buildings.
 * Assumes that building.rooms is non-empty. */
function setBuildingFields(building: any, page: any): void {
	let buildingInfoAttrs: any[] = [{
		name: "id",
		value: "building-info"
	}];
	let buildingInfoElement = getElementsByTag(page, "div", buildingInfoAttrs)[0];
	building.fullname = getBuildingFullname(buildingInfoElement);
	building.shortname = getBuildingShortname(building.rooms[0]);
	building.address = getBuildingAddress(buildingInfoElement);
}

/* Sets the coordinates of the building from geolocation. */
function setCoordinates(building: any, geoResponse: any): void {
	building.lat = geoResponse.lat;
	building.lon = geoResponse.lon;
}
