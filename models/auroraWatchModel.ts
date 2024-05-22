export interface Alert {
    status: string;
    datetime: string;
    value: number;
}

export interface currentStatus {
    "@api_version": string,
    updated: {
        datetime: string
    },
    site_status: siteStatus
}

export interface siteStatus {
    "@project_id": string,
    "@site_id": string,
    "@site_url": string,
    "@status_id": string,
    "#text": string | null
}

export interface Status {
    "@status_id": string;
    datetime: string;
    value: number;
}

export interface Thresholds {
    "@status_id": string;
    "#text": number;
}
