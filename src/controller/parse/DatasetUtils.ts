import GenericDataset from "../../dataset/GenericDataset";
import {
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	NotFoundError
} from "../IInsightFacade";
import {
	datasetExistsOnDisk,
	extractValidData,
	loadDatasetFromDisk,
	removeDatasetFromDisk,
	saveDatasetToDisk
} from "./DiskUtils";

/* Adds valid dataset, updates cache and disk.
 * REQUIRES: id and kind must be valid. */
export async function addValidDataset(
	id: string, content: string, kind: InsightDatasetKind,
	datasets: InsightDataset[], cache: Map<string, any>) {
	let datasetToAdd: InsightDataset;
	let data: any[];

	if (datasetExistsOnDisk(id)) {
		let datasetObj: any = await loadDatasetFromDisk(id);
		data = datasetObj.data;
		kind = datasetObj.kind;
	} else {
		data = await extractValidData(id, content, kind);
		if (data.length === 0) { // Assert that there exists valid data point
			return Promise.reject(
				new InsightError("content does not have at least one valid entry"));
		}
	}
	datasetToAdd = new GenericDataset(id, kind, data);
	updateDatasets(id, datasetToAdd, data, datasets, cache);
}

/* Update live datasets, cache, and disk. */
function updateDatasets(id: string, datasetToAdd: InsightDataset, data: any[],
	datasets: InsightDataset[], cache: Map<string, any>) {
	datasets.push(datasetToAdd);
	cache.set(id, data);
	saveDatasetToDisk(datasetToAdd, data);
}

/* Removes dataset with specified id, and throws NotFoundError if not found.
 * REQUIRES: id to be valid, and dataset with id to exist in datasets. */
export async function removeDatasetByID(id: string, datasets: InsightDataset[],
	cache: Map<string, any>): Promise<void> {
	const removeIndex = datasets.findIndex((dataset) => dataset.id === id);
	delete datasets[removeIndex];
	datasets = datasets.splice(removeIndex, 1);
	if (cache.has(id)) {
		cache.delete(id);
	}
	return removeDatasetFromDisk(id);
}

/* Returns data (e.g. list of courses or list of buildings) associated with dataset. */
export async function getDataForDataset(dataset: InsightDataset,
	cache: Map<string, any>): Promise<any[]> {
	if (cache.has(dataset.id)) {
		return cache.get(dataset.id);
	} else {
		let save: any = await loadDatasetFromDisk(dataset.id);
		return save.data;
	}
}
