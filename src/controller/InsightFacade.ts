import { IInsightFacade, InsightDataset, InsightDatasetKind } from "./IInsightFacade";
import { addValidDataset, removeDatasetByID } from "./parse/DatasetUtils";
import { performQueryOnDatasets } from "./query/QueryUtils";
import { loadDatasetsFromDisk } from "./parse/DiskUtils";
import {
	validateAddDatasetInput,
	validateRemoveDatasetInput,
	validateQuery
} from "./parse/ValidationUtils";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 */

export default class InsightFacade implements IInsightFacade {
	public datasets: InsightDataset[];
	public dataCache: Map<string, any>; // map from dataset.id to dataset's data

	constructor() {
		this.datasets = [];
		this.dataCache = new Map<string, any>();
	}

	public addDataset(id: string, content: string,
		kind: InsightDatasetKind): Promise<string[]> {
		try {
			validateAddDatasetInput(id, kind, this.datasets);
			return addValidDataset(id, content, kind, this.datasets, this.dataCache)
				.then(() => this.datasets.map((d) => d.id));
		} catch (error: any) {
			return Promise.reject(error);
		}
	}

	public removeDataset(id: string): Promise<string> {
		try {
			validateRemoveDatasetInput(id, this.datasets);
			return removeDatasetByID(id, this.datasets, this.dataCache).then(() => id);
		} catch (error: any) {
			return Promise.reject(error);
		}
	}

	public performQuery(query: any): Promise<any[]> {
		try {
			loadDatasetsFromDisk(this.datasets, this.dataCache);
			validateQuery(query, this.datasets);
			return performQueryOnDatasets(query, this.datasets, this.dataCache);
		} catch (error: any) {
			return Promise.reject(error);
		}
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(this.datasets);
	}
}
