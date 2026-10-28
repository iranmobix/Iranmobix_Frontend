import {
  ImportJob,
  ImportJobStatus,
} from "../types/importer.type";

/**
 * fake in-memory job store
 */
const jobs = new Map<string, ImportJob>();

/**
 * helper
 */
const delay = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));

const randomId = () =>
  Math.random().toString(36).substring(2, 10);

/**
 * create job
 */
export const importerMockApi = {
  async importProduct(payload: { url: string }): Promise<ImportJob> {
    const job: ImportJob = {
      job_id: randomId(),
      status: "pending",
    };

    jobs.set(job.job_id, job);

    // simulate background processing
    simulateJobProgress(job.job_id);

    await delay(300);

    return job;
  },

  async importSeller(payload: { seller_url: string }): Promise<ImportJob> {
    const job: ImportJob = {
      job_id: randomId(),
      status: "pending",
    };

    jobs.set(job.job_id, job);

    simulateJobProgress(job.job_id);

    await delay(300);

    return job;
  },

  async importImage(payload: { image: File }): Promise<ImportJob> {
    const job: ImportJob = {
      job_id: randomId(),
      status: "pending",
    };

    jobs.set(job.job_id, job);

    simulateJobProgress(job.job_id);

    await delay(300);

    return job;
  },

  async getJobStatus(jobId: string): Promise<ImportJob> {
    await delay(500);

    const job = jobs.get(jobId);

    if (!job) {
      return {
        job_id: jobId,
        status: "failed",
      };
    }

    return job;
  },
};

/**
 * fake backend processing
 */
async function simulateJobProgress(jobId: string) {
  await delay(2000);

  const job = jobs.get(jobId);
  if (!job) return;

  const shouldFail = Math.random() < 0.2;

  job.status = shouldFail ? "failed" : "done";

  jobs.set(jobId, job);
}