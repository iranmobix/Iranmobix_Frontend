export class ImportJobError extends Error {
  constructor(
    message: string,
    public readonly status: string
  ) {
    super(message);

    this.name = "ImportJobError";
  }
}