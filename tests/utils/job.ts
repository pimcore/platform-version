import { APIRequestContext } from '@playwright/test';

export class JobHelper {
    /**
     * Cancel all running jobs to ensure clean state before tests
     * @param authenticatedRequest - The authenticated API request context
     */
    static async cancelAllRunningJobs(authenticatedRequest: APIRequestContext): Promise<void> {
        try {
            const runningJobsResponse = await authenticatedRequest.post('/pimcore-studio/api/execution-engine/running-jobs', {
                data: { filters: { page: 1, pageSize: 50 } }
            });
            if (runningJobsResponse.status() === 200) {
                const jobData = await runningJobsResponse.json();
                if (jobData.items && jobData.items.length > 0) {
                    const runningJobs = jobData.items.filter((job: any) => job.state === 'running');
                    if (runningJobs.length > 0) {
                        for (const job of runningJobs) {
                            try {
                                await authenticatedRequest.post(`/pimcore-studio/api/execution-engine/abort/${job.id}`);
                            } catch (error) {
                                // Silently ignore individual job cancellation errors
                            }
                        }
                    }
                }
            }
        } catch (error) {
            // Silently ignore errors when getting or cancelling jobs
        }
    }

    /**
     * Cancel a specific job by ID
     * @param authenticatedRequest - The authenticated API request context
     * @param jobId - The ID of the job to cancel
     */
    static async cancelJob(authenticatedRequest: APIRequestContext, jobId: number): Promise<void> {
        try {
            await authenticatedRequest.post(`/pimcore-studio/api/execution-engine/abort/${jobId}`);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all running jobs
     * @param authenticatedRequest - The authenticated API request context
     * @returns Array of running jobs
     */
    static async getRunningJobs(authenticatedRequest: APIRequestContext): Promise<any[]> {
        try {
            const runningJobsResponse = await authenticatedRequest.post('/pimcore-studio/api/execution-engine/running-jobs', {
                data: { filters: { page: 1, pageSize: 50 } }
            });
            if (runningJobsResponse.status() === 200) {
                const jobData = await runningJobsResponse.json();
                return jobData.items || [];
            }
            return [];
        } catch (error) {
            return [];
        }
    }
}
