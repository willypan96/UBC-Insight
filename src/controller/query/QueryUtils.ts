import {
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	ResultTooLargeError
} from "../IInsightFacade";
import { getDataForDataset } from "../parse/DatasetUtils";
import { preprocessRow } from "./QueryDataPreprocess";
import { rowMatchesFilter } from "./QueryMatch";
import { transformQueryResult } from "./QueryTransform";
import { sortQueryResult } from "./QuerySort";

/* Constants */
const LOGICCOMPARISON: string[] = ["AND", "OR"];
const MCOMPARISON: string[] = ["LT", "EQ", "GT"];
const SCOMPARISON: string[] = ["IS"];
const NEGATION: string[] = ["NOT"];

const MAX_QUERY_RESPONSE_LENGTH: number = 5000;

/* Performs query on a multiple datasets. */
export async function performQueryOnDatasets(query: any, datasets: InsightDataset[],
	cache: Map<string, any>): Promise<any[]> {
	let matchingDataset: InsightDataset = getDatasetMatchingQuery(datasets, query);
	let res: any[] = await performQueryOnDataset(query, matchingDataset, cache);
	res = transformQueryResult(res, query.TRANSFORMATIONS);

	// From here we know that result.length cannot change.
	if (res.length > MAX_QUERY_RESPONSE_LENGTH) {
		throw new ResultTooLargeError("Result is too large.");
	}

	res = getColumnsFromQueryResult(res, query.OPTIONS.COLUMNS);
	res = sortQueryResult(res, query.OPTIONS.ORDER);
	return res;
}

/* Returns the dataset that has id matching query. */
function getDatasetMatchingQuery(datasets: InsightDataset[], query: any): InsightDataset {
	let queryIds: string[] = getIdsFromQuery(query);
	if (queryIds.length > 1) {
		throw new InsightError("Query refers to multiple datasets.");
	}
	for (let dataset of datasets) {
		if (dataset.id === queryIds[0]) {
			return dataset;
		}
	}
	throw new InsightError("Dataset does not exist with id matching query.");
}

function getIdsFromQuery(query: any): string[] {
	let uniqueIds: Set<string> = new Set<string>();
	getIdsFromQueryHelper(query, uniqueIds);
	let res: string[] = [];
	uniqueIds.forEach((id) => res.push(id));
	return res;
}

/* Returns a query key that contains an underscore.
 * It is guaranteed to contain the id of the dataset in question. */
function getIdsFromQueryHelper(query: any, res: Set<string>): void {
	if (Array.isArray(query)) {
		query.forEach((el) => {
			if (typeof el === "string") {
				if (el.includes("_")) {
					let id = el.split("_")[0];
					res.add(id);
				}
			} else {
				getIdsFromQueryHelper(el, res);
			}
		});
	} else if (typeof query === "object") {
		Object.keys(query).forEach((key) => {
			if (key.includes("_")) {
				let id = key.split("_")[0];
				res.add(id);
			}
			getIdsFromQueryHelper(query[key], res);
		});
	}
}

/* Performs query on a single dataset and adds matching rows to result. */
async function performQueryOnDataset(query: any, dataset: InsightDataset,
	cache: Map<string, any>): Promise<any[]> {
	let result: any[] = [];
	const data = await getDataForDataset(dataset, cache);
	data.forEach((datapoint) =>
		performQueryOnDatapoint(dataset, datapoint, query, result));
	return result;
}

/* Performs query on single datapoint, adds matching rows to result. */
function performQueryOnDatapoint(dataset: InsightDataset, datapoint: any,
	query: any, result: any[]): void {
	let rows: any[] = (dataset.kind === InsightDatasetKind.Courses) ?
		datapoint.result : datapoint.rooms;
	rows.forEach((row: any) => {
		let preprocessedRow: any = preprocessRow(dataset.id, datapoint, row,
			dataset.kind);
		performQueryOnProcessedRow(dataset.id, preprocessedRow, query, result);
	});
}

/* Performs query on row, and adds it to result if query matches. */
function performQueryOnProcessedRow(id: string, row: any, query: any,
	result: any[]) {
	if (Object.keys(query.WHERE).length === 0
		|| rowMatchesFilter(id, row, query.WHERE)) {
		result.push(row);
	}
}

/* Returns result with columns specified as in query. */
function getColumnsFromQueryResult(result: any[], columns: string[]): any[] {
	const getColumnEntriesFromRow = (row: any): any => {
		let res: any = {};
		columns.forEach((key) => res[key] = row[key]);
		return res;
	};

	result.forEach((row: any, i: number) =>
		result[i] = getColumnEntriesFromRow(row));
	return result;
}
