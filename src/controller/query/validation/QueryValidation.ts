import { InsightDataset, } from "../../IInsightFacade";

import {
	isWhereTypeValid,
	isFilterValid
} from "./WhereValidation";

import {
	isColumnsValid,
	isOptionsTypeValid,
	isOrderKeyInColumn,
	isOrderValid
} from "./OptionsValidation";

import {
	isTransformationsValid
} from "./TransformationValidation";

export const FILTERS: string[] = ["AND", "OR", "LT", "GT", "EQ", "IS", "NOT"];
export const QUERYKEYS: string[] = [
	"dept", "id", "avg", "instructor", "title", "pass", "fail", "audit", "uuid",
	"year", "fullname", "shortname", "number", "name", "address", "lat", "lon",
	"seats", "type", "furniture", "href"
];
export const MKEYS: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
export const SKEYS: string[] = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname",
	"number", "name", "address", "type", "furniture", "href"];
export const APPLYTOKENS: string[] = ["MAX", "MIN", "AVG", "COUNT", "SUM"];

export function isQueryValid(query: any, datasets: InsightDataset[]): boolean {
	if (!queryTypeIsValid(query)) {
		return false;
	} else if (!areQueryKeysValid(query)) {
		return false;
	} else {
		if (!isWhereTypeValid(query.WHERE) || !isOptionsTypeValid(query.OPTIONS)) {
			return false;
		}
		if (typeof query.WHERE !== "undefined" && Object.keys(query.WHERE).length !== 0) {
			if (!isFilterValid(query.WHERE, datasets)){
				return false;
			}
		}

		if (!isTransformationsValid(query.TRANSFORMATIONS, datasets)){
			return false;
		}
		let column: any = query.OPTIONS.COLUMNS;
		let order: any = query.OPTIONS.ORDER;
		if (!isColumnsValid(column, datasets, query.TRANSFORMATIONS) || !isOrderValid(order, column, datasets)
			|| !isOrderKeyInColumn(column, order)) {
			return false;
		}
		return true;
	}
}

function queryTypeIsValid(query: any): boolean {
	return query !== null
		&& query !== "undefined"
		&& typeof query === "object";
}

function areQueryKeysValid(query: any) {
	return Object.keys(query)[0] === "WHERE"
		&& Object.keys(query)[1] === "OPTIONS"
		&& (Object.keys(query).length === 2
			|| (Object.keys(query).length === 3
					&& Object.keys(query)[2] === "TRANSFORMATIONS"));
}

export function isDatasetAdded(id: string, datasets: InsightDataset[]) {
	for (let d of datasets) {
		if (d.id === id) {
			return true;
		}
	}
	return false;
}
