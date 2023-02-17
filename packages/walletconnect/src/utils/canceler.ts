export default class Canceler {
  public status: { canceled: boolean };

  constructor() {
    this.status = { canceled: false };
  }

  cancel() {
    this.status.canceled = true;
  }
}
