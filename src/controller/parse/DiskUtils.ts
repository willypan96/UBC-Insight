import JSZip = require("jszip");
import * as fs from "fs-extra";
import * as p5 from "parse5";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	NotFoundError
} from "../IInsightFacade";
import {
	isCourseValid,
	isCourseFilenameValid,
} from "./ValidationUtils";
import { extractValidBuildings } from "./BuildingParser";
import InsightFacade from "../InsightFacade";
import { INSPECT_MAX_BYTES } from "buffer";
import GenericDataset from "../../dataset/GenericDataset";

/* Utilities related to extracting data from files. */

const DATA_DIR = "data";

/* Returns list of valid data points from zip specified by content,
 * with valid criteria specified by validationFunction. */
export async function extractValidData(id: string, content: string,
	kind: InsightDatasetKind): Promise<any[]> {
	try {
		let jsZip = new JSZip();
		let zip: any = await jsZip.loadAsync(content, {base64 : true});
		if (kind === InsightDatasetKind.Courses) {
			return extractValidCourses(zip);
		} else {
			return extractValidBuildings(zip);
		}
	} catch (error) {
		throw new InsightError("Invalid zip, id =", id, "kind =", kind);
	}
}
/* Returns a list of valid courses. */
async function extractValidCourses(zip: any): Promise<any[]> {
	let courses: any[] = [];
	for (let filename of getCourseFilenames(zip)) {
		try {
			let file: any = zip.files[filename];
			const valid = await isCourseValid(filename, file);
			if (valid) {
				let course = await getCourseFromFile(file);
				courses.push(course);
			}
		} catch (error: any) {
			// Skip
		}
	}
	return courses;
}

function getCourseFilenames(zip: any): string[] {
	return Object.keys(zip.files)
		.filter((filename: string) => isCourseFilenameValid(filename));
}

/* Saves dataset to disk */
export async function saveDatasetToDisk(dataset: InsightDataset, data: any) {
	const datasetObj = {
		id : dataset.id,
		kind : dataset.kind,
		numRows : dataset.numRows,
		data : data
	};
	return fs.outputFile(`${DATA_DIR}/${dataset.id}.json`, JSON.stringify(datasetObj))
		.catch((error) => console.log(error));
}

/* Removes dataset with given id from disk. */
export async function removeDatasetFromDisk(id: string): Promise<void> {
	let path: string = `${DATA_DIR}/${id}.json`;
	return fs.remove(path).catch((error: Error) => console.error("Could not delete dataset at ", path));
}

/* Loads any possible saved datasets from DATA_DIR. */
export function loadDatasetsFromDisk(datasets: InsightDataset[], cache: Map<string, any>): void {
	fs.readdirSync(DATA_DIR).forEach((filename: string) => {
		let datasetId = filename.substring(0, filename.lastIndexOf("."));
		if (!datasets.map((d) => d.id).includes(datasetId)) {
			try {
				let fileData: any = JSON.parse(fs.readFileSync(`${DATA_DIR}/${filename}`, {encoding: "utf8"}));
				datasets.push(new GenericDataset(fileData.id, fileData.kind, fileData.data));
				cache.set(fileData.id, fileData.data);
			} catch (error: any) {
				// Skip
			}
		}
	});
}

/* Return data object describing dataset {id, kind, numRows, data} */
export async function loadDatasetFromDisk(id: string): Promise<any> {
	let data: any = await fs.readFile(`${DATA_DIR}/${id}.json`, "utf8");
	return JSON.parse(data);
}

/* Returns whether there exists a dataset saved on disk with given id. */
export function datasetExistsOnDisk(id: string): boolean {
	return fs.existsSync(`${DATA_DIR}/${id}.json`);
}

export async function getCourseFromFile(file: any): Promise<any> {
	return file.async("string").then((fileData: any) => JSON.parse(fileData));
}

/* Returns the data object from a html file in */
export async function getJSONFromHTMLFile(file: any): Promise<any> {
	try {
		let fileString: string = await file.async("string");
		return p5.parse(fileString);
	} catch (error) {
		throw new InsightError("invalid html");
	}
}
