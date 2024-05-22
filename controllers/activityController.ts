import 'https://deno.land/std@0.224.0/dotenv/load.ts';
import { Database } from 'https://deno.land/x/aloedb@0.9.0/mod.ts';
import { parse } from 'https://deno.land/x/xml@4.0.0/mod.ts'

import {
    Alert,
    currentStatus,
    Status,
    Thresholds
} from '../models/auroraWatchModel.ts';

const alertsDB = new Database<Alert>('./resources/alerts.json');

export const fetchActivityStatus = async () => {
    const parsedActivityFile = isProduction()
        ? await fetchXMLEndpoint(Deno.env.get('API_SITE_ACTIVITY'))
        : await openXMLFile('./resources/local/site-activity.xml')
    const { lower_threshold, activity } = parsedActivityFile.site_activity

    await setThresholds(lower_threshold)
    await logActivityStatus(activity)
}

export const fetchAlerts = () => {
    return alertsDB.findMany({ status: Deno.env.get('ALERTABLE_STATUS') })
}

export const fetchCurrentStatus = async (): Promise<currentStatus> => {
    return isProduction()
        ? await fetchXMLEndpoint(Deno.env.get('API_CURRENT_STATUS'))
        : await openXMLFile('./resources/local/current-status.xml')
}

const fetchXMLEndpoint = async (endpoint: string) => {
    const endpointData = await fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.')
            }
            return response.text()
        })

    return parse(endpointData)
}

const isProduction = (): Boolean => {
    return Deno.env.get('APP_ENV') === 'production';
}

const logActivityStatus = (activity: Status[]) => {
    for (let i = 0; i < activity.length; i++) {
        const status = activity[i];
        if (status['@status_id'] === Deno.env.get('ALERTABLE_STATUS')) {
            writeToLogFile(status);
        }
    }
}

export const sendAlert = async () => {
    // Either send SMS or Email.
}

const setThresholds = (thresholds: Thresholds[]) => {
    Deno.writeTextFile(
        './resources/thresholds.json',
        JSON.stringify(thresholds),
        {
            create: true
        }
    )
}

const openXMLFile = async (directory: string) => {
    const file = await Deno.open(directory)
    const parsedFile = parse(file)

    return parsedFile
}

const writeToLogFile = async (status: Status) => {
    await alertsDB.insertOne({
        status: status['@status_id'],
        datetime: status.datetime,
        value: status.value
    });
}
