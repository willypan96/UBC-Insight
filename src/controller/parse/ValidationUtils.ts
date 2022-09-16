import {
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	NotFoundError
} from "../IInsightFacade";
import { isQueryValid } from "../query/validation/QueryValidation";

import {getCourseFromFile} from "./DiskUtils";

/* Utilities related to validating data/input. */

const COURSES_DIR = "courses";
const ROOMS_DIR = "rooms";

/* Throws an error if add dataset id or kind are invalid. */
export function validateAddDatasetInput(id: string, kind: InsightDatasetKind,
	datasets: InsightDataset[]): void {
	assertIdFollowsSyntax(id);
	assertIdIsUnique(id, datasets);
	assertKindIsValid(kind);
}

/* Throws an error if remove dataset id is invalid. */
export function validateRemoveDatasetInput(id: string,
	datasets: InsightDataset[]): void {
	assertIdFollowsSyntax(id);
	assertDatasetWithIdExists(id, datasets);
}

/* Throws error if query is invalid. */
export function validateQuery(query: any, datasets: InsightDataset[]): void {
	if (!isQueryValid(query, datasets)) {
		throw new InsightError("Invalid Query");
	}
}

/* Throws an InsightError if id does not follow syntax rules. */
function assertIdFollowsSyntax(id: string): void {
	if (id === null || typeof id === "undefined") {
		throw new InsightError("The given id must not be null.");
	} else if (id.trim() === "") {
		throw new InsightError("The given id cannot be only whitespace.");
	} else if (id.indexOf("_") > -1) {
		throw new InsightError("The given id must not contain an underscore (_).");
	}
}

/* Throws an InsightError if dataset with id already exists in system. */
function assertIdIsUnique(id: string, datasets: InsightDataset[]): void {
	if (datasets.findIndex((dataset) => dataset.id === id) !== -1) {
		throw new InsightError(`A dataset already exists with id "${id}".`);
	}
}

/* Throws an InsightError if dataset with id does not exist in system. */
function assertDatasetWithIdExists(id: string, datasets: InsightDataset[]): void {
	if (datasets.findIndex((dataset) => dataset.id === id) === -1) {
		throw new NotFoundError(`Expected dataset with id "${id}" to exist on disk,
			but found not to.`);
	}
}

/* Throws an InsightError if dataset with id does not exist in system. */
function assertKindIsValid(kind: InsightDatasetKind): void {
	if (kind !== InsightDatasetKind.Courses && kind !== InsightDatasetKind.Rooms) {
		throw new InsightError(`Kind "${kind}" is invalid.`);
	}
}

/* Returns whether specified course with corresponding filename is valid. */
export async function isCourseValid(filename: string,
	course: any): Promise<boolean> {
	let courseData: any = await getCourseFromFile(course)
		.catch((error: Error) =>
			Promise.reject(new InsightError(`invalid json file: ${filename}"`)));
	return courseData !== null && courseData.result.length > 0;
}

/* Returns whether a file representing a course with given filename is valid. */
export function isCourseFilenameValid(filename: string): boolean {
	return filename !== `${COURSES_DIR}/` && filename.startsWith(`${COURSES_DIR}/`);
}
